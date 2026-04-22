import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/Users';
import AddQuiz from './pages/admin/AddQuiz';
import AttemptReview from './pages/admin/AttemptReview';
import StudentDetail from './pages/admin/StudentDetail';
import QuizLeaderboard from './pages/admin/QuizLeaderboard';

// Student Pages
import StudentHome from './pages/student/Home';
import Profile from './pages/Profile';
import QuizAttempt from './pages/student/QuizAttempt';
import ResultPage from './pages/student/ResultPage';
import MyResults from './pages/student/MyResults';
import MyHistory from './pages/student/History';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyAdmin from './pages/VerifyAdmin';

import Landing from './pages/Landing';

import MainLayout from './components/MainLayout';

function App() {
  return (
    <Routes>
      {/* Public Routes - No Global Layout */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-admin" element={<VerifyAdmin />} />

      {/* Quiz Mode - Dedicated Clean UI */}
      <Route path="/quiz/:id" element={
        <ProtectedRoute role="student">
          <QuizAttempt />
        </ProtectedRoute>
      } />

      {/* Portal Routes - Shared Layout (Navbar & Footer) */}
      <Route element={<MainLayout />}>
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-quiz" element={
          <ProtectedRoute role="admin">
            <AddQuiz />
          </ProtectedRoute>
        } />
        <Route path="/admin/review-attempt/:id" element={
          <ProtectedRoute role="admin">
            <AttemptReview />
          </ProtectedRoute>
        } />
        <Route path="/admin/student/:id" element={
          <ProtectedRoute role="admin">
            <StudentDetail />
          </ProtectedRoute>
        } />
        <Route path="/admin/quiz/:id/leaderboard" element={
          <ProtectedRoute role="admin">
            <QuizLeaderboard />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student/home" element={
          <ProtectedRoute role="student">
            <StudentHome />
          </ProtectedRoute>
        } />
        <Route path="/result/:id" element={
          <ProtectedRoute role="student">
            <ResultPage />
          </ProtectedRoute>
        } />
        <Route path="/my-results" element={
          <ProtectedRoute role="student">
            <MyResults />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute role={["admin", "student"]}>
            <MyHistory />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute role={["admin", "student"]}>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute role={["admin", "student"]}>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
