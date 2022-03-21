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
  const yamlBody = message.match(/---(?<yml>(\r?\n|.)+)\.\.\./m)?.groups?.yml;
  const updateInfo = yaml.load(yamlBody);
  const depData = updateInfo?.['updated-dependencies']?.[0];
  if (depData) {
    const depType = depData['dependency-type'];
    const updateType = depData['update-type'];
    return {
      dependencyName: depData['dependency-name'],
      dependencyType: depType ? /[a-z]+$/.exec(depType)?.[0] : null,
      updateType: updateType ? /[a-z]+$/.exec(updateType)?.[0] : null,
    };
  }
  return {};
};
