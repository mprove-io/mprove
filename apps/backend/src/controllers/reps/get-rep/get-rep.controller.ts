import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  add,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  fromUnixTime,
  getUnixTime,
  sub
} from 'date-fns';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DocService } from '~backend/services/doc.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetRepController {
  constructor(
    private membersService: MembersService,
    private docService: DocService,
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private repsRepository: repositories.RepsRepository,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRep)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetRepRequest = request.body;

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      repId,
      withData,
      timeRangeFraction,
      timeSpec,
      timezone
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let rep = await this.repsRepository.findOne({
      where: {
        struct_id: bridge.struct_id,
        rep_id: repId
      }
    });

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction
    });

    let toBlockmlGetTimeRangeRequest: apiToBlockml.ToBlockmlGetTimeRangeRequest =
      {
        info: {
          name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlGetTimeRange,
          traceId: traceId
        },
        payload: {
          fraction: timeRangeFraction
        }
      };

    let blockmlGetTimeRangeResponse =
      await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlGetTimeRangeResponse>(
        {
          routingKey: common.RabbitBlockmlRoutingEnum.GetTimeRange.toString(),
          message: toBlockmlGetTimeRangeRequest,
          checkIsOk: true
        }
      );

    let rangeOpen = blockmlGetTimeRangeResponse.payload.rangeOpen;
    let rangeClose = blockmlGetTimeRangeResponse.payload.rangeClose;

    // console.log(blockmlGetTimeRangeResponse.payload);
    // console.log(rangeOpen);
    // console.log(rangeClose);

    // let columns = eachDayOfInterval({
    //   start: new Date(2023, 1, 6),
    //   end: new Date(2023, 1, 10)
    // }).map(x => getUnixTime(x));

    let rangeLength = 100;

    let start =
      common.isDefined(rangeOpen) && common.isDefined(rangeClose)
        ? Math.min(rangeOpen, rangeClose)
        : common.isUndefined(rangeOpen)
        ? undefined
        : [
            common.FractionTypeEnum.TsIsBeforeDate,
            common.FractionTypeEnum.TsIsBeforeRelative
          ].indexOf(timeRangeFraction.type) > -1
        ? getUnixTime(
            sub(
              fromUnixTime(rangeOpen),
              timeSpec === common.TimeSpecEnum.Years
                ? { years: rangeLength }
                : timeSpec === common.TimeSpecEnum.Quarters
                ? { months: rangeLength * 3 }
                : timeSpec === common.TimeSpecEnum.Months
                ? { months: rangeLength }
                : timeSpec === common.TimeSpecEnum.Weeks
                ? { days: rangeLength * 7 }
                : timeSpec === common.TimeSpecEnum.Days
                ? { days: rangeLength }
                : timeSpec === common.TimeSpecEnum.Hours
                ? { hours: rangeLength }
                : timeSpec === common.TimeSpecEnum.Minutes
                ? { minutes: rangeLength }
                : {}
            )
          )
        : [
            common.FractionTypeEnum.TsIsAfterDate,
            common.FractionTypeEnum.TsIsAfterRelative
          ].indexOf(timeRangeFraction.type) > -1
        ? rangeOpen
        : undefined;

    let end =
      common.isDefined(rangeOpen) && common.isDefined(rangeClose)
        ? Math.max(rangeOpen, rangeClose)
        : common.isUndefined(rangeOpen)
        ? undefined
        : [
            common.FractionTypeEnum.TsIsBeforeDate,
            common.FractionTypeEnum.TsIsBeforeRelative
          ].indexOf(timeRangeFraction.type) > -1
        ? rangeOpen
        : [
            common.FractionTypeEnum.TsIsAfterDate,
            common.FractionTypeEnum.TsIsAfterRelative
          ].indexOf(timeRangeFraction.type) > -1
        ? getUnixTime(
            add(
              fromUnixTime(rangeOpen),
              timeSpec === common.TimeSpecEnum.Years
                ? { years: rangeLength }
                : timeSpec === common.TimeSpecEnum.Quarters
                ? { months: rangeLength * 3 }
                : timeSpec === common.TimeSpecEnum.Months
                ? { months: rangeLength }
                : timeSpec === common.TimeSpecEnum.Weeks
                ? { days: rangeLength * 7 }
                : timeSpec === common.TimeSpecEnum.Days
                ? { days: rangeLength }
                : timeSpec === common.TimeSpecEnum.Hours
                ? { hours: rangeLength }
                : timeSpec === common.TimeSpecEnum.Minutes
                ? { minutes: rangeLength }
                : {}
            )
          )
        : undefined;

    let startDate = new Date(start * 1000);
    let endDate = new Date(end * 1000);

    let timeInterval =
      timeSpec === common.TimeSpecEnum.Years
        ? eachYearOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Quarters
        ? eachQuarterOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Months
        ? eachMonthOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Weeks
        ? eachWeekOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Days
        ? eachDayOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Hours
        ? eachHourOfInterval({
            start: startDate,
            end: endDate
          })
        : timeSpec === common.TimeSpecEnum.Minutes
        ? eachMinuteOfInterval({
            start: startDate,
            end: endDate
          })
        : undefined;

    timeInterval = timeInterval.slice(0, 50);

    repApi.columns = timeInterval.map(x => getUnixTime(x));

    if (withData === true) {
      repApi = await this.docService.getData({ rep: repApi });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetRepResponsePayload = {
      needValidate: common.enumToBoolean(bridge.need_validate),
      struct: wrapper.wrapToApiStruct(struct),
      userMember: apiMember,
      rep: repApi
    };

    return payload;
  }
}
