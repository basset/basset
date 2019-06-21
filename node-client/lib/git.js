const util = require('util');
const exec = util.promisify(require('child_process').exec);

const throwOnError = result => {
  if (result.stderr) {
    throw result.stderr;
  }
};

const parseCommitMessage = async () => {
  const result = await exec('git log -1 --pretty=format:"%B"');

  throwOnError(result);

  return result.stdout;
};

const parseBranch = async () => {
  const result = await exec('git rev-parse --abbrev-ref HEAD');
  throwOnError(result);

  return result.stdout.split('\n')[0];
};

const parseGitLog = async () => {
  const result = await exec(
    'git log -1 --pretty=format:"%H,%cn,%ce,%cI,%an,%ae,%aI"',
  );

  throwOnError(result);

  const gitLog = result.stdout.split(',');

  if (gitLog.length !== 7) {
    throw new Error('error parsing git log');
  }

  const [
    commitSha,
    committerName,
    committerEmail,
    commitDate,
    authorName,
    authorEmail,
    authorDate,
  ] = gitLog;

  return {
    commitSha,
    committerName,
    committerEmail,
    commitDate,
    authorName,
    authorEmail,
    authorDate,
  };
};

const getGitInfo = async () => {
  const branch = await parseBranch();

  const gitInfo = await parseGitLog();

  const commitMessage = await parseCommitMessage();

  return {
    ...gitInfo,
    branch,
    commitMessage,
  };
};

module.exports = {
  getGitInfo,
  parseBranch,
  parseCommitMessage,
  parseGitLog,
};
