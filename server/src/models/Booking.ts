import { Schema, model, Document } from "mongoose";

interface IBooking extends Document {
  user: Schema.Types.ObjectId;
  event: Schema.Types.ObjectId;
  tickets: {
    type: string;
    quantity: number;
  }[];
  totalAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  qrCode: string;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    tickets: [
      {
        type: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    qrCode: { type: String, required: true },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", BookingSchema);
