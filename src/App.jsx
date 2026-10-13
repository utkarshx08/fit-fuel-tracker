import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import DashboardPage from './pages/DashboardPage';
import FoodDiaryPage from './pages/FoodDiaryPage';
import WorkoutsPage from './pages/WorkoutsPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/food':
        return { title: 'Food diary', eyebrow: 'NUTRITION JOURNAL' };
      case '/workouts':
        return { title: 'Workouts & activity', eyebrow: 'MOVE WITH PURPOSE' };
      case '/progress':
        return { title: 'Your progress', eyebrow: 'THE BIG PICTURE' };
      case '/settings':
        return { title: 'Profile & daily targets', eyebrow: 'PERSONALIZE' };
      default:
        return { title: null, eyebrow: 'YOUR DAILY CHECK-IN' };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="shell min-h-screen flex bg-[#0b0d12] text-[#f2f4f8]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="w-full md:w-[calc(100%-240px)] max-w-[1600px] mx-auto p-5 md:p-8 lg:p-10 flex flex-col justify-between">
        <div>
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            pageTitle={pageInfo.title}
            eyebrow={pageInfo.eyebrow}
          />
          {children}
        </div>

        {/* Global Footer */}
        <footer className="mt-14 pt-6 pb-2 border-t border-[#1e222d] text-xs text-[#71798a] flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            Made for your progress <span className="lime">✦</span>
          </div>
          <small className="text-[11px] text-[#626a79]">
            FitFuel 2.0 • Cloud Synced & Nutritiously Verified
          </small>
        </footer>
      </main>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/overview"
        element={<Navigate to="/" replace />}
      />
      <Route
        path="/food"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FoodDiaryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workouts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkoutsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProgressPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotFoundPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
