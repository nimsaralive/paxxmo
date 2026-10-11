import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/px-portal" replace />;
  }

  if (!user?.role) return <main className="min-h-screen flex items-center justify-center p-6"><div className="max-w-md space-y-4">
    <h1 className="text-2xl">CMS access is required</h1>
    <p className="text-muted-foreground">Your account needs a CMS role. Check database connectivity and apply the Blog 2.0 migration if access previously worked.</p>
    <button onClick={logout} className="px-4 py-2 border rounded-lg">Sign out</button>
  </div></main>;
  return <>{children}</>;
};

export default ProtectedRoute;
