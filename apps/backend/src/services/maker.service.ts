import { Injectable } from '@nestjs/common';
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { DEFAULT_QUERY_SIZE_LIMIT } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { ConnectionOptions } from '~common/interfaces/backend/connection-parts/connection-options';
import { ConnectionSt } from '~common/interfaces/backend/connection-parts/connection-tab';
import { EnvTab } from '~common/interfaces/backend/env-tab';
import { Ev } from '~common/interfaces/backend/ev';
import { MemberTab } from '~common/interfaces/backend/member-tab';
import { ReportTab } from '~common/interfaces/backend/report-tab';
import { UserTab } from '~common/interfaces/backend/user-tab';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { HashService } from './hash.service';
import { TabService } from './tab.service';

@Injectable()
export class EntMakerService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  makeMember(item: {
    projectId: string;
    roles?: string[];
    envs?: string[];
    user: UserEnt;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }): MemberEnt {
    let { projectId, roles, envs, user, isAdmin, isEditor, isExplorer } = item;

    let userTab = this.tabService.decrypt<UserTab>({
      encryptedString: user.tab
    });

    let memberTab: MemberTab = {
      email: userTab.email,
      alias: userTab.alias,
      firstName: userTab.firstName,
      lastName: userTab.lastName,
      roles: roles || []
    };

    let member: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: projectId,
        memberId: user.userId
      }),
      projectId: projectId,
      memberId: user.userId,
      emailHash: this.hashService.makeHash(userTab.email),
      aliasHash: this.hashService.makeHash(userTab.alias),
      isAdmin: isAdmin,
      isEditor: isEditor,
      isExplorer: isExplorer,
      tab: this.tabService.encrypt({
        data: memberTab
      }),
      serverTs: undefined
    };

    return member;
  }

  makeBridge(item: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    structId: string;
    needValidate: boolean;
  }): BridgeEnt {
    let { projectId, repoId, branchId, envId, structId, needValidate } = item;

    let bridge: BridgeEnt = {
      bridgeFullId: this.hashService.makeBridgeFullId({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId
      }),
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId,
      structId: structId,
      needValidate: needValidate,
      serverTs: undefined
    };

    return bridge;
  }

  makeBranch(item: {
    projectId: string;
    repoId: string;
    branchId: string;
  }): BranchEnt {
    let { projectId, repoId, branchId } = item;

    let branch: BranchEnt = {
      branchFullId: this.hashService.makeBranchFullId({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId
      }),
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      serverTs: undefined
    };

    return branch;
  }

  makeEnv(item: { projectId: string; envId: string; evs: Ev[] }): EnvEnt {
    let { projectId, envId, evs } = item;

    let envTab: EnvTab = {
      evs: evs
    };

    let env: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: projectId,
        envId: envId
      }),
      projectId: projectId,
      envId: envId,
      memberIds: [],
      isFallbackToProdConnections: true,
      isFallbackToProdVariables: true,
      tab: this.tabService.encrypt({ data: envTab }),
      serverTs: undefined
    };

    return env;
  }

  makeConnection(item: {
    projectId: string;
    connectionId: string;
    envId: string;
    type: ConnectionTypeEnum;
    options: ConnectionOptions;
  }): ConnectionEnt {
    let { projectId, connectionId, envId, type, options } = item;

    if (isDefined(options.storeGoogleApi)) {
      options.storeGoogleApi.googleCloudProject =
        options.storeGoogleApi.serviceAccountCredentials?.project_id;

      options.storeGoogleApi.googleCloudClientEmail =
        options.storeGoogleApi.serviceAccountCredentials?.client_email;
    }

    if (isDefined(options.bigquery)) {
      options.bigquery.googleCloudProject =
        options.bigquery.serviceAccountCredentials?.project_id;

      options.bigquery.googleCloudClientEmail =
        options.bigquery.serviceAccountCredentials?.client_email;

      let slimit = options.bigquery.bigqueryQuerySizeLimitGb;

      options.bigquery.bigqueryQuerySizeLimitGb =
        isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
    }

    let connectionSt: ConnectionSt = { options: options };

    let connection: ConnectionEnt = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: projectId,
        envId: envId,
        connectionId: connectionId
      }),
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      tab: this.tabService.encrypt({ data: connectionSt }),
      serverTs: undefined
    };

    return connection;
  }

  makeReport(item: {
    structId: string;
    reportId: string;
    projectId: string;
    creatorId: string;
    filePath: string;
    accessRoles: string[];
    title: string;
    fields: ReportField[];
    rows: Row[];
    chart: MconfigChart;
    draftCreatedTs?: number;
    draft: boolean;
  }): ReportEnt {
    let {
      structId,
      reportId,
      projectId,
      creatorId,
      filePath,
      accessRoles,
      title,
      fields,
      rows,
      chart,
      draft,
      draftCreatedTs
    } = item;

    let reportTab: ReportTab = {
      filePath: filePath,
      accessRoles: accessRoles,
      title: title,
      fields: fields,
      rows: rows,
      chart: chart
    };

    let report: ReportEnt = {
      reportFullId: this.hashService.makeReportFullId({
        structId: structId,
        reportId: reportId
      }),
      structId: structId,
      reportId: reportId,
      projectId: projectId,
      creatorId: creatorId,
      draft: draft,
      draftCreatedTs: draftCreatedTs,
      tab: this.tabService.encrypt({ data: reportTab }),
      serverTs: undefined
    };

    return report;
  }
}
