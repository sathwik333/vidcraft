import { lazy, Suspense } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded pages for code-splitting
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const GeneratePage = lazy(() => import("@/pages/GeneratePage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const SharedVideoPage = lazy(() => import("@/pages/SharedVideoPage"));
const SignInPage = lazy(() => import("@/pages/SignInPage"));
const SignUpPage = lazy(() => import("@/pages/SignUpPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="space-y-4 w-full max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={
            <>
              <SignedIn><Navigate to="/dashboard" replace /></SignedIn>
              <SignedOut><LandingPage /></SignedOut>
            </>
          }
        />
        <Route path="/v/:videoId" element={<SharedVideoPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
      </Route>

      {/* Pricing — sidebar when signed in, public layout when signed out */}
      <Route
        path="/pricing"
        element={
          <>
            <SignedIn><AuthenticatedLayout /></SignedIn>
            <SignedOut><PublicLayout /></SignedOut>
          </>
        }
      >
        <Route index element={<PricingPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Route>

      {/* 404 */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
