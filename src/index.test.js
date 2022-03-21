const github = require('@actions/github');
const main = require('.');

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  error: jest.fn(),
  getInput: (input) => {
    switch (input) {
      case 'github_token':
        return 'github_token';
      case 'config':
        return 'index.test.yml';
      default:
        return '';
    }
  },
}));
jest.mock('@actions/github', () => {
  const message = `Bump yargs from 17.3.0 to 17.3.1

Bumps [yargs](https://github.com/yargs/yargs) from 17.3.0 to 17.3.1.
- [Release notes](https://github.com/yargs/yargs/releases)
- [Changelog](https://github.com/yargs/yargs/blob/main/CHANGELOG.md)
- [Commits](https://github.com/yargs/yargs/compare/v17.3.0...v17.3.1)

---
updated-dependencies:
- dependency-name: yargs
  dependency-type: direct:development
  update-type: version-update:semver-patch
...

Signed-off-by: dependabot[bot] <support@github.com>
  `;
  const octokit = {
    pulls: { createReview: jest.fn() },
    rest: {
      git: {
        getCommit: jest.fn(() => ({
          data: { message },
        })),
      },
    },
  };
  return {
    context: {
      repo: { organization_name: 'alkemics', repo_name: 'lib-python-ci' },
      payload: {
        sender: { login: 'dependabot[bot]' },
        pull_request: { number: 42, head: { sha: 42 } },
      },
    },
    getOctokit: () => octokit,
  };
});

test('main script should approve pull-request', async () => {
  process.env.GITHUB_WORKSPACE = __dirname;
  await main();
  const octokit = github.getOctokit();
  expect(octokit.pulls.createReview).toHaveBeenCalledTimes(1);
  expect(octokit.pulls.createReview).toHaveBeenCalledWith({
    body: '@dependabot merge',
    event: 'APPROVE',
    organization_name: 'alkemics',
    pull_number: 42,
    repo_name: 'lib-python-ci',
  });
});
