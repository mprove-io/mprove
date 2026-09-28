import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateConnectionRequest } from '#common/zod/backend/routes/connections/create-connection/create-connection-request';
import { zToBackendCreateConnectionResponse } from '#common/zod/backend/routes/connections/create-connection/create-connection-response';

export class ToBackendCreateConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionRequest })
) {}

export class ToBackendCreateConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateConnectionResponse }
) {}
