import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetEnvsRequest } from '#common/types/backend/routes/envs/get-envs/get-envs-request';
import { zToBackendGetEnvsResponse } from '#common/types/backend/routes/envs/get-envs/get-envs-response';

export class ToBackendGetEnvsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsRequest })
) {}

export class ToBackendGetEnvsResponseDto extends createBackendResponseDto({
  schema: zToBackendGetEnvsResponse
}) {}
