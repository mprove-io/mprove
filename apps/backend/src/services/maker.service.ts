import { Injectable } from '@nestjs/common';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { HashService } from './hash.service';

@Injectable()
export class MakerService {
  constructor(private hashService: HashService) {}

  makeReport(item: {
    structId: string;
    reportId: string;
    projectId: string;
    creatorId: string;
    filePath: string;
    accessUsers: string[];
    accessRoles: string[];
    title: string;
    rows: common.Row[];
    draftCreatedTs?: number;
    draft: boolean;
  }) {
    let {
      structId,
      reportId,
      projectId,
      creatorId,
      filePath,
      accessUsers,
      accessRoles,
      title,
      rows,
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
      accessUsers: accessUsers,
      accessRoles: accessRoles,
      title: title,
      rows: rows,
      draft: draft,
      draftCreatedTs: draftCreatedTs,
      serverTs: undefined
    };

    return report;
  }

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
      envs: envs || [],
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

  makeEnv(item: { projectId: string; envId: string }) {
    let { projectId, envId } = item;

    let env: schemaPostgres.EnvEnt = {
      envFullId: this.hashService.makeEnvFullId({
        projectId: projectId,
        envId: envId
      }),
      projectId: projectId,
      envId: envId,
      serverTs: undefined
    };

    return env;
  }

  makeEv(item: {
    projectId: string;
    envId: string;
    evId: string;
    val: string;
  }) {
    let { projectId, envId, evId, val } = item;

    let ev: schemaPostgres.EvEnt = {
      evFullId: this.hashService.makeEvFullId({
        projectId: projectId,
        envId: envId,
        evId: evId
      }),
      projectId: projectId,
      envId: envId,
      evId: evId,
      val: val,
      serverTs: undefined
    };

    return ev;
  }

  makeConnection(item: {
    projectId: string;
    connectionId: string;
    envId: string;
    type: common.ConnectionTypeEnum;
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    account: string;
    warehouse: string;
    bigqueryCredentials: any;
    bigqueryQuerySizeLimitGb: number;
    isSSL: boolean;
  }) {
    let {
      projectId,
      connectionId,
      envId,
      type,
      host,
      port,
      database,
      username,
      password,
      account,
      warehouse,
      bigqueryCredentials,
      bigqueryQuerySizeLimitGb,
      isSSL
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
      bigqueryCredentials: bigqueryCredentials,
      bigqueryProject: bigqueryCredentials?.project_id,
      bigqueryClientEmail: bigqueryCredentials?.client_email,
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
}
