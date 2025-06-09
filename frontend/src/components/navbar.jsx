import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ paths }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Update auth state when route changes or component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setToken(storedToken);
    setUser(storedUser);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Navbar link component for consistent styling and behavior
  const NavLink = ({ to, className = "", children }) => (
    <Link
      to={to}
      className={`btn btn-sm ${className}`}
      onClick={() => {
        // Force refresh user data on navigation
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUser(currentUser);
      }}
    >
      {children}
    </Link>
  );

  return (
    <nav className="navbar bg-base-100 shadow-md px-4 sm:px-8">
      <div className="flex-1">
        <NavLink to="/" className="btn-ghost normal-case text-xl">
          Ticket AI
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        {!token ? (
          <div className="flex items-center gap-2">
            <NavLink to="/signup" className="btn-ghost">
              Sign up
            </NavLink>
            <NavLink to="/login" className="btn-primary">
              Login
            </NavLink>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Dashboard Link based on role */}
            <NavLink
              to={user?.role === "moderator" ? "/moderator" : "/"}
              className="btn-ghost"
            >
              {user?.role === "admin"
                ? "All Tickets"
                : user?.role === "moderator"
                ? "My Assignments"
                : "My Tickets"}
            </NavLink>

            {/* Create Ticket - Only for users */}
            {user?.role === "user" && (
              <NavLink to="/create-ticket" className="btn-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Ticket
              </NavLink>
            )}

            {/* Admin Panel - Only for admins */}
            {user?.role === "admin" && (
              <NavLink to="/admin" className="btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Admin Panel
              </NavLink>
            )}

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-8">
                  <span className="text-xs">{user?.name?.charAt(0)}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-base-content/70 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}