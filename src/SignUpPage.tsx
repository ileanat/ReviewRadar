//@ts-nocheck

import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await register(username, email, password);
      navigate("/browse"); // or "/"
    } catch (err) {
      setError(err.message || "Sign up failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      {/* Top bar with logo + back button */}
      <header className="w-full border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ReviewRadar logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-purple-600">ReviewRadar</span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 rounded-full bg-purple-500 text-white font-semibold shadow hover:bg-purple-600 transition"
          >
            ← Back to Home
          </button>
        </div>
      </header>

      {/* Signup Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-20">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-10 md:p-12">
          <h1 className="text-3xl font-bold mb-2 text-purple-600 text-center">
            Create Your Account
          </h1>
          <p className="mb-6 text-sm text-gray-500 text-center">
            Join ReviewRadar to start posting and exploring reviews.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <form className="flex flex-col max-w-md mx-auto" onSubmit={handleSignUp}>
            {/* Username */}
            <label className="mb-2 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="yourusername"
              className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 bg-white text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {/* Email */}
            <label className="mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password */}
            <label className="mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="mb-6 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Create Account Button */}
            <button
              type="submit"
              className="mb-4 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md font-semibold text-lg transition"
            >
              Create Account
            </button>

            {/* Already have an account */}
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-purple-500 text-white rounded-full shadow hover:bg-purple-600 transition font-medium ml-1"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
