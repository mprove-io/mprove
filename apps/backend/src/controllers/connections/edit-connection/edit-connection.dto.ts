import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditConnectionRequest } from '#common/types/backend/routes/connections/edit-connection/edit-connection-request';
import { zToBackendEditConnectionResponse } from '#common/types/backend/routes/connections/edit-connection/edit-connection-response';

export class ToBackendEditConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditConnectionRequest })
) {}

export class ToBackendEditConnectionResponseDto extends createBackendResponseDto(
  { schema: zToBackendEditConnectionResponse }
) {}
