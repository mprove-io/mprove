import type { Result } from '@praha/byethrow';
import type { PgTable } from 'drizzle-orm/pg-core';
import { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import { avatarEntToTab } from '#backend/functions/db/avatars/avatar-ent-to-tab/avatar-ent-to-tab';
import { avatarTabToEnt } from '#backend/functions/db/avatars/avatar-tab-to-ent/avatar-tab-to-ent';
import { branchEntToTab } from '#backend/functions/db/branches/branch-ent-to-tab/branch-ent-to-tab';
import { branchTabToEnt } from '#backend/functions/db/branches/branch-tab-to-ent/branch-tab-to-ent';
import { bridgeEntToTab } from '#backend/functions/db/bridges/bridge-ent-to-tab/bridge-ent-to-tab';
import { bridgeTabToEnt } from '#backend/functions/db/bridges/bridge-tab-to-ent/bridge-tab-to-ent';
import { cachedColumnEntToTab } from '#backend/functions/db/cached-columns/cached-column-ent-to-tab/cached-column-ent-to-tab';
import { cachedColumnTabToEnt } from '#backend/functions/db/cached-columns/cached-column-tab-to-ent/cached-column-tab-to-ent';
import { cachedPartEntToTab } from '#backend/functions/db/cached-parts/cached-part-ent-to-tab/cached-part-ent-to-tab';
import { cachedPartTabToEnt } from '#backend/functions/db/cached-parts/cached-part-tab-to-ent/cached-part-tab-to-ent';
import { chartEntToTab } from '#backend/functions/db/charts/chart-ent-to-tab/chart-ent-to-tab';
import { chartTabToEnt } from '#backend/functions/db/charts/chart-tab-to-ent/chart-tab-to-ent';
import { connectionEntToTab } from '#backend/functions/db/connections/connection-ent-to-tab/connection-ent-to-tab';
import { connectionTabToEnt } from '#backend/functions/db/connections/connection-tab-to-ent/connection-tab-to-ent';
import { dashboardEntToTab } from '#backend/functions/db/dashboards/dashboard-ent-to-tab/dashboard-ent-to-tab';
import { dashboardTabToEnt } from '#backend/functions/db/dashboards/dashboard-tab-to-ent/dashboard-tab-to-ent';
import { dconfigEntToTab } from '#backend/functions/db/dconfigs/dconfig-ent-to-tab/dconfig-ent-to-tab';
import { dconfigTabToEnt } from '#backend/functions/db/dconfigs/dconfig-tab-to-ent/dconfig-tab-to-ent';
import { envEntToTab } from '#backend/functions/db/envs/env-ent-to-tab/env-ent-to-tab';
import { envTabToEnt } from '#backend/functions/db/envs/env-tab-to-ent/env-tab-to-ent';
import { favoriteEntToTab } from '#backend/functions/db/favorites/favorite-ent-to-tab/favorite-ent-to-tab';
import { favoriteTabToEnt } from '#backend/functions/db/favorites/favorite-tab-to-ent/favorite-tab-to-ent';
import { givenEntToTab } from '#backend/functions/db/givens/given-ent-to-tab/given-ent-to-tab';
import { givenTabToEnt } from '#backend/functions/db/givens/given-tab-to-ent/given-tab-to-ent';
import { kitEntToTab } from '#backend/functions/db/kits/kit-ent-to-tab/kit-ent-to-tab';
import { kitTabToEnt } from '#backend/functions/db/kits/kit-tab-to-ent/kit-tab-to-ent';
import { mconfigEntToTab } from '#backend/functions/db/mconfigs/mconfig-ent-to-tab/mconfig-ent-to-tab';
import { mconfigTabToEnt } from '#backend/functions/db/mconfigs/mconfig-tab-to-ent/mconfig-tab-to-ent';
import { memberEntToTab } from '#backend/functions/db/members/member-ent-to-tab/member-ent-to-tab';
import { memberTabToEnt } from '#backend/functions/db/members/member-tab-to-ent/member-tab-to-ent';
import { modelFieldLeafEntToTab } from '#backend/functions/db/model-field-leafs/model-field-leaf-ent-to-tab/model-field-leaf-ent-to-tab';
import { modelFieldLeafTabToEnt } from '#backend/functions/db/model-field-leafs/model-field-leaf-tab-to-ent/model-field-leaf-tab-to-ent';
import { modelEntToTab } from '#backend/functions/db/models/model-ent-to-tab/model-ent-to-tab';
import { modelTabToEnt } from '#backend/functions/db/models/model-tab-to-ent/model-tab-to-ent';
import { noteEntToTab } from '#backend/functions/db/notes/note-ent-to-tab/note-ent-to-tab';
import { noteTabToEnt } from '#backend/functions/db/notes/note-tab-to-ent/note-tab-to-ent';
import { ocEventEntToTab } from '#backend/functions/db/oc-events/oc-event-ent-to-tab/oc-event-ent-to-tab';
import { ocEventTabToEnt } from '#backend/functions/db/oc-events/oc-event-tab-to-ent/oc-event-tab-to-ent';
import { ocMessageEntToTab } from '#backend/functions/db/oc-messages/oc-message-ent-to-tab/oc-message-ent-to-tab';
import { ocMessageTabToEnt } from '#backend/functions/db/oc-messages/oc-message-tab-to-ent/oc-message-tab-to-ent';
import { ocPartEntToTab } from '#backend/functions/db/oc-parts/oc-part-ent-to-tab/oc-part-ent-to-tab';
import { ocPartTabToEnt } from '#backend/functions/db/oc-parts/oc-part-tab-to-ent/oc-part-tab-to-ent';
import { ocSessionEntToTab } from '#backend/functions/db/oc-sessions/oc-session-ent-to-tab/oc-session-ent-to-tab';
import { ocSessionTabToEnt } from '#backend/functions/db/oc-sessions/oc-session-tab-to-ent/oc-session-tab-to-ent';
import { orgEntToTab } from '#backend/functions/db/orgs/org-ent-to-tab/org-ent-to-tab';
import { orgTabToEnt } from '#backend/functions/db/orgs/org-tab-to-ent/org-tab-to-ent';
import { projectEntToTab } from '#backend/functions/db/projects/project-ent-to-tab/project-ent-to-tab';
import { projectTabToEnt } from '#backend/functions/db/projects/project-tab-to-ent/project-tab-to-ent';
import { providerEntToTab } from '#backend/functions/db/providers/provider-ent-to-tab/provider-ent-to-tab';
import { providerTabToEnt } from '#backend/functions/db/providers/provider-tab-to-ent/provider-tab-to-ent';
import { queryEntToTab } from '#backend/functions/db/queries/query-ent-to-tab/query-ent-to-tab';
import { queryTabToEnt } from '#backend/functions/db/queries/query-tab-to-ent/query-tab-to-ent';
import { reportEntToTab } from '#backend/functions/db/reports/report-ent-to-tab/report-ent-to-tab';
import { reportTabToEnt } from '#backend/functions/db/reports/report-tab-to-ent/report-tab-to-ent';
import { roleEntToTab } from '#backend/functions/db/roles/role-ent-to-tab/role-ent-to-tab';
import { roleTabToEnt } from '#backend/functions/db/roles/role-tab-to-ent/role-tab-to-ent';
import { sessionEntToTab } from '#backend/functions/db/sessions/session-ent-to-tab/session-ent-to-tab';
import { sessionTabToEnt } from '#backend/functions/db/sessions/session-tab-to-ent/session-tab-to-ent';
import { structEntToTab } from '#backend/functions/db/structs/struct-ent-to-tab/struct-ent-to-tab';
import { structTabToEnt } from '#backend/functions/db/structs/struct-tab-to-ent/struct-tab-to-ent';
import { uconfigEntToTab } from '#backend/functions/db/uconfigs/uconfig-ent-to-tab/uconfig-ent-to-tab';
import { uconfigTabToEnt } from '#backend/functions/db/uconfigs/uconfig-tab-to-ent/uconfig-tab-to-ent';
import { userEntToTab } from '#backend/functions/db/users/user-ent-to-tab/user-ent-to-tab';
import { userTabToEnt } from '#backend/functions/db/users/user-tab-to-ent/user-tab-to-ent';
import type { DbEncryptionPolicy } from '#backend/services/db/db-encryption-policy';
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
import type { BackendFavoriteDoesNotExistError } from '#common/types/backend/errors/backend-favorite-does-not-exist-error';
import type { BackendGivenDoesNotExistError } from '#common/types/backend/errors/backend-given-does-not-exist-error';
import type { BackendKitDoesNotExistError } from '#common/types/backend/errors/backend-kit-does-not-exist-error';
import type { BackendMconfigDoesNotExistError } from '#common/types/backend/errors/backend-mconfig-does-not-exist-error';
import type { BackendMemberDoesNotExistError } from '#common/types/backend/errors/backend-member-does-not-exist-error';
import type { BackendModelDoesNotExistError } from '#common/types/backend/errors/backend-model-does-not-exist-error';
import type { BackendModelFieldLeafDoesNotExistError } from '#common/types/backend/errors/backend-model-field-leaf-does-not-exist-error';
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

type DbEntityRegistryDefinition = typeof dbEntityRegistry;

// Require a registry entry for every PostgreSQL table exported by the schema.
export type DbTableKey = {
  [Key in keyof typeof schemaPostgres]: (typeof schemaPostgres)[Key] extends PgTable
    ? Key extends `${infer Name}Table`
      ? Name
      : never
    : never;
}[keyof typeof schemaPostgres];

type DbTableTypeMap = {
  [Key in DbTableKey]: {
    ent: (typeof schemaPostgres)[`${Key}Table`]['$inferSelect'];
    tab: Parameters<DbEntityRegistryDefinition[Key]['tabToEnt']>[0]['tab'];
    readError: Extract<
      ReturnType<DbEntityRegistryDefinition[Key]['entToTab']>,
      Result.Failure<unknown>
    >['error'];
    writeError: Extract<
      ReturnType<DbEntityRegistryDefinition[Key]['tabToEnt']>,
      Result.Failure<unknown>
    >['error'];
    notFoundError: DbEntityRegistryDefinition[Key]['notFoundError'];
  };
};

export type DbTableEnt<Key extends DbTableKey> = DbTableTypeMap[Key]['ent'];

export type DbTableTab<Key extends DbTableKey> = DbTableTypeMap[Key]['tab'];

export type DbTableReadError<Key extends DbTableKey> =
  DbTableTypeMap[Key]['readError'];

export type DbTableWriteError<Key extends DbTableKey> =
  DbTableTypeMap[Key]['writeError'];

export type DbTableNotFoundError<Key extends DbTableKey> =
  DbTableTypeMap[Key]['notFoundError'];

// Every table must provide the same read and write API.
export type DbEntityRegistry = {
  [Key in DbTableKey]: {
    table: (typeof schemaPostgres)[`${Key}Table`];
    identityKey: Extract<keyof DbTableEnt<Key>, string>;
    encryptionPolicy: DbEncryptionPolicy;
    notFoundError: DbTableNotFoundError<Key>;
    entToTab: (item: {
      ent: DbTableEnt<Key>;
      tabService: TabService;
    }) => Result.Result<DbTableTab<Key>, DbTableReadError<Key>>;
    tabToEnt: (item: {
      tab: DbTableTab<Key>;
      hashSecret?: string;

      tabService: TabService;
      isEncryptDb: boolean;
      isEncryptMetadata: boolean;
    }) => Result.Result<DbTableEnt<Key>, DbTableWriteError<Key>>;
  };
};

// Declaration order determines conversion and SQL execution order.
export const dbEntityRegistry = {
  avatars: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.avatarsTable,
    identityKey:
      'userId' as const satisfies keyof typeof schemaPostgres.avatarsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_AVATAR_DOES_NOT_EXIST'
    } satisfies BackendAvatarDoesNotExistError,
    entToTab: avatarEntToTab,
    tabToEnt: avatarTabToEnt
  },
  branches: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.branchesTable,
    identityKey:
      'branchFullId' as const satisfies keyof typeof schemaPostgres.branchesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_BRANCH_DOES_NOT_EXIST'
    } satisfies BackendBranchDoesNotExistError,
    entToTab: branchEntToTab,
    tabToEnt: branchTabToEnt
  },
  bridges: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.bridgesTable,
    identityKey:
      'bridgeFullId' as const satisfies keyof typeof schemaPostgres.bridgesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST'
    } satisfies BackendBridgeBranchEnvDoesNotExistError,
    entToTab: bridgeEntToTab,
    tabToEnt: bridgeTabToEnt
  },
  cachedColumns: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.cachedColumnsTable,
    identityKey:
      'cachedColumnFullId' as const satisfies keyof typeof schemaPostgres.cachedColumnsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST'
    } satisfies BackendCachedColumnDoesNotExistError,
    entToTab: cachedColumnEntToTab,
    tabToEnt: cachedColumnTabToEnt
  },
  cachedParts: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.cachedPartsTable,
    identityKey:
      'cachedPartFullId' as const satisfies keyof typeof schemaPostgres.cachedPartsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST'
    } satisfies BackendCachedPartDoesNotExistError,
    entToTab: cachedPartEntToTab,
    tabToEnt: cachedPartTabToEnt
  },
  connections: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.connectionsTable,
    identityKey:
      'connectionFullId' as const satisfies keyof typeof schemaPostgres.connectionsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_CONNECTION_DOES_NOT_EXIST'
    } satisfies BackendConnectionDoesNotExistError,
    entToTab: connectionEntToTab,
    tabToEnt: connectionTabToEnt
  },
  dashboards: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.dashboardsTable,
    identityKey:
      'dashboardFullId' as const satisfies keyof typeof schemaPostgres.dashboardsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST'
    } satisfies BackendDashboardDoesNotExistError,
    entToTab: dashboardEntToTab,
    tabToEnt: dashboardTabToEnt
  },
  dconfigs: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.dconfigsTable,
    identityKey:
      'dconfigId' as const satisfies keyof typeof schemaPostgres.dconfigsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_DCONFIG_DOES_NOT_EXIST'
    } satisfies BackendDconfigDoesNotExistError,
    entToTab: dconfigEntToTab,
    tabToEnt: dconfigTabToEnt
  },
  uconfigs: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.uconfigsTable,
    identityKey:
      'uconfigId' as const satisfies keyof typeof schemaPostgres.uconfigsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_UCONFIG_DOES_NOT_EXIST'
    } satisfies BackendUconfigDoesNotExistError,
    entToTab: uconfigEntToTab,
    tabToEnt: uconfigTabToEnt
  },
  envs: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.envsTable,
    identityKey:
      'envFullId' as const satisfies keyof typeof schemaPostgres.envsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_ENV_DOES_NOT_EXIST'
    } satisfies BackendEnvDoesNotExistError,
    entToTab: envEntToTab,
    tabToEnt: envTabToEnt
  },
  favorites: {
    encryptionPolicy: 'none' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.favoritesTable,
    identityKey:
      'favoriteFullId' as const satisfies keyof typeof schemaPostgres.favoritesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_FAVORITE_DOES_NOT_EXIST'
    } satisfies BackendFavoriteDoesNotExistError,
    entToTab: favoriteEntToTab,
    tabToEnt: favoriteTabToEnt
  },
  givens: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.givensTable,
    identityKey:
      'givenFullId' as const satisfies keyof typeof schemaPostgres.givensTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_GIVEN_DOES_NOT_EXIST'
    } satisfies BackendGivenDoesNotExistError,
    entToTab: givenEntToTab,
    tabToEnt: givenTabToEnt
  },
  roles: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.rolesTable,
    identityKey:
      'roleFullId' as const satisfies keyof typeof schemaPostgres.rolesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_ROLE_DOES_NOT_EXIST'
    } satisfies BackendRoleDoesNotExistError,
    entToTab: roleEntToTab,
    tabToEnt: roleTabToEnt
  },
  kits: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.kitsTable,
    identityKey:
      'kitId' as const satisfies keyof typeof schemaPostgres.kitsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_KIT_DOES_NOT_EXIST'
    } satisfies BackendKitDoesNotExistError,
    entToTab: kitEntToTab,
    tabToEnt: kitTabToEnt
  },
  mconfigs: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.mconfigsTable,
    identityKey:
      'mconfigId' as const satisfies keyof typeof schemaPostgres.mconfigsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_MCONFIG_DOES_NOT_EXIST'
    } satisfies BackendMconfigDoesNotExistError,
    entToTab: mconfigEntToTab,
    tabToEnt: mconfigTabToEnt
  },
  members: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.membersTable,
    identityKey:
      'memberFullId' as const satisfies keyof typeof schemaPostgres.membersTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_MEMBER_DOES_NOT_EXIST'
    } satisfies BackendMemberDoesNotExistError,
    entToTab: memberEntToTab,
    tabToEnt: memberTabToEnt
  },
  models: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.modelsTable,
    identityKey:
      'modelFullId' as const satisfies keyof typeof schemaPostgres.modelsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_MODEL_DOES_NOT_EXIST'
    } satisfies BackendModelDoesNotExistError,
    entToTab: modelEntToTab,
    tabToEnt: modelTabToEnt
  },
  modelFieldLeafs: {
    encryptionPolicy: 'none' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.modelFieldLeafsTable,
    identityKey:
      'modelFieldLeafFullId' as const satisfies keyof typeof schemaPostgres.modelFieldLeafsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_MODEL_FIELD_LEAF_DOES_NOT_EXIST'
    } satisfies BackendModelFieldLeafDoesNotExistError,
    entToTab: modelFieldLeafEntToTab,
    tabToEnt: modelFieldLeafTabToEnt
  },
  notes: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.notesTable,
    identityKey:
      'noteId' as const satisfies keyof typeof schemaPostgres.notesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_NOTE_DOES_NOT_EXIST'
    } satisfies BackendNoteDoesNotExistError,
    entToTab: noteEntToTab,
    tabToEnt: noteTabToEnt
  },
  orgs: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.orgsTable,
    identityKey:
      'orgId' as const satisfies keyof typeof schemaPostgres.orgsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_ORG_DOES_NOT_EXIST'
    } satisfies BackendOrgDoesNotExistError,
    entToTab: orgEntToTab,
    tabToEnt: orgTabToEnt
  },
  projects: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.projectsTable,
    identityKey:
      'projectId' as const satisfies keyof typeof schemaPostgres.projectsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_PROJECT_DOES_NOT_EXIST'
    } satisfies BackendProjectDoesNotExistError,
    entToTab: projectEntToTab,
    tabToEnt: projectTabToEnt
  },
  providers: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.providersTable,
    identityKey:
      'providerFullId' as const satisfies keyof typeof schemaPostgres.providersTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_PROVIDER_DOES_NOT_EXIST'
    } satisfies BackendProviderDoesNotExistError,
    entToTab: providerEntToTab,
    tabToEnt: providerTabToEnt
  },
  queries: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.queriesTable,
    identityKey:
      'queryId' as const satisfies keyof typeof schemaPostgres.queriesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_QUERY_DOES_NOT_EXIST'
    } satisfies BackendQueryDoesNotExistError,
    entToTab: queryEntToTab,
    tabToEnt: queryTabToEnt
  },
  reports: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.reportsTable,
    identityKey:
      'reportFullId' as const satisfies keyof typeof schemaPostgres.reportsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_REPORT_NOT_FOUND'
    } satisfies BackendReportNotFoundError,
    entToTab: reportEntToTab,
    tabToEnt: reportTabToEnt
  },
  structs: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.structsTable,
    identityKey:
      'structId' as const satisfies keyof typeof schemaPostgres.structsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_STRUCT_DOES_NOT_EXIST'
    } satisfies BackendStructDoesNotExistError,
    entToTab: structEntToTab,
    tabToEnt: structTabToEnt
  },
  users: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.usersTable,
    identityKey:
      'userId' as const satisfies keyof typeof schemaPostgres.usersTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_USER_DOES_NOT_EXIST'
    } satisfies BackendUserDoesNotExistError,
    entToTab: userEntToTab,
    tabToEnt: userTabToEnt
  },
  charts: {
    encryptionPolicy: 'metadata' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.chartsTable,
    identityKey:
      'chartFullId' as const satisfies keyof typeof schemaPostgres.chartsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_CHART_DOES_NOT_EXIST'
    } satisfies BackendChartDoesNotExistError,
    entToTab: chartEntToTab,
    tabToEnt: chartTabToEnt
  },
  ocEvents: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.ocEventsTable,
    identityKey:
      'eventId' as const satisfies keyof typeof schemaPostgres.ocEventsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST'
    } satisfies BackendOcEventDoesNotExistError,
    entToTab: ocEventEntToTab,
    tabToEnt: ocEventTabToEnt
  },
  sessions: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.sessionsTable,
    identityKey:
      'sessionId' as const satisfies keyof typeof schemaPostgres.sessionsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_SESSION_NOT_FOUND'
    } satisfies BackendSessionNotFoundError,
    entToTab: sessionEntToTab,
    tabToEnt: sessionTabToEnt
  },
  ocSessions: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.ocSessionsTable,
    identityKey:
      'sessionId' as const satisfies keyof typeof schemaPostgres.ocSessionsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST'
    } satisfies BackendOcSessionDoesNotExistError,
    entToTab: ocSessionEntToTab,
    tabToEnt: ocSessionTabToEnt
  },
  ocMessages: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.ocMessagesTable,
    identityKey:
      'messageId' as const satisfies keyof typeof schemaPostgres.ocMessagesTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST'
    } satisfies BackendOcMessageDoesNotExistError,
    entToTab: ocMessageEntToTab,
    tabToEnt: ocMessageTabToEnt
  },
  ocParts: {
    encryptionPolicy: 'regular' as const satisfies DbEncryptionPolicy,
    table: schemaPostgres.ocPartsTable,
    identityKey:
      'partId' as const satisfies keyof typeof schemaPostgres.ocPartsTable.$inferSelect,
    notFoundError: {
      code: 'BACKEND_OC_PART_DOES_NOT_EXIST'
    } satisfies BackendOcPartDoesNotExistError,
    entToTab: ocPartEntToTab,
    tabToEnt: ocPartTabToEnt
  }
};

// Object.keys loses the literal keys only at this enumeration boundary.
export const dbTableKeys: DbTableKey[] = Object.keys(
  dbEntityRegistry
) as DbTableKey[];
