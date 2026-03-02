import * as avatars from '#backend/drizzle/postgres/schema/avatars';
import * as branches from '#backend/drizzle/postgres/schema/branches';
import * as bridges from '#backend/drizzle/postgres/schema/bridges';
import * as charts from '#backend/drizzle/postgres/schema/charts';
import * as connections from '#backend/drizzle/postgres/schema/connections';
import * as dashboards from '#backend/drizzle/postgres/schema/dashboards';
import * as dconfigs from '#backend/drizzle/postgres/schema/dconfigs';
import * as envs from '#backend/drizzle/postgres/schema/envs';
import * as kits from '#backend/drizzle/postgres/schema/kits';
import * as mconfigs from '#backend/drizzle/postgres/schema/mconfigs';
import * as members from '#backend/drizzle/postgres/schema/members';
import * as models from '#backend/drizzle/postgres/schema/models';
import * as notes from '#backend/drizzle/postgres/schema/notes';
import * as ocEvents from '#backend/drizzle/postgres/schema/oc-events';
import * as ocMessages from '#backend/drizzle/postgres/schema/oc-messages';
import * as ocParts from '#backend/drizzle/postgres/schema/oc-parts';
import * as ocSessions from '#backend/drizzle/postgres/schema/oc-sessions';
import * as orgs from '#backend/drizzle/postgres/schema/orgs';
import * as projects from '#backend/drizzle/postgres/schema/projects';
import * as queries from '#backend/drizzle/postgres/schema/queries';
import * as reports from '#backend/drizzle/postgres/schema/reports';
import * as sessions from '#backend/drizzle/postgres/schema/sessions';
import * as structs from '#backend/drizzle/postgres/schema/structs';
import * as uconfigs from '#backend/drizzle/postgres/schema/uconfigs';
import * as users from '#backend/drizzle/postgres/schema/users';

export const schemaPostgres = {
  ...avatars,
  ...branches,
  ...bridges,
  ...charts,
  ...connections,
  ...dashboards,
  ...dconfigs,
  ...envs,
  ...kits,
  ...mconfigs,
  ...members,
  ...models,
  ...notes,
  ...ocEvents,
  ...ocMessages,
  ...ocParts,
  ...ocSessions,
  ...orgs,
  ...projects,
  ...queries,
  ...reports,
  ...sessions,
  ...structs,
  ...uconfigs,
  ...users
};
