import Booking from "../models/Booking.js";



//API controller function to get user Bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;

        const bookings = await Booking.find({ user }).populate({
            path: "show",
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 })

        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error.message)
        res.json({ success: false, message: error.message });
    }
}