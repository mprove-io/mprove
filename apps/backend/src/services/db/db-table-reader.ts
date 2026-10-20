import { Result } from '@praha/byethrow';
import type {
  DBQueryConfig,
  ExtractTablesWithRelations,
  KnownKeysOnly
} from 'drizzle-orm';
import type { schemaPostgres } from '#backend/drizzle/postgres/schema/_schema-postgres';
import type { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
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
import type { DbAvatarsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/avatars/db-avatars-find-first-check-exists-error';
import type { DbAvatarsFindFirstError } from '#common/types/backend/function-errors/db/avatars/db-avatars-find-first-error';
import type { DbAvatarsFindManyError } from '#common/types/backend/function-errors/db/avatars/db-avatars-find-many-error';
import type { DbBranchesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import type { DbBranchesFindFirstError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-error';
import type { DbBranchesFindManyError } from '#common/types/backend/function-errors/db/branches/db-branches-find-many-error';
import type { DbBridgesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import type { DbBridgesFindFirstError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-error';
import type { DbBridgesFindManyError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import type { DbCachedColumnsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/cached-columns/db-cached-columns-find-first-check-exists-error';
import type { DbCachedColumnsFindFirstError } from '#common/types/backend/function-errors/db/cached-columns/db-cached-columns-find-first-error';
import type { DbCachedColumnsFindManyError } from '#common/types/backend/function-errors/db/cached-columns/db-cached-columns-find-many-error';
import type { DbCachedPartsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/cached-parts/db-cached-parts-find-first-check-exists-error';
import type { DbCachedPartsFindFirstError } from '#common/types/backend/function-errors/db/cached-parts/db-cached-parts-find-first-error';
import type { DbCachedPartsFindManyError } from '#common/types/backend/function-errors/db/cached-parts/db-cached-parts-find-many-error';
import type { DbChartsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/charts/db-charts-find-first-check-exists-error';
import type { DbChartsFindFirstError } from '#common/types/backend/function-errors/db/charts/db-charts-find-first-error';
import type { DbChartsFindManyError } from '#common/types/backend/function-errors/db/charts/db-charts-find-many-error';
import type { DbConnectionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/connections/db-connections-find-first-check-exists-error';
import type { DbConnectionsFindFirstError } from '#common/types/backend/function-errors/db/connections/db-connections-find-first-error';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbDashboardsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/dashboards/db-dashboards-find-first-check-exists-error';
import type { DbDashboardsFindFirstError } from '#common/types/backend/function-errors/db/dashboards/db-dashboards-find-first-error';
import type { DbDashboardsFindManyError } from '#common/types/backend/function-errors/db/dashboards/db-dashboards-find-many-error';
import type { DbDconfigsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/dconfigs/db-dconfigs-find-first-check-exists-error';
import type { DbDconfigsFindFirstError } from '#common/types/backend/function-errors/db/dconfigs/db-dconfigs-find-first-error';
import type { DbDconfigsFindManyError } from '#common/types/backend/function-errors/db/dconfigs/db-dconfigs-find-many-error';
import type { DbEnvsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/envs/db-envs-find-first-check-exists-error';
import type { DbEnvsFindFirstError } from '#common/types/backend/function-errors/db/envs/db-envs-find-first-error';
import type { DbEnvsFindManyError } from '#common/types/backend/function-errors/db/envs/db-envs-find-many-error';
import type { DbGivensFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/givens/db-givens-find-first-check-exists-error';
import type { DbGivensFindFirstError } from '#common/types/backend/function-errors/db/givens/db-givens-find-first-error';
import type { DbGivensFindManyError } from '#common/types/backend/function-errors/db/givens/db-givens-find-many-error';
import type { DbKitsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/kits/db-kits-find-first-check-exists-error';
import type { DbKitsFindFirstError } from '#common/types/backend/function-errors/db/kits/db-kits-find-first-error';
import type { DbKitsFindManyError } from '#common/types/backend/function-errors/db/kits/db-kits-find-many-error';
import type { DbMconfigsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-first-check-exists-error';
import type { DbMconfigsFindFirstError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-first-error';
import type { DbMconfigsFindManyError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbMembersFindFirstError } from '#common/types/backend/function-errors/db/members/db-members-find-first-error';
import type { DbMembersFindManyError } from '#common/types/backend/function-errors/db/members/db-members-find-many-error';
import type { DbModelsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/models/db-models-find-first-check-exists-error';
import type { DbModelsFindFirstError } from '#common/types/backend/function-errors/db/models/db-models-find-first-error';
import type { DbModelsFindManyError } from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import type { DbNotesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/notes/db-notes-find-first-check-exists-error';
import type { DbNotesFindFirstError } from '#common/types/backend/function-errors/db/notes/db-notes-find-first-error';
import type { DbNotesFindManyError } from '#common/types/backend/function-errors/db/notes/db-notes-find-many-error';
import type { DbOcEventsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/oc-events/db-oc-events-find-first-check-exists-error';
import type { DbOcEventsFindFirstError } from '#common/types/backend/function-errors/db/oc-events/db-oc-events-find-first-error';
import type { DbOcEventsFindManyError } from '#common/types/backend/function-errors/db/oc-events/db-oc-events-find-many-error';
import type { DbOcMessagesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/oc-messages/db-oc-messages-find-first-check-exists-error';
import type { DbOcMessagesFindFirstError } from '#common/types/backend/function-errors/db/oc-messages/db-oc-messages-find-first-error';
import type { DbOcMessagesFindManyError } from '#common/types/backend/function-errors/db/oc-messages/db-oc-messages-find-many-error';
import type { DbOcPartsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/oc-parts/db-oc-parts-find-first-check-exists-error';
import type { DbOcPartsFindFirstError } from '#common/types/backend/function-errors/db/oc-parts/db-oc-parts-find-first-error';
import type { DbOcPartsFindManyError } from '#common/types/backend/function-errors/db/oc-parts/db-oc-parts-find-many-error';
import type { DbOcSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-first-check-exists-error';
import type { DbOcSessionsFindFirstError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-first-error';
import type { DbOcSessionsFindManyError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-many-error';
import type { DbOrgsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/orgs/db-orgs-find-first-check-exists-error';
import type { DbOrgsFindFirstError } from '#common/types/backend/function-errors/db/orgs/db-orgs-find-first-error';
import type { DbOrgsFindManyError } from '#common/types/backend/function-errors/db/orgs/db-orgs-find-many-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { DbProjectsFindFirstError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-error';
import type { DbProjectsFindManyError } from '#common/types/backend/function-errors/db/projects/db-projects-find-many-error';
import type { DbProvidersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/providers/db-providers-find-first-check-exists-error';
import type { DbProvidersFindFirstError } from '#common/types/backend/function-errors/db/providers/db-providers-find-first-error';
import type { DbProvidersFindManyError } from '#common/types/backend/function-errors/db/providers/db-providers-find-many-error';
import type { DbQueriesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/queries/db-queries-find-first-check-exists-error';
import type { DbQueriesFindFirstError } from '#common/types/backend/function-errors/db/queries/db-queries-find-first-error';
import type { DbQueriesFindManyError } from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';
import type { DbReportsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/reports/db-reports-find-first-check-exists-error';
import type { DbReportsFindFirstError } from '#common/types/backend/function-errors/db/reports/db-reports-find-first-error';
import type { DbReportsFindManyError } from '#common/types/backend/function-errors/db/reports/db-reports-find-many-error';
import type { DbRolesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/roles/db-roles-find-first-check-exists-error';
import type { DbRolesFindFirstError } from '#common/types/backend/function-errors/db/roles/db-roles-find-first-error';
import type { DbRolesFindManyError } from '#common/types/backend/function-errors/db/roles/db-roles-find-many-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { DbSessionsFindFirstError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-error';
import type { DbSessionsFindManyError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-many-error';
import type { DbStructsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/structs/db-structs-find-first-check-exists-error';
import type { DbStructsFindFirstError } from '#common/types/backend/function-errors/db/structs/db-structs-find-first-error';
import type { DbStructsFindManyError } from '#common/types/backend/function-errors/db/structs/db-structs-find-many-error';
import type { DbUconfigsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/uconfigs/db-uconfigs-find-first-check-exists-error';
import type { DbUconfigsFindFirstError } from '#common/types/backend/function-errors/db/uconfigs/db-uconfigs-find-first-error';
import type { DbUconfigsFindManyError } from '#common/types/backend/function-errors/db/uconfigs/db-uconfigs-find-many-error';
import type { DbUsersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/users/db-users-find-first-check-exists-error';
import type { DbUsersFindFirstError } from '#common/types/backend/function-errors/db/users/db-users-find-first-error';
import type { DbUsersFindManyError } from '#common/types/backend/function-errors/db/users/db-users-find-many-error';

type DbReadSchema = ExtractTablesWithRelations<typeof schemaPostgres>;

type DbTableReadOptions<Table extends keyof DbReadSchema> = Omit<
  DBQueryConfig<'many', true, DbReadSchema, DbReadSchema[Table]>,
  'columns' | 'with' | 'extras'
> & {
  columns?: never;
  with?: never;
  extras?: never;
};

type DbTableReaderConverterMap = {
  avatars: TabService['avatarEntToTab'];
  branches: TabService['branchEntToTab'];
  bridges: TabService['bridgeEntToTab'];
  cachedColumns: TabService['cachedColumnEntToTab'];
  cachedParts: TabService['cachedPartEntToTab'];
  charts: TabService['chartEntToTab'];
  connections: TabService['connectionEntToTab'];
  dashboards: TabService['dashboardEntToTab'];
  dconfigs: TabService['dconfigEntToTab'];
  envs: TabService['envEntToTab'];
  givens: TabService['givenEntToTab'];
  kits: TabService['kitEntToTab'];
  mconfigs: TabService['mconfigEntToTab'];
  members: TabService['memberEntToTab'];
  models: TabService['modelEntToTab'];
  notes: TabService['noteEntToTab'];
  ocEvents: TabService['ocEventEntToTab'];
  ocMessages: TabService['ocMessageEntToTab'];
  ocParts: TabService['ocPartEntToTab'];
  ocSessions: TabService['ocSessionEntToTab'];
  orgs: TabService['orgEntToTab'];
  projects: TabService['projectEntToTab'];
  providers: TabService['providerEntToTab'];
  queries: TabService['queryEntToTab'];
  reports: TabService['reportEntToTab'];
  roles: TabService['roleEntToTab'];
  sessions: TabService['sessionEntToTab'];
  structs: TabService['structEntToTab'];
  uconfigs: TabService['uconfigEntToTab'];
  users: TabService['userEntToTab'];
};

type DbTableReaderNotFoundErrorMap = {
  avatars: BackendAvatarDoesNotExistError;
  branches: BackendBranchDoesNotExistError;
  bridges: BackendBridgeBranchEnvDoesNotExistError;
  cachedColumns: BackendCachedColumnDoesNotExistError;
  cachedParts: BackendCachedPartDoesNotExistError;
  charts: BackendChartDoesNotExistError;
  connections: BackendConnectionDoesNotExistError;
  dashboards: BackendDashboardDoesNotExistError;
  dconfigs: BackendDconfigDoesNotExistError;
  envs: BackendEnvDoesNotExistError;
  givens: BackendGivenDoesNotExistError;
  kits: BackendKitDoesNotExistError;
  mconfigs: BackendMconfigDoesNotExistError;
  members: BackendMemberDoesNotExistError;
  models: BackendModelDoesNotExistError;
  notes: BackendNoteDoesNotExistError;
  ocEvents: BackendOcEventDoesNotExistError;
  ocMessages: BackendOcMessageDoesNotExistError;
  ocParts: BackendOcPartDoesNotExistError;
  ocSessions: BackendOcSessionDoesNotExistError;
  orgs: BackendOrgDoesNotExistError;
  projects: BackendProjectDoesNotExistError;
  providers: BackendProviderDoesNotExistError;
  queries: BackendQueryDoesNotExistError;
  reports: BackendReportNotFoundError;
  roles: BackendRoleDoesNotExistError;
  sessions: BackendSessionNotFoundError;
  structs: BackendStructDoesNotExistError;
  uconfigs: BackendUconfigDoesNotExistError;
  users: BackendUserDoesNotExistError;
};

type DbTableReaderFindFirstErrorMap = {
  avatars: DbAvatarsFindFirstError;
  branches: DbBranchesFindFirstError;
  bridges: DbBridgesFindFirstError;
  cachedColumns: DbCachedColumnsFindFirstError;
  cachedParts: DbCachedPartsFindFirstError;
  charts: DbChartsFindFirstError;
  connections: DbConnectionsFindFirstError;
  dashboards: DbDashboardsFindFirstError;
  dconfigs: DbDconfigsFindFirstError;
  envs: DbEnvsFindFirstError;
  givens: DbGivensFindFirstError;
  kits: DbKitsFindFirstError;
  mconfigs: DbMconfigsFindFirstError;
  members: DbMembersFindFirstError;
  models: DbModelsFindFirstError;
  notes: DbNotesFindFirstError;
  ocEvents: DbOcEventsFindFirstError;
  ocMessages: DbOcMessagesFindFirstError;
  ocParts: DbOcPartsFindFirstError;
  ocSessions: DbOcSessionsFindFirstError;
  orgs: DbOrgsFindFirstError;
  projects: DbProjectsFindFirstError;
  providers: DbProvidersFindFirstError;
  queries: DbQueriesFindFirstError;
  reports: DbReportsFindFirstError;
  roles: DbRolesFindFirstError;
  sessions: DbSessionsFindFirstError;
  structs: DbStructsFindFirstError;
  uconfigs: DbUconfigsFindFirstError;
  users: DbUsersFindFirstError;
};

type DbTableReaderFindManyErrorMap = {
  avatars: DbAvatarsFindManyError;
  branches: DbBranchesFindManyError;
  bridges: DbBridgesFindManyError;
  cachedColumns: DbCachedColumnsFindManyError;
  cachedParts: DbCachedPartsFindManyError;
  charts: DbChartsFindManyError;
  connections: DbConnectionsFindManyError;
  dashboards: DbDashboardsFindManyError;
  dconfigs: DbDconfigsFindManyError;
  envs: DbEnvsFindManyError;
  givens: DbGivensFindManyError;
  kits: DbKitsFindManyError;
  mconfigs: DbMconfigsFindManyError;
  members: DbMembersFindManyError;
  models: DbModelsFindManyError;
  notes: DbNotesFindManyError;
  ocEvents: DbOcEventsFindManyError;
  ocMessages: DbOcMessagesFindManyError;
  ocParts: DbOcPartsFindManyError;
  ocSessions: DbOcSessionsFindManyError;
  orgs: DbOrgsFindManyError;
  projects: DbProjectsFindManyError;
  providers: DbProvidersFindManyError;
  queries: DbQueriesFindManyError;
  reports: DbReportsFindManyError;
  roles: DbRolesFindManyError;
  sessions: DbSessionsFindManyError;
  structs: DbStructsFindManyError;
  uconfigs: DbUconfigsFindManyError;
  users: DbUsersFindManyError;
};

type DbTableReaderFindFirstCheckExistsErrorMap = {
  avatars: DbAvatarsFindFirstCheckExistsError;
  branches: DbBranchesFindFirstCheckExistsError;
  bridges: DbBridgesFindFirstCheckExistsError;
  cachedColumns: DbCachedColumnsFindFirstCheckExistsError;
  cachedParts: DbCachedPartsFindFirstCheckExistsError;
  charts: DbChartsFindFirstCheckExistsError;
  connections: DbConnectionsFindFirstCheckExistsError;
  dashboards: DbDashboardsFindFirstCheckExistsError;
  dconfigs: DbDconfigsFindFirstCheckExistsError;
  envs: DbEnvsFindFirstCheckExistsError;
  givens: DbGivensFindFirstCheckExistsError;
  kits: DbKitsFindFirstCheckExistsError;
  mconfigs: DbMconfigsFindFirstCheckExistsError;
  members: DbMembersFindFirstCheckExistsError;
  models: DbModelsFindFirstCheckExistsError;
  notes: DbNotesFindFirstCheckExistsError;
  ocEvents: DbOcEventsFindFirstCheckExistsError;
  ocMessages: DbOcMessagesFindFirstCheckExistsError;
  ocParts: DbOcPartsFindFirstCheckExistsError;
  ocSessions: DbOcSessionsFindFirstCheckExistsError;
  orgs: DbOrgsFindFirstCheckExistsError;
  projects: DbProjectsFindFirstCheckExistsError;
  providers: DbProvidersFindFirstCheckExistsError;
  queries: DbQueriesFindFirstCheckExistsError;
  reports: DbReportsFindFirstCheckExistsError;
  roles: DbRolesFindFirstCheckExistsError;
  sessions: DbSessionsFindFirstCheckExistsError;
  structs: DbStructsFindFirstCheckExistsError;
  uconfigs: DbUconfigsFindFirstCheckExistsError;
  users: DbUsersFindFirstCheckExistsError;
};

export type DbTableReaderKey = keyof DbTableReaderConverterMap;

type DbTableReaderTable<Key extends DbTableReaderKey> = `${Key}Table`;

type DbTableReaderEnt<Key extends DbTableReaderKey> =
  (typeof schemaPostgres)[DbTableReaderTable<Key>]['$inferSelect'];

type DbTableReaderTab<Key extends DbTableReaderKey> = Result.InferSuccess<
  DbTableReaderConverterMap[Key]
>;

export class DbTableReader<Key extends DbTableReaderKey> {
  constructor(
    private readonly item: {
      key: Key;
      query: {
        findFirst: (
          item?: Omit<
            DbTableReadOptions<DbTableReaderTable<NoInfer<Key>>>,
            'limit'
          >
        ) => PromiseLike<DbTableReaderEnt<NoInfer<Key>>>;
        findMany: (
          item?: DbTableReadOptions<DbTableReaderTable<NoInfer<Key>>>
        ) => PromiseLike<DbTableReaderEnt<NoInfer<Key>>[]>;
      };
      findExists?: (
        item?: Omit<
          DbTableReadOptions<DbTableReaderTable<NoInfer<Key>>>,
          'limit'
        >
      ) => PromiseLike<unknown>;
      convert: (
        ent: DbTableReaderEnt<NoInfer<Key>>
      ) => Result.Result<
        DbTableReaderTab<NoInfer<Key>>,
        DbTableReaderFindFirstErrorMap[NoInfer<Key>]
      >;
      defaultError: DbTableReaderNotFoundErrorMap[NoInfer<Key>];
    }
  ) {}

  async isExistUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<boolean> {
    let result: Result.Result<boolean, never> = await this.isExist(item);

    let isExist: boolean = Result.unwrap(result);

    return isExist;
  }

  async isExist<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<boolean, never> {
    return (
      isDefined(this.item.findExists)
        ? this.item.findExists(item)
        : this.item.query.findFirst(item)
    ).then(x => Result.succeed(isDefined(x)));
  }

  async findFirstCheckExistsUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<DbTableReaderTab<Key>> {
    let result: Result.Result<
      DbTableReaderTab<Key>,
      DbTableReaderFindFirstCheckExistsErrorMap[Key]
    > = await this.findFirstCheckExists(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableReaderTab<Key> = result.value;

    return tab;
  }

  async findFirstCheckExists<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<
    DbTableReaderTab<Key>,
    DbTableReaderFindFirstCheckExistsErrorMap[Key]
  > {
    return this.item.query
      .findFirst(item)
      .then(
        async (
          x: DbTableReaderEnt<Key>
        ): Result.ResultAsync<
          DbTableReaderTab<Key>,
          | DbTableReaderFindFirstErrorMap[Key]
          | DbTableReaderNotFoundErrorMap[Key]
        > =>
          isUndefined(x)
            ? await Result.fail(this.item.defaultError)
            : this.item.convert(x)
      );
  }

  async findFirstUnwrap<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Promise<DbTableReaderTab<Key>> {
    let result: Result.Result<
      DbTableReaderTab<Key>,
      DbTableReaderFindFirstErrorMap[Key]
    > = await this.findFirst(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tab: DbTableReaderTab<Key> = result.value;

    return tab;
  }

  async findFirst<
    Config extends Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
  >(
    item?: KnownKeysOnly<
      Config,
      Omit<DbTableReadOptions<DbTableReaderTable<Key>>, 'limit'>
    >
  ): Result.ResultAsync<
    DbTableReaderTab<Key>,
    DbTableReaderFindFirstErrorMap[Key]
  > {
    return this.item.query
      .findFirst(item)
      .then(x =>
        isUndefined(x) ? Result.succeed(undefined) : this.item.convert(x)
      );
  }

  async findManyUnwrap<
    Config extends DbTableReadOptions<DbTableReaderTable<Key>>
  >(
    item?: KnownKeysOnly<Config, DbTableReadOptions<DbTableReaderTable<Key>>>
  ): Promise<DbTableReaderTab<Key>[]> {
    let result: Result.Result<
      DbTableReaderTab<Key>[],
      DbTableReaderFindManyErrorMap[Key]
    > = await this.findMany(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let tabs: DbTableReaderTab<Key>[] = result.value;

    return tabs;
  }

  async findMany<Config extends DbTableReadOptions<DbTableReaderTable<Key>>>(
    item?: KnownKeysOnly<Config, DbTableReadOptions<DbTableReaderTable<Key>>>
  ): Result.ResultAsync<
    DbTableReaderTab<Key>[],
    DbTableReaderFindManyErrorMap[Key]
  > {
    return this.item.query
      .findMany(item)
      .then(xs => Result.sequence(xs, x => this.item.convert(x)));
  }
}
