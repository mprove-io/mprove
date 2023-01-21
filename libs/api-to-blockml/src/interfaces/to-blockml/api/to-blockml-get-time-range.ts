import { Type } from 'class-transformer';
import { IsBoolean, IsInt, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlGetTimeRangeRequestPayload {
  @ValidateNested()
  @Type(() => common.Fraction)
  fraction: common.Fraction;
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
  rangeOpen: number;

  @IsInt()
  rangeClose: number;
}

export class ToBlockmlGetTimeRangeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlGetTimeRangeResponsePayload)
  payload: ToBlockmlGetTimeRangeResponsePayload;
}
