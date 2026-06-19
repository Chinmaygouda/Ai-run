import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { motion } from "framer-motion";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Process from "@/pages/Process";
import Results from "@/pages/Results";
import History from "@/pages/History";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

// Layouts
import SidebarLayout from "@/components/layout/SidebarLayout";
import ErrorBoundary from "@/ErrorBoundary";

const queryClient = new QueryClient();

// Page transition animation
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

function AuthenticatedRoutes() {
  return (
    <SidebarLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageVariants}
        key="authenticated"
      >
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/process/:id" component={Process} />
          <Route path="/results/:id" component={Results} />
          <Route path="/history" component={History} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </SidebarLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={AuthenticatedRoutes} />
      <Route path="/upload" component={AuthenticatedRoutes} />
      <Route path="/process/:id" component={AuthenticatedRoutes} />
      <Route path="/results/:id" component={AuthenticatedRoutes} />
      <Route path="/history" component={AuthenticatedRoutes} />
      <Route path="/reports" component={AuthenticatedRoutes} />
      <Route path="/settings" component={AuthenticatedRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
        <Toaster position="top-center" theme="dark" />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
