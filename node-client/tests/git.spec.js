jest.mock('child_process', () => ({
  exec: jest.fn((call, cb) => {
    if (call.includes('%B')) {
      const stdout = 'this is a test';
      cb(null, { stdout, stderr: null });
    } else if (call.includes('%H,%cn,%ce,%cI,%an,%ae,%aI')) {
      const stdout =
        'sha1234,commiterName,committerEmail,commitDate,authorName,authorEmail,authorDate';
      return cb(null, { stdout, stderr: null });
    }
    const stdout = 'master\n';
    return cb(null, { stdout, stderr: null });
  }),
}));
const git = require('../lib/git');

test('getGitInfo', async () => {
  const info = await git.getGitInfo();
  expect(info).toEqual({
    branch: 'master',
    commitMessage: 'this is a test',
    commitSha: 'sha1234',
    committerName: 'commiterName',
    committerEmail: 'committerEmail',
    commitDate: 'commitDate',
    authorName: 'authorName',
    authorEmail: 'authorEmail',
    authorDate: 'authorDate',
  });
});
