const { shouldApprove, approvePR } = require('./approve');

describe('shouldApprove', () => {
  it('should match development config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      { 'dependency-type': 'development', 'update-type': 'patch' },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should match development config when dependency type conf is all', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [{ 'dependency-type': 'all', 'update-type': 'patch' }];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should match production config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'production',
      updateType: 'patch',
    };
    const config = [
      { 'dependency-type': 'production', 'update-type': 'minor' },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should not match update type config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'minor',
    };
    const config = [
      { 'dependency-type': 'development', 'update-type': 'patch' },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should not match dependency type config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'production',
      updateType: 'patch',
    };
    const config = [
      { 'dependency-type': 'development', 'update-type': 'patch' },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should match config and be included', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        include: 'lib-python-',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should match config but not included', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        include: 'something',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should match config but excluded', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        exclude: 'lib-python-',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should match config and not excluded', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        exclude: 'something',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should match config, be included and not excluded', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        include: 'lib-python-',
        exclude: 'something',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(true);
  });

  it('should match config, be included and excluded', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        include: 'lib-python-',
        exclude: 'lib-python-ci',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should match nothing with invalid config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });

  it('should match nothing with empty config', () => {
    const dependabotData = {
      dependencyName: 'lib-python-ci',
      dependencyType: 'development',
      updateType: 'patch',
    };
    const config = [
      {
        wrong: 'development',
        config: 'patch',
      },
    ];
    const result = shouldApprove({ dependabotData, config });
    expect(result).toBe(false);
  });
});

describe('approvePR', () => {
  it('should approve pull-request', async () => {
    const octokit = { rest: { pulls: { createReview: jest.fn() } } };
    const repo = { organization_name: 'alkemics', repo_name: 'lib-python-ci' };
    const pr = { number: 42 };
    await approvePR({ octokit, repo, pr });
    expect(octokit.rest.pulls.createReview).toHaveBeenCalledTimes(1);
    expect(octokit.rest.pulls.createReview).toHaveBeenCalledWith({
      body: '@dependabot merge',
      event: 'APPROVE',
      organization_name: 'alkemics',
      pull_number: 42,
      repo_name: 'lib-python-ci',
    });
  });
});
