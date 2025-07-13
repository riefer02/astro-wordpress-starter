import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimpleAvatar } from '@/components/ui/simple-avatar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu, User, LogOut, Home, FileText } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  roles?: string[];
}

interface HeaderProps {
  isAuthenticated: boolean;
  user?: User;
}

export default function Header({ isAuthenticated, user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userInitials = user?.display_name
    ? user.display_name
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || 'U';

  const NavigationItems = ({ mobile = false }: { mobile?: boolean }) => {
    const baseClass = mobile
      ? 'flex flex-col space-y-2'
      : 'flex items-center space-x-6';

    const linkClass = mobile
      ? 'w-full justify-start text-left h-12 px-0 text-base font-medium'
      : 'text-sm font-medium';

    return (
      <div className={baseClass}>
        <Button variant="ghost" asChild className={linkClass}>
          <a
            href="/"
            className={mobile ? 'flex items-center gap-3' : ''}
            onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
          >
            {mobile && <Home className="h-5 w-5" />}
            Home
          </a>
        </Button>

        <Button variant="ghost" asChild className={linkClass}>
          <a
            href="/posts"
            className={mobile ? 'flex items-center gap-3' : ''}
            onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
          >
            {mobile && <FileText className="h-5 w-5" />}
            Posts
          </a>
        </Button>

        {isAuthenticated ? (
          // Authenticated user section
          <>
            {mobile && (
              <div className="border-t pt-6 mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Account
                </p>
              </div>
            )}

            <Button variant="ghost" asChild className={linkClass}>
              <a
                href="/profile"
                className={
                  mobile ? 'flex items-center gap-3' : 'flex items-center gap-2'
                }
                onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              >
                {mobile ? (
                  <>
                    <SimpleAvatar className="w-5 h-5 text-xs">
                      {userInitials}
                    </SimpleAvatar>
                    <span>Profile</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {user?.display_name || user?.username}
                    </span>
                  </>
                ) : (
                  <>
                    <SimpleAvatar className="w-6 h-6 text-xs">
                      {userInitials}
                    </SimpleAvatar>
                    Profile
                  </>
                )}
              </a>
            </Button>

            <Button
              variant={mobile ? 'ghost' : 'outline'}
              asChild
              className={
                mobile
                  ? `${linkClass} text-destructive hover:text-destructive hover:bg-destructive/10`
                  : ''
              }
            >
              <a
                href="/api/auth/logout"
                className={mobile ? 'flex items-center gap-3' : ''}
                onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              >
                {mobile && <LogOut className="h-5 w-5" />}
                Logout
              </a>
            </Button>
          </>
        ) : (
          // Unauthenticated user section
          <>
            {mobile && (
              <div className="border-t pt-6 mt-6">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Account
                </p>
              </div>
            )}

            <Button variant="ghost" asChild className={linkClass}>
              <a
                href="/login"
                className={mobile ? 'flex items-center gap-3' : ''}
                onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              >
                {mobile && <User className="h-5 w-5" />}
                Login
              </a>
            </Button>

            <Button
              asChild
              className={
                mobile
                  ? `${linkClass} bg-primary text-primary-foreground hover:bg-primary/90`
                  : ''
              }
              variant={mobile ? 'ghost' : 'default'}
            >
              <a
                href="/register"
                className={mobile ? 'flex items-center gap-3' : ''}
                onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
              >
                {mobile && <User className="h-5 w-5" />}
                Register
              </a>
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Site Title / Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              Astro WordPress
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <NavigationItems />
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
                <SheetHeader className="px-6 py-4 border-b">
                  <SheetTitle className="text-lg font-semibold text-left">
                    Astro WordPress
                  </SheetTitle>
                </SheetHeader>
                <div className="px-6 py-6">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-muted-foreground mb-4">
                      Navigation
                    </p>
                  </div>
                  <NavigationItems mobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
