import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRunRequest } from '#common/zod/backend/routes/run/run/run-request';
import { zToBackendRunResponse } from '#common/zod/backend/routes/run/run/run-response';

export class ToBackendRunRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunRequest })
) {}

export class ToBackendRunResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunResponse })
) {}
