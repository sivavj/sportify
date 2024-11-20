import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.get("/:userId", authMiddleware, getUser);
router.put("/:userId", authMiddleware, updateUser);
router.delete("/:userId", authMiddleware, deleteUser);

export default router;
