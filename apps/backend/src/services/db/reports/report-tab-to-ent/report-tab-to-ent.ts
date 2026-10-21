import { Result } from '@praha/byethrow';
import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ReportEnt } from '#backend/drizzle/postgres/schema/reports';
import { getEntProps } from '#backend/functions/get-ent-props/get-ent-props';
import type { HashService } from '#backend/services/hash/hash.service';
import type { TabService } from '#backend/services/tab/tab.service';
import type { ReportLt } from '#common/types/shared/st-lt/reports/report-lt';
import type { ReportSt } from '#common/types/shared/st-lt/reports/report-st';

export function reportTabToEnt(item: {
  tab: ReportTab;
  hashService: HashService;
  tabService: TabService;
  isEncryptDb: boolean;
  isEncryptMetadata: boolean;
}): Result.Result<ReportEnt, never> {
  let { tab, hashService, tabService, isEncryptDb, isEncryptMetadata } = item;

  let reportSt: ReportSt = {
    filePath: tab.filePath,
    space: tab.space,
    fields: tab.fields,
    accessRoles: tab.accessRoles,
    accessRolesCombined: tab.accessRolesCombined,
    title: tab.title,
    chart: tab.chart
  };

  let reportLt: ReportLt = {
    rows: tab.rows
  };

  let reportEnt: ReportEnt = {
    reportFullId: hashService.makeReportFullId({
      structId: tab.structId,
      reportId: tab.reportId
    }),
    projectId: tab.projectId,
    structId: tab.structId,
    reportId: tab.reportId,
    creatorId: tab.creatorId,
    draft: tab.draft,
    draftCreatedTs: tab.draftCreatedTs,
    serverTs: tab.serverTs,
    ...getEntProps({
      dataSt: reportSt,
      dataLt: reportLt,
      isMetadata: true,
      tabService: tabService,
      isEncryptDb: isEncryptDb,
      isEncryptMetadata: isEncryptMetadata
    })
  };

  return Result.succeed(reportEnt);
}
