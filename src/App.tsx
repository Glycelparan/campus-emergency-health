import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { Nav } from "@/components/nav";
import Home from "./components/home";
import routes from "tempo-routes";
import { ChatBox } from "@/components/ChatBox";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  return (
    <>
      <Nav />
      <main className="container mx-auto py-6">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </main>
      <ChatBox />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <AppContent />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
