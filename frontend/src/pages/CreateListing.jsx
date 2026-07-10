import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, CheckCircle2, UploadCloud, MapPin, Home, DollarSign, Image as ImageIcon } from "lucide-react";
import api from "../lib/axios";
import { useToast } from "../components/Toast";

export default function CreateListing() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "", description: "", price: "", location: "", country: ""
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const steps = [
    { id: 1, title: 'Basics', icon: Home, desc: 'Tell us about your place' },
    { id: 2, title: 'Location', icon: MapPin, desc: 'Where is it located?' },
    { id: 3, title: 'Pricing', icon: DollarSign, desc: 'Set your nightly rate' },
    { id: 4, title: 'Photos', icon: ImageIcon, desc: 'Add some photos' },
    { id: 5, title: 'Review', icon: CheckCircle2, desc: 'Ready to publish?' }
  ];

  const handleNext = () => {
    if (step < 5) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    data.append("listing[title]", formData.title);
    data.append("listing[description]", formData.description);
    data.append("listing[price]", formData.price);
    data.append("listing[location]", formData.location);
    data.append("listing[country]", formData.country);
    if (file) data.append("listing[image]", file);

    try {
      await api.post("/listings", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      addToast("Listing created successfully!", "success");
      navigate("/listings");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create listing", "error");
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.title.length > 3 && formData.description.length > 10;
      case 2: return formData.location.length > 2 && formData.country.length > 2;
      case 3: return formData.price > 0;
      case 4: return file !== null;
      default: return true;
    }
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 })
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-surface)' }}>
      <Helmet>
        <title>List your space | TravelStay</title>
      </Helmet>

      {/* Header */}
      <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          TravelStay
        </h1>
        <button onClick={() => navigate('/')} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', fontWeight: 500 }}>
          Save & Exit
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Left Panel: Progress */}
        <div style={{ flex: '0 0 300px', background: 'var(--color-background)', borderRight: '1px solid var(--color-border-light)', padding: '40px', display: 'none', '@media(minWidth: 768px)': { display: 'block' } }} className="desktop-progress">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '32px' }}>List your space</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map(s => (
              <div key={s.id} style={{ display: 'flex', gap: '16px', opacity: step >= s.id ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: step === s.id ? 'var(--color-primary)' : step > s.id ? 'var(--color-success)' : 'var(--color-border)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {step > s.id ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: step === s.id ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @media (min-width: 768px) {
            .desktop-progress { display: block !important; }
          }
        `}</style>

        {/* Right Panel: Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ position: 'absolute', inset: 0, padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div style={{ width: '100%', maxWidth: '560px' }}>
                  
                  {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Tell us about your place</h2>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Share some basic information to get started.</p>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Title</label>
                        <input 
                          type="text" name="title" value={formData.title} onChange={handleChange} 
                          placeholder="e.g. Cozy Cottage in the Woods"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1.1rem', outlineColor: 'var(--color-primary)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Description</label>
                        <textarea 
                          name="description" value={formData.description} onChange={handleChange} 
                          placeholder="What makes your place special?" rows="5"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1rem', outlineColor: 'var(--color-primary)', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Where's your place located?</h2>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Your exact address will only be shared with guests after they book.</p>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>City / Location</label>
                        <input 
                          type="text" name="location" value={formData.location} onChange={handleChange} 
                          placeholder="e.g. Kyoto"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1.1rem', outlineColor: 'var(--color-primary)' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Country</label>
                        <input 
                          type="text" name="country" value={formData.country} onChange={handleChange} 
                          placeholder="e.g. Japan"
                          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '1.1rem', outlineColor: 'var(--color-primary)' }}
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Now, set your price</h2>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>You can change it anytime.</p>
                      
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Nightly price (&#8377;)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: 600 }}>&#8377;</span>
                          <input 
                            type="number" name="price" value={formData.price} onChange={handleChange} 
                            placeholder="0"
                            style={{ width: '100%', padding: '24px 24px 24px 48px', borderRadius: '16px', border: '1px solid var(--color-border)', fontSize: '1.4rem', fontWeight: 600, outlineColor: 'var(--color-primary)' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Add a photo</h2>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Show guests what your place looks like.</p>
                      
                      <div style={{ 
                        border: '2px dashed var(--color-primary-light)', borderRadius: '24px', padding: '40px', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', minHeight: '300px', background: 'rgba(255, 56, 92, 0.02)',
                        transition: 'background 0.2s', cursor: 'pointer'
                      }}
                      onMouseOver={(e) => !preview && (e.currentTarget.style.background = 'rgba(255, 56, 92, 0.06)')}
                      onMouseOut={(e) => !preview && (e.currentTarget.style.background = 'rgba(255, 56, 92, 0.02)')}
                      >
                        <input type="file" onChange={handleFile} accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                        
                        {preview ? (
                          <div style={{ position: 'absolute', inset: '8px', borderRadius: '16px', overflow: 'hidden' }}>
                            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'white', padding: '8px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Change photo</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                              <UploadCloud size={32} color="var(--color-primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Upload a photo</h3>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>PNG, JPG or WEBP (max. 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '8px' }}>Review your listing</h2>
                      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Here's what we'll show to guests.</p>
                      
                      <div style={{ 
                        borderRadius: '20px', border: '1px solid var(--color-border)', overflow: 'hidden',
                        background: 'var(--color-surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
                      }}>
                        <div style={{ height: '240px', background: 'var(--color-background)', position: 'relative' }}>
                          {preview && <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                        </div>
                        <div style={{ padding: '24px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{formData.title}</h3>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>&#8377; {formData.price} <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ night</span></div>
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                            <MapPin size={14} /> {formData.location}, {formData.country}
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {formData.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Bar */}
          <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', background: 'var(--color-surface)', position: 'relative', zIndex: 10 }}>
            {step > 1 ? (
              <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Back</button>
            ) : <div />}
            
            {step < 5 ? (
              <button onClick={handleNext} disabled={!isStepValid()} style={{ background: isStepValid() ? 'var(--color-text-primary)' : 'var(--color-border)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '12px', fontWeight: 600, cursor: isStepValid() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loading && <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                Publish Listing
              </button>
            )}
          </div>
          
          {/* Progress Bar (Mobile) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--color-border-light)', zIndex: 10 }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: 'var(--color-primary)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
