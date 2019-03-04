import * as Octokit from '@octokit/rest';
import { config } from '../../barrels/config';

let octokit = new Octokit();

octokit.authenticate({
  // sync
  type: 'token',
  token: config.GITHUB_TOKEN
});

export const constantOctokitAuth = octokit;
