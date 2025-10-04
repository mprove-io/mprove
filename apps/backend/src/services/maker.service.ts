import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
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
import { ConnectionTab } from '~common/interfaces/backend/connection/connection-tab';
import { ConnectionTabOptions } from '~common/interfaces/backend/connection/connection-tab-options';
import { Ev } from '~common/interfaces/backend/ev';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { encryptData } from '~node-common/functions/encryption/encrypt-data';
import { HashService } from './hash.service';

@Injectable()
export class MakerService {
  constructor(
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>
  ) {}

  makeMember(item: {
    projectId: string;
    roles?: string[];
    envs?: string[];
    user: UserEnt;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }) {
    let { projectId, roles, envs, user, isAdmin, isEditor, isExplorer } = item;

    let member: MemberEnt = {
      memberFullId: this.hashService.makeMemberFullId({
        projectId: projectId,
        memberId: user.userId
      }),
      projectId: projectId,
      memberId: user.userId,
      email: user.email,
      alias: user.alias,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: roles || [],
      isAdmin: isAdmin,
      isEditor: isEditor,
      isExplorer: isExplorer,
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
  }) {
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

  makeBranch(item: { projectId: string; repoId: string; branchId: string }) {
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

  makeEnv(item: { projectId: string; envId: string; evs: Ev[] }) {
    let { projectId, envId, evs } = item;

    let env: EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: projectId,
        envId: envId
      }),
      projectId: projectId,
      envId: envId,
      evs: evs,
      memberIds: [],
      isFallbackToProdConnections: true,
      isFallbackToProdVariables: true,
      serverTs: undefined
    };

    return env;
  }

  makeConnection(item: {
    projectId: string;
    connectionId: string;
    envId: string;
    type: ConnectionTypeEnum;
    options: ConnectionTabOptions;
  }) {
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

    let connectionTab: ConnectionTab = { options: options };

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
      tab: encryptData({
        data: connectionTab,
        keyBase64: this.cs.get<BackendConfig['backendAesKey']>('backendAesKey')
      }),
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
  }) {
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

    let report: ReportEnt = {
      reportFullId: this.hashService.makeReportFullId({
        structId: structId,
        reportId: reportId
      }),
      structId: structId,
      reportId: reportId,
      projectId: projectId,
      creatorId: creatorId,
      filePath: filePath,
      accessRoles: accessRoles,
      title: title,
      fields: fields,
      rows: rows,
      chart: chart,
      draft: draft,
      draftCreatedTs: draftCreatedTs,
      serverTs: undefined
    };

    return report;
  }
}
