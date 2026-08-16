import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Menu, X, Home, ScanLine, LayoutDashboard, History, Info, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/analyze", label: "Analyze", icon: ScanLine },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/history", label: "History", icon: History },
  { to: "/about", label: "About", icon: Info },
  { to: "/profile", label: "Profile", icon: User },
] as const;

/** Responsive top navigation with a mobile bottom bar for small screens. */
export function NavBar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="gradient-leaf flex size-9 items-center justify-center rounded-xl text-primary-foreground">
              <Leaf className="size-5" aria-hidden="true" />
            </span>
            <span className="text-base">AgriVision AI</span>
          </Link>

          <ul className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                Log out
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>

        {open ? (
          <div className="border-t border-border bg-card md:hidden">
            <ul className="mx-auto max-w-6xl px-4 py-2">
              {LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-foreground" }}
                  >
                    <link.icon className="size-4" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      {/* Mobile bottom navigation for the primary tasks */}
      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur md:hidden"
      >
        {LINKS.filter((l) => ["/", "/analyze", "/dashboard", "/history"].includes(l.to)).map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <link.icon className="size-5" aria-hidden="true" />
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}


