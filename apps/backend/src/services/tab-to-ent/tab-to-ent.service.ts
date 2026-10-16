import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  CachedColumnTab,
  CachedPartTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  GivenTab,
  KitTab,
  MconfigTab,
  MemberTab,
  ModelFieldLeafTab,
  ModelTab,
  NoteTab,
  OcEventTab,
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  OrgTab,
  ProjectTab,
  ProviderTab,
  QueryTab,
  ReportTab,
  RoleTab,
  SessionTab,
  StructTab,
  UconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import type { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import type { CachedColumnsEnt } from '#backend/drizzle/postgres/schema/cached-columns';
import type { CachedPartsEnt } from '#backend/drizzle/postgres/schema/cached-parts';
import type { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import type { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import type { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import type { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import type { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import type { GivenEnt } from '#backend/drizzle/postgres/schema/givens';
import type { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import type { ModelFieldLeafEnt } from '#backend/drizzle/postgres/schema/model-field-leafs';
import type { ModelEnt } from '#backend/drizzle/postgres/schema/models';
import type { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import type { OcEventEnt } from '#backend/drizzle/postgres/schema/oc-events';
import type { OcMessageEnt } from '#backend/drizzle/postgres/schema/oc-messages';
import type { OcPartEnt } from '#backend/drizzle/postgres/schema/oc-parts';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import type { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import type { ProviderEnt } from '#backend/drizzle/postgres/schema/providers';
import type { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import type { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import type { RoleEnt } from '#backend/drizzle/postgres/schema/roles';
import type { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import type { StructEnt } from '#backend/drizzle/postgres/schema/structs';
import type { UconfigEnt } from '#backend/drizzle/postgres/schema/uconfigs';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import type { DbEntsPack } from '#backend/interfaces/db-ents-pack';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import { HashService } from '#backend/services/hash/hash.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { MemberTabToEntError } from '#common/types/backend/function-errors/member-tab-to-ent-error';
import type { OrgTabToEntError } from '#common/types/backend/function-errors/org-tab-to-ent-error';
import type { ProjectTabToEntError } from '#common/types/backend/function-errors/project-tab-to-ent-error';
import type { QueryTabToEntError } from '#common/types/backend/function-errors/query-tab-to-ent-error';
import type { TabsPackToEntsPackError } from '#common/types/backend/function-errors/tabs-pack-to-ents-pack-error';
import type { UserTabToEntError } from '#common/types/backend/function-errors/user-tab-to-ent-error';
import type { AvatarLt } from '#common/types/shared/st-lt/avatars/avatar-lt';
import type { AvatarSt } from '#common/types/shared/st-lt/avatars/avatar-st';
import type { BranchLt } from '#common/types/shared/st-lt/branches/branch-lt';
import type { BranchSt } from '#common/types/shared/st-lt/branches/branch-st';
import type { BridgeLt } from '#common/types/shared/st-lt/bridges/bridge-lt';
import type { BridgeSt } from '#common/types/shared/st-lt/bridges/bridge-st';
import type { CachedColumnLt } from '#common/types/shared/st-lt/cached-columns/cached-column-lt';
import type { CachedColumnSt } from '#common/types/shared/st-lt/cached-columns/cached-column-st';
import type { CachedPartLt } from '#common/types/shared/st-lt/cached-parts/cached-part-lt';
import type { CachedPartSt } from '#common/types/shared/st-lt/cached-parts/cached-part-st';
import type { ChartLt } from '#common/types/shared/st-lt/charts/chart-lt';
import type { ChartSt } from '#common/types/shared/st-lt/charts/chart-st';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';
import type { DashboardLt } from '#common/types/shared/st-lt/dashboards/dashboard-lt';
import type { DashboardSt } from '#common/types/shared/st-lt/dashboards/dashboard-st';
import type { DconfigLt } from '#common/types/shared/st-lt/dconfigs/dconfig-lt';
import type { DconfigSt } from '#common/types/shared/st-lt/dconfigs/dconfig-st';
import type { EnvLt } from '#common/types/shared/st-lt/envs/env-lt';
import type { EnvSt } from '#common/types/shared/st-lt/envs/env-st';
import type { GivenLt } from '#common/types/shared/st-lt/givens/given-lt';
import type { GivenSt } from '#common/types/shared/st-lt/givens/given-st';
import type { KitLt } from '#common/types/shared/st-lt/kits/kit-lt';
import type { KitSt } from '#common/types/shared/st-lt/kits/kit-st';
import type { MconfigLt } from '#common/types/shared/st-lt/mconfigs/mconfig-lt';
import type { MconfigSt } from '#common/types/shared/st-lt/mconfigs/mconfig-st';
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';
import type { ModelLt } from '#common/types/shared/st-lt/models/model-lt';
import type { ModelSt } from '#common/types/shared/st-lt/models/model-st';
import type { NoteLt } from '#common/types/shared/st-lt/notes/note-lt';
import type { NoteSt } from '#common/types/shared/st-lt/notes/note-st';
import type { OcEventLt } from '#common/types/shared/st-lt/oc-events/oc-event-lt';
import type { OcEventSt } from '#common/types/shared/st-lt/oc-events/oc-event-st';
import type { OcMessageLt } from '#common/types/shared/st-lt/oc-messages/oc-message-lt';
import type { OcMessageSt } from '#common/types/shared/st-lt/oc-messages/oc-message-st';
import type { OcPartLt } from '#common/types/shared/st-lt/oc-parts/oc-part-lt';
import type { OcPartSt } from '#common/types/shared/st-lt/oc-parts/oc-part-st';
import type { OcSessionLt } from '#common/types/shared/st-lt/oc-sessions/oc-session-lt';
import type { OcSessionSt } from '#common/types/shared/st-lt/oc-sessions/oc-session-st';
import type { OrgLt } from '#common/types/shared/st-lt/orgs/org-lt';
import type { OrgSt } from '#common/types/shared/st-lt/orgs/org-st';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';
import type { ProviderLt } from '#common/types/shared/st-lt/providers/provider-lt';
import type { ProviderSt } from '#common/types/shared/st-lt/providers/provider-st';
import type { QueryLt } from '#common/types/shared/st-lt/queries/query-lt';
import type { QuerySt } from '#common/types/shared/st-lt/queries/query-st';
import type { ReportLt } from '#common/types/shared/st-lt/reports/report-lt';
import type { ReportSt } from '#common/types/shared/st-lt/reports/report-st';
import type { RoleLt } from '#common/types/shared/st-lt/roles/role-lt';
import type { RoleSt } from '#common/types/shared/st-lt/roles/role-st';
import type { SessionLt } from '#common/types/shared/st-lt/sessions/session-lt';
import type { SessionSt } from '#common/types/shared/st-lt/sessions/session-st';
import type { StructLt } from '#common/types/shared/st-lt/structs/struct-lt';
import type { StructSt } from '#common/types/shared/st-lt/structs/struct-st';
import type { UconfigLt } from '#common/types/shared/st-lt/uconfigs/uconfig-lt';
import type { UconfigSt } from '#common/types/shared/st-lt/uconfigs/uconfig-st';
import type { UserLt } from '#common/types/shared/st-lt/users/user-lt';
import type { UserSt } from '#common/types/shared/st-lt/users/user-st';
import { encryptData } from '#node-common/functions/encrypt-data/encrypt-data';

@Injectable()
export class TabToEntService {
  private keyBuffer: Buffer;
  private keyTag: string;
  private isEncryptDb: boolean;
  private isEncryptMetadata: boolean;

  constructor(
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>
  ) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.isEncryptDb = this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');

    this.isEncryptMetadata =
      this.cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');
  }

  tabsPackToEntsPack(item: {
    tabsPack: DbTabsPack;
    hashSecret: string;
  }): DbEntsPack {
    let { tabsPack, hashSecret } = item;

    let result: Result.Result<DbEntsPack, TabsPackToEntsPackError> =
      this.tabsPackToEntsPackResult({
        tabsPack: tabsPack,
        hashSecret: hashSecret
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let entsPack: DbEntsPack = result.value;

    return entsPack;
  }

  tabsPackToEntsPackResult(item: {
    tabsPack: DbTabsPack;
    hashSecret?: string;
  }): Result.Result<DbEntsPack, TabsPackToEntsPackError> {
    let entsPack: DbEntsPack = {};

    return Result.pipe(
      Result.succeed({ ...item, entsPack: entsPack }),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          avatars:
            v.tabsPack.avatars
              ?.filter(x => isDefined(x))
              .map(x =>
                this.avatarTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          branches:
            v.tabsPack.branches
              ?.filter(x => isDefined(x))
              .map(x =>
                this.branchTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          bridges:
            v.tabsPack.bridges
              ?.filter(x => isDefined(x))
              .map(x =>
                this.bridgeTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          cachedColumns:
            v.tabsPack.cachedColumns
              ?.filter(x => isDefined(x))
              .map(x =>
                this.cachedColumnTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          cachedParts:
            v.tabsPack.cachedParts
              ?.filter(x => isDefined(x))
              .map(x =>
                this.cachedPartTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          charts:
            v.tabsPack.charts
              ?.filter(x => isDefined(x))
              .map(x =>
                this.chartTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          connections:
            v.tabsPack.connections
              ?.filter(x => isDefined(x))
              .map(x =>
                this.connectionTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          dashboards:
            v.tabsPack.dashboards
              ?.filter(x => isDefined(x))
              .map(x =>
                this.dashboardTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          dconfigs:
            v.tabsPack.dconfigs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.dconfigTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          envs:
            v.tabsPack.envs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.envTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          givens:
            v.tabsPack.givens
              ?.filter(x => isDefined(x))
              .map(x =>
                this.givenTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          roles:
            v.tabsPack.roles
              ?.filter(x => isDefined(x))
              .map(x =>
                this.roleTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          kits:
            v.tabsPack.kits
              ?.filter(x => isDefined(x))
              .map(x =>
                this.kitTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          mconfigs:
            v.tabsPack.mconfigs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.mconfigTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.bind(
        'memberEnts',
        (v): Result.Result<MemberEnt[], MemberTabToEntError> =>
          Result.sequence(
            v.tabsPack.members?.filter(x => isDefined(x)) ?? [],
            member =>
              this.memberTabToEntResult({
                tab: member,
                hashSecret: v.hashSecret
              })
          )
      ),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          ...v.entsPack,
          members: v.memberEnts,
          ocMessages:
            v.tabsPack.ocMessages
              ?.filter(x => isDefined(x))
              .map(x =>
                this.ocMessageTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          modelFieldLeafs:
            v.tabsPack.modelFieldLeafs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.modelFieldLeafTabToEnt({
                  tab: x,
                  hashSecret: v.hashSecret
                })
              ) ?? [],
          models:
            v.tabsPack.models
              ?.filter(x => isDefined(x))
              .map(x =>
                this.modelTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          notes:
            v.tabsPack.notes
              ?.filter(x => isDefined(x))
              .map(x =>
                this.noteTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          ocSessions:
            v.tabsPack.ocSessions
              ?.filter(x => isDefined(x))
              .map(x =>
                this.ocSessionTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.bind(
        'orgEnts',
        (v): Result.Result<OrgEnt[], OrgTabToEntError> =>
          Result.sequence(
            v.tabsPack.orgs?.filter(x => isDefined(x)) ?? [],
            org =>
              this.orgTabToEntResult({ tab: org, hashSecret: v.hashSecret })
          )
      ),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          ...v.entsPack,
          orgs: v.orgEnts,
          ocParts:
            v.tabsPack.ocParts
              ?.filter(x => isDefined(x))
              .map(x =>
                this.ocPartTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.bind(
        'projectEnts',
        (v): Result.Result<ProjectEnt[], ProjectTabToEntError> =>
          Result.sequence(
            v.tabsPack.projects?.filter(x => isDefined(x)) ?? [],
            project =>
              this.projectTabToEntResult({
                tab: project,
                hashSecret: v.hashSecret
              })
          )
      ),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          ...v.entsPack,
          projects: v.projectEnts,
          providers:
            v.tabsPack.providers
              ?.filter(x => isDefined(x))
              .map(x =>
                this.providerTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.bind(
        'queryEnts',
        (v): Result.Result<QueryEnt[], QueryTabToEntError> =>
          Result.sequence(
            v.tabsPack.queries?.filter(x => isDefined(x)) ?? [],
            query =>
              this.queryTabToEntResult({ tab: query, hashSecret: v.hashSecret })
          )
      ),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          ...v.entsPack,
          queries: v.queryEnts,
          reports:
            v.tabsPack.reports
              ?.filter(x => isDefined(x))
              .map(x =>
                this.reportTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          structs:
            v.tabsPack.structs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.structTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.bind(
        'userEnts',
        (v): Result.Result<UserEnt[], UserTabToEntError> =>
          Result.sequence(
            v.tabsPack.users?.filter(x => isDefined(x)) ?? [],
            user =>
              this.userTabToEntResult({ tab: user, hashSecret: v.hashSecret })
          )
      ),
      Result.map(v => {
        let entsPack: DbEntsPack = {
          ...v.entsPack,
          users: v.userEnts,
          ocEvents:
            v.tabsPack.ocEvents
              ?.filter(x => isDefined(x))
              .map(x =>
                this.ocEventTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          sessions:
            v.tabsPack.sessions
              ?.filter(x => isDefined(x))
              .map(x =>
                this.sessionTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? [],
          uconfigs:
            v.tabsPack.uconfigs
              ?.filter(x => isDefined(x))
              .map(x =>
                this.uconfigTabToEnt({ tab: x, hashSecret: v.hashSecret })
              ) ?? []
        };

        Object.assign(v.entsPack, entsPack);

        return v;
      }),
      Result.map((v): DbEntsPack => v.entsPack)
    );
  }

  getEntProps<DataSt, DataLt>(item: {
    dataSt: DataSt;
    dataLt: DataLt;
    isMetadata: boolean;
  }) {
    let { dataSt, dataLt, isMetadata } = item;

    let isEncrypt =
      isMetadata === true
        ? this.isEncryptDb === true && this.isEncryptMetadata === true
        : this.isEncryptDb === true;

    return isEncrypt === true
      ? {
          st: {
            encrypted: this.encrypt({ data: dataSt }),
            decrypted: undefined as DataSt
          },
          lt: {
            encrypted: this.encrypt({ data: dataLt }),
            decrypted: undefined as DataLt
          },
          keyTag: this.keyTag
        }
      : {
          st: {
            encrypted: undefined as string,
            decrypted: dataSt
          },
          lt: {
            encrypted: undefined as string,
            decrypted: dataLt
          },
          keyTag: undefined
        };
  }

  encrypt(item: { data: any }) {
    let { data } = item;

    return encryptData({
      data: data,
      keyBuffer: this.keyBuffer
    });
  }

  avatarTabToEnt(item: { tab: AvatarTab; hashSecret: string }): AvatarEnt {
    let { tab, hashSecret } = item;

    let avatarSt: AvatarSt = {
      avatarSmall: tab.avatarSmall
    };
    let avatarLt: AvatarLt = {
      avatarBig: tab.avatarBig
    };

    let avatarEnt: AvatarEnt = {
      userId: tab.userId,
      ...this.getEntProps({
        dataSt: avatarSt,
        dataLt: avatarLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return avatarEnt;
  }

  branchTabToEnt(item: { tab: BranchTab; hashSecret: string }): BranchEnt {
    let { tab, hashSecret } = item;

    let branchSt: BranchSt = {};
    let branchLt: BranchLt = {};

    let branchEnt: BranchEnt = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: tab.projectId,
        repoId: tab.repoId,
        branchId: tab.branchId
      }),
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId,
      ...this.getEntProps({
        dataSt: branchSt,
        dataLt: branchLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return branchEnt;
  }

  bridgeTabToEnt(item: { tab: BridgeTab; hashSecret: string }): BridgeEnt {
    let { tab, hashSecret } = item;

    let bridgeSt: BridgeSt = {};
    let bridgeLt: BridgeLt = {};

    let bridgeEnt: BridgeEnt = {
      bridgeFullId: this.hashService.makeBridgeFullId({
        projectId: tab.projectId,
        repoId: tab.repoId,
        branchId: tab.branchId,
        envId: tab.envId
      }),
      projectId: tab.projectId,
      repoId: tab.repoId,
      branchId: tab.branchId,
      envId: tab.envId,
      structId: tab.structId,
      needValidate: tab.needValidate,
      ...this.getEntProps({
        dataSt: bridgeSt,
        dataLt: bridgeLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return bridgeEnt;
  }

  cachedColumnTabToEnt(item: {
    tab: CachedColumnTab;
    hashSecret: string;
  }): CachedColumnsEnt {
    let { tab, hashSecret } = item;

    let cachedColumnSt: CachedColumnSt = {};
    let cachedColumnLt: CachedColumnLt = {};

    let cachedColumnEnt: CachedColumnsEnt = {
      cachedColumnFullId: this.hashService.makeCachedColumnFullId({
        projectId: tab.projectId,
        connectionId: tab.connectionId,
        envId: tab.envId,
        schemaName: tab.schemaNameLc,
        tableName: tab.tableNameLc,
        columnName: tab.columnNameLc
      }),
      projectId: tab.projectId,
      connectionId: tab.connectionId,
      envId: tab.envId,
      schemaNameLc: tab.schemaNameLc,
      tableNameLc: tab.tableNameLc,
      columnNameLc: tab.columnNameLc,
      requestedByUserId: tab.requestedByUserId,
      status: tab.status,
      errorMessage: tab.errorMessage,
      ...this.getEntProps({
        dataSt: cachedColumnSt,
        dataLt: cachedColumnLt,
        isMetadata: false
      }),
      startedTs: tab.startedTs,
      completedTs: tab.completedTs,
      completedDurationMs: tab.completedDurationMs,
      limit: tab.limit,
      sampleSize: tab.sampleSize,
      isLimitReached: tab.isLimitReached,
      uniqueValuesCount: tab.uniqueValuesCount,
      serverTs: tab.serverTs
    };

    return cachedColumnEnt;
  }

  cachedPartTabToEnt(item: {
    tab: CachedPartTab;
    hashSecret: string;
  }): CachedPartsEnt {
    let { tab, hashSecret } = item;

    let cachedPartSt: CachedPartSt = {};
    let cachedPartLt: CachedPartLt = {};

    let cachedPartEnt: CachedPartsEnt = {
      cachedPartFullId: this.hashService.makeCachedPartFullId({
        projectId: tab.projectId,
        connectionId: tab.connectionId,
        envId: tab.envId,
        schemaName: tab.schemaNameLc,
        tableName: tab.tableNameLc,
        columnName: tab.columnNameLc,
        columnValue: tab.columnValue
      }),
      projectId: tab.projectId,
      connectionId: tab.connectionId,
      envId: tab.envId,
      schemaNameLc: tab.schemaNameLc,
      tableNameLc: tab.tableNameLc,
      columnNameLc: tab.columnNameLc,
      columnValue: tab.columnValue,
      columnValueLc: tab.columnValueLc,
      count: tab.count,
      ...this.getEntProps({
        dataSt: cachedPartSt,
        dataLt: cachedPartLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return cachedPartEnt;
  }

  chartTabToEnt(item: { tab: ChartTab; hashSecret: string }): ChartEnt {
    let { tab, hashSecret } = item;

    let chartSt: ChartSt = {
      title: tab.title,
      modelLabel: tab.modelLabel,
      filePath: tab.filePath,
      space: tab.space,
      accessRoles: tab.accessRoles || [],
      accessRolesCombined: tab.accessRolesCombined || [],
      tiles: tab.tiles
    };

    let chartLt: ChartLt = {};

    let chartEnt: ChartEnt = {
      chartFullId: this.hashService.makeChartFullId({
        structId: tab.structId,
        chartId: tab.chartId
      }),
      structId: tab.structId,
      chartId: tab.chartId,
      modelId: tab.modelId,
      creatorId: tab.creatorId,
      chartType: tab.chartType,
      draft: tab.draft,
      isExplorer: tab.isExplorer,
      sessionId: tab.sessionId,
      chartYaml: tab.chartYaml,
      ...this.getEntProps({
        dataSt: chartSt,
        dataLt: chartLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return chartEnt;
  }

  connectionTabToEnt(item: {
    tab: ConnectionTab;
    hashSecret: string;
  }): ConnectionEnt {
    let { tab, hashSecret } = item;

    let connectionSt: ConnectionSt = { options: tab.options };
    let connectionLt: ConnectionLt = { rawSchema: tab.rawSchema };

    let connectionEnt: ConnectionEnt = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: tab.projectId,
        envId: tab.envId,
        connectionId: tab.connectionId
      }),
      projectId: tab.projectId,
      envId: tab.envId,
      connectionId: tab.connectionId,
      type: tab.type,
      ...this.getEntProps({
        dataSt: connectionSt,
        dataLt: connectionLt,
        isMetadata: false
      }),
      serverTs: undefined
    };

    return connectionEnt;
  }

  dashboardTabToEnt(item: {
    tab: DashboardTab;
    hashSecret: string;
  }): DashboardEnt {
    let { tab, hashSecret } = item;

    let dashboardSt: DashboardSt = {
      title: tab.title,
      filePath: tab.filePath,
      space: tab.space,
      accessRoles: tab.accessRoles,
      accessRolesCombined: tab.accessRolesCombined,
      tiles: tab.tiles,
      fields: tab.fields
    };
    let dashboardLt: DashboardLt = { content: tab.content };

    let dashboardEnt: DashboardEnt = {
      dashboardFullId: this.hashService.makeDashboardFullId({
        structId: tab.structId,
        dashboardId: tab.dashboardId
      }),
      structId: tab.structId,
      dashboardId: tab.dashboardId,
      creatorId: tab.creatorId,
      draft: tab.draft,
      ...this.getEntProps({
        dataSt: dashboardSt,
        dataLt: dashboardLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return dashboardEnt;
  }

  dconfigTabToEnt(item: { tab: DconfigTab; hashSecret: string }): DconfigEnt {
    let { tab, hashSecret } = item;

    let dconfigSt: DconfigSt = {
      hashSecret: tab.hashSecret,
      hashSecretCheck: tab.hashSecretCheck
    };
    let dconfigLt: DconfigLt = {};

    let dconfigEnt: DconfigEnt = {
      dconfigId: tab.dconfigId,
      ...this.getEntProps({
        dataSt: dconfigSt,
        dataLt: dconfigLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return dconfigEnt;
  }

  uconfigTabToEnt(item: { tab: UconfigTab; hashSecret: string }): UconfigEnt {
    let { tab, hashSecret } = item;

    let uconfigSt: UconfigSt = {};
    let uconfigLt: UconfigLt = {};

    let uconfigEnt: UconfigEnt = {
      uconfigId: tab.uconfigId,
      ...this.getEntProps({
        dataSt: uconfigSt,
        dataLt: uconfigLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return uconfigEnt;
  }

  givenTabToEnt(item: { tab: GivenTab; hashSecret: string }): GivenEnt {
    let { tab, hashSecret } = item;

    let givenSt: GivenSt = { values: tab.values };
    let givenLt: GivenLt = {};

    let givenEnt: GivenEnt = {
      givenFullId: this.hashService.makeGivenFullId({
        projectId: tab.projectId,
        givenId: tab.givenId
      }),
      projectId: tab.projectId,
      givenId: tab.givenId,
      type: tab.type,
      isMultiple: tab.isMultiple,
      ...this.getEntProps({
        dataSt: givenSt,
        dataLt: givenLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return givenEnt;
  }

  roleTabToEnt(item: { tab: RoleTab; hashSecret: string }): RoleEnt {
    let { tab, hashSecret } = item;

    let roleSt: RoleSt = { gvs: tab.gvs };
    let roleLt: RoleLt = {};

    let roleEnt: RoleEnt = {
      roleFullId: this.hashService.makeRoleFullId({
        projectId: tab.projectId,
        roleId: tab.roleId
      }),
      projectId: tab.projectId,
      roleId: tab.roleId,
      ...this.getEntProps({
        dataSt: roleSt,
        dataLt: roleLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return roleEnt;
  }

  envTabToEnt(item: { tab: EnvTab; hashSecret: string }): EnvEnt {
    let { tab, hashSecret } = item;

    let envSt: EnvSt = { evs: tab.evs };
    let envLt: EnvLt = {};

    let envEnt: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: tab.projectId,
        envId: tab.envId
      }),
      projectId: tab.projectId,
      envId: tab.envId,
      memberIds: tab.memberIds,
      isFallbackToProdConnections: tab.isFallbackToProdConnections,
      isFallbackToProdVariables: tab.isFallbackToProdVariables,
      useProdCache: tab.useProdCache,
      ...this.getEntProps({
        dataSt: envSt,
        dataLt: envLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return envEnt;
  }

  kitTabToEnt(item: { tab: KitTab; hashSecret: string }): KitEnt {
    let { tab, hashSecret } = item;

    let kitSt: KitSt = {};
    let kitLt: KitLt = {
      data: tab.data
    };

    let kitEnt: KitEnt = {
      kitId: tab.kitId,
      structId: tab.structId,
      reportId: tab.reportId,
      ...this.getEntProps({
        dataSt: kitSt,
        dataLt: kitLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return kitEnt;
  }

  mconfigTabToEnt(item: { tab: MconfigTab; hashSecret: string }): MconfigEnt {
    let { tab, hashSecret } = item;

    let mconfigSt: MconfigSt = {};

    let mconfigLt: MconfigLt = {
      dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
      storePart: tab.storePart,
      modelLabel: tab.modelLabel,
      modelFilePath: tab.modelFilePath,
      malloyQueryStable: tab.malloyQueryStable,
      malloyQueryExtra: tab.malloyQueryExtra,
      compiledQuery: tab.compiledQuery,
      select: tab.select,
      sortings: tab.sortings,
      sorts: tab.sorts,
      timezone: tab.timezone,
      limit: tab.limit,
      filters: tab.filters,
      appliedGivens: tab.appliedGivens,
      chart: tab.chart
    };

    let mconfigEnt: MconfigEnt = {
      mconfigId: tab.mconfigId,
      structId: tab.structId,
      queryId: tab.queryId,
      modelId: tab.modelId,
      modelType: tab.modelType,
      parentType: tab.parentType,
      parentId: tab.parentId,
      sessionId: tab.sessionId,
      ...this.getEntProps({
        dataSt: mconfigSt,
        dataLt: mconfigLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return mconfigEnt;
  }

  memberTabToEnt(item: { tab: MemberTab; hashSecret: string }): MemberEnt {
    let { tab, hashSecret } = item;

    let result: Result.Result<MemberEnt, MemberTabToEntError> =
      this.memberTabToEntResult({ tab: tab, hashSecret: hashSecret });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let memberEnt: MemberEnt = result.value;

    return memberEnt;
  }

  memberTabToEntResult(item: {
    tab: MemberTab;
    hashSecret?: string;
  }): Result.Result<MemberEnt, MemberTabToEntError> {
    let { tab } = item;

    let memberSt: MemberSt = {
      email: tab.email,
      alias: tab.alias,
      firstName: tab.firstName,
      lastName: tab.lastName,
      roles: tab.roles
    };

    let memberLt: MemberLt = {};

    return Result.pipe(
      Result.succeed({
        ...item,
        memberFullId: this.hashService.makeMemberFullId({
          projectId: tab.projectId,
          memberId: tab.memberId
        }),
        entProps: this.getEntProps({
          dataSt: memberSt,
          dataLt: memberLt,
          isMetadata: false
        })
      }),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'aliasHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.alias,
            hashSecret: v.hashSecret
          })
      ),
      Result.map(
        (v): MemberEnt => ({
          memberFullId: v.memberFullId,
          projectId: v.tab.projectId,
          memberId: v.tab.memberId,
          isAdmin: v.tab.isAdmin,
          isEditor: v.tab.isEditor,
          isExplorer: v.tab.isExplorer,
          ...v.entProps,
          emailHash: v.emailHash,
          aliasHash: v.aliasHash,
          serverTs: v.tab.serverTs
        })
      )
    );
  }

  modelTabToEnt(item: { tab: ModelTab; hashSecret: string }): ModelEnt {
    let { tab, hashSecret } = item;

    let modelSt: ModelSt = {
      accessRoles: tab.accessRoles,
      accessRolesCombined: tab.accessRolesCombined,
      source: tab.source,
      filePath: tab.filePath,
      space: tab.space,
      spaceFullTitle: tab.spaceFullTitle,
      label: tab.label
    };

    let modelLt: ModelLt = {
      malloyModelDef: tab.malloyModelDef,
      fileText: tab.fileText,
      storeContent: tab.storeContent,
      dateRangeIncludesRightSide: tab.dateRangeIncludesRightSide,
      fields: tab.fields,
      nodes: tab.nodes
    };

    let modelEnt: ModelEnt = {
      modelFullId: this.hashService.makeModelFullId({
        structId: tab.structId,
        modelId: tab.modelId
      }),
      structId: tab.structId,
      modelId: tab.modelId,
      type: tab.type,
      connectionId: tab.connectionId,
      connectionType: tab.connectionType,
      ...this.getEntProps({
        dataSt: modelSt,
        dataLt: modelLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return modelEnt;
  }

  modelFieldLeafTabToEnt(item: {
    tab: ModelFieldLeafTab;
    hashSecret: string;
  }): ModelFieldLeafEnt {
    let { tab } = item;

    let modelFieldLeafEnt: ModelFieldLeafEnt = {
      modelFieldLeafFullId: this.hashService.makeModelFieldLeafFullId({
        structId: tab.structId,
        modelId: tab.modelId,
        fieldId: tab.fieldId
      }),
      structId: tab.structId,
      modelId: tab.modelId,
      modelType: tab.modelType,
      connectionId: tab.connectionId,
      connectionType: tab.connectionType,
      fieldId: tab.fieldId,
      fieldNameLc: tab.fieldNameLc,
      fieldPath: tab.fieldPath,
      fieldClass: tab.fieldClass,
      fieldResult: tab.fieldResult,
      fieldType: tab.fieldType,
      labelLc: tab.labelLc,
      descriptionLc: tab.descriptionLc,
      hidden: tab.hidden,
      required: tab.required,
      sqlNameLc: tab.sqlNameLc,
      topId: tab.topId,
      topLabel: tab.topLabel,
      groupId: tab.groupId,
      groupLabel: tab.groupLabel,
      malloyFieldNameLc: tab.malloyFieldNameLc,
      malloyFieldPath: tab.malloyFieldPath,
      malloyTags: tab.malloyTags,
      mproveTags: tab.mproveTags,
      schemaNameLc: tab.schemaNameLc,
      tableNameLc: tab.tableNameLc,
      columnNameLc: tab.columnNameLc,
      field: tab.field,
      malloyFieldDef: tab.malloyFieldDef,
      serverTs: tab.serverTs
    };

    return modelFieldLeafEnt;
  }

  noteTabToEnt(item: { tab: NoteTab; hashSecret: string }): NoteEnt {
    let { tab, hashSecret } = item;

    let noteSt: NoteSt = {};
    let noteLt: NoteLt = {
      publicKey: tab.publicKey,
      privateKey: tab.privateKey,
      publicKeyEncrypted: tab.publicKeyEncrypted,
      privateKeyEncrypted: tab.privateKeyEncrypted,
      passPhrase: tab.passPhrase
    };

    let noteEnt: NoteEnt = {
      noteId: tab.noteId,
      ...this.getEntProps({
        dataSt: noteSt,
        dataLt: noteLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return noteEnt;
  }

  orgTabToEnt(item: { tab: OrgTab; hashSecret: string }): OrgEnt {
    let { tab, hashSecret } = item;

    let result: Result.Result<OrgEnt, OrgTabToEntError> =
      this.orgTabToEntResult({ tab: tab, hashSecret: hashSecret });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let orgEnt: OrgEnt = result.value;

    return orgEnt;
  }

  orgTabToEntResult(item: {
    tab: OrgTab;
    hashSecret?: string;
  }): Result.Result<OrgEnt, OrgTabToEntError> {
    let { tab } = item;

    let orgSt: OrgSt = {
      name: tab.name,
      ownerEmail: tab.ownerEmail
    };

    let orgLt: OrgLt = {};

    return Result.pipe(
      Result.succeed({
        ...item,
        entProps: this.getEntProps({
          dataSt: orgSt,
          dataLt: orgLt,
          isMetadata: false
        })
      }),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'ownerEmailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.ownerEmail,
            hashSecret: v.hashSecret
          })
      ),
      Result.map(
        (v): OrgEnt => ({
          orgId: v.tab.orgId,
          ownerId: v.tab.ownerId,
          ...v.entProps,
          nameHash: v.nameHash,
          ownerEmailHash: v.ownerEmailHash,
          serverTs: v.tab.serverTs
        })
      )
    );
  }

  projectTabToEnt(item: { tab: ProjectTab; hashSecret: string }): ProjectEnt {
    let { tab, hashSecret } = item;

    let result: Result.Result<ProjectEnt, ProjectTabToEntError> =
      this.projectTabToEntResult({ tab: tab, hashSecret: hashSecret });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let projectEnt: ProjectEnt = result.value;

    return projectEnt;
  }

  projectTabToEntResult(item: {
    tab: ProjectTab;
    hashSecret?: string;
  }): Result.Result<ProjectEnt, ProjectTabToEntError> {
    let { tab } = item;

    let projectSt: ProjectSt = {
      name: tab.name,
      e2bApiKey: tab.e2bApiKey
    };

    let projectLt: ProjectLt = {
      defaultBranch: tab.defaultBranch,
      gitUrl: tab.gitUrl,
      publicKey: tab.publicKey,
      privateKey: tab.privateKey,
      publicKeyEncrypted: tab.publicKeyEncrypted,
      privateKeyEncrypted: tab.privateKeyEncrypted,
      passPhrase: tab.passPhrase
    };

    return Result.pipe(
      Result.succeed({
        ...item,
        entProps: this.getEntProps({
          dataSt: projectSt,
          dataLt: projectLt,
          isMetadata: false
        })
      }),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'gitUrlHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.gitUrl,
            hashSecret: v.hashSecret
          })
      ),
      Result.map(
        (v): ProjectEnt => ({
          projectId: v.tab.projectId,
          orgId: v.tab.orgId,
          remoteType: v.tab.remoteType,
          ...v.entProps,
          nameHash: v.nameHash,
          gitUrlHash: v.gitUrlHash,
          serverTs: v.tab.serverTs
        })
      )
    );
  }

  providerTabToEnt(item: {
    tab: ProviderTab;
    hashSecret: string;
  }): ProviderEnt {
    let { tab } = item;

    let providerSt: ProviderSt = {
      name: tab.name,
      options: tab.options
    };

    let providerLt: ProviderLt = {
      emptyData: tab.emptyData
    };

    let providerEnt: ProviderEnt = {
      providerFullId: this.hashService.makeProviderFullId({
        projectId: tab.projectId,
        providerId: tab.providerId
      }),
      projectId: tab.projectId,
      providerId: tab.providerId,
      type: tab.type,
      isEnabled: tab.isEnabled,
      models: tab.models,
      ...this.getEntProps({
        dataSt: providerSt,
        dataLt: providerLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return providerEnt;
  }

  queryTabToEnt(item: { tab: QueryTab; hashSecret: string }): QueryEnt {
    let { tab, hashSecret } = item;

    let result: Result.Result<QueryEnt, QueryTabToEntError> =
      this.queryTabToEntResult({ tab: tab, hashSecret: hashSecret });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let queryEnt: QueryEnt = result.value;

    return queryEnt;
  }

  queryTabToEntResult(item: {
    tab: QueryTab;
    hashSecret?: string;
  }): Result.Result<QueryEnt, QueryTabToEntError> {
    let { tab } = item;

    let querySt: QuerySt = {
      sql: tab.sql,
      apiMethod: tab.apiMethod,
      apiUrl: tab.apiUrl,
      apiBody: tab.apiBody,
      lastErrorMessage: tab.lastErrorMessage
    };

    let queryLt: QueryLt = {
      data: tab.data
    };

    return Result.pipe(
      Result.succeed({
        ...item,
        entProps: this.getEntProps({
          dataSt: querySt,
          dataLt: queryLt,
          isMetadata: false
        })
      }),
      Result.bind(
        'apiUrlHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.apiUrl,
            hashSecret: v.hashSecret
          })
      ),
      Result.map(
        (v): QueryEnt => ({
          projectId: v.tab.projectId,
          envId: v.tab.envId,
          connectionId: v.tab.connectionId,
          connectionType: v.tab.connectionType,
          queryId: v.tab.queryId,
          reportId: v.tab.reportId,
          reportStructId: v.tab.reportStructId,
          status: v.tab.status,
          lastRunBy: v.tab.lastRunBy,
          lastRunTs: v.tab.lastRunTs,
          lastCancelTs: v.tab.lastCancelTs,
          lastCompleteTs: v.tab.lastCompleteTs,
          lastCompleteDuration: v.tab.lastCompleteDuration,
          lastErrorTs: v.tab.lastErrorTs,
          queryJobId: v.tab.queryJobId,
          bigqueryQueryJobId: v.tab.bigqueryQueryJobId,
          bigqueryConsecutiveErrorsGetJob:
            v.tab.bigqueryConsecutiveErrorsGetJob,
          bigqueryConsecutiveErrorsGetResults:
            v.tab.bigqueryConsecutiveErrorsGetResults,
          ...v.entProps,
          apiUrlHash: v.apiUrlHash,
          sessionId: v.tab.sessionId,
          serverTs: v.tab.serverTs
        })
      )
    );
  }

  reportTabToEnt(item: { tab: ReportTab; hashSecret: string }): ReportEnt {
    let { tab, hashSecret } = item;

    let reportSt: ReportSt = {
      filePath: tab.filePath,
      space: tab.space,
      fields: tab.fields,
      accessRoles: tab.accessRoles,
      accessRolesCombined: tab.accessRolesCombined,
      title: tab.title,
      chart: tab.chart
    };

    let reportLt: ReportLt = {
      rows: tab.rows
    };

    let reportEnt: ReportEnt = {
      reportFullId: this.hashService.makeReportFullId({
        structId: tab.structId,
        reportId: tab.reportId
      }),
      projectId: tab.projectId,
      structId: tab.structId,
      reportId: tab.reportId,
      creatorId: tab.creatorId,
      draft: tab.draft,
      draftCreatedTs: tab.draftCreatedTs,
      ...this.getEntProps({
        dataSt: reportSt,
        dataLt: reportLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return reportEnt;
  }

  structTabToEnt(item: { tab: StructTab; hashSecret: string }): StructEnt {
    let { tab, hashSecret } = item;

    let structSt: StructSt = {};

    let structLt: StructLt = {
      errors: tab.errors,
      modelFilePaths: tab.modelFilePaths ?? [],
      metrics: tab.metrics,
      presets: tab.presets,
      spaces: tab.spaces,
      extraSchemas: tab.extraSchemas,
      mproveConfig: tab.mproveConfig,
      mproveExplorer: tab.mproveExplorer
    };

    let structEnt: StructEnt = {
      structId: tab.structId,
      projectId: tab.projectId,
      mproveVersion: tab.mproveVersion,
      ...this.getEntProps({
        dataSt: structSt,
        dataLt: structLt,
        isMetadata: true
      }),
      serverTs: tab.serverTs
    };

    return structEnt;
  }

  userTabToEnt(item: { tab: UserTab; hashSecret: string }): UserEnt {
    let { tab, hashSecret } = item;

    let result: Result.Result<UserEnt, UserTabToEntError> =
      this.userTabToEntResult({ tab: tab, hashSecret: hashSecret });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let userEnt: UserEnt = result.value;

    return userEnt;
  }

  userTabToEntResult(item: {
    tab: UserTab;
    hashSecret?: string;
  }): Result.Result<UserEnt, UserTabToEntError> {
    let { tab } = item;

    let userSt: UserSt = {};

    let userLt: UserLt = {
      email: tab.email,
      alias: tab.alias,
      passwordHash: tab.passwordHash,
      passwordSalt: tab.passwordSalt,
      firstName: tab.firstName,
      lastName: tab.lastName,
      emailVerificationToken: tab.emailVerificationToken,
      passwordResetToken: tab.passwordResetToken,
      passwordResetExpiresTs: tab.passwordResetExpiresTs,
      ui: tab.ui,
      apiKeySecretHash: tab.apiKeySecretHash,
      apiKeySalt: tab.apiKeySalt,
      codexAuth: tab.codexAuth
    };

    return Result.pipe(
      Result.succeed({
        ...item,
        entProps: this.getEntProps({
          dataSt: userSt,
          dataLt: userLt,
          isMetadata: false
        })
      }),
      Result.bind(
        'emailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.email,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'aliasHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.alias,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'emailVerificationTokenHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.emailVerificationToken,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'passwordResetTokenHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHashResult({
            input: v.tab.passwordResetToken,
            hashSecret: v.hashSecret
          })
      ),
      Result.map(
        (v): UserEnt => ({
          userId: v.tab.userId,
          isEmailVerified: v.tab.isEmailVerified,
          jwtMinIat: v.tab.jwtMinIat,
          apiKeyPrefix: v.tab.apiKeyPrefix,
          codexAuthUpdateTs: v.tab.codexAuthUpdateTs,
          codexAuthExpiresTs: v.tab.codexAuthExpiresTs,
          ...v.entProps,
          emailHash: v.emailHash,
          aliasHash: v.aliasHash,
          emailVerificationTokenHash: v.emailVerificationTokenHash,
          passwordResetTokenHash: v.passwordResetTokenHash,
          serverTs: v.tab.serverTs,
          createdTs: v.tab.createdTs
        })
      )
    );
  }

  ocEventTabToEnt(item: { tab: OcEventTab; hashSecret: string }): OcEventEnt {
    let { tab } = item;

    let eventSt: OcEventSt = {
      ocEvent: tab.ocEvent
    };

    let eventLt: OcEventLt = {};

    let eventEnt: OcEventEnt = {
      eventId: tab.eventId,
      sessionId: tab.sessionId,
      eventIndex: tab.eventIndex,
      type: tab.type,
      ...this.getEntProps({
        dataSt: eventSt,
        dataLt: eventLt,
        isMetadata: false
      }),
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return eventEnt;
  }

  sessionTabToEnt(item: { tab: SessionTab; hashSecret: string }): SessionEnt {
    let { tab } = item;

    let sessionSt: SessionSt = {
      sandboxId: tab.sandboxId,
      sandboxBaseUrl: tab.sandboxBaseUrl,
      opencodeSessionId: tab.opencodeSessionId,
      opencodePassword: tab.opencodePassword,
      firstMessage: tab.firstMessage,
      apiKeySecretHash: tab.apiKeySecretHash,
      apiKeySalt: tab.apiKeySalt,
      providerConfigHash: tab.providerConfigHash,
      closedExplorerTabIds: tab.closedExplorerTabIds
    };

    let sessionLt: SessionLt = {};

    let sessionEnt: SessionEnt = {
      sessionId: tab.sessionId,
      type: tab.type,
      repoId: tab.repoId,
      branchId: tab.branchId,
      userId: tab.userId,
      projectId: tab.projectId,
      apiKeyPrefix: tab.apiKeyPrefix,
      modelId: tab.modelId,
      lastMessageVariant: tab.lastMessageVariant,
      sandboxType: tab.sandboxType,
      providerId: tab.providerId,
      agent: tab.agent,
      status: tab.status,
      archiveReason: tab.archiveReason,
      pauseReason: tab.pauseReason,
      initialBranch: tab.initialBranch,
      envId: tab.envId,
      initialCommit: tab.initialCommit,
      ...this.getEntProps({
        dataSt: sessionSt,
        dataLt: sessionLt,
        isMetadata: false
      }),
      lastActivityTs: tab.lastActivityTs,
      sandboxStartTs: tab.sandboxStartTs,
      sandboxEndTs: tab.sandboxEndTs,
      sandboxInfo: tab.sandboxInfo,
      lastFetchEventIndex: tab.lastFetchEventIndex,
      reloadRequestedTs: tab.reloadRequestedTs,
      codexAuthUpdateTs: tab.codexAuthUpdateTs,
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return sessionEnt;
  }

  ocSessionTabToEnt(item: {
    tab: OcSessionTab;
    hashSecret: string;
  }): OcSessionEnt {
    let { tab } = item;

    let ocSessionSt: OcSessionSt = {
      openSession: tab.openSession,
      todos: tab.todos,
      questions: tab.questions,
      permissions: tab.permissions,
      ocSessionStatus: tab.ocSessionStatus,
      lastSessionError: tab.lastSessionError,
      isLastErrorRecovered: tab.isLastErrorRecovered
    };

    let ocSessionLt: OcSessionLt = {};

    let ocSessionEnt: OcSessionEnt = {
      sessionId: tab.sessionId,
      ...this.getEntProps({
        dataSt: ocSessionSt,
        dataLt: ocSessionLt,
        isMetadata: false
      }),
      serverTs: tab.serverTs
    };

    return ocSessionEnt;
  }

  ocMessageTabToEnt(item: {
    tab: OcMessageTab;
    hashSecret: string;
  }): OcMessageEnt {
    let { tab } = item;

    let messageSt: OcMessageSt = {
      ocMessage: tab.ocMessage
    };

    let messageLt: OcMessageLt = {};

    let messageEnt: OcMessageEnt = {
      messageId: tab.messageId,
      sessionId: tab.sessionId,
      role: tab.role,
      ...this.getEntProps({
        dataSt: messageSt,
        dataLt: messageLt,
        isMetadata: false
      }),
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return messageEnt;
  }

  ocPartTabToEnt(item: { tab: OcPartTab; hashSecret: string }): OcPartEnt {
    let { tab } = item;

    let partSt: OcPartSt = {
      ocPart: tab.ocPart
    };

    let partLt: OcPartLt = {};

    let partEnt: OcPartEnt = {
      partId: tab.partId,
      messageId: tab.messageId,
      sessionId: tab.sessionId,
      type: tab.type,
      ...this.getEntProps({
        dataSt: partSt,
        dataLt: partLt,
        isMetadata: false
      }),
      createdTs: tab.createdTs,
      serverTs: tab.serverTs
    };

    return partEnt;
  }
}
