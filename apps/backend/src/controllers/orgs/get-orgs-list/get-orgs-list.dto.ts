import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetOrgsListRequest } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-request';
import { zToBackendGetOrgsListResponse } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-response';

export class ToBackendGetOrgsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListRequest })
) {}

export class ToBackendGetOrgsListResponseDto extends createBackendResponseDto({
  schema: zToBackendGetOrgsListResponse
}) {}
