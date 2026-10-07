import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateEnvRequest } from '#common/types/backend/routes/envs/create-env/create-env-request';
import { zToBackendCreateEnvResponse } from '#common/types/backend/routes/envs/create-env/create-env-response';

export class ToBackendCreateEnvRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvRequest })
) {}

export class ToBackendCreateEnvResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateEnvResponse
}) {}
