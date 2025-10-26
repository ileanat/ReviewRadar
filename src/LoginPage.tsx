import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); //show errors

  // const handleLogin = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   alert(`Email: ${email}\nPassword: ${password}`);
  //   setEmail("");
  //   setPassword("");
  // };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save JWT for later authenticated requests
      localStorage.setItem("token", data.token);

      // Simple redirect (you can swap for react-router navigate if you prefer)
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    } finally {
      setPassword(""); // keep email so user can retry if they typed password wrong
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-purple-500 text-center">
          Login
        </h1>

        {/* error message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 text-center">{error}</div>
        )}

        <form className="flex flex-col" onSubmit={handleLogin}>
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

          {/* Login Button */}
          <button
            type="submit"
            className="mb-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 shadow-md"
          >
            Login
          </button>

          {/* Signup Redirect
          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <span className="text-purple-500 cursor-pointer hover:underline">
              Signup
            </span> */}
            
            <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-purple-500 hover:underline">
              Signup
            </a>

          </p>
        </form>
      </div>
    </div>
  );
}
