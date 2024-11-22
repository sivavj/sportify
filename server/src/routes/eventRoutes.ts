import express from "express";
import {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";
import {
  authMiddleware,
  organizerMiddleware,
} from "../middleware/authMiddleware";
import upload from "../utils/fileUpload";

const router = express.Router();

router.get("/", authMiddleware, getEvents);
router.get("/:eventId", authMiddleware, getEvent);
router.post("/", authMiddleware, organizerMiddleware, upload.single("image"), createEvent);
router.put("/:eventId", authMiddleware, organizerMiddleware, upload.single("image"), updateEvent);
router.delete("/:eventId", authMiddleware, organizerMiddleware, deleteEvent);

export default router;
