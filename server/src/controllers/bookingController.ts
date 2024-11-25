import { Request, Response } from "express";
import { User } from "../models/User";
import { Event } from "../models/Event";
import { Booking } from "../models/Booking";
import mongoose from "mongoose";
import QRCode from "qrcode";

export const createBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, eventId, tickets } = req.body;

    // Validate the tickets property - it should be an array
    if (!Array.isArray(tickets) || tickets.length === 0) {
      res.status(400).json({ message: "'tickets' must be a non-empty array." });
      return;
    }

    // Validate user and event existence
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    let totalAmount = 0;
    let paymentStatus = "pending";

    // Validate ticket availability for each ticket type
    for (const ticket of tickets) {
      if (!ticket.type || !ticket.quantity) {
        res.status(400).json({
          message: "Each ticket must have a valid 'type' and 'quantity'.",
        });
        return;
      }

      const eventTicket = event.tickets.find((t) => t.type === ticket.type);
      if (!eventTicket) {
        res.status(400).json({
          message: `Ticket type ${ticket.type} not available for this event`,
        });
        return;
      }

      if (eventTicket.sold + ticket.quantity > eventTicket.quantity) {
        res.status(400).json({
          message: `Not enough tickets for ${ticket.type}`,
        });
        return;
      }

      // Calculate total amount by adding the price of each ticket type
      totalAmount += eventTicket.price * ticket.quantity;
    }

    // Create the booking object without qrCode initially
    const newBooking = new Booking({
      user: userId,
      event: eventId,
      tickets,
      totalAmount,
      paymentStatus,
    });

    // Save the booking first
    const savedBooking = await newBooking.save();
    const bookingId = savedBooking._id as string;

    // Generate QR code for the saved booking using the booking ID
    const qrCode = await QRCode.toDataURL(bookingId.toString());

    // Update the booking with the generated QR code
    savedBooking.qrCode = qrCode;
    await savedBooking.save();

    // Update the sold quantity of the tickets in the event
    for (const ticket of tickets) {
      const eventTicket = event.tickets.find((t) => t.type === ticket.type);
      if (eventTicket) {
        // Update sold quantity
        eventTicket.sold += ticket.quantity;
        // Calculate available quantity
        eventTicket.availableQuantity = eventTicket.quantity - eventTicket.sold;
      }
    }

    // Save the updated event with the incremented sold quantities
    await event.save();

    res
      .status(201)
      .json({ message: "Booking created successfully", data: savedBooking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking" });
  }
};

export const getBookings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { totalAmount: { $regex: search, $options: "i" } },
        { paymentStatus: { $regex: search, $options: "i" } },
      ];
    }

    const bookings = await Booking.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate("user", "name email").populate("event", "name description date time location");

    const total = await Booking.countDocuments(query);

    res.status(200).json({ data: bookings, total, page: +page, limit: +limit });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const getBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    const booking = await Booking.findById(bookingId).populate(
      "user",
      "name email"
    ).populate("event", "name description date time location");

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json({ data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking" });
  }
};

export const updateBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { totalAmount, paymentStatus, qrCode, tickets } = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    // Fetch the current booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Fetch the event related to the booking
    const event = await Event.findById(booking.event);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    let totalAmountUpdated = totalAmount || booking.totalAmount;

    // Track ticket updates and changes to sold quantities
    const ticketUpdates: { type: string; soldChange: number }[] = [];
    let totalAmountCalculated = 0;

    // Validate and process ticket changes
    if (tickets) {
      // Iterate over the tickets in the request to check for updates
      for (const ticket of tickets) {
        const existingTicket = booking.tickets.find(
          (t) => t.type === ticket.type
        );
        if (!existingTicket) {
          continue; // Skip if the ticket type doesn't exist in the booking
        }

        const eventTicket = event.tickets.find((t) => t.type === ticket.type);
        if (eventTicket) {
          const quantityChange = ticket.quantity - existingTicket.quantity;

          // Ensure there are enough tickets available for the updated quantity
          if (eventTicket.sold + quantityChange > eventTicket.quantity) {
            res.status(400).json({
              message: `Not enough tickets for ${ticket.type}`,
            });
            return;
          }

          // Update total amount based on price and quantity change
          totalAmountCalculated += eventTicket.price * ticket.quantity;

          // Update ticket updates
          ticketUpdates.push({
            type: ticket.type,
            soldChange: quantityChange,
          });
        }
      }
    }

    // If no tickets are updated, use the existing amount
    if (!totalAmountUpdated) {
      totalAmountUpdated = totalAmountCalculated;
    }

    // Update the booking with the new information
    const updateBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { totalAmount: totalAmountUpdated, paymentStatus, qrCode, tickets },
      { new: true }
    );

    if (!updateBooking) {
      res.status(404).json({ message: "Booking update failed" });
      return;
    }

    // Now, update the sold quantities in the event tickets
    for (const ticketUpdate of ticketUpdates) {
      const eventTicket = event.tickets.find(
        (t) => t.type === ticketUpdate.type
      );
      if (eventTicket) {
        eventTicket.sold += ticketUpdate.soldChange;
        eventTicket.availableQuantity = eventTicket.quantity - eventTicket.sold;
      }
    }

    // Save the updated event document
    await event.save();

    res
      .status(200)
      .json({ message: "Booking updated successfully", data: updateBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Error updating booking" });
  }
};

export const deleteBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }
    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Error deleting booking" });
  }
};
