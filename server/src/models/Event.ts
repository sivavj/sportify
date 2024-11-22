import { Schema, model, Document } from "mongoose";

interface IEvent extends Document {
  name: string;
  description: string;
  sportType: string;
  date: Date;
  time: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  tickets: {
    type: string;
    price: number;
    quantity: number;
    availableQuantity: number;
    sold: number;
  }[];
  organizer: Schema.Types.ObjectId;
  image: string;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    sportType: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    tickets: [
      {
        type: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        availableQuantity: { type: Number, required: true },
        sold: { type: Number, default: 0 },
      },
    ],
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

export const Event = model<IEvent>("Event", EventSchema);
