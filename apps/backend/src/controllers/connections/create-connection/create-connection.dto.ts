import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateConnectionRequest } from '#common/zod/backend/routes/connections/create-connection/create-connection-request';
import { zToBackendCreateConnectionResponse } from '#common/zod/backend/routes/connections/create-connection/create-connection-response';

export class ToBackendCreateConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionRequest })
) {}

export class ToBackendCreateConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionResponse })
) {}
