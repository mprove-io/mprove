import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteConnectionRequest } from '#common/zod/backend/routes/connections/delete-connection/delete-connection-request';
import { zToBackendDeleteConnectionResponse } from '#common/zod/backend/routes/connections/delete-connection/delete-connection-response';

export class ToBackendDeleteConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteConnectionRequest })
) {}

export class ToBackendDeleteConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteConnectionResponse })
) {}
