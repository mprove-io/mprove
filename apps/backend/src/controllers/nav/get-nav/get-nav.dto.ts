import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetNavRequest } from '#common/zod/backend/routes/nav/get-nav/get-nav-request';
import { zToBackendGetNavResponse } from '#common/zod/backend/routes/nav/get-nav/get-nav-response';

export class ToBackendGetNavRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetNavRequest })
) {}

export class ToBackendGetNavResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetNavResponse })
) {}
