import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/LoginPage';
import OAuthCallback from './features/auth/OAuthCallback';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import Dashboard from './features/dashboard/Dashboard';
import Analytics from './features/dashboard/Analytics';
import ResourceList from './features/resources/ResourceList';
import ResourceForm from './features/resources/ResourceForm';
import ResourceAvailability from './features/resources/ResourceAvailability';
import BookingList from './features/bookings/BookingList';
import BookingForm from './features/bookings/BookingForm';
import BookingReview from './features/bookings/BookingReview';
import BookingQR from './features/bookings/BookingQR';
import TicketList from './features/tickets/TicketList';
import TicketForm from './features/tickets/TicketForm';
import TicketDetail from './features/tickets/TicketDetail';
import NotificationPanel from './features/notifications/NotificationPanel';
import UserManagement from './features/users/UserManagement';
import ProfilePage from './features/users/ProfilePage';

// Roles that can book resources and view resource pages (all except TECHNICIAN)
const BOOKING_ROLES = ['ADMIN', 'USER', 'LECTURER', 'LAB_ASSISTANT'];

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationPanel />} />

            {/* Tickets — accessible to ADMIN, USER, TECHNICIAN, LECTURER, LAB_ASSISTANT */}
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />

            {/* Resources & Bookings — blocked for TECHNICIAN only */}
            <Route element={<RoleGuard allowedRoles={BOOKING_ROLES} />}>
              <Route path="/resources" element={<ResourceList />} />
              <Route path="/resources/:id/availability" element={<ResourceAvailability />} />
              <Route path="/bookings" element={<BookingList />} />
              <Route path="/bookings/new" element={<BookingForm />} />
              <Route path="/bookings/:id/qr" element={<BookingQR />} />
              <Route path="/tickets/new" element={<TicketForm />} />
            </Route>

            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path="/admin/resources/new" element={<ResourceForm />} />
              <Route path="/admin/resources/:id/edit" element={<ResourceForm />} />
              <Route path="/admin/bookings/review" element={<BookingReview />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}
