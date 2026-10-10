import * as crypto from 'node:crypto';
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
import { CachedColumnsEnt } from '#backend/drizzle/postgres/schema/cached-columns';
import type { CachedPartsEnt } from '#backend/drizzle/postgres/schema/cached-parts';
import type { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import type { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import type { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import type { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import type { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import type { GivenEnt } from '#backend/drizzle/postgres/schema/givens';
import { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import type { ModelEnt } from '#backend/drizzle/postgres/schema/models';
import type { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import { OcEventEnt } from '#backend/drizzle/postgres/schema/oc-events';
import { OcMessageEnt } from '#backend/drizzle/postgres/schema/oc-messages';
import { OcPartEnt } from '#backend/drizzle/postgres/schema/oc-parts';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import type { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import type { ProviderEnt } from '#backend/drizzle/postgres/schema/providers';
import { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import type { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import type { RoleEnt } from '#backend/drizzle/postgres/schema/roles';
import type { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import type { StructEnt } from '#backend/drizzle/postgres/schema/structs';
import { UconfigEnt } from '#backend/drizzle/postgres/schema/uconfigs';
import type { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { TabToEntService } from '#backend/services/tab-to-ent/tab-to-ent.service';
import type { GitKeyPair } from '#backend/types/git-key-pair';
import type { TabProps } from '#backend/types/tab-props';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { BranchEntToTabResultError } from '#common/types/backend/function-errors/branch-ent-to-tab-result-error';
import type { BridgeEntToTabResultError } from '#common/types/backend/function-errors/bridge-ent-to-tab-result-error';
import type { CachedColumnEntToTabResultError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import type { CachedPartEntToTabResultError } from '#common/types/backend/function-errors/cached-part-ent-to-tab-result-error';
import type { ChartEntToTabResultError } from '#common/types/backend/function-errors/chart-ent-to-tab-result-error';
import type { ConnectionEntToTabResultError } from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import type { DashboardEntToTabResultError } from '#common/types/backend/function-errors/dashboard-ent-to-tab-result-error';
import type { DconfigEntToTabResultError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-result-error';
import type { EnvEntToTabResultError } from '#common/types/backend/function-errors/env-ent-to-tab-result-error';
import type { GetTabPropsResultError } from '#common/types/backend/function-errors/get-tab-props-result-error';
import type { GivenEntToTabResultError } from '#common/types/backend/function-errors/given-ent-to-tab-result-error';
import type { MemberEntToTabResultError } from '#common/types/backend/function-errors/member-ent-to-tab-result-error';
import type { ModelEntToTabResultError } from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
import type { NoteEntToTabResultError } from '#common/types/backend/function-errors/note-ent-to-tab-result-error';
import type { OcSessionEntToTabResultError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-result-error';
import type { OrgEntToTabResultError } from '#common/types/backend/function-errors/org-ent-to-tab-result-error';
import type { ProjectEntToTabResultError } from '#common/types/backend/function-errors/project-ent-to-tab-result-error';
import type { ProviderEntToTabResultError } from '#common/types/backend/function-errors/provider-ent-to-tab-result-error';
import type { ReportEntToTabResultError } from '#common/types/backend/function-errors/report-ent-to-tab-result-error';
import type { RoleEntToTabResultError } from '#common/types/backend/function-errors/role-ent-to-tab-result-error';
import type { SessionEntToTabResultError } from '#common/types/backend/function-errors/session-ent-to-tab-result-error';
import type { StructEntToTabResultError } from '#common/types/backend/function-errors/struct-ent-to-tab-result-error';
import type { UserEntToTabResultError } from '#common/types/backend/function-errors/user-ent-to-tab-result-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
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
import type { MemberLt } from '#common/types/shared/st-lt/members/member-lt';
import type { MemberSt } from '#common/types/shared/st-lt/members/member-st';
import type { ModelLt } from '#common/types/shared/st-lt/models/model-lt';
import type { ModelSt } from '#common/types/shared/st-lt/models/model-st';
import type { NoteLt } from '#common/types/shared/st-lt/notes/note-lt';
import type { NoteSt } from '#common/types/shared/st-lt/notes/note-st';
import type { OcSessionLt } from '#common/types/shared/st-lt/oc-sessions/oc-session-lt';
import type { OcSessionSt } from '#common/types/shared/st-lt/oc-sessions/oc-session-st';
import type { OrgLt } from '#common/types/shared/st-lt/orgs/org-lt';
import type { OrgSt } from '#common/types/shared/st-lt/orgs/org-st';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';
import type { ProviderLt } from '#common/types/shared/st-lt/providers/provider-lt';
import type { ProviderSt } from '#common/types/shared/st-lt/providers/provider-st';
import type { ReportLt } from '#common/types/shared/st-lt/reports/report-lt';
import type { ReportSt } from '#common/types/shared/st-lt/reports/report-st';
import type { RoleLt } from '#common/types/shared/st-lt/roles/role-lt';
import type { RoleSt } from '#common/types/shared/st-lt/roles/role-st';
import type { SessionLt } from '#common/types/shared/st-lt/sessions/session-lt';
import type { SessionSt } from '#common/types/shared/st-lt/sessions/session-st';
import type { StructLt } from '#common/types/shared/st-lt/structs/struct-lt';
import type { StructSt } from '#common/types/shared/st-lt/structs/struct-st';
import type { UserLt } from '#common/types/shared/st-lt/users/user-lt';
import type { UserSt } from '#common/types/shared/st-lt/users/user-st';
import { decryptData } from '#node-common/functions/decrypt-data/decrypt-data';

@Injectable()
export class TabService {
  private keyBuffer: Buffer;
  private keyTag: string;

  private prevKeyBuffer: Buffer;
  private prevKeyTag: string;

  constructor(
    private tabToEntService: TabToEntService,
    private cs: ConfigService<BackendConfig>
  ) {
    let keyBase64 = this.cs.get<BackendConfig['aesKey']>('aesKey');
    this.keyBuffer = Buffer.from(keyBase64, 'base64');

    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    let prevKeyBase64 = this.cs.get<BackendConfig['prevAesKey']>('prevAesKey');
    this.prevKeyBuffer = isDefined(prevKeyBase64)
      ? Buffer.from(prevKeyBase64, 'base64')
      : undefined;

    this.prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');
  }

  getTabProps<ST, LT>(item: {
    ent: {
      st: { encrypted: string; decrypted: ST };
      lt: { encrypted: string; decrypted: LT };
      keyTag: string;
    };
  }): ST & LT {
    let result: Result.Result<
      TabProps<ST, LT>,
      GetTabPropsResultError
    > = this.getTabPropsResult<ST, LT>(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let props: ST & LT = result.value.props;

    return props;
  }

  getTabPropsResult<ST, LT>(item: {
    ent: {
      st: { encrypted: string; decrypted: ST };
      lt: { encrypted: string; decrypted: LT };
      keyTag: string;
    };
  }): Result.Result<TabProps<ST, LT>, GetTabPropsResultError> {
    let { ent } = item;

    let isDefinedStAndUndefinedEncrypted =
      isDefined(ent.st) && isUndefined(ent.st.encrypted);

    let isDefinedStAndUndefinedDecrypted =
      isDefined(ent.st) && isUndefined(ent.st.decrypted);

    let isDefinedLtAndUndefinedEncrypted =
      isDefined(ent.lt) && isUndefined(ent.lt.encrypted);

    let isDefinedLtAndUndefinedDecrypted =
      isDefined(ent.lt) && isUndefined(ent.lt.decrypted);

    if (
      (isDefinedStAndUndefinedEncrypted || isDefinedLtAndUndefinedEncrypted) &&
      (isDefinedStAndUndefinedDecrypted || isDefinedLtAndUndefinedDecrypted)
    ) {
      return Result.fail({
        code: 'BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS'
      });
    }

    if (
      (isDefined(ent.st?.encrypted) || isDefined(ent.lt?.encrypted)) &&
      (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
    ) {
      return Result.fail({
        code: 'BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS'
      });
    }

    if (
      isDefined(ent.keyTag) &&
      (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
    ) {
      return Result.fail({
        code: 'BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG'
      });
    }

    if (
      isDefined(ent.keyTag) &&
      [this.keyTag, this.prevKeyTag].indexOf(ent.keyTag) < 0
    ) {
      return Result.fail({
        code: 'BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV'
      });
    }

    let keyBuffer: Buffer =
      isDefined(ent.keyTag) && ent.keyTag === this.keyTag
        ? this.keyBuffer
        : isDefined(ent.keyTag) && ent.keyTag === this.prevKeyTag
          ? this.prevKeyBuffer
          : undefined;

    let props: ST & LT = isDefined(ent.keyTag)
      ? {
          ...this.decrypt<ST>({
            encryptedString: ent.st?.encrypted,
            keyBuffer: keyBuffer
          }),
          ...this.decrypt<LT>({
            encryptedString: ent.lt?.encrypted,
            keyBuffer: keyBuffer
          })
        }
      : {
          ...(ent.st?.decrypted ?? ({} as ST)),
          ...(ent.lt?.decrypted ?? ({} as LT))
        };

    return Result.succeed({ props: props });
  }

  decrypt<T>(item: {
    encryptedString: string;
    keyBuffer: Buffer<ArrayBufferLike>;
  }): T {
    let { encryptedString, keyBuffer } = item;

    return isDefinedAndNotEmpty(encryptedString)
      ? decryptData({
          encryptedString: encryptedString,
          keyBuffer: keyBuffer
        })
      : ({} as T);
  }

  makePassPhrase(): string {
    let length = 32;

    let output = '';

    let charset: string =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomValues: Uint8Array = new Uint8Array(length);

    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      let randomIndex: number = randomValues[i] % charset.length;
      output += charset[randomIndex];
    }

    return output;
  }

  createGitKeyPair(): GitKeyPair {
    let passPhrase: string = this.makePassPhrase();

    let keyPair: crypto.KeyPairSyncResult<string, string> =
      crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: passPhrase
        }
      });

    let gitKeyPair: GitKeyPair = {
      publicKeyEncrypted: keyPair.publicKey,
      privateKeyEncrypted: keyPair.privateKey,
      passPhrase: passPhrase
    };

    return gitKeyPair;
  }

  projectTabToBaseProject(item: {
    // tabService (no circular deps - membersService, projectsService)
    project: ProjectTab;
  }): BaseProject {
    let { project } = item;

    let projectSt: ProjectSt = {
      name: project.name,
      e2bApiKey: undefined // baseProject does not need project.e2bApiKey
    };

    let projectLt: ProjectLt = {
      defaultBranch: project.defaultBranch,
      gitUrl: project.gitUrl,
      publicKey: project.publicKey,
      privateKey: project.privateKey,
      publicKeyEncrypted: project.publicKey,
      privateKeyEncrypted: project.privateKeyEncrypted,
      passPhrase: project.passPhrase
    };

    let apiBaseProject: BaseProject = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      st: this.tabToEntService.encrypt({ data: projectSt }),
      lt: this.tabToEntService.encrypt({ data: projectLt })
    };

    return apiBaseProject;
  }

  avatarEntToTab(avatarEnt: AvatarEnt): AvatarTab {
    if (isUndefined(avatarEnt)) {
      return;
    }

    let result: Result.Result<AvatarTab, AvatarEntToTabResultError> =
      this.avatarEntToTabResult({ avatarEnt: avatarEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let avatar: AvatarTab = result.value;

    return avatar;
  }

  avatarEntToTabResult(item: {
    avatarEnt: AvatarEnt;
  }): Result.Result<AvatarTab, AvatarEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<AvatarSt, AvatarLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<AvatarSt, AvatarLt>({
            ent: v.avatarEnt
          })
      ),
      Result.map((v): AvatarTab => ({ ...v.avatarEnt, ...v.tabProps.props }))
    );
  }

  branchEntToTab(branchEnt: BranchEnt): BranchTab {
    if (isUndefined(branchEnt)) {
      return;
    }

    let result: Result.Result<BranchTab, BranchEntToTabResultError> =
      this.branchEntToTabResult({ branchEnt: branchEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let branch: BranchTab = result.value;

    return branch;
  }

  branchEntToTabResult(item: {
    branchEnt: BranchEnt;
  }): Result.Result<BranchTab, BranchEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<BranchSt, BranchLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<BranchSt, BranchLt>({
            ent: v.branchEnt
          })
      ),
      Result.map((v): BranchTab => ({ ...v.branchEnt, ...v.tabProps.props }))
    );
  }

  bridgeEntToTab(bridgeEnt: BridgeEnt): BridgeTab {
    if (isUndefined(bridgeEnt)) {
      return;
    }

    let result: Result.Result<BridgeTab, BridgeEntToTabResultError> =
      this.bridgeEntToTabResult({ bridgeEnt: bridgeEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let bridge: BridgeTab = result.value;

    return bridge;
  }

  bridgeEntToTabResult(item: {
    bridgeEnt: BridgeEnt;
  }): Result.Result<BridgeTab, BridgeEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<BridgeSt, BridgeLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<BridgeSt, BridgeLt>({
            ent: v.bridgeEnt
          })
      ),
      Result.map((v): BridgeTab => ({ ...v.bridgeEnt, ...v.tabProps.props }))
    );
  }

  cachedColumnEntToTab(cachedColumnEnt: CachedColumnsEnt): CachedColumnTab {
    if (isUndefined(cachedColumnEnt)) {
      return;
    }

    let result: Result.Result<
      CachedColumnTab,
      CachedColumnEntToTabResultError
    > = this.cachedColumnEntToTabResult({ cachedColumnEnt: cachedColumnEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let cachedColumn: CachedColumnTab = result.value;

    return cachedColumn;
  }

  cachedColumnEntToTabResult(item: {
    cachedColumnEnt: CachedColumnsEnt;
  }): Result.Result<CachedColumnTab, CachedColumnEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<CachedColumnSt, CachedColumnLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<CachedColumnSt, CachedColumnLt>({
            ent: v.cachedColumnEnt
          })
      ),
      Result.map(
        (v): CachedColumnTab => ({ ...v.cachedColumnEnt, ...v.tabProps.props })
      )
    );
  }

  cachedPartEntToTab(cachedPartEnt: CachedPartsEnt): CachedPartTab {
    if (isUndefined(cachedPartEnt)) {
      return;
    }

    let result: Result.Result<CachedPartTab, CachedPartEntToTabResultError> =
      this.cachedPartEntToTabResult({ cachedPartEnt: cachedPartEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let cachedPart: CachedPartTab = result.value;

    return cachedPart;
  }

  cachedPartEntToTabResult(item: {
    cachedPartEnt: CachedPartsEnt;
  }): Result.Result<CachedPartTab, CachedPartEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<CachedPartSt, CachedPartLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<CachedPartSt, CachedPartLt>({
            ent: v.cachedPartEnt
          })
      ),
      Result.map(
        (v): CachedPartTab => ({ ...v.cachedPartEnt, ...v.tabProps.props })
      )
    );
  }

  chartEntToTab(chartEnt: ChartEnt): ChartTab {
    if (isUndefined(chartEnt)) {
      return;
    }

    let result: Result.Result<ChartTab, ChartEntToTabResultError> =
      this.chartEntToTabResult({ chartEnt: chartEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let chart: ChartTab = result.value;

    return chart;
  }

  chartEntToTabResult(item: {
    chartEnt: ChartEnt;
  }): Result.Result<ChartTab, ChartEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<TabProps<ChartSt, ChartLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<ChartSt, ChartLt>({ ent: v.chartEnt })
      ),
      Result.map((v): ChartTab => ({ ...v.chartEnt, ...v.tabProps.props }))
    );
  }

  connectionEntToTab(connectionEnt: ConnectionEnt): ConnectionTab {
    if (isUndefined(connectionEnt)) {
      return;
    }

    let result: Result.Result<ConnectionTab, ConnectionEntToTabResultError> =
      this.connectionEntToTabResult({ connectionEnt: connectionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let connection: ConnectionTab = result.value;

    return connection;
  }

  connectionEntToTabResult(item: {
    connectionEnt: ConnectionEnt;
  }): Result.Result<ConnectionTab, ConnectionEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<ConnectionSt, ConnectionLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<ConnectionSt, ConnectionLt>({
            ent: v.connectionEnt
          })
      ),
      Result.map(
        (v): ConnectionTab => ({ ...v.connectionEnt, ...v.tabProps.props })
      )
    );
  }

  dashboardEntToTab(dashboardEnt: DashboardEnt): DashboardTab {
    if (isUndefined(dashboardEnt)) {
      return;
    }

    let result: Result.Result<DashboardTab, DashboardEntToTabResultError> =
      this.dashboardEntToTabResult({ dashboardEnt: dashboardEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let dashboard: DashboardTab = result.value;

    return dashboard;
  }

  dashboardEntToTabResult(item: {
    dashboardEnt: DashboardEnt;
  }): Result.Result<DashboardTab, DashboardEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<DashboardSt, DashboardLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<DashboardSt, DashboardLt>({
            ent: v.dashboardEnt
          })
      ),
      Result.map(
        (v): DashboardTab => ({ ...v.dashboardEnt, ...v.tabProps.props })
      )
    );
  }

  dconfigEntToTab(dconfigEnt: DconfigEnt): DconfigTab {
    if (isUndefined(dconfigEnt)) {
      return;
    }

    let result: Result.Result<DconfigTab, DconfigEntToTabResultError> =
      this.dconfigEntToTabResult({ dconfigEnt: dconfigEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let dconfig: DconfigTab = result.value;

    return dconfig;
  }

  dconfigEntToTabResult(item: {
    dconfigEnt: DconfigEnt;
  }): Result.Result<DconfigTab, DconfigEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<DconfigSt, DconfigLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<DconfigSt, DconfigLt>({
            ent: v.dconfigEnt
          })
      ),
      Result.map((v): DconfigTab => ({ ...v.dconfigEnt, ...v.tabProps.props }))
    );
  }

  uconfigEntToTab(uconfigEnt: UconfigEnt): UconfigTab {
    if (isUndefined(uconfigEnt)) {
      return;
    }

    let uconfig: UconfigTab = {
      ...uconfigEnt,
      ...this.getTabProps({ ent: uconfigEnt })
    };

    return uconfig;
  }

  givenEntToTab(givenEnt: GivenEnt): GivenTab {
    if (isUndefined(givenEnt)) {
      return;
    }

    let result: Result.Result<GivenTab, GivenEntToTabResultError> =
      this.givenEntToTabResult({ givenEnt: givenEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let given: GivenTab = result.value;

    return given;
  }

  givenEntToTabResult(item: {
    givenEnt: GivenEnt;
  }): Result.Result<GivenTab, GivenEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<TabProps<GivenSt, GivenLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<GivenSt, GivenLt>({ ent: v.givenEnt })
      ),
      Result.map((v): GivenTab => ({ ...v.givenEnt, ...v.tabProps.props }))
    );
  }

  roleEntToTab(roleEnt: RoleEnt): RoleTab {
    if (isUndefined(roleEnt)) {
      return;
    }

    let result: Result.Result<RoleTab, RoleEntToTabResultError> =
      this.roleEntToTabResult({ roleEnt: roleEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let role: RoleTab = result.value;

    return role;
  }

  roleEntToTabResult(item: {
    roleEnt: RoleEnt;
  }): Result.Result<RoleTab, RoleEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<RoleSt, RoleLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<RoleSt, RoleLt>({ ent: v.roleEnt })
      ),
      Result.map((v): RoleTab => ({ ...v.roleEnt, ...v.tabProps.props }))
    );
  }

  envEntToTab(envEnt: EnvEnt): EnvTab {
    if (isUndefined(envEnt)) {
      return;
    }

    let result: Result.Result<EnvTab, EnvEntToTabResultError> =
      this.envEntToTabResult({ envEnt: envEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let env: EnvTab = result.value;

    return env;
  }

  envEntToTabResult(item: {
    envEnt: EnvEnt;
  }): Result.Result<EnvTab, EnvEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<EnvSt, EnvLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<EnvSt, EnvLt>({ ent: v.envEnt })
      ),
      Result.map((v): EnvTab => ({ ...v.envEnt, ...v.tabProps.props }))
    );
  }

  kitEntToTab(kitEnt: KitEnt): KitTab {
    if (isUndefined(kitEnt)) {
      return;
    }

    let kit: KitTab = {
      ...kitEnt,
      ...this.getTabProps({ ent: kitEnt })
    };

    return kit;
  }

  mconfigEntToTab(mconfigEnt: MconfigEnt): MconfigTab {
    if (isUndefined(mconfigEnt)) {
      return;
    }

    let mconfig: MconfigTab = {
      ...mconfigEnt,
      ...this.getTabProps({ ent: mconfigEnt })
    };

    return mconfig;
  }

  memberEntToTab(memberEnt: MemberEnt): MemberTab {
    if (isUndefined(memberEnt)) {
      return;
    }

    let result: Result.Result<MemberTab, MemberEntToTabResultError> =
      this.memberEntToTabResult({ memberEnt: memberEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let member: MemberTab = result.value;

    return member;
  }

  memberEntToTabResult(item: {
    memberEnt: MemberEnt;
  }): Result.Result<MemberTab, MemberEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<MemberSt, MemberLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<MemberSt, MemberLt>({
            ent: v.memberEnt
          })
      ),
      Result.map((v): MemberTab => ({ ...v.memberEnt, ...v.tabProps.props }))
    );
  }

  modelEntToTab(modelEnt: ModelEnt): ModelTab {
    if (isUndefined(modelEnt)) {
      return;
    }

    let result: Result.Result<ModelTab, ModelEntToTabResultError> =
      this.modelEntToTabResult({ modelEnt: modelEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let model: ModelTab = result.value;

    return model;
  }

  modelEntToTabResult(item: {
    modelEnt: ModelEnt;
  }): Result.Result<ModelTab, ModelEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<TabProps<ModelSt, ModelLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<ModelSt, ModelLt>({ ent: v.modelEnt })
      ),
      Result.map((v): ModelTab => ({ ...v.modelEnt, ...v.tabProps.props }))
    );
  }

  noteEntToTab(noteEnt: NoteEnt): NoteTab {
    if (isUndefined(noteEnt)) {
      return;
    }

    let result: Result.Result<NoteTab, NoteEntToTabResultError> =
      this.noteEntToTabResult({ noteEnt: noteEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let note: NoteTab = result.value;

    return note;
  }

  noteEntToTabResult(item: {
    noteEnt: NoteEnt;
  }): Result.Result<NoteTab, NoteEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<NoteSt, NoteLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<NoteSt, NoteLt>({ ent: v.noteEnt })
      ),
      Result.map((v): NoteTab => ({ ...v.noteEnt, ...v.tabProps.props }))
    );
  }

  orgEntToTab(orgEnt: OrgEnt): OrgTab {
    if (isUndefined(orgEnt)) {
      return;
    }

    let result: Result.Result<OrgTab, OrgEntToTabResultError> =
      this.orgEntToTabResult({ orgEnt: orgEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let org: OrgTab = result.value;

    return org;
  }

  orgEntToTabResult(item: {
    orgEnt: OrgEnt;
  }): Result.Result<OrgTab, OrgEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<OrgSt, OrgLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<OrgSt, OrgLt>({ ent: v.orgEnt })
      ),
      Result.map((v): OrgTab => ({ ...v.orgEnt, ...v.tabProps.props }))
    );
  }

  projectEntToTab(projectEnt: ProjectEnt): ProjectTab {
    if (isUndefined(projectEnt)) {
      return;
    }

    let result: Result.Result<ProjectTab, ProjectEntToTabResultError> =
      this.projectEntToTabResult({ projectEnt: projectEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let project: ProjectTab = result.value;

    return project;
  }

  projectEntToTabResult(item: {
    projectEnt: ProjectEnt;
  }): Result.Result<ProjectTab, ProjectEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<ProjectSt, ProjectLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<ProjectSt, ProjectLt>({
            ent: v.projectEnt
          })
      ),
      Result.map((v): ProjectTab => ({ ...v.projectEnt, ...v.tabProps.props }))
    );
  }

  providerEntToTab(item: { providerEnt: ProviderEnt }): ProviderTab {
    let { providerEnt } = item;

    if (isUndefined(providerEnt)) {
      return;
    }

    let result: Result.Result<ProviderTab, ProviderEntToTabResultError> =
      this.providerEntToTabResult({ providerEnt: providerEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let provider: ProviderTab = result.value;

    return provider;
  }

  providerEntToTabResult(item: {
    providerEnt: ProviderEnt;
  }): Result.Result<ProviderTab, ProviderEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<ProviderSt, ProviderLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<ProviderSt, ProviderLt>({
            ent: v.providerEnt
          })
      ),
      Result.map(
        (v): ProviderTab =>
          ({ ...v.providerEnt, ...v.tabProps.props }) as ProviderTab
      )
    );
  }

  queryEntToTab(queryEnt: QueryEnt): QueryTab {
    if (isUndefined(queryEnt)) {
      return;
    }

    let query: QueryTab = {
      ...queryEnt,
      ...this.getTabProps({ ent: queryEnt })
    };

    return query;
  }

  reportEntToTab(reportEnt: ReportEnt): ReportTab {
    if (isUndefined(reportEnt)) {
      return;
    }

    let result: Result.Result<ReportTab, ReportEntToTabResultError> =
      this.reportEntToTabResult({ reportEnt: reportEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let report: ReportTab = result.value;

    return report;
  }

  reportEntToTabResult(item: {
    reportEnt: ReportEnt;
  }): Result.Result<ReportTab, ReportEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<ReportSt, ReportLt>,
          GetTabPropsResultError
        > => this.getTabPropsResult<ReportSt, ReportLt>({ ent: v.reportEnt })
      ),
      Result.map((v): ReportTab => ({ ...v.reportEnt, ...v.tabProps.props }))
    );
  }

  structEntToTab(structEnt: StructEnt): StructTab {
    if (isUndefined(structEnt)) {
      return;
    }

    let result: Result.Result<StructTab, StructEntToTabResultError> =
      this.structEntToTabResult({ structEnt: structEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let struct: StructTab = result.value;

    return struct;
  }

  structEntToTabResult(item: {
    structEnt: StructEnt;
  }): Result.Result<StructTab, StructEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<StructSt, StructLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<StructSt, StructLt>({
            ent: v.structEnt
          })
      ),
      Result.map((v): StructTab => ({ ...v.structEnt, ...v.tabProps.props }))
    );
  }

  userEntToTab(userEnt: UserEnt): UserTab {
    if (isUndefined(userEnt)) {
      return;
    }

    let result: Result.Result<UserTab, UserEntToTabResultError> =
      this.userEntToTabResult({ userEnt: userEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let user: UserTab = result.value;

    return user;
  }

  userEntToTabResult(item: {
    userEnt: UserEnt;
  }): Result.Result<UserTab, UserEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<UserSt, UserLt>, GetTabPropsResultError> =>
          this.getTabPropsResult<UserSt, UserLt>({ ent: v.userEnt })
      ),
      Result.map((v): UserTab => ({ ...v.userEnt, ...v.tabProps.props }))
    );
  }

  sessionEntToTab(sessionEnt: SessionEnt): SessionTab {
    if (isUndefined(sessionEnt)) {
      return;
    }

    let result: Result.Result<SessionTab, SessionEntToTabResultError> =
      this.sessionEntToTabResult({ sessionEnt: sessionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let session: SessionTab = result.value;

    return session;
  }

  sessionEntToTabResult(item: {
    sessionEnt: SessionEnt;
  }): Result.Result<SessionTab, SessionEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<SessionSt, SessionLt>,
          GetTabPropsResultError
        > => this.getTabPropsResult<SessionSt, SessionLt>({ ent: v.sessionEnt })
      ),
      Result.map((v): SessionTab => ({ ...v.sessionEnt, ...v.tabProps.props }))
    );
  }

  ocSessionEntToTab(ocSessionEnt: OcSessionEnt): OcSessionTab {
    if (isUndefined(ocSessionEnt)) {
      return;
    }

    let result: Result.Result<OcSessionTab, OcSessionEntToTabResultError> =
      this.ocSessionEntToTabResult({ ocSessionEnt: ocSessionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let ocSession: OcSessionTab = result.value;

    return ocSession;
  }

  ocSessionEntToTabResult(item: {
    ocSessionEnt: OcSessionEnt;
  }): Result.Result<OcSessionTab, OcSessionEntToTabResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<OcSessionSt, OcSessionLt>,
          GetTabPropsResultError
        > =>
          this.getTabPropsResult<OcSessionSt, OcSessionLt>({
            ent: v.ocSessionEnt
          })
      ),
      Result.map(
        (v): OcSessionTab => ({ ...v.ocSessionEnt, ...v.tabProps.props })
      )
    );
  }

  ocEventEntToTab(eventEnt: OcEventEnt): OcEventTab {
    if (isUndefined(eventEnt)) {
      return;
    }

    let event: OcEventTab = {
      ...eventEnt,
      ...this.getTabProps({ ent: eventEnt })
    };

    return event;
  }

  ocMessageEntToTab(messageEnt: OcMessageEnt): OcMessageTab {
    if (isUndefined(messageEnt)) {
      return;
    }

    let message: OcMessageTab = {
      ...messageEnt,
      ...this.getTabProps({ ent: messageEnt })
    };

    return message;
  }

  ocPartEntToTab(partEnt: OcPartEnt): OcPartTab {
    if (isUndefined(partEnt)) {
      return;
    }

    let part: OcPartTab = {
      ...partEnt,
      ...this.getTabProps({ ent: partEnt })
    };

    return part;
  }
}
