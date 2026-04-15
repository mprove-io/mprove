import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetUserNameRequest,
  zToBackendSetUserNameResponse
} from '#common/zod/to-backend/users/to-backend-set-user-name';

export class ToBackendSetUserNameRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserNameRequest })
) {}

export class ToBackendSetUserNameResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserNameResponse })
) {}
