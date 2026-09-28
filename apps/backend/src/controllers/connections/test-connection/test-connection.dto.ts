import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendTestConnectionRequest } from '#common/zod/backend/routes/connections/test-connection/test-connection-request';
import { zToBackendTestConnectionResponse } from '#common/zod/backend/routes/connections/test-connection/test-connection-response';

export class ToBackendTestConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendTestConnectionRequest })
) {}

export class ToBackendTestConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendTestConnectionResponse }
) {}
