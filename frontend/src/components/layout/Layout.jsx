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
        <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)}  />
        <main className="flex-1 p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}