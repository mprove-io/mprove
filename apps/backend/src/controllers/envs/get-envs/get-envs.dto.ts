import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetEnvsRequest } from '#common/zod/backend/routes/envs/get-envs/get-envs-request';
import { zToBackendGetEnvsResponse } from '#common/zod/backend/routes/envs/get-envs/get-envs-response';

export class ToBackendGetEnvsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsRequest })
) {}

export class ToBackendGetEnvsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetEnvsResponse })
) {}
