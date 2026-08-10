import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityProvider";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/Dashboard";

// Code-split routes that aren't part of the everyday guest/sign-in path —
// keeps the initial bundle (and landing-page time-to-interactive) smaller.
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AccessibilityStatementPage = lazy(() => import("./pages/AccessibilityStatementPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/app" element={<Dashboard />} />
              <Route path="/accessibility" element={<AccessibilityStatementPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
export default App;
