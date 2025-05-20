const Checklist = require("../models/Checklist");
const UserPaymentDetails = require("../models/UserPaymentDetails");

const insertUserPaymentDetails = async (req, res) => {
    const { userId, accountName, bankName, accountNumber, iban } = req.body;
    try {
        //check if any payment details are in database for that user
        const userPaymentDetails = await UserPaymentDetails.find({ userId })
        //if no payment detail is present, then the first one will be primary
        let newPaymentDetails = new UserPaymentDetails({ userId, accountName, bankName, accountNumber, iban, isPrimary: userPaymentDetails?.length > 0 ? false : true });
        await newPaymentDetails.save();
        res.status(201).json({ msg: 'Payment Details added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUserPaymentDetails = async (req, res) => {
    const { userId, accountName, bankName, accountNumber, iban, uuid, isPrimary } = req.body;

    try {
        if (isPrimary) {
            //remove other payment details as primary
            await UserPaymentDetails.updateMany(
                { userId },
                { $set: { isPrimary: false } }
            );
        } else {
            return res.status(400).json({ msg: 'Cannot remove payment detail as primary. Set another bank detail as primary to remove this one.' });
        }

        const updatedPaymentDetails = await UserPaymentDetails.updateOne(
            { uuid },
            { $set: { accountName, bankName, accountNumber, iban, isPrimary } }
        );
        res.status(201).json({ msg: 'Payment Details updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserPaymentDetails = async (req, res) => {
    const { userId } = req.query;
    try {
        const userPaymentDetails = await UserPaymentDetails.find({ userId })
        res.status(200).json(userPaymentDetails);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getVendorPaymentDetails = async (req, res) => {
    const { vendorId } = req.query;
    try {
        const userPaymentDetails = await UserPaymentDetails.findOne({ userId: vendorId, isPrimary: true }).lean()
        res.status(200).json(userPaymentDetails);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const deleteUserPaymentDetails = async (req, res) => {
    const { paymentId } = req.query;
    try {
        const payment = await UserPaymentDetails.deleteOne({ uuid: paymentId });
        res.status(201).json({ msg: 'Payment Details deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertUserPaymentDetails, getUserPaymentDetails, updateUserPaymentDetails, deleteUserPaymentDetails,getVendorPaymentDetails };