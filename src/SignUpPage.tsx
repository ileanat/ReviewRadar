import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      setSuccess(true);
      // Optionally redirect after short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    } finally {
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-purple-500 text-center">
          Sign Up
        </h1>

        {/* error or success messages */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-sm text-green-600 text-center">
            Account created! Redirecting to login...
          </div>
        )}

        <form className="flex flex-col" onSubmit={handleSignUp}>
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Sign Up Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md"
          >
            Create Account
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Already have an account?{" "}
            <a href="/login" className="text-purple-500 hover:underline">
              Login
            </a>
        </p>

      </div>
    </div>
  );
}
