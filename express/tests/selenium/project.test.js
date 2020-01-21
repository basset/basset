const { createUser } = require('../utils/user');
const { createProject } = require('../utils/project');
const {
  createOrganization,
  addUserToOrganization,
} = require('../utils/organization');
const { login } = require('./utils/auth');

describe('projects', () => {
  let user, organization;
  const home = `http://localhost:${address.port}/`;
  beforeAll(async () => {
    user = await createUser('project@basset.io', {
      password: 'basset',
      active: true,
    });
    organization = await createOrganization('basset');
    await addUserToOrganization(organization.id, user.id, true);
  });
  test('create project', async () => {
    await login(driver, 'project@basset.io', 'basset');
    await driver.get(home);
    await waitForLoader();
    await snapshot('Project list - empty', { widths: '1280' });
    const createProjectLink = await findByTestId('create-project');
    await createProjectLink.click();
    await waitForLoader();
    await snapshot('Create project', { widths: '1280' });
    const createProjectNameInput = await findByTestId(
      'create-project-name-input',
    );
    await createProjectNameInput.sendKeys('Test project');
    const submit = await findByTestId('create-project-submit');
    await submit.click();
    await driver.wait(until.stalenessOf(submit));
    await waitForLoader();
    await waitForTestId('project');
    await snapshot('Project list', { widths: '1280' });
  });
  test('edit project', async () => {
    let projects = await findAllByTestId('project');
    await projects[0].click();
    await waitForLoader();
    const config = await findByTestId('project-configuration');
    await config.click();
    await waitForLoader();

    const editProjectName = await findByTestId('edit-project-name');
    await driver.wait(until.elementIsEnabled(editProjectName));
    await editProjectName.click();
    const projectName = await findByTestId('project-name-input');
    await projectName.sendKeys(' #2');
    const saveName = await findByTestId('project-name-save');
    await saveName.click();
    await driver.wait(until.stalenessOf(saveName));
    projects = await findAllByTestId('project');
    await driver.wait(async () => {
      const text = await projects[0].getText();
      return text === 'Test project #2';
    });
    const editProjectBranch = await findByTestId('edit-project-branch');
    await driver.wait(until.elementIsEnabled(editProjectBranch));
    await editProjectBranch.click();
    const projectBranch = await findByTestId('project-branch-input');
    await projectBranch.clear();
    await projectBranch.sendKeys('blaster');
    const saveBranch = await findByTestId('project-branch-save');
    await saveBranch.click();
  });
  test('edit project - slack webhook', async () => {
    await waitForTestId('edit-slack-webhook');
    const editSlackWebhook = await findByTestId('edit-slack-webhook');
    await driver.wait(until.elementIsEnabled(editSlackWebhook));
    await editSlackWebhook.click();
    const slackWebhook = await findByTestId('slack-webhook-input');
    await slackWebhook.sendKeys('webhook');
    const saveWebhook = await findByTestId('slack-webhook-save');
    await saveWebhook.click();
    await driver.wait(until.stalenessOf(saveWebhook));
  });
  // test('edit project - slack variable', async () => {
  //   await waitForTestId('edit-slack-variable');
  //   const editSlackVariable = await findByTestId('edit-slack-variable');
  //   await driver.wait(until.elementIsEnabled(editSlackVariable));
  //   await editSlackVariable.click();
  //   await driver.wait(until.stalenessOf(editSlackVariable));
  //
  //   await waitForTestId('slack-variable-input');
  //   const slackVariable = await findByTestId('slack-variable-input');
  //   await slackVariable.sendKeys('variable');
  //   const saveVariable = await findByTestId('slack-variable-save');
  //   await saveVariable.click();
  //   await driver.wait(until.stalenessOf(saveVariable));
  // });
  test('edit project - browser settings', async () => {
    const toggleChrome = await findByTestId('toggle-chrome');
    await toggleChrome.click();
    await driver.wait(until.elementIsEnabled(toggleChrome));

    const toggleFirefox = await findByTestId('toggle-firefox');
    await toggleFirefox.click();
    await driver.wait(until.elementIsEnabled(toggleFirefox));
  });

  test('edit github settings', async () => {
    const project = await createProject('Github test', organization.id, {
      scmToken: 'randomgargon',
      name: 'New project',
      slackWebhook: 'webhook',
      slackVariable: 'variable',
    });
    await project.$query().update({
      key: 'randomtokenhere',
    });
    await driver.get(`${home}projects/${project.id}`);
    await waitForLoader();

    const config = await findByTestId('project-configuration');
    await config.click();
    await waitForLoader();

    await snapshot('Project configuration', { widths: '1280' });
    // const editRepoOwner = await findByTestId('edit-repo-owner');
    // await editRepoOwner.click();
    // const repoOwner = await findByTestId('repo-owner-input');
    // await repoOwner.sendKeys('repoman');
    // const saveOwner = await findByTestId('repo-owner-save');
    // await saveOwner.click();
    // await driver.wait(until.stalenessOf(saveOwner));
    //
    // const editRepoName = await findByTestId('edit-repo-name');
    // await driver.wait(until.elementIsEnabled(editRepoName));
    // await editRepoName.click();
    // const repoName = await findByTestId('repo-name-input');
    // await repoName.sendKeys('repoman');
    // const saveName = await findByTestId('repo-name-save');
    // await saveName.click();
    // await driver.wait(until.stalenessOf(saveName));

    const toggleSCMActive = await findByTestId('toggle-scm-active');
    await toggleSCMActive.click();
    await driver.wait(until.elementIsEnabled(toggleSCMActive));

    await snapshot('Project configuration - filled', { widths: '1280' });
  });
  test('config examples', async () => {
    const project = await createProject('Config Example', organization.id, {
      scmToken: 'TOKEN',
      name: 'New project',
      slackWebhook: 'webhook',
      slackVariable: 'variable',
    });
    await driver.get(`${home}projects/${project.id}`);
    await waitForLoader();
    const configExamples = await findByTestId('project-setup');
    await configExamples.click();

    await snapshot('Project - Node setup');

    const pythonExample = await findByTestId('python-setup');
    await pythonExample.click();

    await snapshot('Project - Python setup');
  })
});
