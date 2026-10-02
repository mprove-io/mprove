import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetNavRequest } from '#common/types/backend/routes/nav/get-nav/get-nav-request';
import { zToBackendGetNavResponse } from '#common/types/backend/routes/nav/get-nav/get-nav-response';

export class ToBackendGetNavRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetNavRequest })
) {}

export class ToBackendGetNavResponseDto extends createBackendResponseDto({
  schema: zToBackendGetNavResponse
}) {}
