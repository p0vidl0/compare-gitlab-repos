import _ from 'lodash';

const env = _.get(process, 'env', {});
const envConfig = require('../.env.js') || {};

const port = env.PORT || _.get(envConfig, 'default.port', 3003);
const host = env.HOST || _.get(envConfig, 'default.host', 'localhost');
const token = env.GITLAB_TOKEN || _.get(envConfig, 'default.token', '123');
const gitlabUri = env.GITLAB_URI || _.get(envConfig, 'default.gitlabUri', 'https://gitlab.com');
const repos = _.get(envConfig, 'default.repos', ['user/repo1', 'user/repo2']);
const branches = _.get(envConfig, 'default.branches', ['master', 'dev']);

export default {
  env,
  host,
  port,
  repos,
  token,
  branches,
  gitlabUri,
};
