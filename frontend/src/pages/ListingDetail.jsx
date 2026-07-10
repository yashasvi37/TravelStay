import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Users, Bed, Bath, Wifi, Car, Coffee, Tv, Wind, CheckCircle2, X, ChevronLeft, ChevronRight, Share, Heart, Grid } from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Skeleton from "../components/Skeleton";

const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

const getGradient = (id, variant) => {
  const hues = [340, 180, 280, 45, 120];
  const hue = hues[(stringToHash(id) + variant) % hues.length];
  return `linear-gradient(135deg, hsl(${hue}, 80%, 90%) 0%, hsl(${hue}, 60%, 80%) 100%)`;
};

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        addToast("Failed to load listing.", "error");
        navigate('/listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, addToast, navigate]);

  const handleReserve = async () => {
    if (!user) {
      addToast("Please sign in to reserve.", "info");
      navigate('/login');
      return;
    }
    if (!checkin || !checkout) {
      addToast("Please select check-in and checkout dates.", "error");
      return;
    }
    if (new Date(checkin) >= new Date(checkout)) {
      addToast("Checkout must be after check-in.", "error");
      return;
    }
    
    setReserving(true);
    
    const diffTime = Math.abs(new Date(checkout) - new Date(checkin));
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const cleaningFee = 1200;
    const serviceFee = Math.round(listing.price * nights * 0.15);
    const totalPrice = (listing.price * nights) + cleaningFee + serviceFee;

    try {
      await api.post(`/listings/${id}/reservations`, {
        checkinDate: checkin,
        checkoutDate: checkout,
        guests,
        totalPrice
      });
      
      // Mock payment loading visually
      setTimeout(() => {
        setReserving(false);
        addToast("Reservation created successfully!", "success");
        setCheckin('');
        setCheckout('');
      }, 1500);
    } catch (err) {
      setReserving(false);
      addToast(err.response?.data?.message || "Failed to create reservation", "error");
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await api.delete(`/listings/${id}/reviews/${reviewId}`);
      setListing(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== reviewId) }));
      addToast("Review deleted.", "success");
    } catch (err) {
      addToast("Failed to delete review.", "error");
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await api.delete(`/listings/${id}`);
        addToast("Listing deleted.", "success");
        navigate('/listings');
      } catch (err) {
        addToast("Failed to delete listing.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <Skeleton height="40px" width="40%" style={{ marginBottom: '16px' }} />
        <Skeleton height="480px" borderRadius="20px" style={{ marginBottom: '40px' }} />
        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ flex: 1.6 }}>
            <Skeleton height="32px" width="60%" style={{ marginBottom: '24px' }} />
            <Skeleton height="100px" style={{ marginBottom: '24px' }} />
            <Skeleton height="200px" />
          </div>
          <div style={{ flex: 1 }}>
            <Skeleton height="400px" borderRadius="24px" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const photos = listing.image?.url 
    ? [listing.image.url, null, null] // In a real app, this would be an array of image URLs
    : [null, null, null];
    
  const getDays = (start, end) => {
    if (!start || !end) return 1;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };
  
  const nights = getDays(checkin, checkout);
  const cleaningFee = 1200;
  const serviceFee = Math.round(listing.price * nights * 0.15);
  const totalCalculated = (listing.price * nights) + cleaningFee + serviceFee;


  return (
    <>
      <Helmet>
        <title>{listing.title} — TravelStay</title>
      </Helmet>

      <div className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              {listing.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star fill="#f59e0b" color="#f59e0b" size={16} /> 4.92 · <span style={{ textDecoration: 'underline', color: 'var(--color-text-secondary)', fontWeight: 400 }}>{listing.reviews?.length || 0} reviews</span></span>
              <span style={{ color: 'var(--color-border)' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}><MapPin size={16} /> {listing.location}, {listing.country}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)', textDecoration: 'underline' }}><Share size={16} /> Share</button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 'var(--text-sm)', textDecoration: 'underline' }}><Heart size={16} /> Save</button>
          </div>
        </div>

        {/* Photo Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60% 40%', gap: '8px', height: '480px',
          borderRadius: '20px', overflow: 'hidden', marginBottom: '48px', position: 'relative'
        }}>
          {/* Main Photo */}
          <div 
            style={{ background: getGradient(listing._id, 1), cursor: 'pointer', position: 'relative' }}
            onClick={() => { setActivePhoto(0); setLightboxOpen(true); }}
          >
            {photos[0] && <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.03)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} />
          </div>
          {/* Stacked Photos */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: getGradient(listing._id, 2), cursor: 'pointer', position: 'relative' }} onClick={() => { setActivePhoto(1); setLightboxOpen(true); }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.03)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} />
            </div>
            <div style={{ background: getGradient(listing._id, 3), cursor: 'pointer', position: 'relative' }} onClick={() => { setActivePhoto(2); setLightboxOpen(true); }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.03)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'} />
            </div>
          </div>
          
          <button 
            onClick={() => { setActivePhoto(0); setLightboxOpen(true); }}
            style={{
              position: 'absolute', bottom: '24px', right: '24px',
              background: 'white', border: '1px solid var(--color-border)', borderRadius: '8px',
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: 500, cursor: 'pointer', fontSize: 'var(--text-sm)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.1s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Grid size={16} /> Show all photos
          </button>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'flex', gap: '8%', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Column */}
          <div style={{ flex: '1 1 55%', minWidth: '320px' }}>
            <div id="overview" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '8px' }}>
                  Hosted by {listing.owner?.username || 'TravelStay Host'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>Superhost · 5 years hosting</p>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.2rem' }}>
                {listing.owner?.username ? listing.owner.username.substring(0,1).toUpperCase() : 'H'}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border-light)', margin: '32px 0' }} />

            {/* Features */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { icon: Users, label: '4 guests' },
                { icon: Bed, label: '2 bedrooms' },
                { icon: Bed, label: '2 beds' },
                { icon: Bath, label: '2 baths' }
              ].map((ft, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <ft.icon size={20} strokeWidth={1.5} />
                  <span>{ft.label}</span>
                </div>
              ))}
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border-light)', margin: '32px 0' }} />

            {/* Description */}
            <div>
              <motion.div 
                animate={{ height: descExpanded ? 'auto' : '100px' }}
                style={{ overflow: 'hidden', color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}
              >
                {listing.description}
                {!descExpanded && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent, var(--color-background))' }} />}
              </motion.div>
              <button 
                onClick={() => setDescExpanded(!descExpanded)}
                style={{ background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 600, fontSize: 'var(--text-base)', cursor: 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {descExpanded ? 'Show less' : 'Show more'} {descExpanded ? <ChevronLeft size={16} style={{transform:'rotate(90deg)'}}/> : <ChevronRight size={16} style={{transform:'rotate(90deg)'}}/>}
              </button>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border-light)', margin: '32px 0' }} />

            {/* Amenities */}
            <div id="amenities">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '24px' }}>What this place offers</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { icon: Wifi, label: 'Fast wifi' },
                  { icon: Car, label: 'Free parking on premises' },
                  { icon: Coffee, label: 'Kitchen' },
                  { icon: Tv, label: 'TV with standard cable' },
                  { icon: Wind, label: 'Air conditioning' }
                ].map((am, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-primary)', fontSize: 'var(--text-base)' }}>
                    <am.icon size={24} strokeWidth={1.5} color="var(--color-text-secondary)" />
                    {am.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--color-border-light)', margin: '48px 0' }} />

            {/* Reviews */}
            <div id="reviews">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <Star fill="var(--color-text-primary)" color="var(--color-text-primary)" size={24} />
                <h3 style={{ fontSize: '1.6rem', fontWeight: 600 }}>4.92 · {listing.reviews?.length || 0} reviews</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                {listing.reviews?.map((r, i) => (
                  <motion.div 
                    key={r._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {r.author?.username?.substring(0,1).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.author?.username || 'Guest'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>October 2025</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="var(--color-text-primary)" color="var(--color-text-primary)" />)}
                    </div>
                    <p style={{ lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{r.comment}</p>
                    
                    {user && r.author && user._id === r.author._id && (
                      <button onClick={() => handleReviewDelete(r._id)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', textDecoration: 'underline', marginTop: '8px', cursor: 'pointer', fontSize: '12px' }}>Delete review</button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {user && listing.owner && user._id === listing.owner._id && (
              <div style={{ marginTop: '64px', padding: '24px', background: 'rgba(255, 56, 92, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 56, 92, 0.2)' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Host Actions</h4>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>You are the owner of this listing.</p>
                <button onClick={handleDeleteListing} style={{ background: 'white', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Delete Listing</button>
              </div>
            )}
          </div>

          {/* Right Column / Booking Card */}
          <div style={{ flex: '1 1 35%', minWidth: '320px', position: 'sticky', top: '120px' }}>
            <div style={{
              background: 'var(--color-surface-raised)',
              borderRadius: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.1)',
              padding: '28px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
                  &#8377; {listing.price?.toLocaleString("en-IN")}
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}> / night</span>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ flex: 1, padding: '12px', borderRight: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Check-in</div>
                    <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', marginTop: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Checkout</div>
                    <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} min={checkin || new Date().toISOString().split('T')[0]} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', marginTop: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)' }} />
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Guests</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px' }}>{guests} guest{guests > 1 ? 's' : ''}</span>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button onClick={() => setGuests(Math.max(1, guests-1))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>-</button>
                      <span style={{ width: '12px', textAlign: 'center' }}>{guests}</span>
                      <button onClick={() => setGuests(Math.min(10, guests+1))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleReserve}
                style={{
                  width: '100%', height: '52px', background: 'var(--color-primary)', color: 'white',
                  borderRadius: '12px', fontWeight: 600, fontSize: 'var(--text-base)', border: 'none',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-primary-dark)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
              >
                {reserving ? (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : 'Reserve'}
              </button>
              <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '16px' }}>You won't be charged yet</div>

              {/* Price Breakdown */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textDecoration: 'underline', color: 'var(--color-text-secondary)' }}>&#8377; {listing.price?.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''}</span>
                  <span>&#8377; {(listing.price * nights).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textDecoration: 'underline', color: 'var(--color-text-secondary)' }}>Cleaning fee</span>
                  <span>&#8377; {cleaningFee.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textDecoration: 'underline', color: 'var(--color-text-secondary)' }}>TravelStay service fee</span>
                  <span>&#8377; {serviceFee.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span>&#8377; {totalCalculated.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 100000,
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'white', fontSize: '14px' }}>{activePhoto + 1} / {photos.length}</div>
              <button 
                onClick={() => setLightboxOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={20} />
              </button>
            </div>
            
            <motion.div 
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}
            >
              <button 
                onClick={() => setActivePhoto(Math.max(0, activePhoto - 1))}
                style={{ position: 'absolute', left: '40px', background: 'white', border: 'none', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: activePhoto === 0 ? 0.3 : 1 }}
                disabled={activePhoto === 0}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div style={{ maxWidth: '100%', maxHeight: '100%', background: getGradient(listing._id, activePhoto + 1), width: '80%', height: '80%', borderRadius: '8px', overflow: 'hidden' }}>
                {photos[activePhoto] && <img src={photos[activePhoto]} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />}
              </div>

              <button 
                onClick={() => setActivePhoto(Math.min(photos.length - 1, activePhoto + 1))}
                style={{ position: 'absolute', right: '40px', background: 'white', border: 'none', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: activePhoto === photos.length - 1 ? 0.3 : 1 }}
                disabled={activePhoto === photos.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
