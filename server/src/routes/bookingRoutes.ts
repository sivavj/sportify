import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController";

const router = express.Router();

router.get("/", authMiddleware, getBookings);
router.get("/:bookingId", authMiddleware, getBooking);
router.post("/", authMiddleware, createBooking);
router.put("/:bookingId", authMiddleware, updateBooking);
router.delete("/:bookingId", authMiddleware, deleteBooking);

export default router;
