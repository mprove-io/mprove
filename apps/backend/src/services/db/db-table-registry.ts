import type { DbExtra } from '#backend/drizzle/drizzle.module';
import type { ModelFieldLeafTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ModelFieldLeafEnt } from '#backend/drizzle/postgres/schema/model-field-leafs';
import { avatarEntToTab } from '#backend/services/db/avatars/avatar-ent-to-tab/avatar-ent-to-tab';
import { avatarTabToEnt } from '#backend/services/db/avatars/avatar-tab-to-ent/avatar-tab-to-ent';
import { branchEntToTab } from '#backend/services/db/branches/branch-ent-to-tab/branch-ent-to-tab';
import { branchTabToEnt } from '#backend/services/db/branches/branch-tab-to-ent/branch-tab-to-ent';
import { bridgeEntToTab } from '#backend/services/db/bridges/bridge-ent-to-tab/bridge-ent-to-tab';
import { bridgeTabToEnt } from '#backend/services/db/bridges/bridge-tab-to-ent/bridge-tab-to-ent';
import { cachedColumnEntToTab } from '#backend/services/db/cached-columns/cached-column-ent-to-tab/cached-column-ent-to-tab';
import { cachedColumnTabToEnt } from '#backend/services/db/cached-columns/cached-column-tab-to-ent/cached-column-tab-to-ent';
import { cachedPartEntToTab } from '#backend/services/db/cached-parts/cached-part-ent-to-tab/cached-part-ent-to-tab';
import { cachedPartTabToEnt } from '#backend/services/db/cached-parts/cached-part-tab-to-ent/cached-part-tab-to-ent';
import { chartEntToTab } from '#backend/services/db/charts/chart-ent-to-tab/chart-ent-to-tab';
import { chartTabToEnt } from '#backend/services/db/charts/chart-tab-to-ent/chart-tab-to-ent';
import { connectionEntToTab } from '#backend/services/db/connections/connection-ent-to-tab/connection-ent-to-tab';
import { connectionTabToEnt } from '#backend/services/db/connections/connection-tab-to-ent/connection-tab-to-ent';
import { dashboardEntToTab } from '#backend/services/db/dashboards/dashboard-ent-to-tab/dashboard-ent-to-tab';
import { dashboardTabToEnt } from '#backend/services/db/dashboards/dashboard-tab-to-ent/dashboard-tab-to-ent';
import type { DbTabToEntConverter } from '#backend/services/db/db-tab-to-ent-converter';
import type { DbTable } from '#backend/services/db/db-table';
import type { DbTableKey } from '#backend/services/db/db-table-definition-map';
import type { DbTableFactoryService } from '#backend/services/db/db-table-factory.service';
import { dconfigEntToTab } from '#backend/services/db/dconfigs/dconfig-ent-to-tab/dconfig-ent-to-tab';
import { dconfigTabToEnt } from '#backend/services/db/dconfigs/dconfig-tab-to-ent/dconfig-tab-to-ent';
import { envEntToTab } from '#backend/services/db/envs/env-ent-to-tab/env-ent-to-tab';
import { envTabToEnt } from '#backend/services/db/envs/env-tab-to-ent/env-tab-to-ent';
import { givenEntToTab } from '#backend/services/db/givens/given-ent-to-tab/given-ent-to-tab';
import { givenTabToEnt } from '#backend/services/db/givens/given-tab-to-ent/given-tab-to-ent';
import { kitEntToTab } from '#backend/services/db/kits/kit-ent-to-tab/kit-ent-to-tab';
import { kitTabToEnt } from '#backend/services/db/kits/kit-tab-to-ent/kit-tab-to-ent';
import { mconfigEntToTab } from '#backend/services/db/mconfigs/mconfig-ent-to-tab/mconfig-ent-to-tab';
import { mconfigTabToEnt } from '#backend/services/db/mconfigs/mconfig-tab-to-ent/mconfig-tab-to-ent';
import { memberEntToTab } from '#backend/services/db/members/member-ent-to-tab/member-ent-to-tab';
import { memberTabToEnt } from '#backend/services/db/members/member-tab-to-ent/member-tab-to-ent';
import { modelFieldLeafTabToEnt } from '#backend/services/db/model-field-leafs/model-field-leaf-tab-to-ent/model-field-leaf-tab-to-ent';
import { modelEntToTab } from '#backend/services/db/models/model-ent-to-tab/model-ent-to-tab';
import { modelTabToEnt } from '#backend/services/db/models/model-tab-to-ent/model-tab-to-ent';
import { noteEntToTab } from '#backend/services/db/notes/note-ent-to-tab/note-ent-to-tab';
import { noteTabToEnt } from '#backend/services/db/notes/note-tab-to-ent/note-tab-to-ent';
import { ocEventEntToTab } from '#backend/services/db/oc-events/oc-event-ent-to-tab/oc-event-ent-to-tab';
import { ocEventTabToEnt } from '#backend/services/db/oc-events/oc-event-tab-to-ent/oc-event-tab-to-ent';
import { ocMessageEntToTab } from '#backend/services/db/oc-messages/oc-message-ent-to-tab/oc-message-ent-to-tab';
import { ocMessageTabToEnt } from '#backend/services/db/oc-messages/oc-message-tab-to-ent/oc-message-tab-to-ent';
import { ocPartEntToTab } from '#backend/services/db/oc-parts/oc-part-ent-to-tab/oc-part-ent-to-tab';
import { ocPartTabToEnt } from '#backend/services/db/oc-parts/oc-part-tab-to-ent/oc-part-tab-to-ent';
import { ocSessionEntToTab } from '#backend/services/db/oc-sessions/oc-session-ent-to-tab/oc-session-ent-to-tab';
import { ocSessionTabToEnt } from '#backend/services/db/oc-sessions/oc-session-tab-to-ent/oc-session-tab-to-ent';
import { orgEntToTab } from '#backend/services/db/orgs/org-ent-to-tab/org-ent-to-tab';
import { orgTabToEnt } from '#backend/services/db/orgs/org-tab-to-ent/org-tab-to-ent';
import { projectEntToTab } from '#backend/services/db/projects/project-ent-to-tab/project-ent-to-tab';
import { projectTabToEnt } from '#backend/services/db/projects/project-tab-to-ent/project-tab-to-ent';
import { providerEntToTab } from '#backend/services/db/providers/provider-ent-to-tab/provider-ent-to-tab';
import { providerTabToEnt } from '#backend/services/db/providers/provider-tab-to-ent/provider-tab-to-ent';
import { queryEntToTab } from '#backend/services/db/queries/query-ent-to-tab/query-ent-to-tab';
import { queryTabToEnt } from '#backend/services/db/queries/query-tab-to-ent/query-tab-to-ent';
import { reportEntToTab } from '#backend/services/db/reports/report-ent-to-tab/report-ent-to-tab';
import { reportTabToEnt } from '#backend/services/db/reports/report-tab-to-ent/report-tab-to-ent';
import { roleEntToTab } from '#backend/services/db/roles/role-ent-to-tab/role-ent-to-tab';
import { roleTabToEnt } from '#backend/services/db/roles/role-tab-to-ent/role-tab-to-ent';
import { sessionEntToTab } from '#backend/services/db/sessions/session-ent-to-tab/session-ent-to-tab';
import { sessionTabToEnt } from '#backend/services/db/sessions/session-tab-to-ent/session-tab-to-ent';
import { structEntToTab } from '#backend/services/db/structs/struct-ent-to-tab/struct-ent-to-tab';
import { structTabToEnt } from '#backend/services/db/structs/struct-tab-to-ent/struct-tab-to-ent';
import { uconfigEntToTab } from '#backend/services/db/uconfigs/uconfig-ent-to-tab/uconfig-ent-to-tab';
import { uconfigTabToEnt } from '#backend/services/db/uconfigs/uconfig-tab-to-ent/uconfig-tab-to-ent';
import { userEntToTab } from '#backend/services/db/users/user-ent-to-tab/user-ent-to-tab';
import { userTabToEnt } from '#backend/services/db/users/user-tab-to-ent/user-tab-to-ent';

type DbTableRegistryMap = {
  [Key in DbTableKey]: DbTable<Key>;
};

export class DbTableRegistry implements DbTableRegistryMap {
  readonly avatars: DbTable<'avatars'>;
  readonly users: DbTable<'users'>;
  readonly branches: DbTable<'branches'>;
  readonly bridges: DbTable<'bridges'>;
  readonly cachedColumns: DbTable<'cachedColumns'>;
  readonly cachedParts: DbTable<'cachedParts'>;
  readonly charts: DbTable<'charts'>;
  readonly connections: DbTable<'connections'>;
  readonly dashboards: DbTable<'dashboards'>;
  readonly dconfigs: DbTable<'dconfigs'>;
  readonly envs: DbTable<'envs'>;
  readonly givens: DbTable<'givens'>;
  readonly kits: DbTable<'kits'>;
  readonly mconfigs: DbTable<'mconfigs'>;
  readonly members: DbTable<'members'>;
  readonly modelFieldLeafs: DbTabToEntConverter<
    ModelFieldLeafTab,
    ModelFieldLeafEnt,
    never
  >;
  readonly models: DbTable<'models'>;
  readonly notes: DbTable<'notes'>;
  readonly ocEvents: DbTable<'ocEvents'>;
  readonly ocMessages: DbTable<'ocMessages'>;
  readonly ocParts: DbTable<'ocParts'>;
  readonly ocSessions: DbTable<'ocSessions'>;
  readonly orgs: DbTable<'orgs'>;
  readonly projects: DbTable<'projects'>;
  readonly providers: DbTable<'providers'>;
  readonly queries: DbTable<'queries'>;
  readonly reports: DbTable<'reports'>;
  readonly roles: DbTable<'roles'>;
  readonly sessions: DbTable<'sessions'>;
  readonly structs: DbTable<'structs'>;
  readonly uconfigs: DbTable<'uconfigs'>;

  constructor(item: { dbExtra: DbExtra; tableFactory: DbTableFactoryService }) {
    let { dbExtra, tableFactory } = item;

    this.modelFieldLeafs = tableFactory.createTabToEntConverter({
      tabToEnt: modelFieldLeafTabToEnt
    });

    this.branches = tableFactory.create({
      key: 'branches',
      query: dbExtra.drizzle.query.branchesTable,
      defaultError: { code: 'BACKEND_BRANCH_DOES_NOT_EXIST' },
      entToTab: branchEntToTab,
      tabToEnt: branchTabToEnt
    });

    this.bridges = tableFactory.create({
      key: 'bridges',
      query: dbExtra.drizzle.query.bridgesTable,
      defaultError: { code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST' },
      entToTab: bridgeEntToTab,
      tabToEnt: bridgeTabToEnt
    });

    this.cachedColumns = tableFactory.create({
      key: 'cachedColumns',
      query: dbExtra.drizzle.query.cachedColumnsTable,
      defaultError: { code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST' },
      entToTab: cachedColumnEntToTab,
      tabToEnt: cachedColumnTabToEnt
    });

    this.cachedParts = tableFactory.create({
      key: 'cachedParts',
      query: dbExtra.drizzle.query.cachedPartsTable,
      defaultError: { code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST' },
      entToTab: cachedPartEntToTab,
      tabToEnt: cachedPartTabToEnt
    });

    this.charts = tableFactory.create({
      key: 'charts',
      query: dbExtra.drizzle.query.chartsTable,
      defaultError: { code: 'BACKEND_CHART_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.chartsTable.findFirst({
          ...item,
          columns: { chartId: true }
        }),
      entToTab: chartEntToTab,
      tabToEnt: chartTabToEnt
    });

    this.connections = tableFactory.create({
      key: 'connections',
      query: dbExtra.drizzle.query.connectionsTable,
      defaultError: { code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' },
      entToTab: connectionEntToTab,
      tabToEnt: connectionTabToEnt
    });

    this.dashboards = tableFactory.create({
      key: 'dashboards',
      query: dbExtra.drizzle.query.dashboardsTable,
      defaultError: { code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.dashboardsTable.findFirst({
          ...item,
          columns: { dashboardId: true }
        }),
      entToTab: dashboardEntToTab,
      tabToEnt: dashboardTabToEnt
    });

    this.dconfigs = tableFactory.create({
      key: 'dconfigs',
      query: dbExtra.drizzle.query.dconfigsTable,
      defaultError: { code: 'BACKEND_DCONFIG_DOES_NOT_EXIST' },
      entToTab: dconfigEntToTab,
      tabToEnt: dconfigTabToEnt
    });

    this.envs = tableFactory.create({
      key: 'envs',
      query: dbExtra.drizzle.query.envsTable,
      defaultError: { code: 'BACKEND_ENV_DOES_NOT_EXIST' },
      entToTab: envEntToTab,
      tabToEnt: envTabToEnt
    });

    this.givens = tableFactory.create({
      key: 'givens',
      query: dbExtra.drizzle.query.givensTable,
      defaultError: { code: 'BACKEND_GIVEN_DOES_NOT_EXIST' },
      entToTab: givenEntToTab,
      tabToEnt: givenTabToEnt
    });

    this.kits = tableFactory.create({
      key: 'kits',
      query: dbExtra.drizzle.query.kitsTable,
      defaultError: { code: 'BACKEND_KIT_DOES_NOT_EXIST' },
      entToTab: kitEntToTab,
      tabToEnt: kitTabToEnt
    });

    this.mconfigs = tableFactory.create({
      key: 'mconfigs',
      query: dbExtra.drizzle.query.mconfigsTable,
      defaultError: { code: 'BACKEND_MCONFIG_DOES_NOT_EXIST' },
      entToTab: mconfigEntToTab,
      tabToEnt: mconfigTabToEnt
    });

    this.members = tableFactory.create({
      key: 'members',
      query: dbExtra.drizzle.query.membersTable,
      defaultError: { code: 'BACKEND_MEMBER_DOES_NOT_EXIST' },
      entToTab: memberEntToTab,
      tabToEnt: memberTabToEnt
    });

    this.models = tableFactory.create({
      key: 'models',
      query: dbExtra.drizzle.query.modelsTable,
      defaultError: { code: 'BACKEND_MODEL_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.modelsTable.findFirst({
          ...item,
          columns: { modelId: true }
        }),
      entToTab: modelEntToTab,
      tabToEnt: modelTabToEnt
    });

    this.notes = tableFactory.create({
      key: 'notes',
      query: dbExtra.drizzle.query.notesTable,
      defaultError: { code: 'BACKEND_NOTE_DOES_NOT_EXIST' },
      entToTab: noteEntToTab,
      tabToEnt: noteTabToEnt
    });

    this.ocEvents = tableFactory.create({
      key: 'ocEvents',
      query: dbExtra.drizzle.query.ocEventsTable,
      defaultError: { code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST' },
      entToTab: ocEventEntToTab,
      tabToEnt: ocEventTabToEnt
    });

    this.ocMessages = tableFactory.create({
      key: 'ocMessages',
      query: dbExtra.drizzle.query.ocMessagesTable,
      defaultError: { code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST' },
      entToTab: ocMessageEntToTab,
      tabToEnt: ocMessageTabToEnt
    });

    this.ocParts = tableFactory.create({
      key: 'ocParts',
      query: dbExtra.drizzle.query.ocPartsTable,
      defaultError: { code: 'BACKEND_OC_PART_DOES_NOT_EXIST' },
      entToTab: ocPartEntToTab,
      tabToEnt: ocPartTabToEnt
    });

    this.ocSessions = tableFactory.create({
      key: 'ocSessions',
      query: dbExtra.drizzle.query.ocSessionsTable,
      defaultError: { code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST' },
      entToTab: ocSessionEntToTab,
      tabToEnt: ocSessionTabToEnt
    });

    this.orgs = tableFactory.create({
      key: 'orgs',
      query: dbExtra.drizzle.query.orgsTable,
      defaultError: { code: 'BACKEND_ORG_DOES_NOT_EXIST' },
      entToTab: orgEntToTab,
      tabToEnt: orgTabToEnt
    });

    this.projects = tableFactory.create({
      key: 'projects',
      query: dbExtra.drizzle.query.projectsTable,
      defaultError: { code: 'BACKEND_PROJECT_DOES_NOT_EXIST' },
      entToTab: projectEntToTab,
      tabToEnt: projectTabToEnt
    });

    this.providers = tableFactory.create({
      key: 'providers',
      query: dbExtra.drizzle.query.providersTable,
      defaultError: { code: 'BACKEND_PROVIDER_DOES_NOT_EXIST' },
      entToTab: providerEntToTab,
      tabToEnt: providerTabToEnt
    });

    this.queries = tableFactory.create({
      key: 'queries',
      query: dbExtra.drizzle.query.queriesTable,
      defaultError: { code: 'BACKEND_QUERY_DOES_NOT_EXIST' },
      entToTab: queryEntToTab,
      tabToEnt: queryTabToEnt
    });

    this.reports = tableFactory.create({
      key: 'reports',
      query: dbExtra.drizzle.query.reportsTable,
      defaultError: { code: 'BACKEND_REPORT_NOT_FOUND' },
      findExists: item =>
        dbExtra.drizzle.query.reportsTable.findFirst({
          ...item,
          columns: { reportId: true }
        }),
      entToTab: reportEntToTab,
      tabToEnt: reportTabToEnt
    });

    this.roles = tableFactory.create({
      key: 'roles',
      query: dbExtra.drizzle.query.rolesTable,
      defaultError: { code: 'BACKEND_ROLE_DOES_NOT_EXIST' },
      entToTab: roleEntToTab,
      tabToEnt: roleTabToEnt
    });

    this.sessions = tableFactory.create({
      key: 'sessions',
      query: dbExtra.drizzle.query.sessionsTable,
      defaultError: { code: 'BACKEND_SESSION_NOT_FOUND' },
      findExists: item =>
        dbExtra.drizzle.query.sessionsTable.findFirst({
          ...item,
          columns: { sessionId: true }
        }),
      entToTab: sessionEntToTab,
      tabToEnt: sessionTabToEnt
    });

    this.structs = tableFactory.create({
      key: 'structs',
      query: dbExtra.drizzle.query.structsTable,
      defaultError: { code: 'BACKEND_STRUCT_DOES_NOT_EXIST' },
      entToTab: structEntToTab,
      tabToEnt: structTabToEnt
    });

    this.uconfigs = tableFactory.create({
      key: 'uconfigs',
      query: dbExtra.drizzle.query.uconfigsTable,
      defaultError: { code: 'BACKEND_UCONFIG_DOES_NOT_EXIST' },
      entToTab: uconfigEntToTab,
      tabToEnt: uconfigTabToEnt
    });

    this.avatars = tableFactory.create({
      key: 'avatars',
      query: dbExtra.drizzle.query.avatarsTable,
      defaultError: { code: 'BACKEND_AVATAR_DOES_NOT_EXIST' },
      entToTab: avatarEntToTab,
      tabToEnt: avatarTabToEnt
    });

    this.users = tableFactory.create({
      key: 'users',
      query: dbExtra.drizzle.query.usersTable,
      defaultError: { code: 'BACKEND_USER_DOES_NOT_EXIST' },
      entToTab: userEntToTab,
      tabToEnt: userTabToEnt
    });
  }
}
