/**
 * Signal Room design reminder: one focused observability canvas with a persistent dark rail,
 * Quorum Lime state language, and inspectable interactions rather than generic marketing UI.
 * Runtime surface is intentionally minimal: no theme persistence or template UI providers.
 */
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function Router() {
  return window.location.pathname === "/" ? <Home /> : <NotFound />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster theme="dark" />
      <Router />
    </ErrorBoundary>
  );
}
