import React from 'react';
import { render, fireEvent, cleanup } from 'react-testing-library';
import { renderWithGrommet } from '../../../tests/render-redux.js';
import Build from './Build.jsx';

afterEach(cleanup);

describe('<Build />', () => {
  let PROPS;
  beforeEach(() => {
    PROPS = {
      build: {
        approvedSnapshots: 13,
        authorEmail: 'tester@basset.io',
        authorName: 'tester',
        branch: 'more-tests-2',
        cancelledAt: null,
        comitterEmail: null,
        commitDate: '1557120299000',
        commitMessage: 'add render diff tests\n',
        commitSha: '61657d2ec5f132afc574b717347a30c76dce1891',
        committerName: 'tester',
        completedAt: '1557157486765',
        createdAt: '1557157398647',
        id: '45b193b9-33c4-470a-8ae4-58fb223248ac',
        modifiedSnapshots: 13,
        newSnapshots: 15,
        number: 67,
        removedSnapshots: 8,
        submittedAt: '1557157400907',
        totalSnapshots: 36,
        updatedAt: '1557157507189',
      },
      active: false,
      onChangeBuild: jest.fn(),
    };
  });
  test('active scrolls into view', () => {
    global.window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const { container } = renderWithGrommet(<Build {...PROPS} active />);
    expect(container.scrollIntoView).toHaveBeenCalled();
  });
  test('build is a link when completedAt is set', () => {
    const { container } = renderWithGrommet(<Build {...PROPS} />);
    const anchor = container.getElementsByTagName('a');
    expect(anchor).toHaveLength(1);
    expect(anchor[0].getAttribute('href')).toBe(
      '/builds/45b193b9-33c4-470a-8ae4-58fb223248ac',
    );
  });
  test('build not a link when completedAt is null', () => {
    PROPS.build.completedAt = null;
    const { container } = renderWithGrommet(<Build {...PROPS} />);
    const anchor = container.getElementsByTagName('a');
    expect(anchor).toHaveLength(0);
  });
  test('build info when completedAt is null', () => {
    PROPS.build.completedAt = null;
    const { getByText } = renderWithGrommet(<Build {...PROPS} />);
    getByText('Build #67');
    getByText('more-tests-2');
    getByText(/^Submitted/);
  });

  test('build info when completedAt is null and cancelledAt is not null', () => {
    PROPS.build.completedAt = null;
    PROPS.build.cancelledAt = '1557157486765';
    const { getByText } = renderWithGrommet(<Build {...PROPS} />);
    getByText('Build #67');
    getByText('more-tests-2');
    getByText(/^Cancelled/);
  });
  test('build info when completedAt is set', () => {
    const { getByText } = renderWithGrommet(<Build {...PROPS} />);
    getByText('Build #67');
    getByText('more-tests-2');
    getByText(/^Finished .+\(build time .+\)/);
  });
  test('approved snapshots info', () => {
    PROPS.build.approvedSnapshots = 5;
    const { queryAllByLabelText, getByText, queryByText } = renderWithGrommet(
      <Build {...PROPS} />,
    );
    expect(queryByText(/snapshots removed/)).toBeNull();
    expect(queryByText(/removed snapshots/)).toBeNull();
    getByText('5 of 13 approved');
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
  });
  test('new snapshots info', () => {
    PROPS.build.modifiedSnapshots = 0;
    const { queryAllByLabelText, getByText, queryByText } = renderWithGrommet(
      <Build {...PROPS} />,
    );
    expect(queryByText(/snapshots removed/)).toBeNull();
    expect(queryByText(/approved/)).toBeNull();
    getByText('15 new snapshots');
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
  });
  test('removed snapshots info', () => {
    PROPS.build.modifiedSnapshots = 0;
    PROPS.build.newSnapshots = 0;
    const { queryAllByLabelText, getByText, queryByText } = renderWithGrommet(
      <Build {...PROPS} />,
    );
    expect(queryByText(/new snapshots/)).toBeNull();
    expect(queryByText(/approved/)).toBeNull();
    getByText('8 snapshots removed');
    expect(queryAllByLabelText('StatusGood')).toHaveLength(1);
  });
  test('Snapshots with checkmark', () => {
    PROPS.build.modifiedSnapshots = 1;
    PROPS.build.approvedSnapshots = 1;
    PROPS.build.newSnapshots = 0;
    PROPS.build.removedSnapshots = 0;
    const { queryAllByLabelText, getByText, queryByText } = renderWithGrommet(
      <Build {...PROPS} />,
    );
    expect(queryByText(/new snapshots/)).toBeNull();
    expect(queryByText(/approved/)).toBeNull();
    getByText(/Snapshots/);
    expect(queryAllByLabelText('StatusGood')).toHaveLength(2);
  });
});
