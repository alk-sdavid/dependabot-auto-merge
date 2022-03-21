const { readConfigFile } = require('./config');

jest.mock('@actions/core', () => ({ info: jest.fn() }));

describe('readConfigFile', () => {
  it('should read config', async () => {
    process.env.GITHUB_WORKSPACE = __dirname;
    const result = await readConfigFile({ configFile: 'config.test.yml' });
    expect(result).toEqual([
      {
        'dependency-type': 'production',
        'update-type': 'patch',
        exclude: 'lib-python-',
      },
      {
        'dependency-type': 'development',
        'update-type': 'patch',
        include: 'lib-python-',
      },
    ]);
  });

  it('should fail to read config because config file is missing', async () => {
    process.env.GITHUB_WORKSPACE = __dirname;
    let error;
    try {
      await readConfigFile({});
    } catch (err) {
      error = err;
    }
    expect(error?.message).toMatch(
      /\.github\/auto-merge\.yml file does not exists/i
    );
  });

  it('should read wront config', async () => {
    process.env.GITHUB_WORKSPACE = __dirname;
    let error;
    try {
      await readConfigFile({ configFile: 'config.wrong.test.yml' });
    } catch (err) {
      error = err;
    }
    expect(error?.message).toMatch(/should be a list with at least 1 item/i);
  });
});
