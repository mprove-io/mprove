import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access';
import { TabService } from '#backend/services/tab.service';
import { ErEnum } from '#common/enums/er.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { getReportUrl } from '#common/functions/get-report-url';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { RunQuery } from '#common/interfaces/backend/run/run-query';
import type { RunReport } from '#common/interfaces/backend/run/run-report';
import { ServerError } from '#common/models/server-error';

interface RunReportPrepRow {
  title: string;
  queryId: string;
}

interface RunReportPrep {
  title: string;
  reportId: string;
  url: string;
  rows: RunReportPrepRow[];
}

interface RunReportMconfigPart {
  mconfigId: string;
  queryId: string;
}

@Injectable()
export class RunReportService {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async prepare(item: {
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    reportIds: string | undefined;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }) {
    let {
      structId,
      user,
      userMember,
      reportIds,
      hostUrl,
      orgId,
      projectId,
      repoId,
      branchId,
      envId,
      defaultTimezone
    } = item;

    let prepReports: RunReportPrep[] = [];

    let mconfigParts: RunReportMconfigPart[] = [];

    let allDbReports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.structId, structId),
          or(
            eq(reportsTable.draft, false),
            eq(reportsTable.creatorId, user.userId)
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let allReports = allDbReports.filter(
      x =>
        x.draft === true ||
        checkAccess({
          member: userMember,
          accessRoles: x.accessRoles
        })
    );

    let reportIdsList = reportIds?.split(',');

    if (isDefined(reportIdsList)) {
      reportIdsList.forEach(reportId => {
        let isFound =
          allReports.map(report => report.reportId).indexOf(reportId) > -1;

        if (isFound === false) {
          let serverError = new ServerError({
            message: ErEnum.BACKEND_REPORT_NOT_FOUND,
            displayData: { id: reportId },
            originalError: null
          });
          throw serverError;
        }
      });
    }

    allReports
      .filter(
        report =>
          isUndefined(reportIdsList) ||
          reportIdsList.indexOf(report.reportId) > -1
      )
      .forEach(report => {
        let prepRows: RunReportPrepRow[] = [];

        report.rows.forEach(row => {
          if (isDefined(row.mconfig)) {
            prepRows.push({
              title: row.name,
              queryId: row.mconfig.queryId
            });

            mconfigParts.push({
              mconfigId: row.mconfig.mconfigId,
              queryId: row.mconfig.queryId
            });
          }
        });

        let url = getReportUrl({
          host: hostUrl,
          orgId: orgId,
          projectId: projectId,
          repoId: repoId,
          branch: branchId,
          env: envId,
          reportId: report.reportId,
          timezone: defaultTimezone,
          timeSpec: 'days',
          timeRange: 'f`last 5 days`'
        });

        prepReports.push({
          title: report.title,
          reportId: report.reportId,
          url: url,
          rows: prepRows
        });
      });

    return { prepReports: prepReports, mconfigParts: mconfigParts };
  }

  build(item: {
    prepReports: RunReportPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunReport[] {
    let { prepReports, findQuery } = item;

    return prepReports.map(meta => ({
      title: meta.title,
      reportId: meta.reportId,
      url: meta.url,
      rows: meta.rows.map(row => ({
        title: row.title,
        query: findQuery({ queryId: row.queryId })
      }))
    }));
  }

  filterErrors(item: { reports: RunReport[] }): RunReport[] {
    let { reports } = item;

    return reports
      .filter(
        x =>
          x.rows.filter(y => y.query.status === QueryStatusEnum.Error).length >
          0
      )
      .map(r => ({
        title: r.title,
        reportId: r.reportId,
        url: r.url,
        rows: r.rows.filter(row => row.query.status === QueryStatusEnum.Error)
      }));
  }
}
