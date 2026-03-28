import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, profile, allowedRoles, children }) {
  // 1. If not logged in at all, go to Login
  if (!user) {
    return <Navigate to="/" replace />; // Redirect to home since you use a Modal
  }
  // 2. If profile is still loading, show nothing (or a spinner)
  if (!profile) {
    return <div>Loading...</div>;
  }

  // 3. If the user's role isn't in the "allowed" list, kick them to Home
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. If they passed all checks, show the page!
  return children;
};