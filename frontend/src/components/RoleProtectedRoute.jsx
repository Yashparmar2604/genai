import { Navigate } from 'react-router-dom';

export default function RoleProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/" 
}) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === "moderator") {
      return <Navigate to="/moderator" replace />;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}