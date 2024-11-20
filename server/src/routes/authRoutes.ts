import express from "express";
import { login, register } from "../controllers/authController";
import { validatePayload } from "../utils/validatePayload";
import { loginSchema, registerSchema } from "../models/validationSchemas";

const router = express.Router();

router.post("/register", validatePayload(registerSchema), register);
router.post("/login", validatePayload(loginSchema), login);

export default router;
