import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { ServerError } from '~common/models/server-error';
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
    private cs: ConfigService<BackendConfig>,
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

    if (isUndefined(report)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPORT_DOES_NOT_EXIST
      });
    }

    return report;
  }

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_REPORT_PATH
      });
    }
  }

  async getReport(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: UserEnt;
    userMember: MemberEnt;
    checkExist: boolean;
    checkAccess: boolean;
  }) {
    let {
      projectId,
      reportId,
      structId,
      checkExist,
      checkAccess: isCheckAccess,
      user,
      userMember
    } = item;

    let chart = makeCopy(DEFAULT_CHART);
    chart.type = ChartTypeEnum.Line;

    let emptyRep = this.makerService.makeReport({
      structId: undefined,
      reportId: reportId,
      projectId: projectId,
      creatorId: undefined,
      filePath: undefined,
      accessRoles: [],
      title: reportId,
      fields: [],
      rows: [],
      chart: chart,
      draft: false
    });

    let report =
      reportId === EMPTY_REPORT_ID
        ? emptyRep
        : await this.db.drizzle.query.reportsTable.findFirst({
            where: and(
              eq(reportsTable.projectId, projectId),
              eq(reportsTable.structId, structId),
              eq(reportsTable.reportId, reportId)
            )
          });

    if (checkExist === true && isUndefined(report)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPORT_NOT_FOUND
      });
    }

    if (
      reportId !== EMPTY_REPORT_ID &&
      report.draft === true &&
      report.creatorId !== user.userId
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_DRAFT_REPORT_IS_AVAILABLE_ONLY_TO_ITS_CREATOR
      });
    }

    if (isCheckAccess === true && report.draft === false) {
      let isAccessGranted = checkAccess({
        userAlias: user.alias,
        member: userMember,
        entity: report
      });

      if (isAccessGranted === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_FORBIDDEN_REPORT
        });
      }
    }

    return report;
  }
}
