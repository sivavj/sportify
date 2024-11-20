import { Schema, model, Document } from "mongoose";

interface INotification extends Document {
  user: Schema.Types.ObjectId;
  message: string;
  isRead: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<INotification>("Notification", NotificationSchema);
