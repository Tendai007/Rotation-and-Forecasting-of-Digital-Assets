import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="error-screen">
        <div className="error-card">
          <h1>Something went wrong</h1>
          <p>We caught an unexpected error in the app. Please reload or check the console for details.</p>
          {this.state.error && (
            <pre className="error-stack">{this.state.error.toString()}</pre>
          )}
          {this.state.errorInfo?.componentStack && (
            <pre className="error-stack">{this.state.errorInfo.componentStack}</pre>
          )}
          <button className="btn-primary" onClick={this.handleReload}>Reload App</button>
        </div>
      </div>
    );
  }
}
