const promisify = require('util').promisify;
const request = promisify(require('request'));

const settings = require('../../settings');

const postToSlack = (webhookUrl, message) => {
  return request.post(
    {
      url: webhookUrl,
      json: true,
      body: {
        text: message,
        link_names: 1,
      },
    },
    (error, response, body) => {
      if (error) {
        console.error(error);
      }
    },
  );
};

const notifySnapshotsNeedApproving = (modifiedCount, project, build) => {
  let message = '';
  if (project.slackVariable) {
    message = `${project.slackVariable} `;
  }

  message = `${message}${modifiedCount} snapshots need approving from build: <${
    settings.site.url
  }/builds/${build.id}|${build.number}>`;

  return postToSlack(project.slackWebhook, message);
};

module.exports = {
  notifySnapshotsNeedApproving,
  postToSlack,
};
