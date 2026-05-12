import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import LoginPage from './LoginPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import ReviewsPage from './pages/ReviewsPage.tsx';
import UserReviewsPage from './pages/UserReviewsPage.tsx';
import WriteReview from "./WriteReview.tsx";
import logo from './assets/logo.png';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
}

// set favicon dynamically so we can use the bundled asset from src/assets
function setFavicon(href: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

setFavicon(logo);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          {/* NEW HOME: use the clean ReviewsPage UI */}
          <Route path="/" element={<ReviewsPage />} />

          {/* Optional: keep old cat home at /old-home */}
          <Route path="/old-home" element={<App />} />

          {/* Optional alias: /browse also shows ReviewsPage */}
          <Route path="/browse" element={<ReviewsPage />} />

          <Route path="/profile" element={<UserReviewsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/write-review"
            element={
              <ProtectedRoute>
                <WriteReview />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
