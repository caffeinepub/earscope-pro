import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/AppShell';
import ConnectionPage from './pages/ConnectionPage';
import LiveCameraPage from './pages/LiveCameraPage';
import PatientsSessionsPage from './pages/PatientsSessionsPage';
import GalleryPage from './pages/GalleryPage';
import ExportReportsPage from './pages/ExportReportsPage';
import { MicrocontrollerProvider } from './state/mcuStore';
import { ActiveSessionProvider } from './state/activeSessionStore';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ConnectionPage,
});

const connectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/connection',
  component: ConnectionPage,
});

const liveCameraRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live',
  component: LiveCameraPage,
});

const patientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/patients',
  component: PatientsSessionsPage,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: GalleryPage,
});

const exportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/export',
  component: ExportReportsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  connectionRoute,
  liveCameraRoute,
  patientsRoute,
  galleryRoute,
  exportRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MicrocontrollerProvider>
        <ActiveSessionProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ActiveSessionProvider>
      </MicrocontrollerProvider>
    </ThemeProvider>
  );
}
