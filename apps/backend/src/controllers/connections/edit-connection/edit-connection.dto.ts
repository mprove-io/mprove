import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditConnectionRequest,
  zToBackendEditConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-edit-connection';

export class ToBackendEditConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditConnectionRequest })
) {}

export class ToBackendEditConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditConnectionResponse })
) {}
