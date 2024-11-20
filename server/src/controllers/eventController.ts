import mongoose from "mongoose";
import { Request, Response } from "express";
import { parse, isValid } from "date-fns";
import { Event } from "../models/Event";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { desciption: { $regex: search, $options: "i" } },
        { sportType: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate("organizer", "name email");

    const total = await Event.countDocuments(query);

    res.status(200).json({ data:events, total, page: +page, limit: +limit });
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
  try {
    const parsedDate = parse(date, "dd/MM/yyyy", new Date());
    if (!isValid(parsedDate)) {
      res.status(400).json({ message: "Invalid date format. Use DD/MM/YYYY" });
    }
    const newEvent = new Event({
      name,
      description,
      sportType,
      date: parsedDate,
      time,
      location,
      tickets,
      organizer,
    });
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
    const { name, description, sportType, date, time, location, tickets } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      res.status(400).json({ message: "Invalid event ID" });
      return;
    }

    const updateEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        name,
        description,
        sportType,
        date,
        time,
        location,
        tickets,
      },
      { new: true }
    );

    if (!updateEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json({ message: "Event updated", data: updateEvent });
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
