import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetSessionTitleRequest,
  zToBackendSetSessionTitleResponse
} from '#common/zod/to-backend/sessions/to-backend-set-session-title';

export class ToBackendSetSessionTitleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetSessionTitleRequest })
) {}

export class ToBackendSetSessionTitleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetSessionTitleResponse })
) {}
