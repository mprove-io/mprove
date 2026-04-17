import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCompleteUserRegistrationRequest,
  zToBackendCompleteUserRegistrationResponse
} from '#common/zod/to-backend/users/to-backend-complete-user-registration';

export class ToBackendCompleteUserRegistrationRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCompleteUserRegistrationRequest })
) {}

export class ToBackendCompleteUserRegistrationResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCompleteUserRegistrationResponse })
) {}
