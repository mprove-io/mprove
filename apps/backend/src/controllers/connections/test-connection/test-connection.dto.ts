import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendTestConnectionRequest,
  zToBackendTestConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-test-connection';

export class ToBackendTestConnectionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendTestConnectionRequest })
) {}

export class ToBackendTestConnectionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendTestConnectionResponse })
) {}
