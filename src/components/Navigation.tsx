'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('boda_user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
  }, [pathname]); // re-check on every route change

  const handleNav = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('boda_token');
    localStorage.removeItem('boda_user');
    setUser(null);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'RIDER') return '/dashboard';
    return '/request-ride';
  };

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={handleNav}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3 shadow-sm shrink-0">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">BodaConnect</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/" className={navLinkClass('/')}>Home</Link>
            <Link href="/request-ride" className={navLinkClass('/request-ride')}>Request Ride</Link>

            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="px-4 py-2 rounded-md text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {user.role === 'ADMIN' ? 'Admin Panel' : user.role === 'RIDER' ? 'My Dashboard' : 'My Rides'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                  isActive('/login')
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full left-0">
          <Link href="/" onClick={handleNav} className={`w-full text-left px-4 py-3 rounded-md text-base font-medium block ${isActive('/') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}>
            Home
          </Link>
          <Link href="/request-ride" onClick={handleNav} className={`w-full text-left px-4 py-3 rounded-md text-base font-medium block ${isActive('/request-ride') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}>
            Request Ride
          </Link>

          {user ? (
            <>
              <Link href={getDashboardLink()} onClick={handleNav} className="w-full text-left px-4 py-3 rounded-md text-base font-medium block text-emerald-700 bg-emerald-50 border border-emerald-200">
                {user.role === 'ADMIN' ? 'Admin Panel' : user.role === 'RIDER' ? 'My Dashboard' : 'My Rides'}
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-md text-base font-medium block text-red-600 hover:bg-red-50 border border-slate-200 mt-1">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={handleNav} className={`w-full text-left px-4 py-3 rounded-md text-base font-medium border mt-2 block ${isActive('/login') ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
