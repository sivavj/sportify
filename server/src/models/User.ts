import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  preferences?: {
    sports: string[];
    location: {
      latitude: number;
      longitude: number;
    };
  };
  isOrganizer: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    preferences: {
      sports: { type: [String] },
      location: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    isOrganizer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
