import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole, isLoggedIn, userData, authLoading }) => {
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
                <div className="text-xl">Betöltés...</div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    // If a specific role is required, check if user has that role
    if (requiredRole && userData?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;