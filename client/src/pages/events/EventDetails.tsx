import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react"; // Import useState for managing ticket quantities
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { useCreate, useGetOne } from "../../hooks";
import useAuthStore from "../../store/authStore";
import { CreateBookingRequest } from "../booking-history/types";
import { IEvent, ITicket } from "./types";

const EventDetails = () => {
  const { id } = useParams();
  const { data, isLoading, isError, refetch } = useGetOne<{ data: IEvent }>(
    `/events/${id}`,
    {
      key: "event",
    }
  );

  // State to manage ticket quantities
  const [selectedTickets, setSelectedTickets] = useState<{
    [ticketId: string]: number;
  }>({});

  const { mutate, isPending } = useCreate("/bookings", {
    key: "bookings",
    onSuccess: () => {
      refetch();
     setSelectedTickets({});
    },
  });

  const { session } = useAuthStore();
  const userId = session?.userId ?? "";

  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">Error loading events.</div>
    );
  }

  const event: IEvent = data?.data?.data || ({} as IEvent);

  const position: LatLngTuple = [
    event.location.latitude,
    event.location.longitude,
  ];

  // Handle ticket quantity change
  const handleQuantityChange = (ticketId: string, change: number) => {
    setSelectedTickets((prev) => {
      const currentQuantity = prev[ticketId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change); // Ensure quantity is non-negative
      return { ...prev, [ticketId]: newQuantity };
    });
  };

  // Handle booking process
  const handleBookNow = () => {
    // Create the booking object (this can be modified to match your booking logic)
    const booking: CreateBookingRequest = {
      tickets: Object.entries(selectedTickets).map(([ticketId, quantity]) => ({
        type:
          event.tickets.find((ticket) => ticket._id === ticketId)?.type || "",
        quantity,
      })),
      userId: userId,
      eventId: event._id,
    };

    mutate(booking);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="flex items-center text-gray-800 hover:text-gray-600 mr-4"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Event Details</h1>
        </div>

        <div className="flex items-center">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              navigate(`/events/${event._id}/edit`);
            }}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg ml-4"
            onClick={() => {
              // navigate(`/events/${event._id}/delete`);
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-4 items-stretch mb-4">
        {/* Event Details Section */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden w-2/4">
          {/* Event Image */}
          <img
            src={`data:image/jpeg;base64,${event.image}`}
            alt={event.name}
            className="h-48 w-full object-cover"
          />
          {/* Event Details */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Sport:</strong> {event.sportType}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}{" "}
              <strong>Time:</strong> {event.time}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Location:</strong> {event.location.address}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Organizer:</strong> {event.organizer.name} (
              {event.organizer.email})
            </p>
            {/* Tickets */}
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800">Tickets</h4>
              {event.tickets.map((ticket: ITicket) => (
                <div
                  key={ticket._id}
                  className="bg-gray-100 p-2 rounded-md mt-2"
                >
                  <p className="text-sm text-gray-700">
                    <strong>Type:</strong> {ticket.type}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Price:</strong> ₹{ticket.price}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Available:</strong>{" "}
                    {ticket.availableQuantity ?? ticket.quantity} /{" "}
                    {ticket.quantity}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      className="px-4 py-1 text-sm text-white bg-gray-500 rounded"
                      onClick={() => handleQuantityChange(ticket._id, -1)}
                    >
                      -
                    </button>
                    <span className="mx-4">
                      {selectedTickets[ticket._id] || 0}
                    </span>
                    <button
                      className="px-4 py-1 text-sm text-white bg-gray-500 rounded"
                      onClick={() => handleQuantityChange(ticket._id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
            >
              {isPending ? "Booking..." : "Book Now"}
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="w-2/4 shadow-md rounded-lg overflow-hidden">
          <MapContainer
            center={{
              lat: event.location.latitude,
              lng: event.location.longitude,
            }}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={position}>
              <Popup>{event.location.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
