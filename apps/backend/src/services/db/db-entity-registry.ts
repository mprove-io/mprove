import type { Result } from '@praha/byethrow';
import type { PgTable } from 'drizzle-orm/pg-core';
import { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
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
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { BackendAvatarDoesNotExistError } from '#common/types/backend/errors/backend-avatar-does-not-exist-error';
import type { BackendBranchDoesNotExistError } from '#common/types/backend/errors/backend-branch-does-not-exist-error';
import type { BackendBridgeBranchEnvDoesNotExistError } from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import type { BackendCachedColumnDoesNotExistError } from '#common/types/backend/errors/backend-cached-column-does-not-exist-error';
import type { BackendCachedPartDoesNotExistError } from '#common/types/backend/errors/backend-cached-part-does-not-exist-error';
import type { BackendChartDoesNotExistError } from '#common/types/backend/errors/backend-chart-does-not-exist-error';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { BackendDashboardDoesNotExistError } from '#common/types/backend/errors/backend-dashboard-does-not-exist-error';
import type { BackendDconfigDoesNotExistError } from '#common/types/backend/errors/backend-dconfig-does-not-exist-error';
import type { BackendEnvDoesNotExistError } from '#common/types/backend/errors/backend-env-does-not-exist-error';
import type { BackendGivenDoesNotExistError } from '#common/types/backend/errors/backend-given-does-not-exist-error';
import type { BackendKitDoesNotExistError } from '#common/types/backend/errors/backend-kit-does-not-exist-error';
import type { BackendMconfigDoesNotExistError } from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { BackendModelDoesNotExistError } from '#common/types/backend/errors/backend-model-does-not-exist-error';
import type { BackendNoteDoesNotExistError } from '#common/types/backend/errors/backend-note-does-not-exist-error';
import type { BackendOcEventDoesNotExistError } from '#common/types/backend/errors/backend-oc-event-does-not-exist-error';
import type { BackendOcMessageDoesNotExistError } from '#common/types/backend/errors/backend-oc-message-does-not-exist-error';
import type { BackendOcPartDoesNotExistError } from '#common/types/backend/errors/backend-oc-part-does-not-exist-error';
import type { BackendOcSessionDoesNotExistError } from '#common/types/backend/errors/backend-oc-session-does-not-exist-error';
import type { BackendOrgDoesNotExistError } from '#common/types/backend/errors/backend-org-does-not-exist-error';
import type { BackendProjectDoesNotExistError } from '#common/types/backend/errors/backend-project-does-not-exist-error';
import type { BackendProviderDoesNotExistError } from '#common/types/backend/errors/backend-provider-does-not-exist-error';
import type { BackendQueryDoesNotExistError } from '#common/types/backend/errors/backend-query-does-not-exist-error';
import type { BackendReportNotFoundError } from '#common/types/backend/errors/backend-report-not-found-error';
import type { BackendRoleDoesNotExistError } from '#common/types/backend/errors/backend-role-does-not-exist-error';
import type { BackendSessionNotFoundError } from '#common/types/backend/errors/backend-session-not-found-error';
import type { BackendStructDoesNotExistError } from '#common/types/backend/errors/backend-struct-does-not-exist-error';
import type { BackendUconfigDoesNotExistError } from '#common/types/backend/errors/backend-uconfig-does-not-exist-error';
import type { BackendUserDoesNotExistError } from '#common/types/backend/errors/backend-user-does-not-exist-error';

type DbEntityRegistry = typeof dbEntityRegistry;

export type DbWriteTableKey = keyof DbEntityRegistry;

export type DbReadTableKey = {
  [Key in DbWriteTableKey]: DbEntityRegistry[Key] extends {
    entToTab: unknown;
  }
    ? Key
    : never;
}[DbWriteTableKey];

type DbWriteTypeMap = {
  [Key in DbWriteTableKey]: {
    ent: DbEntityRegistry[Key]['table']['$inferSelect'];
    tab: Parameters<DbEntityRegistry[Key]['tabToEnt']>[0]['tab'];
    writeError: Extract<
      ReturnType<DbEntityRegistry[Key]['tabToEnt']>,
      Result.Failure<unknown>
    >['error'];
  };
};

type DbReadTypeMap = {
  [Key in DbReadTableKey]: {
    readError: Extract<
      ReturnType<DbEntityRegistry[Key]['entToTab']>,
      Result.Failure<unknown>
    >['error'];
    notFoundError: DbEntityRegistry[Key]['defaultError'];
  };
};

export type DbTableEnt<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['ent'];

export type DbTableTab<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['tab'];

export type DbTableReadError<Key extends DbReadTableKey> =
  DbReadTypeMap[Key]['readError'];

export type DbTableWriteError<Key extends DbWriteTableKey> =
  DbWriteTypeMap[Key]['writeError'];

export type DbTableNotFoundError<Key extends DbReadTableKey> =
  DbReadTypeMap[Key]['notFoundError'];

export type DbExistsColumns<Table extends PgTable> = {
  [Column in keyof Table['$inferSelect']]?: true;
};

export type DbWriteEntityRegistry = {
  [Key in DbWriteTableKey]: {
    table: (typeof schemaPostgres)[`${Key}Table`];
    tabToEnt: (item: {
      tab: DbTableTab<Key>;
      hashSecret?: string;
      hashService: HashService;
      tabService: TabService;
      isEncryptDb: boolean;
      isEncryptMetadata: boolean;
    }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;
  };
};

export type DbReadEntityRegistry = {
  [Key in DbReadTableKey]: {
    entToTab: (item: {
      ent: DbTableEnt<Key>;
      tabService: TabService;
    }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;
    tabToEnt: DbWriteEntityRegistry[Key]['tabToEnt'];
    defaultError: DbTableNotFoundError<Key>;
    existsColumns?: DbExistsColumns<DbEntityRegistry[Key]['table']>;
  };
};

export const dbEntityRegistry = {
  avatars: {
    table: schemaPostgres.avatarsTable,
    defaultError: {
      code: 'BACKEND_AVATAR_DOES_NOT_EXIST'
    } satisfies BackendAvatarDoesNotExistError,
    entToTab: avatarEntToTab,
    tabToEnt: avatarTabToEnt
  },
  branches: {
    table: schemaPostgres.branchesTable,
    defaultError: {
      code: 'BACKEND_BRANCH_DOES_NOT_EXIST'
    } satisfies BackendBranchDoesNotExistError,
    entToTab: branchEntToTab,
    tabToEnt: branchTabToEnt
  },
  bridges: {
    table: schemaPostgres.bridgesTable,
    defaultError: {
      code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST'
    } satisfies BackendBridgeBranchEnvDoesNotExistError,
    entToTab: bridgeEntToTab,
    tabToEnt: bridgeTabToEnt
  },
  cachedColumns: {
    table: schemaPostgres.cachedColumnsTable,
    defaultError: {
      code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST'
    } satisfies BackendCachedColumnDoesNotExistError,
    entToTab: cachedColumnEntToTab,
    tabToEnt: cachedColumnTabToEnt
  },
  cachedParts: {
    table: schemaPostgres.cachedPartsTable,
    defaultError: {
      code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST'
    } satisfies BackendCachedPartDoesNotExistError,
    entToTab: cachedPartEntToTab,
    tabToEnt: cachedPartTabToEnt
  },
  charts: {
    table: schemaPostgres.chartsTable,
    existsColumns: { chartId: true } satisfies DbExistsColumns<
      typeof schemaPostgres.chartsTable
    >,
    defaultError: {
      code: 'BACKEND_CHART_DOES_NOT_EXIST'
    } satisfies BackendChartDoesNotExistError,
    entToTab: chartEntToTab,
    tabToEnt: chartTabToEnt
  },
  connections: {
    table: schemaPostgres.connectionsTable,
    defaultError: {
      code: 'BACKEND_CONNECTION_DOES_NOT_EXIST'
    } satisfies BackendConnectionDoesNotExistError,
    entToTab: connectionEntToTab,
    tabToEnt: connectionTabToEnt
  },
  dashboards: {
    table: schemaPostgres.dashboardsTable,
    existsColumns: { dashboardId: true } satisfies DbExistsColumns<
      typeof schemaPostgres.dashboardsTable
    >,
    defaultError: {
      code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST'
    } satisfies BackendDashboardDoesNotExistError,
    entToTab: dashboardEntToTab,
    tabToEnt: dashboardTabToEnt
  },
  dconfigs: {
    table: schemaPostgres.dconfigsTable,
    defaultError: {
      code: 'BACKEND_DCONFIG_DOES_NOT_EXIST'
    } satisfies BackendDconfigDoesNotExistError,
    entToTab: dconfigEntToTab,
    tabToEnt: dconfigTabToEnt
  },
  envs: {
    table: schemaPostgres.envsTable,
    defaultError: {
      code: 'BACKEND_ENV_DOES_NOT_EXIST'
    } satisfies BackendEnvDoesNotExistError,
    entToTab: envEntToTab,
    tabToEnt: envTabToEnt
  },
  givens: {
    table: schemaPostgres.givensTable,
    defaultError: {
      code: 'BACKEND_GIVEN_DOES_NOT_EXIST'
    } satisfies BackendGivenDoesNotExistError,
    entToTab: givenEntToTab,
    tabToEnt: givenTabToEnt
  },
  kits: {
    table: schemaPostgres.kitsTable,
    defaultError: {
      code: 'BACKEND_KIT_DOES_NOT_EXIST'
    } satisfies BackendKitDoesNotExistError,
    entToTab: kitEntToTab,
    tabToEnt: kitTabToEnt
  },
  mconfigs: {
    table: schemaPostgres.mconfigsTable,
    defaultError: {
      code: 'BACKEND_MCONFIG_DOES_NOT_EXIST'
    } satisfies BackendMconfigDoesNotExistError,
    entToTab: mconfigEntToTab,
    tabToEnt: mconfigTabToEnt
  },
  members: {
    table: schemaPostgres.membersTable,
    defaultError: {
      code: 'BACKEND_MEMBER_DOES_NOT_EXIST'
    } satisfies BackendMemberDoesNotExistError,
    entToTab: memberEntToTab,
    tabToEnt: memberTabToEnt
  },
  modelFieldLeafs: {
    table: schemaPostgres.modelFieldLeafsTable,
    tabToEnt: modelFieldLeafTabToEnt
  },
  models: {
    table: schemaPostgres.modelsTable,
    existsColumns: { modelId: true } satisfies DbExistsColumns<
      typeof schemaPostgres.modelsTable
    >,
    defaultError: {
      code: 'BACKEND_MODEL_DOES_NOT_EXIST'
    } satisfies BackendModelDoesNotExistError,
    entToTab: modelEntToTab,
    tabToEnt: modelTabToEnt
  },
  notes: {
    table: schemaPostgres.notesTable,
    defaultError: {
      code: 'BACKEND_NOTE_DOES_NOT_EXIST'
    } satisfies BackendNoteDoesNotExistError,
    entToTab: noteEntToTab,
    tabToEnt: noteTabToEnt
  },
  ocEvents: {
    table: schemaPostgres.ocEventsTable,
    defaultError: {
      code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST'
    } satisfies BackendOcEventDoesNotExistError,
    entToTab: ocEventEntToTab,
    tabToEnt: ocEventTabToEnt
  },
  ocMessages: {
    table: schemaPostgres.ocMessagesTable,
    defaultError: {
      code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST'
    } satisfies BackendOcMessageDoesNotExistError,
    entToTab: ocMessageEntToTab,
    tabToEnt: ocMessageTabToEnt
  },
  ocParts: {
    table: schemaPostgres.ocPartsTable,
    defaultError: {
      code: 'BACKEND_OC_PART_DOES_NOT_EXIST'
    } satisfies BackendOcPartDoesNotExistError,
    entToTab: ocPartEntToTab,
    tabToEnt: ocPartTabToEnt
  },
  ocSessions: {
    table: schemaPostgres.ocSessionsTable,
    defaultError: {
      code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST'
    } satisfies BackendOcSessionDoesNotExistError,
    entToTab: ocSessionEntToTab,
    tabToEnt: ocSessionTabToEnt
  },
  orgs: {
    table: schemaPostgres.orgsTable,
    defaultError: {
      code: 'BACKEND_ORG_DOES_NOT_EXIST'
    } satisfies BackendOrgDoesNotExistError,
    entToTab: orgEntToTab,
    tabToEnt: orgTabToEnt
  },
  projects: {
    table: schemaPostgres.projectsTable,
    defaultError: {
      code: 'BACKEND_PROJECT_DOES_NOT_EXIST'
    } satisfies BackendProjectDoesNotExistError,
    entToTab: projectEntToTab,
    tabToEnt: projectTabToEnt
  },
  providers: {
    table: schemaPostgres.providersTable,
    defaultError: {
      code: 'BACKEND_PROVIDER_DOES_NOT_EXIST'
    } satisfies BackendProviderDoesNotExistError,
    entToTab: providerEntToTab,
    tabToEnt: providerTabToEnt
  },
  queries: {
    table: schemaPostgres.queriesTable,
    defaultError: {
      code: 'BACKEND_QUERY_DOES_NOT_EXIST'
    } satisfies BackendQueryDoesNotExistError,
    entToTab: queryEntToTab,
    tabToEnt: queryTabToEnt
  },
  reports: {
    table: schemaPostgres.reportsTable,
    existsColumns: { reportId: true } satisfies DbExistsColumns<
      typeof schemaPostgres.reportsTable
    >,
    defaultError: {
      code: 'BACKEND_REPORT_NOT_FOUND'
    } satisfies BackendReportNotFoundError,
    entToTab: reportEntToTab,
    tabToEnt: reportTabToEnt
  },
  roles: {
    table: schemaPostgres.rolesTable,
    defaultError: {
      code: 'BACKEND_ROLE_DOES_NOT_EXIST'
    } satisfies BackendRoleDoesNotExistError,
    entToTab: roleEntToTab,
    tabToEnt: roleTabToEnt
  },
  sessions: {
    table: schemaPostgres.sessionsTable,
    existsColumns: { sessionId: true } satisfies DbExistsColumns<
      typeof schemaPostgres.sessionsTable
    >,
    defaultError: {
      code: 'BACKEND_SESSION_NOT_FOUND'
    } satisfies BackendSessionNotFoundError,
    entToTab: sessionEntToTab,
    tabToEnt: sessionTabToEnt
  },
  structs: {
    table: schemaPostgres.structsTable,
    defaultError: {
      code: 'BACKEND_STRUCT_DOES_NOT_EXIST'
    } satisfies BackendStructDoesNotExistError,
    entToTab: structEntToTab,
    tabToEnt: structTabToEnt
  },
  uconfigs: {
    table: schemaPostgres.uconfigsTable,
    defaultError: {
      code: 'BACKEND_UCONFIG_DOES_NOT_EXIST'
    } satisfies BackendUconfigDoesNotExistError,
    entToTab: uconfigEntToTab,
    tabToEnt: uconfigTabToEnt
  },
  users: {
    table: schemaPostgres.usersTable,
    defaultError: {
      code: 'BACKEND_USER_DOES_NOT_EXIST'
    } satisfies BackendUserDoesNotExistError,
    entToTab: userEntToTab,
    tabToEnt: userTabToEnt
  }
};
