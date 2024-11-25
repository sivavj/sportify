export interface IEvent {
  _id: string;
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
  tickets: ITicket[];
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  image: string;
}

export interface ITicket {
  _id: string;
  type: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  sold: number;
}
