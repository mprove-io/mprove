import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetStateRequest } from '#common/zod/backend/routes/state/get-state/get-state-request';
import { zToBackendGetStateResponse } from '#common/zod/backend/routes/state/get-state/get-state-response';

export class ToBackendGetStateRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStateRequest })
) {}

export class ToBackendGetStateResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStateResponse })
) {}
