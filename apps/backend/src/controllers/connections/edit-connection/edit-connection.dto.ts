import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditConnectionRequest } from '#common/zod/backend/routes/connections/edit-connection/edit-connection-request';
import { zToBackendEditConnectionResponse } from '#common/zod/backend/routes/connections/edit-connection/edit-connection-response';

export class ToBackendEditConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditConnectionRequest })
) {}

export class ToBackendEditConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditConnectionResponse })
) {}
