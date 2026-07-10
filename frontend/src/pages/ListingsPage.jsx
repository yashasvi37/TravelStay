import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Heart, Filter, Grid, List, Search, X, Star } from "lucide-react";
import api from "../lib/axios";
import Skeleton from "../components/Skeleton";

// Simple string hash for gradient generation
const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

const getGradient = (id) => {
  const gradients = [
    'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
    'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
    'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
  ];
  return gradients[stringToHash(id) % gradients.length];
};

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');

  const fetchListings = async (currentCursor = null, reset = false) => {
    try {
      const params = { limit: 12 };
      if (currentCursor) params.cursor = currentCursor;
      if (searchParams.get('category')) params.category = searchParams.get('category');
      
      const res = await api.get("/listings", { params });
      const payload = res.data;
      let incoming = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

      const locationParam = searchParams.get('location');
      if (locationParam) {
        incoming = incoming.filter(l => 
          l.location?.toLowerCase().includes(locationParam.toLowerCase()) || 
          l.country?.toLowerCase().includes(locationParam.toLowerCase()) ||
          l.title?.toLowerCase().includes(locationParam.toLowerCase())
        );
      }

      setListings(prev => reset ? incoming : [...prev, ...incoming]);
      setCursor(payload?.nextCursor ?? null);
      setHasMore(payload?.hasMore ?? false);
    } catch (err) {
      console.error("Failed to fetch listings", err);
      setError("Could not load listings. Please try again in a moment.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchListings(null, true);
  }, [searchParams.get('category'), searchParams.get('location')]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ location: searchQuery });
    } else {
      setSearchParams({});
    }
    setLoading(true);
    fetchListings(null, true);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--color-background)', paddingBottom: '80px' }}>
      <Helmet>
        <title>Find your next stay | TravelStay</title>
        <meta name="description" content="Discover and book amazing homes, apartments, and unique places to stay." />
      </Helmet>

      {/* Header Area */}
      <div className="container" style={{ position: 'sticky', top: '80px', zIndex: 90, background: 'rgba(247,247,247,0.85)', backdropFilter: 'blur(12px)', paddingTop: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: '16px' }}>Find your next stay</h1>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: '1 1 320px', maxWidth: '600px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: '100px',
                  border: '1px solid var(--color-border)', outline: 'none',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </form>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setFilterOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                borderRadius: '100px', border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--text-sm)'
              }}
            >
              <Filter size={16} /> Filters
            </button>
            <div style={{ display: 'flex', background: 'var(--color-border-light)', padding: '4px', borderRadius: '12px' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ padding: '6px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-secondary)', boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '6px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'list' ? 'var(--color-surface)' : 'transparent', color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)', boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: '32px' }}>
        {loading ? (
          <div className="listings-grid" style={{
            display: 'grid', gap: '24px',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr'
          }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: '20px', border: '1px solid var(--color-border-light)', overflow: 'hidden', background: 'var(--color-surface)', display: viewMode === 'list' ? 'flex' : 'block' }}>
                <Skeleton height={viewMode === 'list' ? '200px' : '280px'} width={viewMode === 'list' ? '300px' : '100%'} borderRadius="0" />
                <div style={{ padding: '20px', flex: 1 }}>
                  <Skeleton height="14px" width="60%" style={{ marginBottom: '12px' }} />
                  <Skeleton height="20px" width="80%" style={{ marginBottom: '16px' }} />
                  <Skeleton height="14px" width="40%" style={{ marginBottom: '24px' }} />
                  <Skeleton height="24px" width="30%" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ color: "var(--color-primary)", marginBottom: "16px" }}>{error}</p>
            <button className="btn-primary" onClick={() => fetchListings(null, true)}>Retry</button>
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "80px", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
              <circle cx="15" cy="15" r="5" stroke="var(--color-primary)" strokeWidth="2"></circle>
              <line x1="18.5" y1="18.5" x2="22" y2="22" stroke="var(--color-primary)" strokeWidth="2"></line>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: '8px' }}>No stays found</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Try adjusting your search or filters.</p>
            <button onClick={() => { setSearchParams({}); setSearchQuery(''); }} style={{ background: 'none', border: '1px solid var(--color-border)', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <motion.div 
              layout
              style={{
                display: 'grid', gap: '24px',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr'
              }}
            >
              <AnimatePresence>
                {listings.map((listing, i) => (
                  <motion.div
                    key={listing._id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i % 12) * 0.04, duration: 0.4 }}
                  >
                    <Link to={`/listings/${listing._id}`} style={{
                      display: viewMode === 'list' ? 'flex' : 'block',
                      background: 'var(--color-surface)',
                      borderRadius: '20px',
                      border: '1px solid var(--color-border-light)',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'transform 300ms var(--ease-out), box-shadow 300ms var(--ease-out)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{
                        position: 'relative',
                        width: viewMode === 'list' ? '300px' : '100%',
                        aspectRatio: viewMode === 'list' ? 'auto' : '4/3',
                        background: getGradient(listing._id),
                        overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {listing.image?.url && (
                          <img 
                            src={listing.image.url} 
                            alt={listing.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 350ms ease-out' }} 
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        )}
                        <button style={{
                          position: 'absolute', top: '16px', right: '16px',
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                          border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          color: 'white'
                        }}>
                          <Heart size={18} />
                        </button>
                      </div>

                      <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                          <MapPin size={12} /> {listing.location}, {listing.country}
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {listing.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
                          <Star fill="#f59e0b" color="#f59e0b" size={12} /> 4.8 (120 reviews)
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div><span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>&#8377; {listing.price?.toLocaleString("en-IN")}</span> <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>/ night</span></div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "40px" }}>
                <button
                  onClick={() => { setLoadingMore(true); fetchListings(cursor); }}
                  disabled={loadingMore}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    padding: '12px 32px', borderRadius: '100px', width: '200px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--text-sm)'
                  }}
                >
                  {loadingMore ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ width: '16px', height: '16px', border: '2px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>
                  ) : "Load more stays"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFilterOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', maxWidth: '100%',
                background: 'var(--color-surface-raised)', zIndex: 10001,
                boxShadow: '-20px 0 60px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Filters</h2>
                <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
              </div>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Price range</h3>
                  <input type="range" min="0" max="10000" style={{ width: '100%', accentColor: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Property type</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {['House', 'Apartment', 'Villa', 'Cabin'].map(type => (
                      <label key={type} style={{ padding: '10px 16px', border: '1px solid var(--color-border)', borderRadius: '100px', fontSize: '14px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ display: 'none' }} />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}>
                <button style={{ background: 'none', border: 'none', textDecoration: 'underline', fontWeight: 500, cursor: 'pointer' }}>Clear all</button>
                <button className="btn-primary" onClick={() => setFilterOpen(false)}>Show places</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
