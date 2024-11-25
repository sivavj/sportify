import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import BottomHeader from "../components/BottomHeader";

const ProtectedLayout = () => {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <div className="flex flex-col mb-16">
        <Outlet />
      </div>
      <BottomHeader />
    </div>
  );
};

export default ProtectedLayout;
