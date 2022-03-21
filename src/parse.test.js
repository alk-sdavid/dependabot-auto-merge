const { parseCommit } = require('./parse');

jest.mock('@actions/github', () => ({
  context: {
    repo: { owner: 'alkemics', repo: 'lib-front-mfe' },
    pull_request: { head: { sha: '42' } },
  },
}));

describe('parseCommit', () => {
  it('should parse commit message', async () => {
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
      rest: { git: { getCommit: jest.fn(() => ({ data: { message } })) } },
    };
    const result = await parseCommit({ octokit });
    expect(octokit.rest.git.getCommit).toHaveBeenCalledTimes(1);
    expect(octokit.rest.git.getCommit).toHaveBeenCalledWith({
      commit_sha: '42',
      owner: 'alkemics',
      repo: 'lib-front-mfe',
    });
    expect(result).toEqual({
      dependencyName: 'yargs',
      dependencyType: 'development',
      updateType: 'patch',
    });
  });

  it('should parse invalid commit message', async () => {
    const octokit = {
      rest: { git: { getCommit: jest.fn(() => ({ data: {} })) } },
    };
    const result = await parseCommit({ octokit });
    expect(octokit.rest.git.getCommit).toHaveBeenCalledTimes(1);
    expect(octokit.rest.git.getCommit).toHaveBeenCalledWith({
      commit_sha: '42',
      owner: 'alkemics',
      repo: 'lib-front-mfe',
    });
    expect(result).toEqual({});
  });
});
