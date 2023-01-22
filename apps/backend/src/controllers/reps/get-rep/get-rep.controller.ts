import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  add,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInQuarters,
  differenceInWeeks,
  differenceInYears,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  fromUnixTime,
  getUnixTime,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  sub
} from 'date-fns';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let rep = await this.repsRepository.findOne({
      where: {
        struct_id: bridge.struct_id,
        rep_id: repId
      }
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

    let timeColumnsLimit = constants.TIME_COLUMNS_LIMIT;

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
                ? { years: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Quarters
                ? { months: timeColumnsLimit * 3 }
                : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                ? { days: timeColumnsLimit * 7 }
                : timeSpec === common.TimeSpecEnum.Days
                ? { days: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Hours
                ? { hours: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Minutes
                ? { minutes: timeColumnsLimit }
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
                ? { years: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Quarters
                ? { months: timeColumnsLimit * 3 }
                : timeSpec === common.TimeSpecEnum.Months
                ? { months: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Weeks
                ? { days: timeColumnsLimit * 7 }
                : timeSpec === common.TimeSpecEnum.Days
                ? { days: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Hours
                ? { hours: timeColumnsLimit }
                : timeSpec === common.TimeSpecEnum.Minutes
                ? { minutes: timeColumnsLimit }
                : {}
            )
          )
        : undefined;

    let startDate = new Date(start * 1000);
    let endDate = new Date(end * 1000);

    let diffColumnsLength =
      timeSpec === common.TimeSpecEnum.Years
        ? differenceInYears(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Quarters
        ? differenceInQuarters(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Months
        ? differenceInMonths(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Weeks
        ? differenceInWeeks(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Days
        ? differenceInDays(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Hours
        ? differenceInHours(endDate, startDate)
        : timeSpec === common.TimeSpecEnum.Minutes
        ? differenceInMinutes(endDate, startDate)
        : undefined;

    if (diffColumnsLength > timeColumnsLimit) {
      endDate = add(
        startDate,
        timeSpec === common.TimeSpecEnum.Years
          ? { years: timeColumnsLimit }
          : timeSpec === common.TimeSpecEnum.Quarters
          ? { months: timeColumnsLimit * 3 }
          : timeSpec === common.TimeSpecEnum.Months
          ? { months: timeColumnsLimit }
          : timeSpec === common.TimeSpecEnum.Weeks
          ? { days: timeColumnsLimit * 7 }
          : timeSpec === common.TimeSpecEnum.Days
          ? { days: timeColumnsLimit }
          : timeSpec === common.TimeSpecEnum.Hours
          ? { hours: timeColumnsLimit }
          : timeSpec === common.TimeSpecEnum.Minutes
          ? { minutes: timeColumnsLimit }
          : {}
      );
    }

    let timeColumns =
      getUnixTime(startDate) === getUnixTime(endDate)
        ? timeSpec === common.TimeSpecEnum.Years
          ? [startOfYear(startDate)]
          : timeSpec === common.TimeSpecEnum.Quarters
          ? [startOfQuarter(startDate)]
          : timeSpec === common.TimeSpecEnum.Months
          ? [startOfMonth(startDate)]
          : timeSpec === common.TimeSpecEnum.Weeks
          ? [
              startOfWeek(startDate, {
                weekStartsOn:
                  struct.week_start === common.ProjectWeekStartEnum.Sunday
                    ? 0
                    : 1
              })
            ]
          : timeSpec === common.TimeSpecEnum.Days
          ? [startOfDay(startDate)]
          : timeSpec === common.TimeSpecEnum.Hours
          ? [startOfHour(startDate)]
          : timeSpec === common.TimeSpecEnum.Minutes
          ? [startOfMinute(startDate)]
          : undefined
        : timeSpec === common.TimeSpecEnum.Years
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
        ? eachWeekOfInterval(
            {
              start: startDate,
              end: endDate
            },
            {
              weekStartsOn:
                struct.week_start === common.ProjectWeekStartEnum.Sunday ? 0 : 1
            }
          )
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

    let repApi = wrapper.wrapToApiRep({
      rep: rep,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumns.length
    });

    repApi.columns = timeColumns.map(x => getUnixTime(x));

    if (withData === true) {
      repApi = await this.docService.getData({ rep: repApi });
    }

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
function getHour(startDate: Date) {
  throw new Error('Function not implemented.');
}

function getMinute(startDate: Date) {
  throw new Error('Function not implemented.');
}
