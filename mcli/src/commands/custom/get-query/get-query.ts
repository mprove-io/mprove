import { Command, Option } from 'clipanion';
import * as t from 'typanion';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import {
  ToBackendGetQueryInfoRequestPayload,
  ToBackendGetQueryInfoResponse
} from '#common/interfaces/to-backend/query-info/to-backend-get-query-info';
import { ServerError } from '#common/models/server-error';
import { getConfig } from '#mcli/config/get.config';
import { logToConsoleMcli } from '#mcli/functions/log-to-console-mcli';
import { mreq } from '#mcli/functions/mreq';
import { CustomCommand } from '#mcli/models/custom-command';

export class GetQueryCommand extends CustomCommand {
  static paths = [['get-query']];

  static usage = Command.Usage({
    description: 'Get query',
    examples: [
      [
        'Get query for Dev repo Chart',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --chart-id v1 --get-sql --get-data'
      ],
      [
        'Get query for Dev repo Dashboard',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --dashboard-id d1 --get-sql --get-data'
      ],
      [
        'Get query for Dev repo Report',
        'mprove get-query --project-id DXYE72ODCP5LWPWH2EXQ --repo dev --branch main --env prod --report-id r1 --get-sql --get-data'
      ]
    ]
  });

  projectId = Option.String('--project-id', {
    description: '(required) Project Id'
  });

  repo = Option.String('--repo', {
    required: true,
    validator: t.isEnum(RepoTypeEnum),
    description: `(required, "${RepoTypeEnum.Dev}", "${RepoTypeEnum.Production}" or "${RepoTypeEnum.Session}")`
  });

  branch = Option.String('--branch', {
    required: true,
    description: '(required) Git Branch'
  });

  env = Option.String('--env', {
    required: true,
    description: '(required) Environment'
  });

  dashboardId = Option.String('--dashboard-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Dashboard Id (name)'
  });

  tileIndex = Option.String('--tile-index', {
    validator: t.isNumber(),
    description: '(optional) Dashboard Tile Index starting with 0'
  });

  chartId = Option.String('--chart-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Chart Id (name)'
  });

  reportId = Option.String('--report-id', {
    description:
      '(dashboard-id, chart-id or report-id required) Report Id (name)'
  });

  rowId = Option.String('--row-id', {
    description: '(optional) Report Row Id'
  });

  timezone = Option.String('--timezone', 'UTC', {
    description: '(default "UTC") Timezone'
  });

  timeSpec = Option.String('--detail', 'days', {
    description:
      '(default "days") "timestamps" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "quarters" | "years"'
  });

  timeRange = Option.String('--range', 'f`last 5 days`', {
    description: '(default "f`last 5 days`") Ts Filter Expression'
  });

  getMalloy = Option.Boolean('--get-malloy', false, {
    description: '(default false), show malloy query in output'
  });

  getSql = Option.Boolean('--get-sql', false, {
    description: '(default false), show query sql in output'
  });

  getData = Option.Boolean('--get-data', false, {
    description: '(default false), show query data in output'
  });

  json = Option.Boolean('--json', false, {
    description: '(default false)'
  });

  envFilePath = Option.String('--env-file-path', {
    description: '(optional) Path to ".env" file'
  });

  async execute() {
    if (isUndefined(this.context.config)) {
      this.context.config = getConfig(this.envFilePath);
    }

    this.projectId = this.projectId || this.context.config.mproveCliProjectId;

    if (isUndefined(this.projectId)) {
      let serverError = new ServerError({
        message: ErEnum.MCLI_PROJECT_ID_IS_NOT_DEFINED,
        originalError: null
      });
      throw serverError;
    }

    let apiKey = this.context.config.mproveCliApiKey;

    let repoId =
      this.repo === RepoTypeEnum.Production
        ? PROD_REPO_ID
        : apiKey.startsWith(`${ApiKeyTypeEnum.SK}-`)
          ? apiKey.split('-')[2].toLowerCase()
          : apiKey.split('-')[2];

    let getQueryInfoReqPayload: ToBackendGetQueryInfoRequestPayload = {
      projectId: this.projectId,
      repoId: repoId,
      branchId: this.branch,
      envId: this.env,
      chartId: this.chartId,
      dashboardId: this.dashboardId,
      tileIndex: this.tileIndex,
      reportId: this.reportId,
      rowId: this.rowId,
      timezone: this.timezone,
      timeSpec: this.timeSpec as TimeSpecEnum,
      timeRangeFractionBrick: this.timeRange,
      getMalloy: this.getMalloy,
      getSql: this.getSql,
      getData: this.getData,
      isFetch: true
    };

    let getQueryInfoResp = await mreq<ToBackendGetQueryInfoResponse>({
      apiKey: apiKey,
      pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo,
      payload: getQueryInfoReqPayload,
      host: this.context.config.mproveCliHost
    });

    logToConsoleMcli({
      log: getQueryInfoResp.payload,
      logLevel: LogLevelEnum.Info,
      context: this.context,
      isJson: this.json
    });
  }
}
