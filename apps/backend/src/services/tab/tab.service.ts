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
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
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
import type { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
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
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { BranchEntToTabError } from '#common/types/backend/function-errors/branch-ent-to-tab-error';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { CachedColumnEntToTabError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-error';
import type { CachedPartEntToTabError } from '#common/types/backend/function-errors/cached-part-ent-to-tab-error';
import type { ChartEntToTabError } from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { DashboardEntToTabError } from '#common/types/backend/function-errors/dashboard-ent-to-tab-error';
import type { DconfigEntToTabError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import type { EnvEntToTabError } from '#common/types/backend/function-errors/env-ent-to-tab-error';
import type { GetTabPropsError } from '#common/types/backend/function-errors/get-tab-props-error';
import type { GivenEntToTabError } from '#common/types/backend/function-errors/given-ent-to-tab-error';
import type { KitEntToTabError } from '#common/types/backend/function-errors/kit-ent-to-tab-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { MemberEntToTabError } from '#common/types/backend/function-errors/member-ent-to-tab-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { NoteEntToTabError } from '#common/types/backend/function-errors/note-ent-to-tab-error';
import type { OcEventEntToTabError } from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { OrgEntToTabError } from '#common/types/backend/function-errors/org-ent-to-tab-error';
import type { ProjectEntToTabError } from '#common/types/backend/function-errors/project-ent-to-tab-error';
import type { ProviderEntToTabError } from '#common/types/backend/function-errors/provider-ent-to-tab-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { ReportEntToTabError } from '#common/types/backend/function-errors/report-ent-to-tab-error';
import type { RoleEntToTabError } from '#common/types/backend/function-errors/role-ent-to-tab-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { StructEntToTabError } from '#common/types/backend/function-errors/struct-ent-to-tab-error';
import type { UconfigEntToTabError } from '#common/types/backend/function-errors/uconfig-ent-to-tab-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
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
      st: {
        encrypted: string;
        decrypted: ST;
      };
      lt: {
        encrypted: string;
        decrypted: LT;
      };
      keyTag: string;
    };
  }): Result.Result<TabProps<ST, LT>, GetTabPropsError> {
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

  avatarEntToTabUnwrap(avatarEnt: AvatarEnt): AvatarTab {
    if (isUndefined(avatarEnt)) {
      return;
    }

    let result: Result.Result<AvatarTab, AvatarEntToTabError> =
      this.avatarEntToTab({ avatarEnt: avatarEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let avatar: AvatarTab = result.value;

    return avatar;
  }

  avatarEntToTab(item: {
    avatarEnt: AvatarEnt;
  }): Result.Result<AvatarTab, AvatarEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<AvatarSt, AvatarLt>, GetTabPropsError> =>
          this.getTabProps<AvatarSt, AvatarLt>({
            ent: v.avatarEnt
          })
      ),
      Result.map((v): AvatarTab => ({ ...v.avatarEnt, ...v.tabProps.props }))
    );
  }

  branchEntToTabUnwrap(branchEnt: BranchEnt): BranchTab {
    if (isUndefined(branchEnt)) {
      return;
    }

    let result: Result.Result<BranchTab, BranchEntToTabError> =
      this.branchEntToTab({ branchEnt: branchEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let branch: BranchTab = result.value;

    return branch;
  }

  branchEntToTab(item: {
    branchEnt: BranchEnt;
  }): Result.Result<BranchTab, BranchEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<BranchSt, BranchLt>, GetTabPropsError> =>
          this.getTabProps<BranchSt, BranchLt>({
            ent: v.branchEnt
          })
      ),
      Result.map((v): BranchTab => ({ ...v.branchEnt, ...v.tabProps.props }))
    );
  }

  bridgeEntToTabUnwrap(bridgeEnt: BridgeEnt): BridgeTab {
    if (isUndefined(bridgeEnt)) {
      return;
    }

    let result: Result.Result<BridgeTab, BridgeEntToTabError> =
      this.bridgeEntToTab({ bridgeEnt: bridgeEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let bridge: BridgeTab = result.value;

    return bridge;
  }

  bridgeEntToTab(item: {
    bridgeEnt: BridgeEnt;
  }): Result.Result<BridgeTab, BridgeEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<BridgeSt, BridgeLt>, GetTabPropsError> =>
          this.getTabProps<BridgeSt, BridgeLt>({
            ent: v.bridgeEnt
          })
      ),
      Result.map((v): BridgeTab => ({ ...v.bridgeEnt, ...v.tabProps.props }))
    );
  }

  cachedColumnEntToTabUnwrap(
    cachedColumnEnt: CachedColumnsEnt
  ): CachedColumnTab {
    if (isUndefined(cachedColumnEnt)) {
      return;
    }

    let result: Result.Result<CachedColumnTab, CachedColumnEntToTabError> =
      this.cachedColumnEntToTab({ cachedColumnEnt: cachedColumnEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let cachedColumn: CachedColumnTab = result.value;

    return cachedColumn;
  }

  cachedColumnEntToTab(item: {
    cachedColumnEnt: CachedColumnsEnt;
  }): Result.Result<CachedColumnTab, CachedColumnEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<CachedColumnSt, CachedColumnLt>,
          GetTabPropsError
        > =>
          this.getTabProps<CachedColumnSt, CachedColumnLt>({
            ent: v.cachedColumnEnt
          })
      ),
      Result.map(
        (v): CachedColumnTab => ({ ...v.cachedColumnEnt, ...v.tabProps.props })
      )
    );
  }

  cachedPartEntToTabUnwrap(cachedPartEnt: CachedPartsEnt): CachedPartTab {
    if (isUndefined(cachedPartEnt)) {
      return;
    }

    let result: Result.Result<CachedPartTab, CachedPartEntToTabError> =
      this.cachedPartEntToTab({ cachedPartEnt: cachedPartEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let cachedPart: CachedPartTab = result.value;

    return cachedPart;
  }

  cachedPartEntToTab(item: {
    cachedPartEnt: CachedPartsEnt;
  }): Result.Result<CachedPartTab, CachedPartEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<CachedPartSt, CachedPartLt>,
          GetTabPropsError
        > =>
          this.getTabProps<CachedPartSt, CachedPartLt>({
            ent: v.cachedPartEnt
          })
      ),
      Result.map(
        (v): CachedPartTab => ({ ...v.cachedPartEnt, ...v.tabProps.props })
      )
    );
  }

  chartEntToTabUnwrap(chartEnt: ChartEnt): ChartTab {
    if (isUndefined(chartEnt)) {
      return;
    }

    let result: Result.Result<ChartTab, ChartEntToTabError> =
      this.chartEntToTab({ chartEnt: chartEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let chart: ChartTab = result.value;

    return chart;
  }

  chartEntToTab(item: {
    chartEnt: ChartEnt;
  }): Result.Result<ChartTab, ChartEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<ChartSt, ChartLt>, GetTabPropsError> =>
          this.getTabProps<ChartSt, ChartLt>({ ent: v.chartEnt })
      ),
      Result.map((v): ChartTab => ({ ...v.chartEnt, ...v.tabProps.props }))
    );
  }

  connectionEntToTabUnwrap(connectionEnt: ConnectionEnt): ConnectionTab {
    if (isUndefined(connectionEnt)) {
      return;
    }

    let result: Result.Result<ConnectionTab, ConnectionEntToTabError> =
      this.connectionEntToTab({ connectionEnt: connectionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let connection: ConnectionTab = result.value;

    return connection;
  }

  connectionEntToTab(item: {
    connectionEnt: ConnectionEnt;
  }): Result.Result<ConnectionTab, ConnectionEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<ConnectionSt, ConnectionLt>,
          GetTabPropsError
        > =>
          this.getTabProps<ConnectionSt, ConnectionLt>({
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

    let result: Result.Result<DashboardTab, DashboardEntToTabError> =
      this.dashboardEntToTabResult({ dashboardEnt: dashboardEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let dashboard: DashboardTab = result.value;

    return dashboard;
  }

  dashboardEntToTabResult(item: {
    dashboardEnt: DashboardEnt;
  }): Result.Result<DashboardTab, DashboardEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<DashboardSt, DashboardLt>,
          GetTabPropsError
        > =>
          this.getTabProps<DashboardSt, DashboardLt>({
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

    let result: Result.Result<DconfigTab, DconfigEntToTabError> =
      this.dconfigEntToTabResult({ dconfigEnt: dconfigEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let dconfig: DconfigTab = result.value;

    return dconfig;
  }

  dconfigEntToTabResult(item: {
    dconfigEnt: DconfigEnt;
  }): Result.Result<DconfigTab, DconfigEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<DconfigSt, DconfigLt>, GetTabPropsError> =>
          this.getTabProps<DconfigSt, DconfigLt>({
            ent: v.dconfigEnt
          })
      ),
      Result.map((v): DconfigTab => ({ ...v.dconfigEnt, ...v.tabProps.props }))
    );
  }

  uconfigEntToTabUnwrap(uconfigEnt: UconfigEnt): UconfigTab {
    if (isUndefined(uconfigEnt)) {
      return;
    }

    let result: Result.Result<UconfigTab, UconfigEntToTabError> =
      this.uconfigEntToTab({ uconfigEnt: uconfigEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let uconfig: UconfigTab = result.value;

    return uconfig;
  }

  uconfigEntToTab(item: {
    uconfigEnt: UconfigEnt;
  }): Result.Result<UconfigTab, UconfigEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<UconfigSt, UconfigLt>, GetTabPropsError> =>
          this.getTabProps<UconfigSt, UconfigLt>({ ent: v.uconfigEnt })
      ),
      Result.map((v): UconfigTab => ({ ...v.uconfigEnt, ...v.tabProps.props }))
    );
  }

  givenEntToTab(item: {
    givenEnt: GivenEnt;
  }): Result.Result<GivenTab, GivenEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<GivenSt, GivenLt>, GetTabPropsError> =>
          this.getTabProps<GivenSt, GivenLt>({ ent: v.givenEnt })
      ),
      Result.map((v): GivenTab => ({ ...v.givenEnt, ...v.tabProps.props }))
    );
  }

  roleEntToTab(item: {
    roleEnt: RoleEnt;
  }): Result.Result<RoleTab, RoleEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<RoleSt, RoleLt>, GetTabPropsError> =>
          this.getTabProps<RoleSt, RoleLt>({ ent: v.roleEnt })
      ),
      Result.map((v): RoleTab => ({ ...v.roleEnt, ...v.tabProps.props }))
    );
  }

  envEntToTabUnwrap(envEnt: EnvEnt): EnvTab {
    if (isUndefined(envEnt)) {
      return;
    }

    let result: Result.Result<EnvTab, EnvEntToTabError> = this.envEntToTab({
      envEnt: envEnt
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let env: EnvTab = result.value;

    return env;
  }

  envEntToTab(item: {
    envEnt: EnvEnt;
  }): Result.Result<EnvTab, EnvEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<EnvSt, EnvLt>, GetTabPropsError> =>
          this.getTabProps<EnvSt, EnvLt>({ ent: v.envEnt })
      ),
      Result.map((v): EnvTab => ({ ...v.envEnt, ...v.tabProps.props }))
    );
  }

  kitEntToTabUnwrap(kitEnt: KitEnt): KitTab {
    if (isUndefined(kitEnt)) {
      return;
    }

    let result: Result.Result<KitTab, KitEntToTabError> = this.kitEntToTab({
      kitEnt: kitEnt
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let kit: KitTab = result.value;

    return kit;
  }

  kitEntToTab(item: {
    kitEnt: KitEnt;
  }): Result.Result<KitTab, KitEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<KitSt, KitLt>, GetTabPropsError> =>
          this.getTabProps<KitSt, KitLt>({ ent: v.kitEnt })
      ),
      Result.map((v): KitTab => ({ ...v.kitEnt, ...v.tabProps.props }))
    );
  }

  mconfigEntToTabUnwrap(mconfigEnt: MconfigEnt): MconfigTab {
    if (isUndefined(mconfigEnt)) {
      return;
    }

    let result: Result.Result<MconfigTab, MconfigEntToTabError> =
      this.mconfigEntToTab({ mconfigEnt: mconfigEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let mconfig: MconfigTab = result.value;

    return mconfig;
  }

  mconfigEntToTab(item: {
    mconfigEnt: MconfigEnt;
  }): Result.Result<MconfigTab, MconfigEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<MconfigSt, MconfigLt>, GetTabPropsError> =>
          this.getTabProps<MconfigSt, MconfigLt>({ ent: v.mconfigEnt })
      ),
      Result.map((v): MconfigTab => ({ ...v.mconfigEnt, ...v.tabProps.props }))
    );
  }

  memberEntToTabUnwrap(memberEnt: MemberEnt): MemberTab {
    if (isUndefined(memberEnt)) {
      return;
    }

    let result: Result.Result<MemberTab, MemberEntToTabError> =
      this.memberEntToTab({ memberEnt: memberEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let member: MemberTab = result.value;

    return member;
  }

  memberEntToTab(item: {
    memberEnt: MemberEnt;
  }): Result.Result<MemberTab, MemberEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<MemberSt, MemberLt>, GetTabPropsError> =>
          this.getTabProps<MemberSt, MemberLt>({
            ent: v.memberEnt
          })
      ),
      Result.map((v): MemberTab => ({ ...v.memberEnt, ...v.tabProps.props }))
    );
  }

  modelEntToTabUnwrap(modelEnt: ModelEnt): ModelTab {
    if (isUndefined(modelEnt)) {
      return;
    }

    let result: Result.Result<ModelTab, ModelEntToTabError> =
      this.modelEntToTab({ modelEnt: modelEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let model: ModelTab = result.value;

    return model;
  }

  modelEntToTab(item: {
    modelEnt: ModelEnt;
  }): Result.Result<ModelTab, ModelEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<ModelSt, ModelLt>, GetTabPropsError> =>
          this.getTabProps<ModelSt, ModelLt>({ ent: v.modelEnt })
      ),
      Result.map((v): ModelTab => ({ ...v.modelEnt, ...v.tabProps.props }))
    );
  }

  noteEntToTabUnwrap(noteEnt: NoteEnt): NoteTab {
    if (isUndefined(noteEnt)) {
      return;
    }

    let result: Result.Result<NoteTab, NoteEntToTabError> = this.noteEntToTab({
      noteEnt: noteEnt
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let note: NoteTab = result.value;

    return note;
  }

  noteEntToTab(item: {
    noteEnt: NoteEnt;
  }): Result.Result<NoteTab, NoteEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<NoteSt, NoteLt>, GetTabPropsError> =>
          this.getTabProps<NoteSt, NoteLt>({ ent: v.noteEnt })
      ),
      Result.map((v): NoteTab => ({ ...v.noteEnt, ...v.tabProps.props }))
    );
  }

  orgEntToTabUnwrap(orgEnt: OrgEnt): OrgTab {
    if (isUndefined(orgEnt)) {
      return;
    }

    let result: Result.Result<OrgTab, OrgEntToTabError> = this.orgEntToTab({
      orgEnt: orgEnt
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let org: OrgTab = result.value;

    return org;
  }

  orgEntToTab(item: {
    orgEnt: OrgEnt;
  }): Result.Result<OrgTab, OrgEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<OrgSt, OrgLt>, GetTabPropsError> =>
          this.getTabProps<OrgSt, OrgLt>({ ent: v.orgEnt })
      ),
      Result.map((v): OrgTab => ({ ...v.orgEnt, ...v.tabProps.props }))
    );
  }

  projectEntToTabUnwrap(projectEnt: ProjectEnt): ProjectTab {
    if (isUndefined(projectEnt)) {
      return;
    }

    let result: Result.Result<ProjectTab, ProjectEntToTabError> =
      this.projectEntToTab({ projectEnt: projectEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let project: ProjectTab = result.value;

    return project;
  }

  projectEntToTab(item: {
    projectEnt: ProjectEnt;
  }): Result.Result<ProjectTab, ProjectEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<ProjectSt, ProjectLt>, GetTabPropsError> =>
          this.getTabProps<ProjectSt, ProjectLt>({
            ent: v.projectEnt
          })
      ),
      Result.map((v): ProjectTab => ({ ...v.projectEnt, ...v.tabProps.props }))
    );
  }

  providerEntToTabUnwrap(item: { providerEnt: ProviderEnt }): ProviderTab {
    let { providerEnt } = item;

    if (isUndefined(providerEnt)) {
      return;
    }

    let result: Result.Result<ProviderTab, ProviderEntToTabError> =
      this.providerEntToTab({ providerEnt: providerEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let provider: ProviderTab = result.value;

    return provider;
  }

  providerEntToTab(item: {
    providerEnt: ProviderEnt;
  }): Result.Result<ProviderTab, ProviderEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<TabProps<ProviderSt, ProviderLt>, GetTabPropsError> =>
          this.getTabProps<ProviderSt, ProviderLt>({
            ent: v.providerEnt
          })
      ),
      Result.map(
        (v): ProviderTab =>
          ({ ...v.providerEnt, ...v.tabProps.props }) as ProviderTab
      )
    );
  }

  queryEntToTabUnwrap(queryEnt: QueryEnt): QueryTab {
    if (isUndefined(queryEnt)) {
      return;
    }

    let result: Result.Result<QueryTab, QueryEntToTabError> =
      this.queryEntToTab({ queryEnt: queryEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let query: QueryTab = result.value;

    return query;
  }

  queryEntToTab(item: {
    queryEnt: QueryEnt;
  }): Result.Result<QueryTab, QueryEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<QuerySt, QueryLt>, GetTabPropsError> =>
          this.getTabProps<QuerySt, QueryLt>({ ent: v.queryEnt })
      ),
      Result.map((v): QueryTab => ({ ...v.queryEnt, ...v.tabProps.props }))
    );
  }

  reportEntToTabUnwrap(reportEnt: ReportEnt): ReportTab {
    if (isUndefined(reportEnt)) {
      return;
    }

    let result: Result.Result<ReportTab, ReportEntToTabError> =
      this.reportEntToTab({ reportEnt: reportEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let report: ReportTab = result.value;

    return report;
  }

  reportEntToTab(item: {
    reportEnt: ReportEnt;
  }): Result.Result<ReportTab, ReportEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<ReportSt, ReportLt>, GetTabPropsError> =>
          this.getTabProps<ReportSt, ReportLt>({ ent: v.reportEnt })
      ),
      Result.map((v): ReportTab => ({ ...v.reportEnt, ...v.tabProps.props }))
    );
  }

  structEntToTabUnwrap(structEnt: StructEnt): StructTab {
    if (isUndefined(structEnt)) {
      return;
    }

    let result: Result.Result<StructTab, StructEntToTabError> =
      this.structEntToTab({ structEnt: structEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let struct: StructTab = result.value;

    return struct;
  }

  structEntToTab(item: {
    structEnt: StructEnt;
  }): Result.Result<StructTab, StructEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<StructSt, StructLt>, GetTabPropsError> =>
          this.getTabProps<StructSt, StructLt>({
            ent: v.structEnt
          })
      ),
      Result.map((v): StructTab => ({ ...v.structEnt, ...v.tabProps.props }))
    );
  }

  userEntToTabUnwrap(userEnt: UserEnt): UserTab {
    if (isUndefined(userEnt)) {
      return;
    }

    let result: Result.Result<UserTab, UserEntToTabError> = this.userEntToTab({
      userEnt: userEnt
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let user: UserTab = result.value;

    return user;
  }

  userEntToTab(item: {
    userEnt: UserEnt;
  }): Result.Result<UserTab, UserEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<UserSt, UserLt>, GetTabPropsError> =>
          this.getTabProps<UserSt, UserLt>({ ent: v.userEnt })
      ),
      Result.map((v): UserTab => ({ ...v.userEnt, ...v.tabProps.props }))
    );
  }

  sessionEntToTabUnwrap(sessionEnt: SessionEnt): SessionTab {
    if (isUndefined(sessionEnt)) {
      return;
    }

    let result: Result.Result<SessionTab, SessionEntToTabError> =
      this.sessionEntToTab({ sessionEnt: sessionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let session: SessionTab = result.value;

    return session;
  }

  sessionEntToTab(item: {
    sessionEnt: SessionEnt;
  }): Result.Result<SessionTab, SessionEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<SessionSt, SessionLt>, GetTabPropsError> =>
          this.getTabProps<SessionSt, SessionLt>({ ent: v.sessionEnt })
      ),
      Result.map((v): SessionTab => ({ ...v.sessionEnt, ...v.tabProps.props }))
    );
  }

  ocSessionEntToTabUnwrap(ocSessionEnt: OcSessionEnt): OcSessionTab {
    if (isUndefined(ocSessionEnt)) {
      return;
    }

    let result: Result.Result<OcSessionTab, OcSessionEntToTabError> =
      this.ocSessionEntToTab({ ocSessionEnt: ocSessionEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let ocSession: OcSessionTab = result.value;

    return ocSession;
  }

  ocSessionEntToTab(item: {
    ocSessionEnt: OcSessionEnt;
  }): Result.Result<OcSessionTab, OcSessionEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<OcSessionSt, OcSessionLt>,
          GetTabPropsError
        > =>
          this.getTabProps<OcSessionSt, OcSessionLt>({
            ent: v.ocSessionEnt
          })
      ),
      Result.map(
        (v): OcSessionTab => ({ ...v.ocSessionEnt, ...v.tabProps.props })
      )
    );
  }

  ocEventEntToTabUnwrap(eventEnt: OcEventEnt): OcEventTab {
    if (isUndefined(eventEnt)) {
      return;
    }

    let result: Result.Result<OcEventTab, OcEventEntToTabError> =
      this.ocEventEntToTab({ eventEnt: eventEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let event: OcEventTab = result.value;

    return event;
  }

  ocEventEntToTab(item: {
    eventEnt: OcEventEnt;
  }): Result.Result<OcEventTab, OcEventEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<OcEventSt, OcEventLt>, GetTabPropsError> =>
          this.getTabProps<OcEventSt, OcEventLt>({ ent: v.eventEnt })
      ),
      Result.map((v): OcEventTab => ({ ...v.eventEnt, ...v.tabProps.props }))
    );
  }

  ocMessageEntToTabUnwrap(messageEnt: OcMessageEnt): OcMessageTab {
    if (isUndefined(messageEnt)) {
      return;
    }

    let result: Result.Result<OcMessageTab, OcMessageEntToTabError> =
      this.ocMessageEntToTab({ messageEnt: messageEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let message: OcMessageTab = result.value;

    return message;
  }

  ocMessageEntToTab(item: {
    messageEnt: OcMessageEnt;
  }): Result.Result<OcMessageTab, OcMessageEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (
          v
        ): Result.Result<
          TabProps<OcMessageSt, OcMessageLt>,
          GetTabPropsError
        > =>
          this.getTabProps<OcMessageSt, OcMessageLt>({
            ent: v.messageEnt
          })
      ),
      Result.map(
        (v): OcMessageTab => ({ ...v.messageEnt, ...v.tabProps.props })
      )
    );
  }

  ocPartEntToTabUnwrap(partEnt: OcPartEnt): OcPartTab {
    if (isUndefined(partEnt)) {
      return;
    }

    let result: Result.Result<OcPartTab, OcPartEntToTabError> =
      this.ocPartEntToTab({ partEnt: partEnt });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let part: OcPartTab = result.value;

    return part;
  }

  ocPartEntToTab(item: {
    partEnt: OcPartEnt;
  }): Result.Result<OcPartTab, OcPartEntToTabError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'tabProps',
        (v): Result.Result<TabProps<OcPartSt, OcPartLt>, GetTabPropsError> =>
          this.getTabProps<OcPartSt, OcPartLt>({ ent: v.partEnt })
      ),
      Result.map((v): OcPartTab => ({ ...v.partEnt, ...v.tabProps.props }))
    );
  }
}
