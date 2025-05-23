const { sender, transport } = require("../config/db");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const Booking = require("../models/Booking");
const User = require("../models/User");
const UserService = require("../models/UserService");
const bookingAcceptedRejectedEmail = require("../templates/bookingAcceptedRejected/bookingAcceptedRejectedEmail");
const paymentSentEmail = require("../templates/paymentSent/paymentSent");
const sendRequestToVendorEmail = require("../templates/sendRequestToVendor/sendRequestToVendor");

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
        const vendor = await User.findOne({ uuid: booking.serviceProviderId })
        const user = await User.findOne({ uuid: booking.serviceRequestorId })

        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isRequestSent: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            const link = process.env.FRONTEND_LINK + `/dashboard/bookings`
            const htmlContent = sendRequestToVendorEmail.replace('{{vendorName}}', vendor.name).replace('{{userName}}', user.name).replace('{{link}}', link);

            const mailOptions = {
                from: sender,
                to: vendor.email,
                subject: "New Booking",
                html: htmlContent,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ message: "Email failed to send" });
                }

                // success response after email is sent
                res.status(201).json({ msg: 'Request sent successfully' });
            });
            // res.status(200).json({ msg: 'Request sent successfully' });
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

        const vendor = await User.findOne({ uuid: booking.serviceProviderId })
        const user = await User.findOne({ uuid: booking.serviceRequestorId })
        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isApproved: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            const link = process.env.FRONTEND_LINK + `/dashboard/vendor-manager/saved-vendors`
            const htmlContent = bookingAcceptedRejectedEmail.replace('{{vendorName}}', vendor.name).replace('{{userName}}', user.name).replace('{{link}}', link).replace('{{type}}', 'accepted');

            const mailOptions = {
                from: sender,
                to: user.email,
                subject: "Request Accepted",
                html: htmlContent,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ message: "Email failed to send" });
                }

                // success response after email is sent
                res.status(200).json({ msg: 'Request approved successfully' });
            });

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
        const vendor = await User.findOne({ uuid: booking.serviceProviderId })
        const user = await User.findOne({ uuid: booking.serviceRequestorId })

        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isRejected: true } }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({ msg: 'Booking not found or already updated' });
            }

            const link = process.env.FRONTEND_LINK + `/dashboard/vendor-manager/saved-vendors`
            const htmlContent = bookingAcceptedRejectedEmail.replace('{{vendorName}}', vendor.name).replace('{{userName}}', user.name).replace('{{link}}', link).replace('{{type}}', 'rejected');

            const mailOptions = {
                from: sender,
                to: user.email,
                subject: "Request Rejected",
                html: htmlContent,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ message: "Email failed to send" });
                }

                // success response after email is sent
                res.status(200).json({ msg: 'Request rejected successfully' });
            });

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

const sendPaymentToVendor = async (req, res) => {
    const { bookingId } = req.body;

    try {
        let booking = await Booking.findOne({ uuid: bookingId });
        const vendor = await User.findOne({ uuid: booking.serviceProviderId })
        const user = await User.findOne({ uuid: booking.serviceRequestorId })

        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isPaymentSent: true } }
            );

            const link = process.env.FRONTEND_LINK + `/dashboard/bookings`
            const htmlContent = paymentSentEmail.replace('{{vendorName}}', vendor.name).replace('{{userName}}', user.name).replace('{{link}}', link);

            const mailOptions = {
                from: sender,
                to: vendor.email,
                subject: "Payment Received",
                html: htmlContent,
            };

            transport.sendMail(mailOptions, (err, info) => {
                if (err) {
                    return res.status(500).json({ message: "Email failed to send" });
                }

                // success response after email is sent
                res.status(200).json({ msg: 'Payment sent successfully' });
            });

        } else {
            return res.status(400).json({ msg: 'Error' });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const receivePaymentFromUser = async (req, res) => {
    const { bookingId } = req.body;

    try {
        let booking = await Booking.findOne({ uuid: bookingId });
        if (booking.eventId) {
            const result = await Booking.updateOne(
                { uuid: bookingId },
                { $set: { isPaymentReceived: true } }
            );

            res.status(200).json({ msg: 'Payment received successfully' });
        } else {
            return res.status(400).json({ msg: 'Please select event first for the vendor' });
        }
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.aggregate([
            {
                $match: {
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
                    from: "users",
                    let: { providerId: "$serviceProviderId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$uuid", "$$providerId"]
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
                    as: "vendorDetails"
                }
            },
            {
                $unwind: "$vendorDetails"
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

const getUserInvoices = async (req, res) => {
    const { userId } = req.query;

    try {
        const bookings = await Booking.aggregate([
            {
                $match: {
                    serviceRequestorId: userId,
                    isPaymentReceived: true
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
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$serviceProviderId",
                    services: {
                        $push: {
                            name: "$ServiceDetails.name",
                            serviceName: "$ServiceDetails.serviceName",
                            price: "$ServiceDetails.price",
                            event: "$EventDetails.name",
                            bookingId: "$uuid"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "uuid",
                    as: "VendorDetails"
                }
            },
            {
                $unwind: "$VendorDetails"
            }
        ]);

        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// const downloadInvoice = async (req, res) => {
//     const { userId } = req.query;

//     try {
//         const invoiceData = await Booking.aggregate([
//             { $match: { serviceRequestorId: userId } },
//             {
//                 $lookup: {
//                     from: "userservices",
//                     localField: "userServiceId",
//                     foreignField: "uuid",
//                     as: "ServiceDetails"
//                 }
//             },
//             { $unwind: "$ServiceDetails" },
//             {
//                 $group: {
//                     _id: "$serviceProviderId",
//                     services: {
//                         $push: {
//                             name: "$ServiceDetails.name",
//                             price: "$ServiceDetails.price"
//                         }
//                     }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "_id",
//                     foreignField: "uuid",
//                     as: "VendorDetails"
//                 }
//             },
//             { $unwind: "$VendorDetails" }
//         ]);

//         // Generate simple HTML
//         const htmlContent = `
//         <html>
//             <head>
//                 <style>
//                     body { font-family: Arial; }
//                     table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//                     th, td { border: 1px solid #000; padding: 8px; text-align: left; }
//                     th { background-color: #f2f2f2; }
//                 </style>
//             </head>
//             <body>
//                 <h1>Invoice Summary</h1>
//                 ${invoiceData.map(vendor => `
//                     <h2>Vendor: ${vendor.VendorDetails.name}</h2>
//                     <table>
//                         <thead>
//                             <tr><th>Service</th><th>Price</th></tr>
//                         </thead>
//                         <tbody>
//                             ${vendor.services.map(s => `
//                                 <tr><td>${s.name}</td><td>${s.price}</td></tr>
//                             `).join("")}
//                         </tbody>
//                     </table>
//                 `).join("")}
//             </body>
//         </html>`;

//         // Launch Puppeteer to create PDF
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: "networkidle0" });

//         const pdfBuffer = await page.pdf({ format: "A4" });

//         await browser.close();

//         // Send PDF file to client
//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `attachment; filename="invoice.pdf"`,
//             "Content-Length": pdfBuffer.length
//         });

//         res.send(pdfBuffer);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to generate invoice PDF" });
//     }
// };


const downloadInvoice = async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' }); // set 'new' for latest versions
        const page = await browser.newPage();

        // Generate dynamic HTML or replace with your HTML content
        const html = `
            <html>
            <head><title>Invoice</title></head>
            <body>
                <h1>Invoice</h1>
                <p>Vendor: Vendor Name</p>
                <p>Service: Wedding Photography</p>
                <p>Price: $500</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </body>
            </html>
        `;

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=invoice.pdf',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating PDF');
    }
};


module.exports = { addVendor, getVendorBookings, getSavedVendors, setBookingEvent, sendRequestToVendor, acceptBooking, rejectBooking, getUserVendors, receivePaymentFromUser, sendPaymentToVendor, getAllBookings, getUserInvoices, downloadInvoice };