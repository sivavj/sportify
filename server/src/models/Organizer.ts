import { Schema, model, Document } from "mongoose";

interface IOrganizer extends Document {
  user: Schema.Types.ObjectId;
  organizationName: string;
}

const OrganizerSchema = new Schema<IOrganizer>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Organizer = model<IOrganizer>("Organizer", OrganizerSchema);
