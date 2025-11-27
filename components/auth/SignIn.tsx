'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        router.push('/');
        router.refresh();
      },
      onError: (ctx) => {
        setError(ctx.error.message);
        setLoading(false);
      }
    });
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    await authClient.signIn.social({
      provider
    }, {
      onSuccess: () => {
        router.push('/');
      },
      onError: (ctx) => {
        setError(ctx.error.message);
      }
    });
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title" style={{ textAlign: 'center' }}>ACCESS TERMINAL</h2>
      </div>

      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {error && (
          <div style={{ 
            backgroundColor: 'var(--color-error)', 
            color: 'white', 
            padding: 'var(--spacing-sm)',
            border: 'var(--border-width) solid var(--color-border)',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ERROR: {error.toUpperCase()}
          </div>
        )}

        <div>
          <label>IDENTIFIER (EMAIL)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="USER@EXAMPLE.COM"
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        <div>
          <label>ACCESS CODE (PASSWORD)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? 'AUTHENTICATING...' : 'INITIATE SESSION'}
        </button>
      </form>

      <div style={{ 
        marginTop: 'var(--spacing-lg)', 
        borderTop: 'var(--border-width) solid var(--color-border)',
        paddingTop: 'var(--spacing-md)'
      }}>
        <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 'var(--spacing-md)' }}>
          {'// ALTERNATIVE PROTOCOLS'}
        </p>
        
        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          <button 
            type="button"
            onClick={() => handleSocialSignIn('google')}
            className="btn"
            style={{ width: '100%' }}
          >
            CONNECT VIA GOOGLE
          </button>
          <button 
            type="button"
            onClick={() => handleSocialSignIn('github')}
            className="btn"
            style={{ width: '100%' }}
          >
            CONNECT VIA GITHUB
          </button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
        <p>NO CREDENTIALS?</p>
        <Link href="/signup" style={{ 
          color: 'var(--color-accent-dark)', 
          fontWeight: '900', 
          textDecoration: 'none',
          borderBottom: '2px solid var(--color-accent-dark)'
        }}>
          REGISTER NEW USER
        </Link>
      </div>
    </div>
  );
}
