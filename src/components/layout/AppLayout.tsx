import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  IndianRupee,
  HandCoins,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Plus,
  Bell,
  Search,
  Building2,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { NotificationBell } from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

/* ---------- Nav Config ---------- */

const NAV_CONFIG: Record<UserRole, any[]> = {
  teacher: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Payments", href: "/payments", icon: IndianRupee },
    { name: "Jobs", href: "/jobs", icon: GraduationCap },
    { name: "Settlements", href: "/settlements", icon: HandCoins },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ],
  owner: [
    { name: "Overview", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Teachers", href: "/owner/teachers", icon: GraduationCap },
    { name: "Approvals", href: "/owner/approvals", icon: AlertCircle },
    { name: "Job Board", href: "/owner/jobs", icon: Plus },
    { name: "Settlements", href: "/owner/settlements", icon: HandCoins },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ],
  client: [
    { name: "My Fees", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Payment History", href: "/student/fees", icon: IndianRupee },
  ],
};

/* ---------- Component ---------- */

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const navItems = role ? NAV_CONFIG[role] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard">
              <Logo size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === item.href
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden ml-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                    {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground uppercase tracking-wider font-bold">
                      {role || "User"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                    <UserIcon className="h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden ml-1"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <Footer />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[300px] bg-background border-l shadow-xl p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size="sm" />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="mb-4 px-4 py-3 rounded-xl bg-muted/50">
                  <p className="text-sm font-semibold">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold">{role}</p>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "text-muted-foreground hover:bg-muted"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="my-4 h-px bg-border" />

                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  <UserIcon className="h-5 w-5" />
                  Account
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-all"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-all w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
