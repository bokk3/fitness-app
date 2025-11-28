'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Er is een fout opgetreden bij het inloggen");
      } else {
        router.push("/");
        router.refresh(); // Keep refresh as it was in original onSuccess
      }
    } catch (_) {
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError(null); // Clear previous errors
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/" // Added callbackURL as per common practice for social sign-in
      });

      if (error) {
        setError(error.message || "Fout bij inloggen met sociale provider");
      } else {
        router.push("/");
        router.refresh(); // Keep refresh as it was in original onSuccess
      }
    } catch (_) {
      setError("Er is een onverwachte fout opgetreden bij sociale aanmelding");
    }
  };

  return (
    <div className="w-full max-w-lg p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase tracking-tighter">INLOGGEN</h1>
      
      {error && (
        <div className="mb-6 p-4 border-2 border-red-600 bg-red-50 text-red-600 font-bold text-sm">
          FOUT: {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-6">
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-4 font-bold uppercase tracking-widest hover:bg-[#00ff00] hover:text-black transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "BEZIG MET LADEN..." : "INLOGGEN"}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-black"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white font-bold uppercase">OF GA VERDER MET</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialSignIn("google")}
            className="flex items-center justify-center px-4 py-3 border-2 border-black hover:bg-gray-50 font-bold uppercase text-sm"
          >
            GOOGLE
          </button>
          <button
            onClick={() => handleSocialSignIn("github")}
            className="flex items-center justify-center px-4 py-3 border-2 border-black hover:bg-gray-50 font-bold uppercase text-sm"
          >
            GITHUB
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm font-bold">
          NOG GEEN ACCOUNT?{" "}
          <Link href="/signup" className="text-[#00aa00] hover:underline uppercase">
            REGISTREER HIER
          </Link>
        </p>
      </div>
    </div>
  );
}
