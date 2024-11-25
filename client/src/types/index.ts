export interface IUser {
    _id: string;
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