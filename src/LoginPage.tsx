//@ts-nocheck

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png"; // same logo you use on home/browse

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate("/browse"); // or "/" if you want home instead
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Top bar: logo + Back to Home */}
      <header className="w-full border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ReviewRadar logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-purple-600">
              ReviewRadar
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition"
>
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Centered login card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-20">
  <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-10 md:p-12">
    <h1 className="text-3xl font-bold mb-2 text-purple-600 text-center">
      Login
    </h1>
    <p className="mb-6 text-sm text-gray-500 text-center">
      Sign in to continue browsing and posting reviews.
    </p>

    {error && (
      <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
        {error}
      </div>
    )}

    <form className="flex flex-col max-w-md mx-auto" onSubmit={handleLogin}>
      <label className="mb-2 text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        placeholder="you@example.com"
        className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm 
             bg-white text-gray-900 placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="••••••••"
        className="mb-6 p-3 border border-gray-300 rounded-lg shadow-sm 
             bg-white text-gray-900 placeholder-gray-400
             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />


      <button
        type="submit"
        className="mb-4 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md font-semibold text-lg"
      >
        Login
      </button>

      <p className="text-sm text-gray-500 text-center">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="px-4 py-2 bg-purple-500 text-white rounded-full shadow hover:bg-purple-600 transition"
        >
          Sign Up
        </button>
      </p>
    </form>
  </div>
</main>
</div>
  );
}   