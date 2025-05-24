import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { HashService } from './hash.service';

@Injectable()
export class MakerService {
  constructor(private hashService: HashService) {}

  makeMember(item: {
    projectId: string;
    roles?: string[];
    envs?: string[];
    user: schemaPostgres.UserEnt;
    isAdmin: boolean;
    isEditor: boolean;
    isExplorer: boolean;
  }) {
    let { projectId, roles, envs, user, isAdmin, isEditor, isExplorer } = item;

    let member: schemaPostgres.MemberEnt = {
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

    let bridge: schemaPostgres.BridgeEnt = {
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

    let branch: schemaPostgres.BranchEnt = {
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

  makeEnv(item: { projectId: string; envId: string; evs: common.Ev[] }) {
    let { projectId, envId, evs } = item;

    let env: schemaPostgres.EnvEnt = {
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
    type: common.ConnectionTypeEnum;
    baseUrl: string;
    headers: common.ConnectionHeader[];
    googleAuthScopes: string[];
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    account: string;
    warehouse: string;
    serviceAccountCredentials: any;
    bigqueryQuerySizeLimitGb: number;
    isSSL: boolean;
  }) {
    let {
      projectId,
      connectionId,
      envId,
      type,
      isSSL,
      baseUrl,
      headers,
      googleAuthScopes,
      host,
      port,
      database,
      username,
      password,
      account,
      warehouse,
      serviceAccountCredentials,
      bigqueryQuerySizeLimitGb
    } = item;

    let connection: schemaPostgres.ConnectionEnt = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: projectId,
        envId: envId,
        connectionId: connectionId
      }),
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      baseUrl: baseUrl,
      headers: headers,
      googleAuthScopes: googleAuthScopes,
      serviceAccountCredentials: serviceAccountCredentials,
      googleCloudProject: serviceAccountCredentials?.project_id,
      googleCloudClientEmail: serviceAccountCredentials?.client_email,
      googleAccessToken: undefined,
      bigqueryQuerySizeLimitGb:
        common.isDefined(bigqueryQuerySizeLimitGb) &&
        bigqueryQuerySizeLimitGb > 0
          ? bigqueryQuerySizeLimitGb
          : constants.DEFAULT_QUERY_SIZE_LIMIT,
      account: account,
      warehouse: warehouse,
      host: host,
      port: port,
      database: database,
      username: username,
      password: password,
      isSsl: isSSL,
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
    fields: common.ReportField[];
    rows: common.Row[];
    chart: common.MconfigChart;
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

    let report: schemaPostgres.ReportEnt = {
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
