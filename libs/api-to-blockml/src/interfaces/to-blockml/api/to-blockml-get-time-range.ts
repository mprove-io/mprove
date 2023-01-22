import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlGetTimeRangeRequestPayload {
  @ValidateNested()
  @Type(() => common.Fraction)
  fraction: common.Fraction;

  @IsInt()
  timeColumnsLimit: number;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;
}

export class ToBlockmlGetTimeRangeRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlGetTimeRangeRequestPayload)
  payload: ToBlockmlGetTimeRangeRequestPayload;
}

export class ToBlockmlGetTimeRangeResponsePayload {
  @IsBoolean()
  isValid: boolean;

  @IsInt()
  rangeStart: number;

  @IsInt()
  rangeEnd: number;
}

export class ToBlockmlGetTimeRangeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlGetTimeRangeResponsePayload)
  payload: ToBlockmlGetTimeRangeResponsePayload;
}
