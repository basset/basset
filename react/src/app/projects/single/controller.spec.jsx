import React from 'react';
import { fireEvent, cleanup, wait } from 'react-testing-library';
import { store, renderApp } from '../../../tests/render-redux.js';

import * as organizationActions from '../../../redux/organizations/actions.js';
import * as userActions from '../../../redux/user/actions.js';
import * as projectActions from '../../../redux/projects/actions.js';

import Project from './controller.jsx';

let mockMutate = Promise.resolve();

jest.mock('../../../graphql/client.js', () => {
  return {
    query: jest.fn(() => Promise.resolve()),
    mutate: jest.fn(() => mockMutate),
  };
});

afterEach(cleanup);

describe('<Project />', () => {
  beforeEach(() => {
    global.window.__BASSET__ = {
      logins: {
        github: true,
        gitlab: false,
        bitbucket: false,
      },
    };
    projectActions.saveProject = jest.fn(() => (dispatch, getState) => {});
    store.dispatch(
      userActions.receiveUser({
        id: '1234',
        name: 'billy',
        providers: {
          edges: [],
        },
      }),
    );
    store.dispatch(
      organizationActions.receiveOrganizations([
        {
          id: '1234',
          name: 'organization',
          admin: true,
        },
      ]),
    );
    store.dispatch(
      projectActions.receiveProjects([
        {
          id: '12345',
          name: 'Basset',
          browsers: 'firefox',
          defaultBranch: 'master',
          defaultWidth: '1280',
          hasToken: true,
          key: 'randomkey',
          scmProvider: null,
          scmActive: null,
          scmConfig: {
            repoName: null,
            repoOwner: null,
          },
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    store.dispatch(projectActions.doneLoading());
    store.dispatch(organizationActions.doneLoading());
  });
  test('loader', () => {
    store.dispatch(projectActions.isLoading());
    const { getByTestId } = renderApp(<Project />);
    getByTestId('loader');
  });

  test('only admins can edit configuration', () => {
    store.dispatch(
      organizationActions.receiveOrganizations([
        {
          id: '1234',
          name: 'organization',
          admin: false,
        },
      ]),
    );
    const { queryByTestId, getByTestId, getByText } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    expect(queryByTestId('edit-project-name')).toBeNull();
    getByText('Only admins can edit these settings.');
  });
  test.each([
    ['name', 'basset', 'project-name'],
    ['defaultBranch', 'branchie', 'project-branch'],
    ['slackWebhook', 'webhook', 'slack-webhook'],
    ['slackVariable', 'var', 'slack-variable'],
    ['defaultWidth', '1280,720', 'project-widths'],
    ['hideSelectors', '[data-test-id="hideme"]', 'project-hide-selectors'],
  ])('edit project %s', (name, value, testName) => {
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const button = getByTestId(`edit-${testName}`);
    button.click();
    const input = getByTestId(`${testName}-input`);
    fireEvent.change(input, {
      target: {
        value: value,
      },
    });
    fireEvent.submit(input);
    expect(projectActions.saveProject).toHaveBeenCalledWith({ [name]: value });
  });
  test('enable github integration', async () => {
    store.dispatch(
      projectActions.receiveProjects([
        {
          id: '12345',
          name: 'Basset',
          browsers: 'firefox',
          defaultBranch: 'master',
          defaultWidth: '1280',
          hasToken: false,
          key: 'randomkey',
          scmProvider: null,
          scmActive: null,
          scmConfig: {
            repoName: null,
            repoOwner: null,
          },
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    projectActions.linkToProvider = jest.fn(() => (dispatch, getState) => {});
    const { getByTestId, getByText } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const editScmProvider = getByTestId('edit-scm-provider');
    editScmProvider.click();
    const scmSelect = getByTestId('scm-provider-select');
    scmSelect.click();
    const github = getByText('github');
    github.click();
    const useSCM = getByTestId('setup-scm');
    useSCM.click();
    expect(projectActions.linkToProvider).toHaveBeenCalled();
  });
  test('set github scm integration', async () => {
    store.dispatch(
      userActions.receiveUser({
        id: '1234',
        name: 'billy',
        providers: {
          edges: [{ node: { providerId: 1234, provider: 'github' } }],
        },
      }),
    );
    store.dispatch(
      projectActions.receiveProjects([
        {
          id: '12345',
          name: 'Basset',
          browsers: 'firefox',
          defaultBranch: 'master',
          defaultWidth: '1280',
          hasToken: true,
          key: 'randomkey',
          scmProvider: null,
          scmActive: null,
          scmConfig: {
            repoName: null,
            repoOwner: null,
          },
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    projectActions.linkToProvider = jest.fn(() => (dispatch, getState) => {});
    const { getByTestId, getByText, debug } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const editScmProvider = getByTestId('edit-scm-provider');
    const scmLabel = getByTestId('scm-provider');
    expect(scmLabel.textContent).toEqual('');

    editScmProvider.click();
    const scmSelect = getByTestId('scm-provider-select');
    scmSelect.click();
    const github = getByText('github');
    github.click();

    const repoOwnerInput = getByTestId('repo-owner-input');
    const repoNameInput = getByTestId('repo-name-input');
    fireEvent.change(repoOwnerInput, {
      target: {
        value: 'basset-owner',
      },
    });
    fireEvent.change(repoNameInput, {
      target: {
        value: 'basset-name',
      },
    });

    const save = getByTestId('save');
    save.click();
    expect(projectActions.linkToProvider).toHaveBeenCalled();
    expect(projectActions.saveProject).toHaveBeenCalledWith({
      scmProvider: 'github',
      scmConfig: {
        repoName: 'basset-name',
        repoOwner: 'basset-owner',
      },
    });
  });
  test('toggle scm active', async () => {
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const button = getByTestId('toggle-scm-active');
    button.click();
    expect(projectActions.saveProject).toHaveBeenCalledWith({
      scmActive: true,
    });
    store.dispatch(
      projectActions.updateProject({
        scmActive: true,
      }),
    );
    await wait(
      () => getByTestId('toggle-scm-active').attributes['checked'] === true,
    );
  });
  test('toggle firefox', async () => {
    store.dispatch(projectActions.isLoading());
    store.dispatch(
      projectActions.receiveProjects([
        {
          id: '12345',
          name: 'Basset',
          browsers: 'chrome',
          defaultBranch: 'master',
          defaultWidth: '1280',
          hasToken: true,
          key: 'randomkey',
          scmProvider: null,
          scmActive: null,
          scmConfig: {
            repoName: null,
            repoOwner: null,
          },
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    store.dispatch(projectActions.doneLoading());
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const button = getByTestId('toggle-firefox');
    button.click();
    expect(projectActions.saveProject).toHaveBeenCalledWith({
      browsers: 'chrome,firefox',
    });
    store.dispatch(
      projectActions.updateProject({
        browsers: 'chrome',
      }),
    );
    await wait(
      () => getByTestId('toggle-firefox').attributes['checked'] === false,
    );
  });
  test('toggle chrome', async () => {
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const button = getByTestId('toggle-chrome');
    button.click();
    expect(projectActions.saveProject).toHaveBeenCalledWith({
      browsers: 'firefox,chrome',
    });
    store.dispatch(
      projectActions.updateProject({
        browsers: 'chrome',
      }),
    );
    await wait(
      () => getByTestId('toggle-chrome').attributes['checked'] === true,
    );
  });
});
