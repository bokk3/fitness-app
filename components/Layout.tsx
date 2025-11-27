'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/workouts', label: 'Workouts' },
    { href: '/exercises', label: 'Exercises' },
    { href: '/progress', label: 'Progress' },
    { href: '/goals', label: 'Goals' },
    { href: '/nutrition', label: 'Nutrition' },
  ];
  
  return (
    <>
      <nav className="nav">
        <div className="container nav-container">
          <Link href="/" className="nav-brand">
            FITTRACK
          </Link>
          <ul className="nav-links">
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
            FITTRACK © 2025 - TRACK YOUR GAINS
          </p>
        </div>
      </footer>
    </>
  );
}
