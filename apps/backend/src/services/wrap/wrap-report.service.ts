import { Injectable } from '@nestjs/common';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { ReportTab } from '~backend/drizzle/postgres/tabs/report-tab';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapBridgeService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

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
