module.exports.shouldApprove = ({
  dependabotData: { dependencyName, dependencyType, updateType },
  config = [],
}) => {
  const weight = {
    premajor: 6,
    major: 5,
    preminor: 4,
    minor: 3,
    prepatch: 2,
    prerelease: 2,
    patch: 1,
  };

  for (const { include, exclude, ...configItem } of config) {
    const matchDepType =
      dependencyType === configItem['dependency-type'] ||
      (configItem['dependency-type'] === 'all' &&
        ['development', 'production'].includes(dependencyType));

    const matchUpType =
      [updateType, configItem['update-type']].every((t) => t in weight) &&
      weight[updateType] <= weight[configItem['update-type']];

    const isMatching = matchDepType && matchUpType;

    if (isMatching && include) {
      const includeList = typeof include === 'string' ? [include] : include;
      const isIncluded = includeList.some((str) =>
        new RegExp(str).test(dependencyName)
      );
      if (!isIncluded) {
        return false;
      }
    }

    if (isMatching && exclude) {
      let excludeList = typeof exclude === 'string' ? [exclude] : exclude;
      const isExcluded = excludeList.some((str) =>
        new RegExp(str).test(dependencyName)
      );
      if (isExcluded) {
        return false;
      }
    }

    return isMatching;
  }

  return false;
};

module.exports.approvePR = async ({ octokit, repo, pr }) => {
  await octokit.rest.pulls.createReview({
    ...repo,
    pull_number: pr.number,
    event: 'APPROVE',
    body: '@dependabot merge',
  });
};
