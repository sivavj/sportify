import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }
  
  try {
    const decoded = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    // Attach user data to the request object
    req.params.id = decoded.userId;
    req.params.isOrganizer = String(decoded.isOrganizer);

    // Proceed to the next middleware/handler
    next();
  } catch (err) {
    res.status(400).json({ message: "Token is not valid" });
  }
};

export const organizerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.isOrganizer) {
    res
      .status(403)
      .json({ message: "Access denied, you must be an organizer" });
      return;
  }
  next();
};
