import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateConnectionRequest,
  zToBackendCreateConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-create-connection';

export class ToBackendCreateConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionRequest })
) {}

export class ToBackendCreateConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateConnectionResponse })
) {}
