import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetEnvsListRequest } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-request';
import { zToBackendGetEnvsListResponse } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-response';

export class ToBackendGetEnvsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsListRequest })
) {}

export class ToBackendGetEnvsListResponseDto extends createBackendResponseDto({
  schema: zToBackendGetEnvsListResponse
}) {}
