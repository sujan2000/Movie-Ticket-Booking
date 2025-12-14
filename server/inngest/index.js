import { Inngest, step } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";


// A client to send and receive events
export const inngest = new Inngest({
    id: "movie-ticket-booking",
});


//inngest function to save user data to  database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.create(userData)
    }
)


//Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)


//inngest function to update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + ' ' + last_name,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData)
    }
)

//Inngest function to delete booking and release seats after 10 minutes if payment not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: "release-seats-delete-booking" },
    { event: "app/checkpayment" },
    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            //If payment is not made, release seats and delete booking 
            if (!booking.isPaid) {
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }

        })
    }

)

//Inngest Function to send email when user books a show 
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: "send-booking-confirmation-email" },
    { event: "app/show.booked" },
    async ({ event, step }) => {
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path: 'show',
            populate: { path: "movie", model: "Movie" }
        }).populate('user');

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
            body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #eeeeee;">
  <div style="background-color: #e63946; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🎟️ Ticket Confirmed!</h1>
  </div>
  <div style="padding: 24px;">
    <p style="margin: 0 0 16px; color: #333333;"><strong>Hi ${booking.user.name},</strong></p>
    <p style="margin: 0 0 16px; color: #555555; line-height: 1.5;">Your movie ticket has been successfully booked. Here are the details:</p>
    <div style="margin: 16px 0; color: #333333;">
      <p style="margin: 8px 0; font-size: 16px;"><strong>🎬 Movie:</strong> ${booking.show.movie.title}</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>🕒 Showtime:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {
                timeZone: 'Asia/Kolkata'
            })}</p>
      <p style="margin: 8px 0; font-size: 16px;"><strong>🪑 Seats:</strong> ${booking.show.movie.seats}</p>
    </div>
    <p style="margin: 20px 0 0; color: #555555; font-size: 14px;">Thank you for booking with us. Enjoy the show!</p>
  </div>
  <div style="background-color: #f8f8f8; padding: 16px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
    &copy; 2025 MovieTicketHub. All rights reserved.
  </div>
</div>   `
        })
    }
)

//Inngest Function to send reminders
const sendShowReminders = inngest.createFunction(
    { id: "send-show-reminders" },
    { cron: "0 */8 * * * " }, //Every 8 hr 

    async ({ step }) => {
        const now = new Date();
        const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000)

        //Prepare reminder tasks
        const reminderTasks = await step.run("prepare-reminder-tasks",
            async () => {
                const shows = await Show.find({
                    showTime: { $gte: windowStart, $lte: in8Hours },
                }).populate('movie');
                const tasks = [];

                for (const show of shows) {
                    if (!show.movie || !show.occupiedSeats) continue;

                    const userIds = [...new Set(Object.values(show.occupiedSeats))];
                    if (userIds.length === 0) continue;

                    const users = await User.find({ _id: { $in: userIds } }).select("name email")

                    for (const user of users) {
                        tasks.push({
                            userEmail: user.email,
                            userName: user.name,
                            movieTitle: show.movie.title,
                            showTime: show.showTime,
                        })
                    }
                }
                return tasks;
            })

        if (reminderTasks.length === 0) {
            return { sent: 0, message: "No reminders to send." }
        }

        //Send remider emails
        const results = step.run('send-all-reminders', async () => {
            return await Promise.allSettled(
                reminderTasks.map(task => sendEmail({
                    to: task.userEmail,
                    subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
                    body: `<div style="font-family: Arial, sans-serif; padding: 20px;>
                      <h2>Hello ${task.userName},</h2>
                      <p>This is aquick reminder that your movie:</p>
                      <h3 style="color: #F84565;">"${task.movieTitle}"</h3>
                      <p>
                        is scheduled for <strong>${new Date(task.showTime).
                            toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> at
                        <strong>${new Date(task.showTime).
                            toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>
                      </p>
                        <p>It starts in approximately <strong>8 hours</strong>
                        - make sure you're ready!</p>
                      <br/>
                      <p>Enjoy the show!<br/>Movie Ticket Book</p>
                    </div>`
                }))
            )
        })

        const sent = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.length - sent;

        return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed.`
        }
    }
)

//Inngest function for send notification when a new movie is added
const sendNewShowNotifications = inngest.createFunction(
    { id: "send-new-show-notifications" },
    { event: "app/show.added" },
    async ({ event }) => {
        const { movieTitle, movieId } = event.data;
    }
)


export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders
];