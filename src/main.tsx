import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import LoginPage from './LoginPage.tsx';
import SignUpPage from './SignUpPage.tsx';
import ReviewsPage from './pages/ReviewsPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/browse" element={<ReviewsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
