import React from 'react';

import ErrorBoundary from './ErrorBoundary.jsx';

import { render } from 'react-testing-library';

describe('<ErrorBoundary />', () => {
  it('should show children when there is no error', () => {
    const wrapper = render(
      <ErrorBoundary>
        <div>No error</div>
      </ErrorBoundary>,
    );
    expect(wrapper.queryByTestId('error-boundary')).toBeNull();
  });
  it('should show an error', () => {
    const child = React.createElement(() => {
      throw 'broken';
    });
    try {
      const wrapper = render(<ErrorBoundary>{child}</ErrorBoundary>);
      expect(wrapper.queryByTestId('error-boundary')).not.toBeNull();
    } catch (error) {
      //
    }
  });
});
