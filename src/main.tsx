import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App.tsx';
import LoginPage from './LoginPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import ReviewsPage from './pages/ReviewsPage.tsx';
// import UserReviewsPage from './pages/UserReviewsPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import WriteReview from "./WriteReview.tsx";
import logo from './assets/logo.png';
import blink_logo from './assets/blink_logo.gif';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import ProductPage from './pages/ProductPage.tsx';
// import ClickSpark from './components/ClickSpark.tsx';

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
      {/*<ClickSpark sparkColor="#fdfdfdff" sparkSize={10} sparkRadius={10} sparkCount={8} duration={400}>*/}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ReviewsPage />} />
          <Route path="/old-home" element={<App />} />
          <Route path="/browse" element={<ReviewsPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reviews/:id" element={<ProductPage />} />
          <Route path="/products/:key" element={<ProductPage />} />
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
      {/*</ClickSpark>*/}
    </ClerkProvider>
  </StrictMode>
);
