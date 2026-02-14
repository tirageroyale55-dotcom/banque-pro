import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  const decoded = jwtDecode(token);

  if (decoded.role !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
