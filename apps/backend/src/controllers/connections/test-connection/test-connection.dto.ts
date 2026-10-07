import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendTestConnectionRequest } from '#common/types/backend/routes/connections/test-connection/test-connection-request';
import { zToBackendTestConnectionResponse } from '#common/types/backend/routes/connections/test-connection/test-connection-response';

export class ToBackendTestConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendTestConnectionRequest })
) {}

export class ToBackendTestConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendTestConnectionResponse }
) {}
