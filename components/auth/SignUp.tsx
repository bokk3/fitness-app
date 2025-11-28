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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        setError(error.message || "Er is een fout opgetreden bij het registreren");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="w-full max-w-md p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase tracking-tighter">REGISTREREN</h1>
      
      {error && (
        <div className="mb-6 p-4 border-2 border-red-600 bg-red-50 text-red-600 font-bold text-sm">
          FOUT: {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-6">
        <div>
          <label className="block font-bold mb-2 uppercase text-sm">Naam</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#00ff00] font-mono"
            placeholder="JOUW NAAM"
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-2 uppercase text-sm">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#00ff00] font-mono"
            placeholder="JOUW@EMAIL.COM"
            required
          />
        </div>
        
        <div>
          <label className="block font-bold mb-2 uppercase text-sm">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#00ff00] font-mono"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-[#00ff00] hover:text-black transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "BEZIG MET LADEN..." : "REGISTREREN"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-bold">
          AL EEN ACCOUNT?{" "}
          <Link href="/signin" className="text-[#00aa00] hover:underline uppercase">
            LOG HIER IN
          </Link>
        </p>
      </div>
    </div>
  );
}
