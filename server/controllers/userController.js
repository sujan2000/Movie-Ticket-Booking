import { clerkClient } from "@clerk/express";
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

//API controller function to add favorite movie in clerk user metadata

export const addFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        const user = await clerkClient.users.getUser(userId)
        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = []
        }

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata })

        res.json({ success: true, message: "Favorite added successfully" })
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message })
    }
}