import { Schema, model, Document } from "mongoose";

interface IPayment extends Document {
  booking: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  paymentId: string;
  amount: number;
  status: "success" | "failed" | "pending";
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
