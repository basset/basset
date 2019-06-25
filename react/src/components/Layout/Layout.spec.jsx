import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { ResponsiveContext } from 'grommet';

import Layout from './Layout.jsx';

import { renderWithRedux } from '../../tests/render-redux.js';

afterEach(cleanup);

describe('<Layout />', () => {
  const PROPS = {
    user: {},
    onLogout: jest.fn(),
    sidebar: true,
  };

  it('should render', () => {
    const wrapper = renderWithRedux(<Layout {...PROPS}>Test</Layout>);
    expect(wrapper.container).toMatchSnapshot();
  });

  describe('sidebar', () => {
    describe('when size is small', () => {
      it('should not render docked', () => {
        const wrapper = renderWithRedux(
          <ResponsiveContext.Provider value="small">
            <Layout {...PROPS} sidebar={<div>sidebar</div>}>
              Test
            </Layout>
          </ResponsiveContext.Provider>,
        );
        expect(wrapper.queryByTestId('docked-sidebar')).toBeNull();
      });
      it('should show a layer sidebar when clicked', async () => {
        const wrapper = renderWithRedux(
          <ResponsiveContext.Provider value="small">
            <Layout {...PROPS} sidebar={<div>sidebar</div>}>
              Test
            </Layout>
          </ResponsiveContext.Provider>,
        );
        fireEvent.click(wrapper.getByTestId('open-sidebar'));
        expect(wrapper.queryByTestId('layer-sidebar')).toBeTruthy();

        fireEvent.click(wrapper.getByTestId('close-sidebar'));
        expect(wrapper.queryByTestId('layer-sidebar')).toBeNull();
      });
    });
    describe('when size is not small', () => {
      it('should render with sidebar prop', () => {
        const wrapper = renderWithRedux(
          <ResponsiveContext.Provider value="medium">
            <Layout {...PROPS} sidebar={<div>sidebar</div>}>
              Test
            </Layout>
          </ResponsiveContext.Provider>,
        );
        expect(wrapper.queryByTestId('docked-sidebar')).toBeTruthy();
      });
    });

    it('should not render if sidebar prop is false', () => {
      const wrapper = renderWithRedux(
        <ResponsiveContext.Provider value="medium">
          <Layout {...PROPS} sidebar={false}>
            Test
          </Layout>
        </ResponsiveContext.Provider>,
      );
      expect(wrapper.queryByTestId('docked-sidebar')).toBeNull();
    });
  });
});
