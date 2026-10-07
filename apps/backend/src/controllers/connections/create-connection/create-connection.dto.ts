import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateConnectionRequest } from '#common/types/backend/routes/connections/create-connection/create-connection-request';
import { zToBackendCreateConnectionResponse } from '#common/types/backend/routes/connections/create-connection/create-connection-response';

export class ToBackendCreateConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionRequest })
) {}

export class ToBackendCreateConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateConnectionResponse }
) {}
