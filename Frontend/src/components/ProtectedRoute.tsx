import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactElement;
  role?: "admin" | "customer";
};

export default function ProtectedRoute({ children, role }: Props) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
