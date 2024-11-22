import mongoose from "mongoose";
import { Request, Response } from "express";
import { parse, isValid } from "date-fns";
import { Event } from "../models/Event";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, sportType } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { desciption: { $regex: search, $options: "i" } },
        { sportType: { $regex: search, $options: "i" } },
      ];
    }

    if (sportType) {
      query.sportType = {
        $in: Array.isArray(sportType) ? sportType : [sportType],
      };
    }

    const events = await Event.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate("organizer", "name email");

    const total = await Event.countDocuments(query);

    res.status(200).json({ data: events, total, page: +page, limit: +limit });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    name,
    description,
    sportType,
    date,
    time,
    location,
    tickets,
    organizer,
  } = req.body;

  let imageBase64 = null;

  if (req.file) {
    imageBase64 = req.file.buffer.toString("base64");
  }

  try {
    // Parse the date
    const parsedDate = parse(date, "dd/MM/yyyy", new Date());
    if (!isValid(parsedDate)) {
      res.status(400).json({ message: "Invalid date format. Use DD/MM/YYYY" });
      return;
    }

    // Parse `location` and `tickets` if they are strings
    const parsedLocation =
      typeof location === "string" ? JSON.parse(location) : location;

    const parsedTickets =
      typeof tickets === "string" ? JSON.parse(tickets) : tickets;

    // Ensure all required fields in `location` are present
    if (
      !parsedLocation?.address ||
      !parsedLocation?.latitude ||
      !parsedLocation?.longitude
    ) {
      res.status(400).json({ message: "Incomplete location data" });
      return;
    }

    // Ensure all required fields in `tickets` are present and calculate `availableQuantity`
    const updatedTickets = parsedTickets.map((ticket: any) => {
      if (!ticket.type || !ticket.price || !ticket.quantity) {
        res.status(400).json({
          message: "Each ticket must have 'type', 'price', and 'quantity'.",
        });
        return;
      }
      // Set the initial `availableQuantity` to the `quantity` of the ticket
      ticket.availableQuantity = ticket.quantity;
      ticket.sold = 0; // Initialize sold as 0
      return ticket;
    });

    // Create the new event with the updated ticket details
    const newEvent = new Event({
      name,
      description,
      sportType,
      date: parsedDate,
      time,
      location: parsedLocation,
      tickets: updatedTickets,
      organizer,
      image: imageBase64,
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();

    res
      .status(201)
      .json({ message: "Event created successfully", data: savedEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    const event = await Event.findById(eventId).populate(
      "organizer",
      "name email"
    );

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json({ data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event" });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    const {
      name,
      description,
      sportType,
      date,
      time,
      location,
      tickets,
      organizer,
    } = req.body;

    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    // Parse and validate the date if provided
    let parsedDate = undefined;
    if (date) {
      parsedDate = parse(date, "dd/MM/yyyy", new Date());
      if (!isValid(parsedDate)) {
        res
          .status(400)
          .json({ message: "Invalid date format. Use DD/MM/YYYY" });
        return;
      }
    }

    // Parse `location` and `tickets` if they are strings
    const parsedLocation =
      location && typeof location === "string"
        ? JSON.parse(location)
        : location;
    const parsedTickets =
      tickets && typeof tickets === "string" ? JSON.parse(tickets) : tickets;

    // Ensure `location` is valid
    if (
      parsedLocation &&
      (!parsedLocation?.address ||
        !parsedLocation?.latitude ||
        !parsedLocation?.longitude)
    ) {
      res.status(400).json({ message: "Incomplete location data" });
      return;
    }

    // Ensure all required fields in `tickets` are present and calculate `availableQuantity`
    const updatedTickets = parsedTickets?.map((ticket: any) => {
      if (!ticket.type || !ticket.price || !ticket.quantity) {
        res.status(400).json({
          message: "Each ticket must have 'type', 'price', and 'quantity'.",
        });
        return;
      }
      // Set the initial `availableQuantity` to the `quantity` of the ticket
      ticket.availableQuantity = ticket.quantity;
      ticket.sold = 0; // Initialize sold as 0
      return ticket;
    });

    // Prepare the update data object
    const updateData: any = {
      name,
      description,
      sportType,
      date: parsedDate || undefined, // Only update the date if it's provided and valid
      time,
      location: parsedLocation || undefined,
      tickets: updatedTickets || undefined,
      organizer,
    };

    // Handle image upload if a new image is provided
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
      updateData.image = imageBase64; // Add the base64 encoded image to the update data
    }

    // Remove any undefined fields from the update data
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Respond with the updated event data
    res
      .status(200)
      .json({ message: "Event updated successfully", data: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }
    await Event.findByIdAndDelete(eventId);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
