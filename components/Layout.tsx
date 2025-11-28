'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/signin');
        },
      },
    });
  };

  // Protect routes
  const publicRoutes = ['/signin', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPending) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Courier New, monospace',
        fontWeight: 'bold'
      }}>
        SYSTEEM INITIALISEREN...
      </div>
    );
  }

  if (!session && !isPublicRoute) {
    router.push('/signin');
    return null;
  }
  
  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/workouts', label: 'Workouts' },
    { href: '/exercises', label: 'Oefeningen' },
    { href: '/progress', label: 'Voortgang' },
    { href: '/goals', label: 'Doelen' },
    { href: '/nutrition', label: 'Voeding' },
  ];
  
  return (
    <>
      <nav className="nav">
        <div className="container nav-container">
          <Link href="/" className="nav-brand">
            FITTRACK
          </Link>
          <ul className="nav-links">
            {session ? (
              <>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="nav-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                  >
                    UITLOGGEN
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  href="/signin"
                  className={`nav-link ${pathname === '/signin' ? 'active' : ''}`}
                >
                  INLOGGEN
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <main className="container" style={{ paddingTop: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-xl)' }}>
        {children}
      </main>
      <footer style={{ 
        borderTop: 'var(--border-width) solid var(--color-border)', 
        padding: 'var(--spacing-md) 0',
        textAlign: 'center',
        marginTop: 'var(--spacing-xl)'
      }}>
        <div className="container">
          <p style={{ margin: 0, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem' }}>
            FITTRACK © 2025 - HOUD JE VOORTGANG BIJ
          </p>
        </div>
      </footer>
    </>
  );
}
