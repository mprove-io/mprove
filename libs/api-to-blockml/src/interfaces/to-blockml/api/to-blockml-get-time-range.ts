import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlGetTimeRangeRequestPayload {
  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsString()
  timezone: string;

  @IsString()
  timeRangeFractionBrick: string;

  @IsInt()
  timeColumnsLimit: number;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;
}

export class ToBlockmlGetTimeRangeRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlGetTimeRangeRequestPayload)
  payload: ToBlockmlGetTimeRangeRequestPayload;
}

export class ToBlockmlGetTimeRangeResponsePayload {
  @IsBoolean()
  isValid: boolean;

  // @IsInt()
  // rangeOpen: number;

  // @IsInt()
  // rangeClose: number;

  @IsInt()
  rangeStart: number;

  @IsInt()
  rangeEnd: number;

  @ValidateNested()
  @Type(() => common.Fraction)
  timeRangeFraction: common.Fraction;
}

export class ToBlockmlGetTimeRangeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlGetTimeRangeResponsePayload)
  payload: ToBlockmlGetTimeRangeResponsePayload;
}
