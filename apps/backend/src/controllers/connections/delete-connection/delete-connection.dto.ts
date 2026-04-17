import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteConnectionRequest,
  zToBackendDeleteConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-delete-connection';

export class ToBackendDeleteConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteConnectionRequest })
) {}

export class ToBackendDeleteConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteConnectionResponse })
) {}
