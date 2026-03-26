import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetQueryInfoService } from '#backend/controllers/query-info/get-query-info/get-query-info.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetQueryInfoRequest,
  ToBackendGetQueryInfoResponsePayload
} from '#common/interfaces/to-backend/query-info/to-backend-get-query-info';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetQueryInfoController {
  constructor(private getQueryInfoService: GetQueryInfoService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo)
  async getQueryInfo(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetQueryInfoRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      chartId,
      dashboardId,
      tileIndex,
      reportId,
      rowId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      getMalloy,
      getSql,
      getData,
      isFetch
    } = reqValid.payload;

    let payload: ToBackendGetQueryInfoResponsePayload =
      await this.getQueryInfoService.getQueryInfo({
        traceId: traceId,
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        chartId: chartId,
        dashboardId: dashboardId,
        tileIndex: tileIndex,
        reportId: reportId,
        rowId: rowId,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick,
        getMalloy: getMalloy,
        getSql: getSql,
        getData: getData,
        isFetch: isFetch
      });

    return payload;
  }
}
