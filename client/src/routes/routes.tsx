import { createBrowserRouter } from "react-router-dom";
import NotFound from "../pages/404/NotFound";
import BookingHistory from "../pages/booking-history/routes/BookingHistory";
import Events from "../pages/events/routes/Events";
import Login from "../pages/login/routes/Login";
import Register from "../pages/register/routes/Register";
import ProtectedLayout from "./ProtectedLayout";
import PublicLayout from "./PublicLayout";

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
      { path: "booking-history", element: <BookingHistory /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
