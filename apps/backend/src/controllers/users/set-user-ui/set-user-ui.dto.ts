import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetUserUiRequest,
  zToBackendSetUserUiResponse
} from '#common/zod/to-backend/users/to-backend-set-user-ui';

export class ToBackendSetUserUiRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserUiRequest })
) {}

export class ToBackendSetUserUiResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserUiResponse })
) {}
