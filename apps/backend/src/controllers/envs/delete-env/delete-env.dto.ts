import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteEnvRequest } from '#common/types/backend/routes/envs/delete-env/delete-env-request';
import { zToBackendDeleteEnvResponse } from '#common/types/backend/routes/envs/delete-env/delete-env-response';

export class ToBackendDeleteEnvRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteEnvRequest })
) {}

export class ToBackendDeleteEnvResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteEnvResponse
}) {}
