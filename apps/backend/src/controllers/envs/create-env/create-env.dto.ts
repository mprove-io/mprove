import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateEnvRequest } from '#common/zod/backend/routes/envs/create-env/create-env-request';
import { zToBackendCreateEnvResponse } from '#common/zod/backend/routes/envs/create-env/create-env-response';

export class ToBackendCreateEnvRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvRequest })
) {}

export class ToBackendCreateEnvResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEnvResponse })
) {}
