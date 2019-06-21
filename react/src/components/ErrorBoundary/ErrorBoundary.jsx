import React from 'react';

export default class ErrorBoundary extends React.PureComponent {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  state = {
    hasError: false,
    error: '',
  };

  render() {
    if (this.state.hasError) {
      console.error(this.state.error);
      return <h1 data-test-id="error-boundary">Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
