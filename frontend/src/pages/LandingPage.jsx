import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Star, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const useCountUp = (target, duration = 1800) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTime = null;
    let animationFrame;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const currentCount = Math.round(target * easeOutQuart(progress / duration));
        setCount(currentCount);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, hasStarted]);

  return [count, setHasStarted];
};

const TiltCard = ({ children, bgGradient }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);
  
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        width: '200px',
        height: '260px',
        borderRadius: '20px',
        background: bgGradient,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        flexShrink: 0
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');

  // Hero words
  const words = ["Find", "your", "place", "in", "the", "world."];

  return (
    <div style={{ width: '100%' }}>
      {/* SECTION 1 - HERO */}
      <section style={{
        height: '100svh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated Mesh Gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 20% 40%, var(--color-primary-light) 0%, transparent 55%), radial-gradient(ellipse at 80% 60%, var(--color-secondary) 0%, transparent 55%), var(--color-background)',
          opacity: 0.4,
          zIndex: -2,
          animation: 'meshShift 12s ease-in-out infinite alternate'
        }} />
        <style>{`
          @keyframes meshShift {
            from { background-position: 20% 40%, 80% 60%; }
            to   { background-position: 30% 50%, 70% 50%; }
          }
        `}</style>
        
        {/* Noise overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
        }} />

        <div className="container" style={{ textAlign: 'center', zIndex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-hero)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: i * 0.08 }}
                style={{ color: i === words.length - 1 ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '520px',
              margin: '0 auto 40px auto'
            }}
          >
            Discover handpicked homes, escapes, and unique stays — hosted by real people who love where they live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' }}
          >
            <button className="btn-primary" onClick={() => navigate('/listings')} style={{ height: '50px', fontSize: 'var(--text-sm)' }}>
              Explore Stays →
            </button>
            <button 
              onClick={() => navigate('/listings/new')}
              style={{
                height: '50px',
                padding: '0 24px',
                borderRadius: '30px',
                border: '1.5px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              List your space
            </button>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '100px',
              padding: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '100%',
              overflowX: 'auto'
            }}
          >
            <div style={{
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              borderRight: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '100px',
              transition: 'background 0.2s',
              gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 56, 92, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>📍</span>
              <input 
                type="text" 
                placeholder="Where?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/listings?location=${searchLocation}`)}
                style={{ 
                  background: 'transparent', border: 'none', outline: 'none', 
                  fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', width: '120px'
                }}
              />
            </div>
            
            <div style={{
              padding: '12px 24px', display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '100px', transition: 'background 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 56, 92, 0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>📅 Check-in</span>
            </div>

            <div style={{
              padding: '12px 24px', display: 'flex', alignItems: 'center',
              borderRadius: '100px', transition: 'background 0.2s'
            }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 56, 92, 0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>👤 Guests</span>
            </div>
            
            <button style={{
              width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer'
            }} onClick={() => navigate(searchLocation ? `/listings?location=${searchLocation}` : '/listings')}>
              <Search size={20} />
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bob 2s infinite'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <style>{`@keyframes bob { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }`}</style>
      </section>

      {/* SECTION 2 - STATS */}
      <section style={{ background: 'var(--color-surface)', padding: '48px 0', borderTop: '1px solid var(--color-border-light)' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
          {[
            { num: 10000, suffix: '+', label: 'Stays Listed' },
            { num: 150, suffix: '+', label: 'Cities Covered' },
            { num: 4.9, suffix: ' ★', label: 'Average Rating' },
            { num: 50000, suffix: '+', label: 'Happy Guests' }
          ].map((stat, i) => (
            <StatItem key={i} target={stat.num} suffix={stat.suffix} label={stat.label} isFloat={stat.num === 4.9} />
          ))}
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '120px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '16px' }}>How It Works</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>Three simple steps to your next great stay.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { id: '01', title: 'Search & Discover', desc: 'Browse stays by location, vibe, and price. Filters for dates and guests.', icon: Search },
              { id: '02', title: 'Book Securely', desc: 'Instant or request-based booking. Transparent pricing, no hidden fees.', icon: ShieldCheck },
              { id: '03', title: 'Arrive & Enjoy', desc: 'Check in, feel at home, leave a review. Your host is always reachable.', icon: Star }
            ].map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'relative',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-light)',
                  borderTop: '2px solid var(--color-primary-light)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '10px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '7rem',
                  opacity: 0.06,
                  color: 'var(--color-text-primary)',
                  pointerEvents: 'none'
                }}>
                  {step.id}
                </div>
                
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <step.icon size={28} color="var(--color-primary)" />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - EXPLORE BY VIBE */}
      <section style={{ padding: '80px 0', background: 'var(--color-surface)', overflow: 'hidden' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '12px' }}>Explore by Vibe</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', marginBottom: '40px' }}>Discover spaces tailored to your travel style.</p>
          
          <div style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            paddingBottom: '40px',
            scrollbarWidth: 'none',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
          }}>
            {[
              { name: 'City Escapes', gradient: 'url("https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=400&q=80") center/cover' },
              { name: 'Mountain Retreats', gradient: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80") center/cover' },
              { name: 'Beach Stays', gradient: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=400&q=80") center/cover' },
              { name: 'Countryside Hideaways', gradient: 'url("https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=400&q=80") center/cover' },
              { name: 'Heritage Homes', gradient: 'url("https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=400&q=80") center/cover' },
              { name: 'Budget Picks', gradient: 'url("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=400&q=80") center/cover' }
            ].map(cat => (
              <TiltCard key={cat.name} bgGradient={cat.gradient}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))' }} />
                <ArrowUpRight color="white" size={24} style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.8 }} />
                <h3 style={{
                  position: 'absolute', bottom: '20px', left: '20px', right: '20px',
                  fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', lineHeight: 1.2
                }}>
                  {cat.name}
                </h3>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 - WHY TRAVELSTAY */}
      <section style={{ padding: '120px 0' }}>
        <div className="container" style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)',
              fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.1
            }}>
              "Every great trip starts with the right place to stay."
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '400px' }}>
              We've built a platform that puts travelers and hosts first. No surprises, just unforgettable experiences.
            </p>
            <button className="btn-primary" onClick={() => navigate('/listings')}>Start Exploring</button>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { title: 'Verified stays', desc: 'Every listing is reviewed before going live.' },
              { title: 'Transparent pricing', desc: 'No surprise fees at checkout.' },
              { title: 'Flexible cancellation', desc: 'Plans change. We get it.' },
              { title: 'Direct host contact', desc: 'Real conversations, real hosts.' }
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
              >
                <div style={{ marginTop: '2px' }}><CheckCircle2 color="var(--color-primary)" size={24} /></div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px' }}>{benefit.title}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - TESTIMONIALS */}
      <section style={{ padding: '80px 0', background: 'var(--color-background)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', textAlign: 'center', marginBottom: '60px' }}>What our guests say</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { name: 'Priya M.', loc: 'Stayed in Udaipur', text: "Woke up to the most stunning view I've ever seen from a bedroom window. The host had left local recommendations and fresh coffee. Absolutely perfect." },
              { name: 'James L.', loc: 'Stayed in Bangalore', text: "Booked last minute for a work trip and it was better than any hotel I've stayed in. Clean, quiet, and the host was incredibly responsive." },
              { name: 'Ananya & Rohit', loc: 'Stayed in Coorg', text: "We celebrated our anniversary here and the host went above and beyond. The little touches made it truly special. Already planning a return trip." }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                style={{
                  background: 'var(--color-surface)',
                  padding: '32px 28px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border-light)',
                  transition: 'box-shadow 0.25s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 0 1.5px var(--color-primary-light), 0 20px 40px rgba(0,0,0,0.06)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} fill="#f59e0b" color="#f59e0b" size={16} />)}
                </div>
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontStyle: 'italic',
                  lineHeight: 1.6, marginBottom: '24px', color: 'var(--color-text-primary)'
                }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>{review.name}</span>
                  <span style={{
                    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                    padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500
                  }}>
                    {review.loc}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 - HOST CTA */}
      <section style={{
        background: 'linear-gradient(12deg, var(--color-primary), var(--color-primary-dark))',
        padding: '100px 40px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        margin: '60px 20px',
        borderRadius: '32px'
      }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-5%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.7)',
            marginBottom: '24px', display: 'block'
          }}>FOR HOSTS</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'white', lineHeight: 1.1, marginBottom: '24px' }}>
            Your home could be someone's favourite memory.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '40px', lineHeight: 1.6 }}>
            Hosting is simple, flexible, and rewarding. List your space in under 10 minutes and start welcoming guests from around the world.
          </p>
          <button 
            onClick={() => navigate('/listings/new')}
            style={{
              background: 'white', color: 'var(--color-primary)', border: 'none', padding: '16px 32px',
              borderRadius: '100px', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'white'; }}
          >
            Start Hosting Today →
          </button>
        </div>
      </section>
    </div>
  );
}

// Helper for Stats
const StatItem = ({ target, suffix, label, isFloat }) => {
  const [ref, setRef] = useState(null);
  const [count, setHasStarted] = useCountUp(target);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, setHasStarted]);

  return (
    <div ref={setRef} style={{ textAlign: 'center', minWidth: '160px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', fontWeight: 600 }}>
        {isFloat ? (count || 0).toFixed(1) : count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  );
};
