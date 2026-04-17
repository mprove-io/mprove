import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetQueryInfoRequestDto,
  ToBackendGetQueryInfoResponseDto
} from '#backend/controllers/query-info/get-query-info/get-query-info.dto';
import { GetQueryInfoService } from '#backend/controllers/query-info/get-query-info/get-query-info.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetQueryInfoResponsePayload } from '#common/zod/to-backend/query-info/to-backend-get-query-info';

@ApiTags('QueryInfo')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetQueryInfoController {
  constructor(private getQueryInfoService: GetQueryInfoService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQueryInfo)
  @ApiOperation({
    summary: 'GetQueryInfo',
    description: 'Get Malloy, SQL, and data'
  })
  @ApiOkResponse({
    type: ToBackendGetQueryInfoResponseDto
  })
  async getQueryInfo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetQueryInfoRequestDto
  ) {
    let { traceId } = body.info;
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
    } = body.payload;

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
