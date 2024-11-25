import { Link } from "react-router-dom";
import NotFoundImage from "../../assets/404.svg";
import useAuthStore from "../../store/authStore";

const NotFound = () => {
  const { isLoggedIn } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <img
          src={NotFoundImage}
          alt="Page Not Found"
          className="w-full max-w-md mx-auto mt-6"
        />
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">
          Oops! Page Not Found
        </h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to={isLoggedIn ? "/events" : "/"}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-base shadow hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
