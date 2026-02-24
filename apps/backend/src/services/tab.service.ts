import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  EventTab,
  KitTab,
  MconfigTab,
  MemberTab,
  MessageTab,
  ModelTab,
  NoteTab,
  OrgTab,
  PartTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  SessionTab,
  StructTab,
  UconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { AvatarEnt } from '#backend/drizzle/postgres/schema/avatars';
import { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '#backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '#backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '#backend/drizzle/postgres/schema/dashboards';
import { DconfigEnt } from '#backend/drizzle/postgres/schema/dconfigs';
import { EnvEnt } from '#backend/drizzle/postgres/schema/envs';
import { EventEnt } from '#backend/drizzle/postgres/schema/events';
import { KitEnt } from '#backend/drizzle/postgres/schema/kits';
import { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { MessageEnt } from '#backend/drizzle/postgres/schema/messages';
import { ModelEnt } from '#backend/drizzle/postgres/schema/models';
import { NoteEnt } from '#backend/drizzle/postgres/schema/notes';
import { OrgEnt } from '#backend/drizzle/postgres/schema/orgs';
import { PartEnt } from '#backend/drizzle/postgres/schema/parts';
import { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import { SessionEnt } from '#backend/drizzle/postgres/schema/sessions';
import { StructEnt } from '#backend/drizzle/postgres/schema/structs';
import { UconfigEnt } from '#backend/drizzle/postgres/schema/uconfigs';
import { UserEnt } from '#backend/drizzle/postgres/schema/users';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { ProjectLt, ProjectSt } from '#common/interfaces/st-lt';
import { ServerError } from '#common/models/server-error';
import { decryptData } from '#node-common/functions/encrypt-decrypt';
import { TabToEntService } from './tab-to-ent.service';

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
  }) {
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
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS
      });
    }

    if (
      (isDefined(ent.st?.encrypted) || isDefined(ent.lt?.encrypted)) &&
      (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS
      });
    }

    if (
      isDefined(ent.keyTag) &&
      (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG
      });
    }

    if (
      isDefined(ent.keyTag) &&
      [this.keyTag, this.prevKeyTag].indexOf(ent.keyTag) < 0
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV
      });
    }

    let keyBuffer =
      isDefined(ent.keyTag) && ent.keyTag === this.keyTag
        ? this.keyBuffer
        : isDefined(ent.keyTag) && ent.keyTag === this.prevKeyTag
          ? this.prevKeyBuffer
          : undefined;

    return isDefined(ent.keyTag)
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

  createGitKeyPair() {
    let passPhrase = this.makePassPhrase();

    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
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

    return {
      publicKeyEncrypted: publicKey,
      privateKeyEncrypted: privateKey,
      passPhrase
    };
  }

  projectTabToBaseProject(item: {
    // tabService (no circular deps - membersService, projectsService)
    project: ProjectTab;
  }): BaseProject {
    let { project } = item;

    let projectSt: ProjectSt = {
      name: project.name,
      zenApiKey: undefined, // baseProject does not need project.zenApiKey
      anthropicApiKey: undefined, // baseProject does not need project.anthropicApiKey
      openaiApiKey: undefined, // baseProject does not need project.openaiApiKey
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

    let avatar: AvatarTab = {
      ...avatarEnt,
      ...this.getTabProps({ ent: avatarEnt })
    };

    return avatar;
  }

  branchEntToTab(branchEnt: BranchEnt): BranchTab {
    if (isUndefined(branchEnt)) {
      return;
    }

    let branch: BranchTab = {
      ...branchEnt,
      ...this.getTabProps({ ent: branchEnt })
    };

    return branch;
  }

  bridgeEntToTab(bridgeEnt: BridgeEnt): BridgeTab {
    if (isUndefined(bridgeEnt)) {
      return;
    }

    let bridge: BridgeTab = {
      ...bridgeEnt,
      ...this.getTabProps({ ent: bridgeEnt })
    };

    return bridge;
  }

  chartEntToTab(chartEnt: ChartEnt): ChartTab {
    if (isUndefined(chartEnt)) {
      return;
    }

    let chart: ChartTab = {
      ...chartEnt,
      ...this.getTabProps({ ent: chartEnt })
    };

    return chart;
  }

  connectionEntToTab(connectionEnt: ConnectionEnt): ConnectionTab {
    if (isUndefined(connectionEnt)) {
      return;
    }

    let connection: ConnectionTab = {
      ...connectionEnt,
      ...this.getTabProps({ ent: connectionEnt })
    };

    return connection;
  }

  dashboardEntToTab(dashboardEnt: DashboardEnt): DashboardTab {
    if (isUndefined(dashboardEnt)) {
      return;
    }

    let dashboard: DashboardTab = {
      ...dashboardEnt,
      ...this.getTabProps({ ent: dashboardEnt })
    };

    return dashboard;
  }

  dconfigEntToTab(dconfigEnt: DconfigEnt): DconfigTab {
    if (isUndefined(dconfigEnt)) {
      return;
    }

    let dconfig: DconfigTab = {
      ...dconfigEnt,
      ...this.getTabProps({ ent: dconfigEnt })
    };

    return dconfig;
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

  envEntToTab(envEnt: EnvEnt): EnvTab {
    if (isUndefined(envEnt)) {
      return;
    }

    let env: EnvTab = {
      ...envEnt,
      ...this.getTabProps({ ent: envEnt })
    };

    return env;
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

    let member: MemberTab = {
      ...memberEnt,
      ...this.getTabProps({ ent: memberEnt })
    };

    return member;
  }

  modelEntToTab(modelEnt: ModelEnt): ModelTab {
    if (isUndefined(modelEnt)) {
      return;
    }

    let model: ModelTab = {
      ...modelEnt,
      ...this.getTabProps({ ent: modelEnt })
    };

    return model;
  }

  noteEntToTab(noteEnt: NoteEnt): NoteTab {
    if (isUndefined(noteEnt)) {
      return;
    }

    let note: NoteTab = {
      ...noteEnt,
      ...this.getTabProps({ ent: noteEnt })
    };

    return note;
  }

  orgEntToTab(orgEnt: OrgEnt): OrgTab {
    if (isUndefined(orgEnt)) {
      return;
    }

    let org: OrgTab = {
      ...orgEnt,
      ...this.getTabProps({ ent: orgEnt })
    };

    return org;
  }

  projectEntToTab(projectEnt: ProjectEnt): ProjectTab {
    if (isUndefined(projectEnt)) {
      return;
    }

    let project: ProjectTab = {
      ...projectEnt,
      ...this.getTabProps({ ent: projectEnt })
    };

    return project;
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

    let report: ReportTab = {
      ...reportEnt,
      ...this.getTabProps({ ent: reportEnt })
    };

    return report;
  }

  structEntToTab(structEnt: StructEnt): StructTab {
    if (isUndefined(structEnt)) {
      return;
    }

    let struct: StructTab = {
      ...structEnt,
      ...this.getTabProps({ ent: structEnt })
    };

    return struct;
  }

  userEntToTab(userEnt: UserEnt): UserTab {
    if (isUndefined(userEnt)) {
      return;
    }

    let user: UserTab = {
      ...userEnt,
      ...this.getTabProps({ ent: userEnt })
    };

    return user;
  }

  sessionEntToTab(sessionEnt: SessionEnt): SessionTab {
    if (isUndefined(sessionEnt)) {
      return;
    }

    let session: SessionTab = {
      ...sessionEnt,
      ...this.getTabProps({ ent: sessionEnt })
    };

    return session;
  }

  eventEntToTab(eventEnt: EventEnt): EventTab {
    if (isUndefined(eventEnt)) {
      return;
    }

    let event: EventTab = {
      ...eventEnt,
      ...this.getTabProps({ ent: eventEnt })
    };

    return event;
  }

  messageEntToTab(messageEnt: MessageEnt): MessageTab {
    if (isUndefined(messageEnt)) {
      return;
    }

    let message: MessageTab = {
      ...messageEnt,
      ...this.getTabProps({ ent: messageEnt })
    };

    return message;
  }

  partEntToTab(partEnt: PartEnt): PartTab {
    if (isUndefined(partEnt)) {
      return;
    }

    let part: PartTab = {
      ...partEnt,
      ...this.getTabProps({ ent: partEnt })
    };

    return part;
  }
}
