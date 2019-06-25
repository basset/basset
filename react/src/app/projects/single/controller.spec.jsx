import React from 'react';
import {
  fireEvent,
  cleanup,
  getByTestId as _getByTestId,
  wait,
} from 'react-testing-library';
import { store, renderApp } from '../../../tests/render-redux.js';

import * as organizationActions from '../../../redux/organizations/actions.js';
import * as buildActions from '../../../redux/builds/actions.js';
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

import ApolloClient from '../../../graphql/client.js';

afterEach(cleanup);

describe('<Project />', () => {
  beforeEach(() => {
    projectActions.saveProject = jest.fn(() => (dispatch, getState) => {});
    store.dispatch(
      userActions.receiveUser({
        name: '',
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
          provider: null,
          repoActive: null,
          repoName: null,
          repoOwner: null,
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
    ['repoName', 'me', 'repo-name'],
    ['repoOwner', 'owner', 'repo-owner'],
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
  test('setup github integration', async () => {
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
          provider: null,
          repoActive: null,
          repoName: null,
          repoOwner: null,
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    projectActions.linkToGitHub = jest.fn(() => (dispatch, getState) => {});
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const useGithub = getByTestId('setup-github');
    useGithub.click();
    expect(projectActions.linkToGitHub).toHaveBeenCalled();
  });
  test('github integration', async () => {
    store.dispatch(
      userActions.receiveUser({
        name: '',
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
          hasToken: false,
          key: 'randomkey',
          provider: null,
          repoActive: null,
          repoName: null,
          repoOwner: null,
          slackActive: null,
          slackVariable: null,
          slackWebhook: null,
        },
      ]),
    );
    store.dispatch(projectActions.setCurrentProject('12345'));
    projectActions.linkToGitHub = jest.fn(() => (dispatch, getState) => {});
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const useGithub = getByTestId('use-github');
    useGithub.click();
    expect(projectActions.linkToGitHub).toHaveBeenCalled();
  });
  test('remove github integration', () => {
    projectActions.removeGithub = jest.fn(() => (dispatch, getState) => {});
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();

    const remove = getByTestId('remove-github');
    remove.click();

    const cancel = _getByTestId(document, 'cancel-remove-github');
    cancel.click();
    expect(projectActions.removeGithub).not.toHaveBeenCalled();

    remove.click();

    let confirm = _getByTestId(document, 'confirm-remove-github');
    confirm.click();
    expect(projectActions.removeGithub).toHaveBeenCalled();
  });
  test('toggle github active', async () => {
    const { getByTestId } = renderApp(<Project />);
    const configuration = getByTestId('project-configuration');
    configuration.click();
    const button = getByTestId('toggle-repo-active');
    button.click();
    expect(projectActions.saveProject).toHaveBeenCalledWith({
      repoActive: true,
    });
    store.dispatch(
      projectActions.updateProject({
        repoActive: true,
      }),
    );
    await wait(
      () => getByTestId('toggle-repo-active').attributes['checked'] === true,
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
          provider: null,
          repoActive: null,
          repoName: null,
          repoOwner: null,
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
