import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TeamDetail from './pages/TeamDetail';
import CreateTeam from './pages/CreateTeam';
import EditTeam from './pages/EditTeam';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import IncomingRequests from './pages/IncomingRequests';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Route guard to check user login status
const PrivateRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

// Route guard to check administrator privileges
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return token && user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Routes (Students) */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams/:id"
                element={
                  <PrivateRoute>
                    <TeamDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/create-team"
                element={
                  <PrivateRoute>
                    <CreateTeam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teams/edit/:id"
                element={
                  <PrivateRoute>
                    <EditTeam />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <PrivateRoute>
                    <EditProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/requests"
                element={
                  <PrivateRoute>
                    <IncomingRequests />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="border-t border-gray-900 bg-gray-950 py-6 text-center text-xs text-gray-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} Who's In? Team Formation Platform. Built for students.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
