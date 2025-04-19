import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { BlockmlService } from './blockml.service';
import { DocService } from './doc.service';
import { MakerService } from './maker.service';
import { MconfigsService } from './mconfigs.service';
import { RabbitService } from './rabbit.service';
import { WrapToApiService } from './wrap-to-api.service';
import { WrapToEntService } from './wrap-to-ent.service';

let retry = require('async-retry');

@Injectable()
export class ReportsService {
  constructor(
    private makerService: MakerService,
    private docService: DocService,
    private mconfigsService: MconfigsService,
    private blockmlService: BlockmlService,
    private rabbitService: RabbitService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getReportCheckExists(item: { reportId: string; structId: string }) {
    let { reportId, structId } = item;

    let report = await this.db.drizzle.query.reportsTable.findFirst({
      where: and(
        eq(reportsTable.structId, structId),
        eq(reportsTable.reportId, reportId)
      )
    });

    if (common.isUndefined(report)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REPORT_DOES_NOT_EXIST
      });
    }

    return report;
  }

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_REPORT_PATH
      });
    }
  }

  async getReport(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: schemaPostgres.UserEnt;
    userMember: schemaPostgres.MemberEnt;
    checkExist: boolean;
    checkAccess: boolean;
  }) {
    let {
      projectId,
      reportId,
      structId,
      checkExist,
      checkAccess,
      user,
      userMember
    } = item;

    let chart = common.makeCopy(common.DEFAULT_CHART);
    chart.type = common.ChartTypeEnum.Line;

    let emptyRep = this.makerService.makeReport({
      structId: undefined,
      reportId: reportId,
      projectId: projectId,
      creatorId: undefined,
      filePath: undefined,
      accessRoles: [],
      accessUsers: [],
      title: reportId,
      fields: [],
      rows: [],
      chart: chart,
      draft: false
    });

    let report =
      reportId === common.EMPTY_REPORT_ID
        ? emptyRep
        : await this.db.drizzle.query.reportsTable.findFirst({
            where: and(
              eq(reportsTable.projectId, projectId),
              eq(reportsTable.structId, structId),
              eq(reportsTable.reportId, reportId)
            )
          });

    if (checkExist === true && common.isUndefined(report)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REPORT_NOT_FOUND
      });
    }

    if (
      reportId !== common.EMPTY_REPORT_ID &&
      report.draft === true &&
      report.creatorId !== user.userId
    ) {
      throw new common.ServerError({
        message:
          common.ErEnum.BACKEND_DRAFT_REPORT_IS_AVAILABLE_ONLY_TO_ITS_CREATOR
      });
    }

    if (checkAccess === true && report.draft === false) {
      let isAccessGranted = helper.checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: report
      });

      if (isAccessGranted === false) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_FORBIDDEN_REPORT
        });
      }
    }

    return report;
  }
}
