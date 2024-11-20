import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: string; // Store user ID or any other info you need from the token
      isOrganizer?: boolean; // Flag to check if the user is an organizer
    }
  }
}