import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  readonly structId: string;
}

export class ToBlockmlRebuildStructRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBlockmlRequestInfo)
  readonly info: apiObjects.ToBlockmlRequestInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  readonly payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @IsString()
  readonly structId: string;
}

export class ToBlockmlRebuildStructResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

// export interface RebuildStructRequestBody {
//   info: apiObjects.ServerRequestToBlockml;
//   payload: {
//     files: apiObjects.File[];
//     project_id: string;
//     repo_id: string;
//     bigquery_project: string;
//     week_start: apiEnums.ProjectWeekStartEnum;
//     connection: apiEnums.ProjectConnectionEnum;
//     struct_id: string;
//   };
// }

// export interface RebuildStructResponse200Body {
//   info: apiObjects.BlockmlResponse;
//   payload: {
//     struct: apiObjects.StructFull;
//     udfs_content: string;
//     pdts_sorted: string[];
//   };
// }
