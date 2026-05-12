import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
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

      <main className="flex-1 flex items-center justify-center px-4 py-10 md:py-20">
        <SignUp
          signInUrl="/login"
          fallbackRedirectUrl="/"
        />
      </main>
    </div>
  );
}
