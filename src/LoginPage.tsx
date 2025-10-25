import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-purple-500 text-center">
          Login
        </h1>
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

          {/* Signup Redirect */}
          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{" "}
            <span className="text-purple-500 cursor-pointer hover:underline">
              Signup
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
