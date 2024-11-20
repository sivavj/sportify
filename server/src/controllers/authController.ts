import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, isOrganizer } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      isOrganizer: isOrganizer || false,
    });
    const savedUser = await newUser.save();

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.status(201).json({ token, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user!.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user!._id, isOrganizer: user!.isOrganizer },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};
