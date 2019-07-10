import React from 'react';
import { render } from 'react-testing-library';
import { Provider } from 'react-redux';
import { ResponsiveContext, ThemeContext, Grommet } from 'grommet';
import theme from '../app/theme.js';
import store from '../redux/store.js';

const renderWithRedux = children => {
  return {
    ...render(<Provider store={store}>{children}</Provider>),
    store,
  };
};

const renderWithGrommet = children => {
  return {
    ...render(
      <Grommet full id="grommet" theme={theme}>
        {children}
      </Grommet>,
    ),
  };
};

const renderApp = children => {
  return {
    ...render(
      <Grommet full id="grommet" theme={theme}>
        <Provider store={store}>{children}</Provider>
      </Grommet>,
    ),
  };
};

const rerenderApp = children => {
  return (
    <Grommet full id="grommet" theme={theme}>
      <Provider store={store}>{children}</Provider>
    </Grommet>
  );
};

export { rerenderApp, renderApp, renderWithRedux, renderWithGrommet, store };
