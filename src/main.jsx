import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ff4444', background: '#111', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#ff6666' }}>⚠️ App Crashed</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ffaaaa' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#aaa', marginTop: 20, fontSize: 12 }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('[main.jsx] Mounting React app...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
