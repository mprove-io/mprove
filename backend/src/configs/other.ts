export const BLOCKML_BASE_PATH = 'http://blockml:8081/api/v2/';
export const BLOCKML_TIMEOUT = 10000;

export const CHUNK_CUTOFF = 15 * 1000;
export const SESSION_LAST_PONG_CUTOFF = 10 * 1000;
export const DELETE_PROJECTS_CUTOFF = 20 * 1000;
export const DELETE_MEMBERS_CUTOFF = 20 * 1000;
export const DELETE_USERS_CUTOFF = 30 * 1000;

export const DISK_BASE_PATH = '/mprove_data/backend/projects';
export const DISK_BIGQUERY_CREDENTIALS_PATH =
  '/mprove_data/backend/bigquery_credentials';

export const GITHUB_TOKEN = 'a97933f0beee74169e58bd598a754e56875d225d';
export const GITHUB_ORG = 'mprove-projects';

export const admins = [
  {
    user_id: 'akalitenya@mprove.io',
    first_password: '123123'
  }
];
