
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DESKTOP_BREAKPOINT = 1024;

export default function Layout() {
  // Mobile sidebar toggle (desktop sidebar is always visible as mini)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        sidebarOpen={mobileOpen}
        onToggleSidebar={() => setMobileOpen(v => !v)}
      />
      <div className="flex">
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        {/* 
          On desktop: ml-16 to make room for the mini sidebar (w-16 = 64px)
          On mobile:  ml-0 (sidebar is overlay, doesn't push content)
        */}
        <main className="flex-1 p-6 mt-16 ml-0 lg:ml-16 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
