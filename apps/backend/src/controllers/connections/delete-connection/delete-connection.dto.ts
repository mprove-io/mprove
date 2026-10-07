import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteConnectionRequest } from '#common/types/backend/routes/connections/delete-connection/delete-connection-request';
import { zToBackendDeleteConnectionResponse } from '#common/types/backend/routes/connections/delete-connection/delete-connection-response';

export class ToBackendDeleteConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteConnectionRequest })
) {}

export class ToBackendDeleteConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteConnectionResponse }
) {}
