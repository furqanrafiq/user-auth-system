const Service = require("../models/Service");
const User = require("../models/User");
const ServiceImages = require("../models/ServiceImages")
const UserService = require("../models/UserService");
const fs = require('fs');
const path = require('path');
const Event = require("../models/Event");
const uploadFolder = path.join(__dirname, '../ServiceImages');
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const insertService = async (req, res) => {
    const { name } = req.body;

    try {
        let service = await Service.findOne({ name });
        if (service) return res.status(400).json({ msg: 'Service already exists' });

        service = new Service({ name });
        await service.save();

        res.status(201).json({ msg: 'Service saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

const getServicesProvidedByServiceName = async (req, res) => {
    const { serviceName } = req.query;
    try {
        if (serviceName == 'All') {
            const services = await UserService.find();
            res.status(200).json(services);
        } else {
            const services = await UserService.find({ serviceName });
            res.status(200).json(services);
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getServiceDetails = async (req, res) => {
    const { serviceId } = req.query;
    try {
        const services = await UserService.findOne({ uuid: serviceId }).lean();
        const serviceImages = await ServiceImages.find({ userServiceId: serviceId })
        services.images = serviceImages;

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserServices = async (req, res) => {
    const { userId } = req.query;
    try {
        const userServices = await UserService.find({ userId });
        // console.log(userServices)
        res.status(200).json(userServices);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const insertUserService = async (req, res) => {
    const { userId, service, description, price, name, images } = req.body;
    try {
        const userServices = await UserService.findOne({ serviceId: service.uuid, userId });
        if (userServices) return res.status(400).json({ msg: 'User Service already exists' });

        let imagePaths = [];

        images.forEach((base64Image, index) => {
            const matches = base64Image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).json({ error: "Invalid base64 format" });
            }

            const extension = matches[1]; // jpg, png, etc.
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `${Date.now()}_${index}.${extension}`;
            const filePath = path.join(uploadFolder, fileName);

            // Save the file
            fs.writeFileSync(filePath, buffer);

            imagePaths.push(`/ServiceImages/${fileName}`);
        });

        const newUserService = new UserService({ name, userId, serviceId: service.uuid, serviceName: service.name, description, price });
        await newUserService.save()

        imagePaths.forEach((item) => {
            const newImages = new ServiceImages({ userServiceId: newUserService.uuid, imagePath: item });
            newImages.save();
        })

        res.status(200).json({ msg: 'User Service Added' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

const deleteUserService = async (req, res) => {
    try {
        const { uuid } = req.query;
        // Check if the service exists
        const userService = await UserService.findOne({ uuid }).lean();
        if (!userService) {
            return res.status(400).json({ msg: 'User Service not found' });
        }

        // Delete the service
        await UserService.deleteOne({ uuid });

        res.status(200).json({ msg: 'User Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

const getRecommendedServices = async (req, res) => {
    const { userId } = req.body;

    try {

        // Step 1: Get total budget
        const totalBudgetResult = await Event.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: "$budget" } } }
        ]).toArray();

        console.log(totalBudgetResult)

        const totalBudget = totalBudgetResult[0]?.total || 0;

        // Step 2: Get vendors with average rating
        const vendors = await UserService.aggregate([
            {
                $lookup: {
                    from: "reviews",
                    localField: "uuid",
                    foreignField: "serviceId",
                    as: "vendorReviews"
                }
            },
            {
                $addFields: {
                    averageRating: { $avg: "$vendorReviews.rating" }
                }
            },
            {
                $match: {
                    averageRating: { $gte: 3.5 }, // adjust as needed
                    price: { $lte: totalBudget }
                }
            },
            {
                $sort: { averageRating: -1 }
            },
            {
                $limit: 10
            }
        ]).toArray();

        if (!vendors.length) {
            return res.json({ message: "No vendors found within budget." });
        }

        // Step 3: Format vendors for ChatGPT
        const prompt = `
A user has a total event budget of ${totalBudget}. 
Here are some vendors to choose from:

${vendors.map((v, i) => `${i + 1}. Service: ${v.category}, Price: ${v.price}, Avg Rating: ${v.averageRating.toFixed(2)}`).join('\n')}

Please recommend the best 3 vendors based on rating-to-price ratio and explain why.
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }]
        });

        res.json({
            vendors,
            gptRecommendation: completion.choices[0].message.content
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
}



module.exports = { getAllServices, insertService, getUserServices, insertUserService, getServicesProvidedByServiceName, getServiceDetails, deleteUserService, getRecommendedServices }