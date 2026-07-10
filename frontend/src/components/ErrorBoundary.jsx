import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error and component stack
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Friendly fallback UI
      return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#d32f2f' }}>Something went wrong.</h2>
          <p>Please try reloading the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', cursor: 'pointer', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
