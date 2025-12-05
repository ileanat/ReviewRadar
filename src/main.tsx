import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import LoginPage from './LoginPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import ReviewsPage from './pages/ReviewsPage.tsx';
import WriteReview from "./WriteReview.tsx";
import logo from './assets/logo.png';

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/browse" element={<ReviewsPage />} />
        <Route path="/write-review" element={<WriteReview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
