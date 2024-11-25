import { createBrowserRouter } from "react-router-dom";
import NotFound from "../pages/404/NotFound";
import BookingHistory from "../pages/booking-history/BookingHistory";
import Events from "../pages/events/Events";
import Register from "../pages/register/Register";
import ProtectedLayout from "./ProtectedLayout";
import PublicLayout from "./PublicLayout";
import Login from "../pages/login/Login";
import EventDetails from "../pages/events/EventDetails";
import AddEvent from "../pages/events/AddEvent";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Events /> },
      { path: "events", element: <Events /> },
      { path: "events/create", element: <AddEvent /> },
      { path: "events/:id", element: <EventDetails /> },
      { path: "bookings", element: <BookingHistory /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
