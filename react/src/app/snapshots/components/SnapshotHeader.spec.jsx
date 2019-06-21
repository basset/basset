import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import SnapshotHeader, { VIEWS } from './SnapshotHeader.jsx';

afterEach(cleanup);

describe('<SnapshotHeader />', () => {
  const PROPS = {
    snapshot: {
      id: 1,
      title: 'test',
      buildId: 1,
      previousApproved: null,
      snapshotDiff: null,
      approved: false,
      browser: 'firefox',
      width: 1280,
    },
    isApproving: false,
    canShrink: true,
    canExpand: true,
    index: 0,
    type: 'modified',
    view: VIEWS.both,
    onShrink: jest.fn(),
    onExpand: jest.fn(),
    onApprove: jest.fn(),
    onChangeView: jest.fn(),
  };

  describe('expand button', () => {
    it('should be a link when normal', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} />,
      );
      expect(queryByTestId('expand-snapshot-button')).toBeNull();
      expect(getByTestId('expand-snapshot-link').getAttribute('href')).toBe(
        '/snapshots/1',
      );
    });

    it('should be disabled when you cannot expand further', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} canExpand={false} />,
      );
      expect(queryByTestId('expand-snapshot-button')).toBeNull();
      expect(getByTestId('expand-snapshot-link').hasAttribute('disabled')).toBe(
        true,
      );
    });
    it('should be a button when fully collapsed', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} canShrink={false} />,
      );
      expect(queryByTestId('expand-snapshot-link')).toBeNull();
      expect(
        getByTestId('expand-snapshot-button').hasAttribute('disabled'),
      ).toBe(false);
    });
  });

  describe('shrink button', () => {
    it('should be a button when normal', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} />,
      );
      expect(queryByTestId('shrink-snapshot-link')).toBeNull();
      expect(
        getByTestId('shrink-snapshot-button').hasAttribute('disabled'),
      ).toBe(false);
    });
    it('should be disabled when you cannot shrink further', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} canShrink={false} />,
      );
      expect(queryByTestId('shrink-snapshot-link')).toBeNull();
      expect(
        getByTestId('shrink-snapshot-button').hasAttribute('disabled'),
      ).toBe(true);
    });
    it('should be a link when fully expanded', () => {
      const { getByTestId, queryByTestId } = render(
        <SnapshotHeader {...PROPS} canExpand={false} />,
      );
      expect(queryByTestId('shrink-snapshot-button')).toBeNull();
      expect(getByTestId('shrink-snapshot-link').getAttribute('href')).toBe(
        '/builds/1/1',
      );
    });
  });

  describe('approve button', () => {
    it('should not be rendered if the snapshot is approved', () => {
      const snapshot = {
        ...PROPS.snapshot,
        approved: true,
        approvedBy: {
          user: {
            name: 'bobby',
          },
        },
        approvedOn: new Date(),
      };
      const { queryByTestId } = render(
        <SnapshotHeader {...PROPS} snapshot={snapshot} />,
      );
      expect(queryByTestId('approve-snapshot')).toBeNull();
    });
    it('should be disabled while approving', () => {
      const props = {
        ...PROPS,
        snapshot: {
          ...PROPS.snapshot,
          diff: {},
        },
      };
      const { getByTestId } = render(<SnapshotHeader {...props} isApproving />);
      expect(getByTestId('approve-snapshot').hasAttribute('disabled')).toBe(
        true,
      );
    });
  });

  describe('original view button', () => {
    it('should be disabled if type is not removed', () => {
      const { getByTestId } = render(<SnapshotHeader {...PROPS} />);
      expect(getByTestId('show-original').hasAttribute('disabled')).toBe(true);
    });
    it('should be enabled if type is removed', () => {
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} type="removed" />,
      );
      expect(getByTestId('show-original').hasAttribute('disabled')).toBe(false);
    });
    it('should be enabled if there is a previous snapshot', () => {
      const snapshot = {
        ...PROPS.snapshot,
        previousApproved: {
          id: 2,
        },
      };
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} snapshot={snapshot} />,
      );
      expect(getByTestId('show-original').hasAttribute('disabled')).toBe(false);
    });
    it('sets the view to original snapshot', () => {
      const snapshot = {
        ...PROPS.snapshot,
        previousApproved: {
          id: 2,
        },
      };
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} snapshot={snapshot} />,
      );
      fireEvent.click(getByTestId('show-original'));
      expect(PROPS.onChangeView).toHaveBeenCalledWith(VIEWS.original);
    });
  });

  describe('new view button', () => {
    it('should be disabled if type is removed', () => {
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} type="removed" />,
      );
      expect(getByTestId('show-new').hasAttribute('disabled')).toBe(true);
    });
    it('sets the view to new', () => {
      const { getByTestId } = render(<SnapshotHeader {...PROPS} />);
      fireEvent.click(getByTestId('show-new'));
      expect(PROPS.onChangeView).toHaveBeenCalledWith(VIEWS.new);
    });
  });

  describe('both view button', () => {
    it('should be disabled if type is removed', () => {
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} type="removed" />,
      );
      expect(getByTestId('show-both').hasAttribute('disabled')).toBe(true);
    });
    it('should be disabled if there is no previous snapshot', () => {
      const { getByTestId } = render(<SnapshotHeader {...PROPS} />);
      expect(getByTestId('show-both').hasAttribute('disabled')).toBe(true);
    });
    it('sets the view to both', () => {
      const snapshot = {
        ...PROPS.snapshot,
        previousApproved: {
          id: 2,
        },
      };
      const { getByTestId } = render(
        <SnapshotHeader {...PROPS} snapshot={snapshot} />,
      );
      fireEvent.click(getByTestId('show-both'));
      expect(PROPS.onChangeView).toHaveBeenCalledWith(VIEWS.both);
    });
  });
});
