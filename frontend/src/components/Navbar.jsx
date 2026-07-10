import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User as UserIcon, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast('Logged out successfully', 'success');
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/' },
    { name: 'Destinations', path: '/listings?category=destinations' },
    { name: 'How it works', path: '/#how-it-works' }
  ];

  if (user) {
    navLinks.push({ name: 'My Listings', path: '/profile' });
  }

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          y: scrolled ? 10 : 20,
          padding: scrolled ? '8px 16px' : '12px 20px',
          width: scrolled ? 'min(90%, 1160px)' : 'min(90%, 1200px)',
          background: scrolled ? 'rgba(255, 255, 255, 0.97)' : 'rgba(255, 255, 255, 0.85)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.12)' : '0 4px 24px rgba(0,0,0,0.08)'
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          x: '-50%',
          borderRadius: '100px',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid var(--color-border-light)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link 
          to="/" 
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.3rem', 
            fontWeight: 600, 
            color: 'var(--color-primary)',
            paddingLeft: '12px'
          }}
        >
          TravelStay
        </Link>

        {/* Desktop Links */}
        <div className="desktop-links" style={{ display: 'none', gap: '8px', alignItems: 'center' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path || (link.path === '/' && location.pathname === '/');
            return (
              <Link 
                key={link.name} 
                to={link.path}
                style={{
                  position: 'relative',
                  padding: '8px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  transition: 'color 0.2s'
                }}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      right: '10%',
                      height: '2px',
                      background: 'var(--color-primary)',
                      borderRadius: '2px'
                    }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!user ? (
            <div className="desktop-auth" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <Link 
                to="/login" 
                style={{
                  padding: '10px 20px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  borderRadius: '100px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-background)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {user.username ? user.username.substring(0,2).toUpperCase() : 'U'}
              </button>
              
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                      width: '200px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <Link 
                      to="/listings/new" 
                      onClick={() => setUserMenuOpen(false)}
                      style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', borderRadius: '8px', color: 'var(--color-text-primary)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-background)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <PlusCircle size={16} /> List your space
                    </Link>
                    <div style={{ height: '1px', background: 'var(--color-border-light)', margin: '4px 0' }} />
                    <button 
                      onClick={handleLogout}
                      style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', borderRadius: '8px', color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              display: 'flex',
              padding: '4px'
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 10000
              }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '80%',
                maxWidth: '360px',
                background: 'var(--color-surface)',
                zIndex: 10001,
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                <button 
                  onClick={() => setMobileOpen(false)}
                  style={{ background: 'var(--color-background)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <Link 
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '16px',
                        fontSize: '1.2rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        borderBottom: '1px solid var(--color-border-light)'
                      }}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + navLinks.length * 0.06 }}
                    style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                  >
                    <Link 
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '1.5px solid var(--color-border)',
                        fontWeight: 600
                      }}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary"
                      style={{ padding: '16px', borderRadius: '12px', width: '100%' }}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          .desktop-links { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </>
  );
}
