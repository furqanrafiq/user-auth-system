const Service = require("../models/Service");
const User = require("../models/User");
const ServiceImages = require("../models/ServiceImages")
const UserService = require("../models/UserService");
const fs = require('fs');
const path = require('path');
const uploadFolder = path.join(__dirname, '../ServiceImages');

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
        const services = await UserService.find({ serviceName });
        res.status(200).json(services);
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



module.exports = { getAllServices, insertService, getUserServices, insertUserService, getServicesProvidedByServiceName, getServiceDetails, deleteUserService }