const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');

module.exports.parseCommit = async ({ octokit }) => {
  const {
    data: { message = '' },
  } = await octokit.rest.git.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    commit_sha: github.context.payload.pull_request.head.sha,
  });
  core.info(`Commit message:\n${message}`);
  const yamlBody = message.match(/---(?<yml>(\r?\n|.)+)\.\.\./m)?.groups?.yml;
  const updateInfo = yaml.load(yamlBody);
  const depData = updateInfo?.['updated-dependencies']?.[0];
  let data = {};
  if (depData) {
    const depType = depData['dependency-type'];
    const updateType = depData['update-type'];
    data = {
      dependencyName: depData['dependency-name'],
      dependencyType: depType ? /[a-z]+$/.exec(depType)?.[0] : null,
      updateType: updateType ? /[a-z]+$/.exec(updateType)?.[0] : null,
    };
  }
  core.info(`Commit data:\n${JSON.stringify(data, null, 2)}`);
  return data;
};
