import { Schema, model, Document } from "mongoose";
import QRCode from "qrcode";

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
    qrCode: { type: String, required: false },
  },
  { timestamps: true }
);

// Pre-save hook to generate QR code before saving
BookingSchema.pre("save", async function (next) {
  if (!this.qrCode) {
    try {
      const id = this._id as string;
      // Generate QR code for the booking ID
      const qrCode = await QRCode.toDataURL(id.toString());
      this.qrCode = qrCode; // Assign the generated QR code to the qrCode field
      next(); // Proceed with the save operation
    } catch (error: any) {
      next(error); // Handle any errors during QR code generation
    }
  } else {
    next(); // If qrCode already exists, just save the document
  }
});

export const Booking = model<IBooking>("Booking", BookingSchema);
