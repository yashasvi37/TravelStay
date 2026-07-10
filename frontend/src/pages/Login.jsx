import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const FloatingInput = ({ label, type, name, value, onChange, required }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <motion.label
        initial={false}
        animate={{
          y: active ? -10 : 16,
          scale: active ? 0.85 : 1,
          color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          background: active ? 'var(--color-surface)' : 'transparent',
          padding: active ? '0 4px' : '0'
        }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          left: '12px',
          pointerEvents: 'none',
          transformOrigin: 'left top',
          fontFamily: 'var(--font-body)',
          zIndex: 1
        }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        style={{
          width: '100%',
          padding: '16px 16px 12px 16px',
          borderRadius: '12px',
          border: `1.5px solid ${focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          outline: 'none',
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-body)',
          background: 'transparent',
          transition: 'border-color 0.2s'
        }}
      />
    </div>
  );
};

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.username, formData.password);
    setLoading(false);
    if (result.success) {
      addToast("Welcome back!", "success");
      navigate("/listings");
    } else {
      addToast(result.error || "Login failed", "error");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Helmet>
        <title>Sign in to TravelStay</title>
      </Helmet>

      {/* Left side: Abstract Visuals */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'none', '@media(minWidth: 900px)': { display: 'block' } }} className="auth-visual">
        <div style={{ position: 'absolute', inset: 0, background: 'var(--color-background)' }} />
        
        {/* Abstract animated shapes */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', top: '-10%', left: '-20%', width: '70%', height: '70%',
            background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)'
          }}
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', bottom: '-20%', right: '-10%', width: '80%', height: '80%',
            background: 'radial-gradient(circle, rgba(0, 166, 153, 0.15) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(60px)'
          }}
        />
        
        <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(100px)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '120px 80px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1.1, marginBottom: '24px' }}>
            Welcome back to your next adventure.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
            Discover places you'll love to stay, hosted by locals.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-visual { display: block !important; }
        }
      `}</style>

      {/* Right side: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '8px' }}>Sign in</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Enter your details to proceed.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FloatingInput
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <FloatingInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: '52px', fontSize: '1.1rem', marginTop: '16px' }}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : 'Continue'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
