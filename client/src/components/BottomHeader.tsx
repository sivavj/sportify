import { Button, DropdownMenu } from "@radix-ui/themes";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetOne } from "../hooks";
import useAuthStore from "../store/authStore";
import { IUser } from "../types";

const BottomHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { session, logout } = useAuthStore();

  const { data } = useGetOne<{ data: IUser }>(`/users/${session?.userId}`, {
    key: "users",
  });

  const user: IUser =
    data?.data?.data ||
    ({
      name: "",
      email: "",
    } as IUser);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (name: string) => {
    const names = name?.split(" ");
    return names?.length > 1
      ? names[0].charAt(0) + names[1].charAt(0)
      : names[0].charAt(0);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-[1000]">
      <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200">
        {/* Left: App Name */}
        <div className="text-xl font-bold text-gray-800 cursor-pointer">
          Event Management
        </div>

        {/* Center: Menu Items */}
        <div className="flex space-x-8">
          <button
            className={`text-gray-700 hover:text-blue-500 transition duration-300 ${
              isActive("/events") ? "border-b-2 border-blue-500 font-bold" : ""
            }`}
            onClick={() => navigate("/events")}
          >
            Events
          </button>
          <button
            className={`text-gray-700 hover:text-blue-500 transition duration-300 ${
              isActive("/bookings")
                ? "border-b-2 border-blue-500 font-bold"
                : ""
            }`}
            onClick={() => navigate("/bookings")}
          >
            Bookings
          </button>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft">
              {getInitials(user?.name)}
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item shortcut="👤">{user?.name}</DropdownMenu.Item>
            <DropdownMenu.Item shortcut="@">{user?.email}</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item shortcut="⏻" color="red" onClick={logout}>
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

export default BottomHeader;
