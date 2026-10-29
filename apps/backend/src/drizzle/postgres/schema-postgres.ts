import * as avatars from '#backend/drizzle/postgres/tables/avatars';
import * as branches from '#backend/drizzle/postgres/tables/branches';
import * as bridges from '#backend/drizzle/postgres/tables/bridges';
import * as cachedColumns from '#backend/drizzle/postgres/tables/cached-columns';
import * as cachedParts from '#backend/drizzle/postgres/tables/cached-parts';
import * as charts from '#backend/drizzle/postgres/tables/charts';
import * as connections from '#backend/drizzle/postgres/tables/connections';
import * as dashboards from '#backend/drizzle/postgres/tables/dashboards';
import * as dconfigs from '#backend/drizzle/postgres/tables/dconfigs';
import * as envs from '#backend/drizzle/postgres/tables/envs';
import * as favorites from '#backend/drizzle/postgres/tables/favorites';
import * as givens from '#backend/drizzle/postgres/tables/givens';
import * as kits from '#backend/drizzle/postgres/tables/kits';
import * as mconfigs from '#backend/drizzle/postgres/tables/mconfigs';
import * as members from '#backend/drizzle/postgres/tables/members';
import * as modelFieldLeafs from '#backend/drizzle/postgres/tables/model-field-leafs';
import * as models from '#backend/drizzle/postgres/tables/models';
import * as notes from '#backend/drizzle/postgres/tables/notes';
import * as ocEvents from '#backend/drizzle/postgres/tables/oc-events';
import * as ocMessages from '#backend/drizzle/postgres/tables/oc-messages';
import * as ocParts from '#backend/drizzle/postgres/tables/oc-parts';
import * as ocSessions from '#backend/drizzle/postgres/tables/oc-sessions';
import * as orgs from '#backend/drizzle/postgres/tables/orgs';
import * as projects from '#backend/drizzle/postgres/tables/projects';
import * as providers from '#backend/drizzle/postgres/tables/providers';
import * as queries from '#backend/drizzle/postgres/tables/queries';
import * as reports from '#backend/drizzle/postgres/tables/reports';
import * as roles from '#backend/drizzle/postgres/tables/roles';
import * as sessions from '#backend/drizzle/postgres/tables/sessions';
import * as structs from '#backend/drizzle/postgres/tables/structs';
import * as uconfigs from '#backend/drizzle/postgres/tables/uconfigs';
import * as users from '#backend/drizzle/postgres/tables/users';

export const schemaPostgres = {
  ...avatars,
  ...branches,
  ...cachedColumns,
  ...cachedParts,
  ...bridges,
  ...charts,
  ...connections,
  ...dashboards,
  ...dconfigs,
  ...envs,
  ...favorites,
  ...givens,
  ...kits,
  ...mconfigs,
  ...members,
  ...modelFieldLeafs,
  ...models,
  ...notes,
  ...ocEvents,
  ...ocMessages,
  ...ocParts,
  ...ocSessions,
  ...orgs,
  ...projects,
  ...providers,
  ...queries,
  ...reports,
  ...roles,
  ...sessions,
  ...structs,
  ...uconfigs,
  ...users
};
