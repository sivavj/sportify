import { IUser } from "../../types";
import { IEvent } from "../events/types";

export interface IBooking {
    _id: string;
    user: IUser;
    event: IEvent;
    tickets: {
      type: string;
      quantity: number;
    }[];
    totalAmount: number;
    paymentStatus: "pending" | "completed" | "failed";
    qrCode: string;
  }
  
  export interface CreateBookingRequest {
    userId: string;
    eventId: string;
    tickets: {
      type: string;
      quantity: number;
    }[];
  }