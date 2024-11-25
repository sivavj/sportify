import { useNavigate } from "react-router-dom";
import { useGetAll } from "../../hooks";
import { IEvent } from "./types";

const Events = () => {
  const { data, isLoading, isError } = useGetAll<{ data: IEvent[] }>(
    "/events",
    {
      key: "events",
    }
  );

  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">Error loading events.</div>
    );
  }

  const events: IEvent[] = data?.data?.data || ([] as IEvent[]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Events</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            navigate("/events/create");
          }}
        >
          Create Event
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event: IEvent) => (
          <div
            key={event._id}
            onClick={() => {
              navigate(`/events/${event._id}`);
            }}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
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
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}{" "}
                <strong>Time:</strong> {event.time}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Location:</strong> {event.location.address}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Organizer:</strong> {event.organizer.name} (
                {event.organizer.email})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
