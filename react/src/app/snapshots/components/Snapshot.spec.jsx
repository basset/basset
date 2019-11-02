import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';

import Snapshot from './Snapshot.jsx';

afterEach(cleanup);

describe('<Snapshot />', () => {
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
      url: 'snapshot',
    },
    isApproving: false,
    isExpanded: false,
    canShrink: true,
    canExpand: true,
    index: 0,
    type: 'modified',
    onShrink: jest.fn(),
    onExpand: jest.fn(),
    onApprove: jest.fn(),
  };
  const snapshotWithDiff = {
    ...PROPS.snapshot,
    snapshotDiff: {
      id: 3,
      url: 'snapshotDiff',
    },
  };
  const snapshotWithPrevious = {
    ...snapshotWithDiff,
    previousApproved: {
      id: 2,
      url: 'previousSnapshot',
    },
  };
  test('active scrolls into view', () => {
    global.window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const { container, queryAllByTestId, getAllByTestId } = render(
      <Snapshot {...PROPS} active />,
    );
    expect(container.scrollIntoView).toHaveBeenCalled();
  });
  test('show the new snapshot with no diff image', () => {
    const { queryAllByTestId, getAllByTestId } = render(
      <Snapshot {...PROPS} />,
    );
    expect(getAllByTestId('snapshot')).toHaveLength(1);
    expect(queryAllByTestId('snapshot-overlay')).toHaveLength(0);
  });
  test('show the new snapshot with a diff image', () => {
    const { getAllByTestId } = render(
      <Snapshot {...PROPS} snapshot={snapshotWithDiff} />,
    );
    expect(getAllByTestId('snapshot')).toHaveLength(1);
    expect(getAllByTestId('snapshot-overlay')).toHaveLength(1);
  });
  test('show both snapshots with a diff image', () => {
    const { getAllByTestId } = render(
      <Snapshot {...PROPS} snapshot={snapshotWithPrevious} />,
    );
    expect(getAllByTestId('snapshot')).toHaveLength(2);
    expect(getAllByTestId('snapshot-overlay')).toHaveLength(1);
  });
  test('toggle between diff and new', () => {
    const { queryAllByTestId, getAllByTestId } = render(
      <Snapshot {...PROPS} snapshot={snapshotWithPrevious} />,
    );
    const btns = getAllByTestId('snapshot');
    const overlay = getAllByTestId('snapshot-overlay');
    fireEvent.click(overlay[0]);
    expect(queryAllByTestId('snapshot-overlay')).toHaveLength(0);
    fireEvent.click(btns[0]);
    expect(queryAllByTestId('snapshot-overlay')).toHaveLength(0);
    fireEvent.click(btns[1]);
    expect(queryAllByTestId('snapshot-overlay')).toHaveLength(1);
  });
  test('show only the original snapshots', () => {
    const { getByTestId, queryAllByTestId, getAllByTestId } = render(
      <Snapshot {...PROPS} snapshot={snapshotWithPrevious} />,
    );
    fireEvent.click(getByTestId('show-original'));
    expect(getAllByTestId('snapshot')).toHaveLength(1);
    expect(queryAllByTestId('snapshot-overlay')).toHaveLength(0);
    expect(getByTestId('snapshot').getAttribute('src')).toEqual(
      'previousSnapshot',
    );
  });
  test('show only the new snapshot', () => {
    const { getByTestId, getAllByTestId } = render(
      <Snapshot {...PROPS} snapshot={snapshotWithPrevious} />,
    );
    fireEvent.click(getByTestId('show-new'));
    expect(getAllByTestId('snapshot')).toHaveLength(1);
    expect(getAllByTestId('snapshot-overlay')).toHaveLength(1);
    expect(getByTestId('snapshot').getAttribute('src')).toEqual('snapshot');
  });
});
