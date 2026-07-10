import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import api from './lib/axios';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'var(--font-body)' }}>
        <h2 style={{ marginBottom: 'var(--space-3)' }}>Access Denied</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          You need to be logged in to view this page.
        </p>
        <a href="/login" className="btn-primary">Go to Login</a>
      </div>
    );
  }
  return children;
};

// Render Cold-Start Banner
const WakeUpBanner = ({ onDismiss }) => (
  <div style={{
    background: 'var(--color-warning)',
    color: '#fff',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-sm)',
    gap: '12px',
    fontFamily: 'var(--font-body)',
    position: 'relative'
  }}>
    <span>
      ⏳ <strong>Server is waking up…</strong> The backend is hosted on Render's free tier and may take up to 50 seconds to start. Please wait.
    </span>
    <button
      onClick={onDismiss}
      style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
};

const PageWrapper = ({ children }) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/listings" element={<PageWrapper><ListingsPage /></PageWrapper>} />
        <Route path="/listings/:id" element={<PageWrapper><ListingDetail /></PageWrapper>} />
        <Route path="/listings/new" element={
          <PageWrapper>
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          </PageWrapper>
        } />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    let timer;
    let resolved = false;

    // Show banner only if the server hasn't responded within 1 second
    timer = setTimeout(() => {
      if (!resolved) setBannerVisible(true);
    }, 1500);

    api.get('/health')
      .then(() => {
        resolved = true;
        clearTimeout(timer);
        setBannerVisible(false);
      })
      .catch(() => {
        resolved = true;
        clearTimeout(timer);
        setBannerVisible(false);
      });

    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastProvider>
      {bannerVisible && <WakeUpBanner onDismiss={() => setBannerVisible(false)} />}
      <Navbar />
      <ErrorBoundary>
        <AnimatedRoutes />
      </ErrorBoundary>
      <Footer />
    </ToastProvider>
  );
}

export default App;
