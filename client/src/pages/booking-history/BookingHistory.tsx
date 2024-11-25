import { useGetAll } from "../../hooks";
import { IBooking } from "./types";

const BookingHistory = () => {
  const { data, isLoading, isError } = useGetAll<{ data: IBooking[] }>(
    "/bookings",
    {
      key: "bookings",
    }
  );

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">Error loading events.</div>
    );
  }

  const bookings: IBooking[] = data?.data?.data || ([] as IBooking[]);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Booking History
      </h1>

      {/* Table Layout */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                User
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Event
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Tickets
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Payment Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                QR Code
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking._id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.user.name} <br />
                  <span className="text-sm text-gray-500">
                    {booking.user.email}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.event.name}
                  <br />
                  <span className="text-sm text-gray-500">
                    {booking.event.description}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {booking.tickets.map((ticket, index) => (
                    <div key={index}>
                      {ticket.type}: {ticket.quantity}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  ₹{booking.totalAmount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      booking.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <img
                    src={booking.qrCode}
                    alt="QR Code"
                    className="w-26 h-26 border-2 border-gray-300 rounded-md"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingHistory;
