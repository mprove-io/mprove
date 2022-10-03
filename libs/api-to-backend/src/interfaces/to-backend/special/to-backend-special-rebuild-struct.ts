import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSpecialRebuildStructRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => common.Ev)
  evs: common.Ev[];

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branch: string;

  @IsString()
  structId: string;

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  connections: common.ProjectConnection[];
}

export class ToBackendSpecialRebuildStructRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSpecialRebuildStructRequestPayload)
  payload: ToBackendSpecialRebuildStructRequestPayload;
}
