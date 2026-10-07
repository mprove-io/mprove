import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetOrgsListRequest } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-request';
import { zToBackendGetOrgsListResponse } from '#common/types/backend/routes/orgs/get-orgs-list/get-orgs-list-response';

export class ToBackendGetOrgsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgsListRequest })
) {}

export class ToBackendGetOrgsListResponseDto extends createBackendResponseDto({
  schema: zToBackendGetOrgsListResponse
}) {}
