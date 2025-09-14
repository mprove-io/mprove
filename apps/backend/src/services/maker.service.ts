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
import { ConnectionBigqueryOptions } from '~common/interfaces/backend/connection/connection-bigquery-options';
import { ConnectionClickhouseOptions } from '~common/interfaces/backend/connection/connection-clickhouse-options';
import { ConnectionMotherduckOptions } from '~common/interfaces/backend/connection/connection-motherduck-options';
import { ConnectionPostgresOptions } from '~common/interfaces/backend/connection/connection-postgres-options';
import { ConnectionSnowflakeOptions } from '~common/interfaces/backend/connection/connection-snowflake-options';
import { ConnectionStoreApiOptions } from '~common/interfaces/backend/connection/connection-store-api-options';
import { ConnectionStoreGoogleApiOptions } from '~common/interfaces/backend/connection/connection-store-google-api-options';
import { Ev } from '~common/interfaces/backend/ev';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { HashService } from './hash.service';

@Injectable()
export class MakerService {
  constructor(private hashService: HashService) {}

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
    bigqueryOptions?: ConnectionBigqueryOptions;
    clickhouseOptions?: ConnectionClickhouseOptions;
    motherduckOptions?: ConnectionMotherduckOptions;
    postgresOptions?: ConnectionPostgresOptions;
    snowflakeOptions?: ConnectionSnowflakeOptions;
    storeApiOptions?: ConnectionStoreApiOptions;
    storeGoogleApiOptions?: ConnectionStoreGoogleApiOptions;
  }) {
    let {
      projectId,
      connectionId,
      envId,
      type,
      bigqueryOptions,
      clickhouseOptions,
      motherduckOptions,
      postgresOptions,
      snowflakeOptions,
      storeApiOptions,
      storeGoogleApiOptions
    } = item;

    if (isDefined(storeGoogleApiOptions)) {
      storeGoogleApiOptions.googleCloudProject =
        storeGoogleApiOptions.serviceAccountCredentials?.project_id;

      storeGoogleApiOptions.googleCloudClientEmail =
        storeGoogleApiOptions.serviceAccountCredentials?.client_email;
    }

    if (isDefined(bigqueryOptions)) {
      bigqueryOptions.googleCloudProject =
        bigqueryOptions.serviceAccountCredentials?.project_id;

      bigqueryOptions.googleCloudClientEmail =
        bigqueryOptions.serviceAccountCredentials?.client_email;

      let slimit = bigqueryOptions.bigqueryQuerySizeLimitGb;

      bigqueryOptions.bigqueryQuerySizeLimitGb =
        isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
    }

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
      bigqueryOptions: bigqueryOptions,
      clickhouseOptions: clickhouseOptions,
      motherduckOptions: motherduckOptions,
      postgresOptions: postgresOptions,
      snowflakeOptions: snowflakeOptions,
      storeApiOptions: storeApiOptions,
      storeGoogleApiOptions: storeGoogleApiOptions,
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
