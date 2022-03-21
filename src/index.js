const core = require('@actions/core');
const github = require('@actions/github');
const { parseCommit } = require('./parse');
const { shouldApprove, approvePR } = require('./approve');
const { readConfigFile } = require('./config');

module.exports = async function main() {
  const {
    repo,
    payload: { sender, pull_request: pr },
  } = github.context;

  if (!sender || !/dependabot\[bot\]/i.test(sender.login)) {
    core.info(
      `exiting early: expected PR by "dependabot[bot]", found "${
        sender ? sender.login : 'no-sender'
      }" instead`
    );
    return;
  }

  const githubToken = core.getInput('github-token', { required: true });
  const configFile = core.getInput('config', { required: false });
  const octokit = github.getOctokit(githubToken);
  const dependabotData = await parseCommit({ octokit });
  const config = await readConfigFile({ configFile });

  if (shouldApprove({ dependabotData, config })) {
    approvePR({ octokit, repo, pr });
  }
};
