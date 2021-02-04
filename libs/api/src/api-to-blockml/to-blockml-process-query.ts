import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToBlockmlProcessQueryRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsEnum(enums.ProjectWeekStartEnum)
  readonly weekStart: enums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => interfaces.UdfsDict)
  readonly udfsDict: interfaces.UdfsDict;

  @ValidateNested()
  @Type(() => interfaces.Mconfig)
  readonly mconfig: interfaces.Mconfig;

  readonly modelContent: any;
}

export class ToBlockmlProcessQueryRequest extends interfaces.ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryRequestPayload)
  readonly payload: ToBlockmlProcessQueryRequestPayload;
}

export class ToBlockmlProcessQueryResponsePayload {
  @ValidateNested()
  @Type(() => interfaces.Query)
  readonly query: interfaces.Query;

  @ValidateNested()
  @Type(() => interfaces.Mconfig)
  readonly mconfig: interfaces.Mconfig;
}

export class ToBlockmlProcessQueryResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryResponsePayload)
  readonly payload: ToBlockmlProcessQueryResponsePayload;
}
