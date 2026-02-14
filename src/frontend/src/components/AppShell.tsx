import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { Activity, Users, Image, FileText, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMicrocontroller } from '../state/mcuStore';
import { Badge } from '@/components/ui/badge';
import LoginButton from './LoginButton';

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectionState } = useMicrocontroller();

  const navItems = [
    { path: '/connection', label: 'Connect', icon: Wifi },
    { path: '/live', label: 'Live', icon: Activity },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/gallery', label: 'Gallery', icon: Image },
    { path: '/export', label: 'Export', icon: FileText },
  ];

  const getConnectionBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      disconnected: 'outline',
      scanning: 'secondary',
      connecting: 'secondary',
      handshaking: 'secondary',
      ready: 'default',
      streaming: 'default',
      error: 'destructive',
    };
    return (
      <Badge variant={variants[connectionState] || 'outline'} className="ml-2">
        {connectionState}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EarScope Pro</h1>
              <p className="text-xs text-muted-foreground">Medical Ear Imaging</p>
            </div>
            {getConnectionBadge()}
          </div>
          <LoginButton />
        </div>
      </header>

      <nav className="border-b border-border bg-card">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                size="lg"
                onClick={() => navigate({ to: item.path })}
                className="min-w-[120px] gap-2"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EarScope Pro • Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
