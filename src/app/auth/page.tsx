"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <form className="flex flex-col gap-4 p-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 w-full max-w-sm" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-2 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="button w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="button w-full"
          required
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button type="submit" className="button w-full" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <button type="button" className="button w-full" onClick={handleSignup} disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
      </form>
    </div>
  );
}
