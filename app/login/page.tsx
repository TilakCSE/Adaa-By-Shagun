"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Define who the admins are
  const adminEmails = ["admin@test.com", "contact.adaabyshagun@gmail.com"];

  // 1. SMART CHECK ON PAGE LOAD: If already logged in, where should they go?
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email && adminEmails.includes(user.email.toLowerCase())) {
          router.push("/admin"); 
        } else {
          router.push("/account"); // Regular customers go to their account
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. SMART CHECK ON SIGN IN: When they click the login button, where do they go?
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // SMART ROUTING: If they are an admin, go to dashboard. Otherwise, go to home.
      if (adminEmails.includes(email.toLowerCase())) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-brand-burgundy mb-2">Welcome Back</h1>
          <p className="text-brand-charcoal/70">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors"
              placeholder="admin@adaabyshagun.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-brand-rose focus:ring-1 focus:ring-brand-rose transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-burgundy text-white py-3 rounded-md hover:bg-brand-charcoal transition-colors font-medium"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-charcoal/70">
          Don't have an account? <Link href="/register" className="text-brand-rose hover:underline font-medium">Create one</Link>
        </div>
      </div>
    </div>
  );
}