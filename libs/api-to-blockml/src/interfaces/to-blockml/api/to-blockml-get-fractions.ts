import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlGetFractionsRequestPayload {
  @IsString({ each: true })
  bricks: string[];

  @IsEnum(common.FieldResultEnum)
  result: common.FieldResultEnum;
}

export class ToBlockmlGetFractionsRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlGetFractionsRequestPayload)
  payload: ToBlockmlGetFractionsRequestPayload;
}

export class ToBlockmlGetFractionsResponsePayload {
  @IsBoolean()
  isValid: boolean;

  @ValidateNested()
  @Type(() => common.Fraction)
  fractions: common.Fraction[];
}

export class ToBlockmlGetFractionsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlGetFractionsResponsePayload)
  payload: ToBlockmlGetFractionsResponsePayload;
}
