const Booking = require("../models/Booking");
const UserService = require("../models/UserService");

const addVendor = async (req, res) => {
    const { serviceRequestorId, serviceProviderId, userServiceId } = req.body;

    try {
        let booking = await Booking.findOne({ serviceRequestorId, userServiceId });
        if (booking) {
            return res.status(400).json({ msg: "Booking already exists" });
        }

        let vendor = new Booking({ serviceRequestorId, serviceProviderId, userServiceId });
        await vendor.save();

        res.status(201).json({ msg: 'Vendor saved successfully' });
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const getVendorBookings = async (req, res) => {
    const { vendorId } = req.query;

    try {
        const bookings = await Booking.aggregate([
            {
                $match: {
                    serviceProviderId: vendorId,
                    isRequestSent: true
                }
            },
            {
                $lookup: {
                    from: "userservices",              // The name of the collection you're joining
                    localField: "userServiceId",       // Field in Booking
                    foreignField: "uuid",              // Matching field in UserService
                    as: "userServiceDetails"
                }
            },
            {
                $unwind: "$userServiceDetails"         // Optional, but useful to flatten the array
            },
            {
                $lookup: {
                    from: "users",
                    let: { requestorId: "$serviceRequestorId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$uuid", "$$requestorId"]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                phoneNumber: 1
                            }
                        }
                    ],
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $lookup: {
                    from: "events",              // The name of the collection you're joining
                    localField: "eventId",       // Field in booking
                    foreignField: "uuid",              // Matching field in events
                    as: "EventDetails"
                }
            },
            {
                $unwind: "$EventDetails"
            }
        ]);

        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ error: error });
    }
};
const getSavedVendors = async (req, res) => {
    const { userId } = req.query;

    try {
        const bookings = await Booking.aggregate([
            {
                $match: {
                    serviceRequestorId: userId
                }
            },
            {
                $lookup: {
                    from: "userservices",
                    localField: "userServiceId",
                    foreignField: "uuid",
                    as: "ServiceDetails"
                }
            },
            {
                $unwind: "$ServiceDetails"
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "uuid",
                    as: "EventDetails"
                }
            },
            {
                $unwind: {
                    path: "$EventDetails",
                    preserveNullAndEmptyArrays: true // Keeps documents even if no matching event
                }
            }
        ]);

        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const setBookingEvent = async (req, res) => {
    const { eventId, bookingId } = req.body;

    try {
        const result = await Booking.updateOne(
            { uuid: bookingId },
            { $set: { eventId: eventId } }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({ msg: 'Booking not found or already updated' });
        }

        res.status(200).json({ msg: 'Booking updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const sendRequestToVendor = async (req, res) => {
    const { bookingId } = req.body;

    try {
        let booking = await Booking.findOne({ uuid: bookingId });
        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isRequestSent: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            res.status(200).json({ msg: 'Request sent successfully' });
        } else {
            return res.status(400).json({ msg: 'Please select event first for the vendor' });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
};


const acceptBooking = async (req, res) => {
    const { bookingId } = req.body;

    try {
        let booking = await Booking.findOne({ uuid: bookingId });
        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isApproved: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            res.status(200).json({ msg: 'Request approved successfully' });
        } else {
            return res.status(400).json({ msg: 'Error' });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const rejectBooking = async (req, res) => {
    const { bookingId } = req.body;

    try {
        let booking = await Booking.findOne({ uuid: bookingId });
        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isRejected: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            res.status(200).json({ msg: 'Request rejected successfully' });
        } else {
            return res.status(400).json({ msg: 'Error' });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const getUserVendors = async (req, res) => {
    const { userId } = req.query;

    try {
        const bookings = await Booking.aggregate([
            {
                $match: {
                    serviceRequestorId: userId,
                    isApproved: true
                }
            },
            {
                $lookup: {
                    from: "userservices",              // The name of the collection you're joining
                    localField: "userServiceId",       // Field in Booking
                    foreignField: "uuid",              // Matching field in UserService
                    as: "ServiceDetails"
                }
            },
            {
                $unwind: "$ServiceDetails"         // Optional, but useful to flatten the array
            },
            {
                $lookup: {
                    from: "events",              // The name of the collection you're joining
                    localField: "eventId",       // Field in booking
                    foreignField: "uuid",              // Matching field in events
                    as: "EventDetails"
                }
            },
            {
                $unwind: "$EventDetails"
            }
        ]);

        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ error: error });
    }
};


module.exports = { addVendor, getVendorBookings, getSavedVendors, setBookingEvent, sendRequestToVendor, acceptBooking, rejectBooking, getUserVendors };