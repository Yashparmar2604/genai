import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

// Pages & Components
import Navbar from "./components/navbar";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Tickets from "./pages/tickets";
import TicketDetailsPage from "./pages/ticket";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Admin from "./pages/admin";

// Route paths configuration
export const PATHS = {
  HOME: "/",
  TICKETS: {
    LIST: "/",
    DETAIL: "/tickets/:id",
    CREATE: "/create-ticket"
  },
  MODERATOR: "/moderator",
  ADMIN: "/admin",
  AUTH: {
    LOGIN: "/login",
    SIGNUP: "/signup"
  }
};

// Error Boundary Component
function ErrorBoundaryComponent({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (hasError) {
      console.error("Error caught in boundary:", error);
    }
  }, [hasError, error]);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Something went wrong!</h3>
            <div className="text-sm">{error?.message || "Unknown error"}</div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

// NotFound Component
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="alert alert-warning max-w-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Page Not Found</h3>
          <div className="text-sm">The page you're looking for doesn't exist.</div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function AppComponent() {
  return (
    <React.StrictMode>
      <ErrorBoundaryComponent>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              success: {
                className: "bg-success text-success-content",
                duration: 3000
              },
              error: {
                className: "bg-error text-error-content",
                duration: 7000
              },
              loading: {
                className: "bg-info text-info-content"
              }
            }}
          />
          <Navbar paths={PATHS} />
          <main className="container mx-auto px-4">
            <Routes>
              <Route
                path={PATHS.HOME}
                element={
                  <RoleProtectedRoute allowedRoles={["user", "moderator", "admin"]}>
                    <Tickets />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path={PATHS.TICKETS.DETAIL}
                element={
                  <RoleProtectedRoute allowedRoles={["user", "moderator", "admin"]}>
                    <TicketDetailsPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path={PATHS.TICKETS.CREATE}
                element={
                  <RoleProtectedRoute allowedRoles={["user"]}>
                    <Tickets />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path={PATHS.MODERATOR}
                element={
                  <RoleProtectedRoute allowedRoles={["moderator"]}>
                    <Tickets />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path={PATHS.ADMIN}
                element={
                  <RoleProtectedRoute allowedRoles={["admin"]}>
                    <Admin />
                  </RoleProtectedRoute>
                }
              />
              <Route path={PATHS.AUTH.LOGIN} element={<Login />} />
              <Route path={PATHS.AUTH.SIGNUP} element={<Signup />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </BrowserRouter>
      </ErrorBoundaryComponent>
    </React.StrictMode>
  );
}

// Root render
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<AppComponent />);