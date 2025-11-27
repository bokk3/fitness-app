'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await authClient.signUp.email({
      email,
      password,
      name,
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

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card-header">
        <h2 className="card-title" style={{ textAlign: 'center' }}>NEW USER REGISTRATION</h2>
      </div>

      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
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
          <label>DESIGNATION (NAME)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="JOHN DOE"
            style={{ textTransform: 'uppercase' }}
          />
        </div>

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
            minLength={8}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? 'REGISTERING...' : 'CREATE CREDENTIALS'}
        </button>
      </form>

      <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
        <p>ALREADY REGISTERED?</p>
        <Link href="/signin" style={{ 
          color: 'var(--color-accent-dark)', 
          fontWeight: '900', 
          textDecoration: 'none',
          borderBottom: '2px solid var(--color-accent-dark)'
        }}>
          INITIATE SESSION
        </Link>
      </div>
    </div>
  );
}
