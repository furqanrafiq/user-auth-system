const Service = require("../models/Service");
const User = require("../models/User");
const ServiceImages = require("../models/ServiceImages")
const UserService = require("../models/UserService");
const fs = require('fs');
const path = require('path');
const Event = require("../models/Event");
const uploadFolder = path.join(__dirname, '../ServiceImages');
// const { OpenAI } = require("openai");

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

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
            const services = await UserService.aggregate([
                {
                    $lookup: {
                        from: "serviceimages",
                        localField: "uuid",
                        foreignField: "userServiceId",
                        as: "serviceImages"
                    },
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: 'uuid',
                        foreignField: 'serviceId',
                        as: 'reviews'
                    }
                },
                {
                    $addFields: {
                        averageRating: { $avg: '$reviews.rating' },
                        totalReviews: { $size: '$reviews' }
                    }
                },
            ]);
            res.status(200).json(services);
        } else {
            // const services = await UserService.find({ serviceName });

            const services = await UserService.aggregate([
                {
                    $match: {
                        serviceName
                    }
                },
                {
                    $lookup: {
                        from: "serviceimages",
                        localField: "uuid",
                        foreignField: "userServiceId",
                        as: "serviceImages"
                    },
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: 'uuid',
                        foreignField: 'serviceId',
                        as: 'reviews'
                    }
                },
                {
                    $addFields: {
                        averageRating: { $avg: '$reviews.rating' },
                        totalReviews: { $size: '$reviews' }
                    }
                },
            ]);
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
        const userServices = await UserService.aggregate([
            {
                $match: {
                    userId
                }
            },
            {
                $lookup: {
                    from: "serviceimages",              // The name of the collection you're joining
                    localField: "uuid",       // Field in UserService
                    foreignField: "userServiceId",              // Matching field in events
                    as: "serviceImages"
                }
            }
        ])
        res.status(200).json(userServices);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
    }
}

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

const updateUserService = async (req, res) => {
    const { userId, service, name, price, description, userServiceId, images } = req.body;

    try {
        const updatedService = await UserService.findOneAndUpdate(
            { userId, uuid: userServiceId }, // Match condition
            {
                $set: {
                    serviceName: service.name,
                    serviceId: service.uuid,
                    name,
                    price,
                    description,
                    updatedAt: new Date(),
                },
            }
        );

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

        imagePaths.forEach((item) => {
            const newImages = new ServiceImages({ userServiceId: updatedService.uuid, imagePath: item });
            newImages.save();
        })

        res.status(200).json({
            msg: "Service updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteUserServiceImage = async (req, res) => {
    try {
        const { imagePath } = req.body;
        // Check if the service exists
        const userServiceImage = await ServiceImages.findOne({ imagePath }).lean();
        if (!userServiceImage) {
            return res.status(400).json({ msg: 'Image not found' });
        }

        // Delete the service
        await ServiceImages.deleteOne({ imagePath });

        res.status(200).json({ msg: 'Image deleted successfully' });
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
    const { userId } = req.query;

    // try {

    //     // Step 1: Get total budget
    //     const totalBudgetResult = await Event.aggregate([
    //         {
    //             $match: {
    //                 userId: userId  // userId is a plain string in your schema
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: null,
    //                 total: { $sum: "$eventBudget" }
    //             }
    //         }
    //     ]);

    //     const totalBudget = totalBudgetResult[0]?.total || 0;

    //     // Step 2: Get vendors with average rating
    //     const vendors = await UserService.aggregate([
    //         {
    //             $lookup: {
    //                 from: "reviews",
    //                 localField: "uuid",
    //                 foreignField: "serviceId",
    //                 as: "vendorReviews"
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 averageRating: { $avg: "$vendorReviews.rating" }
    //             }
    //         },
    //         {
    //             $match: {
    //                 averageRating: { $gte: 2 }, // adjust as needed
    //                 price: { $lte: totalBudget }
    //             }
    //         },
    //         {
    //             $sort: { averageRating: -1 }
    //         },
    //         {
    //             $limit: 10
    //         }
    //     ])

    //     if (!vendors.length) {
    //         return res.json({ message: "No vendors found within budget." });
    //     }

    //     // Step 3: Format vendors for ChatGPT
    //     const prompt = `
    //     A user has a total event budget of ${totalBudget}. 
    //     Here are some vendors to choose from:

    //     ${vendors.map((v, i) => `${i + 1}. Service: ${v.category}, Price: ${v.price}, Avg Rating: ${v.averageRating.toFixed(2)}`).join('\n')}

    //     Please recommend the best 3 vendors based on rating-to-price ratio and explain why.
    //     `;

    //     const completion = await openai.chat.completions.create({
    //         model: "gpt-4.1",
    //         messages: [{ role: "user", content: prompt }]
    //     });

    //     res.json({
    //         vendors,
    //         gptRecommendation: completion.choices[0].message.content
    //     });

    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: "Server error" });
    // }
}

const getAllServiceProviders = async (req, res) => {
    const { serviceName } = req.query;
    try {
        if (serviceName == 'All') {
            const allVendors = await UserService.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "uuid",
                        as: "vendorDetails"
                    },
                },
                {
                    $unwind: "$vendorDetails"         // Optional, but useful to flatten the array
                },
            ]);
            res.status(200).json(allVendors);
        } else {
            const allVendors = await UserService.aggregate([
                {
                    $match: {
                        serviceName
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "uuid",
                        as: "vendorDetails"
                    }
                },
                {
                    $unwind: "$vendorDetails"         // Optional, but useful to flatten the array
                },
            ]);
            res.status(200).json(allVendors);
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getTopRatedServices = async (req, res) => {
    const { userId } = req.query;
    try {
        const services = await UserService.aggregate([
            {
                $match: {
                    userId: { $ne: userId } // Exclude current user's services
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'uuid',
                    foreignField: 'serviceId',
                    as: 'reviews'
                }
            },
            {
                $addFields: {
                    averageRating: { $avg: '$reviews.rating' },
                    totalReviews: { $size: '$reviews' }
                }
            },
            {
                $match: {
                    totalReviews: { $gt: 0 } // 🚨 Filter services with at least 1 review
                }
            },
            {
                $sort: { averageRating: -1, totalReviews: -1 } // sort by rating then review count
            }
        ]);

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { getAllServices, insertService, getUserServices, insertUserService, getServicesProvidedByServiceName, getServiceDetails, deleteUserService, getRecommendedServices, getAllServiceProviders, getTopRatedServices, updateUserService, deleteUserServiceImage }