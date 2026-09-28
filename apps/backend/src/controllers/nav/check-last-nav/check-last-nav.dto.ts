import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCheckLastNavRequest } from '#common/zod/backend/routes/nav/check-last-nav/check-last-nav-request';
import { zToBackendCheckLastNavResponse } from '#common/zod/backend/routes/nav/check-last-nav/check-last-nav-response';

export class ToBackendCheckLastNavRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckLastNavRequest })
) {}

export class ToBackendCheckLastNavResponseDto extends createBackendResponseDto({
  schema: zToBackendCheckLastNavResponse
}) {}
