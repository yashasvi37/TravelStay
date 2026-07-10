import { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 'var(--space-4)',
      right: 'var(--space-4)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 size={20} color="var(--color-success)" />;
      case 'error': return <AlertCircle size={20} color="var(--color-primary)" />;
      default: return <Info size={20} color="var(--color-secondary)" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-primary)';
      default: return 'var(--color-secondary)';
    }
  };

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'var(--color-surface)',
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        padding: '16px',
        width: '320px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {getIcon()}
      <div style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-primary)' }}>
        {toast.message}
      </div>
      <button 
        onClick={onDismiss} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: getBorderColor(),
        }}
      />
    </motion.div>
  );
};
