import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkMemberAccess } from '#backend/functions/db/members/check-member-access/check-member-access';
import { getReportUrl } from '#backend/functions/db/reports/get-report-url/get-report-url';
import { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { PrepareRunReportError } from '#common/types/backend/function-errors/prepare-run-report-error';
import type { RunQuery } from '#common/types/backend/parts/run/run-query';
import type { RunReport } from '#common/types/backend/parts/run/run-report';

type RunReportPrepRow = {
  title: string;
  queryId: string;
};

type RunReportPrep = {
  title: string;
  reportId: string;
  url: string;
  rows: RunReportPrepRow[];
};

type RunReportMconfigPart = {
  mconfigId: string;
  queryId: string;
};

export type PrepareRunReportOutput = {
  prepReports: RunReportPrep[];
  mconfigParts: RunReportMconfigPart[];
};

@Injectable()
export class RunReportService {
  constructor(private db: DbService) {}

  async prepareRunReport(item: {
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    reportIds?: string;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }): Result.ResultAsync<PrepareRunReportOutput, PrepareRunReportError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('reports', v =>
        this.db.reports.findMany({
          where: and(
            eq(reportsTable.structId, v.structId),
            or(
              eq(reportsTable.draft, false),
              eq(reportsTable.creatorId, v.user.userId)
            )
          )
        })
      ),
      Result.bind('reportsGrantedAccess', v =>
        Result.succeed(
          v.reports.filter(
            x =>
              x.draft === true ||
              checkMemberAccess({
                member: v.userMember,
                accessRoles: x.accessRolesCombined,
                filePath: x.filePath
              })
          )
        )
      ),
      Result.bind('reportIdsList', v =>
        Result.succeed(v.reportIds?.split(','))
      ),
      Result.andThrough(v =>
        isUndefined(v.reportIdsList)
          ? Result.succeed()
          : Result.sequence(v.reportIdsList, reportId =>
              v.reportsGrantedAccess.some(x => x.reportId === reportId)
                ? Result.succeed()
                : Result.fail({
                    code: 'BACKEND_REPORT_NOT_FOUND',
                    displayData: { id: reportId }
                  })
            )
      ),
      Result.map((v): PrepareRunReportOutput => {
        let prepReports: RunReportPrep[] = [];

        let mconfigParts: RunReportMconfigPart[] = [];

        v.reportsGrantedAccess
          .filter(
            report =>
              isUndefined(v.reportIdsList) ||
              v.reportIdsList.includes(report.reportId)
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

            let url: string = getReportUrl({
              host: v.hostUrl,
              orgId: v.orgId,
              projectId: v.projectId,
              repoId: v.repoId,
              branch: v.branchId,
              env: v.envId,
              reportId: report.reportId,
              timezone: v.defaultTimezone,
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
      })
    );
  }

  build(item: {
    prepReports: RunReportPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunReport[] {
    let { prepReports, findQuery } = item;

    let reports: RunReport[] = prepReports.map(meta => ({
      title: meta.title,
      reportId: meta.reportId,
      url: meta.url,
      rows: meta.rows.map(row => ({
        title: row.title,
        query: findQuery({ queryId: row.queryId })
      }))
    }));

    return reports;
  }

  filterErrors(item: { reports: RunReport[] }): RunReport[] {
    let { reports } = item;

    let errorReports: RunReport[] = reports
      .filter(x => x.rows.filter(y => y.query.status === 'Error').length > 0)
      .map(r => ({
        title: r.title,
        reportId: r.reportId,
        url: r.url,
        rows: r.rows.filter(row => row.query.status === 'Error')
      }));

    return errorReports;
  }
}
