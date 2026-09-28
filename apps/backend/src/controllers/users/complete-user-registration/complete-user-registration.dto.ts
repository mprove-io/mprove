import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCompleteUserRegistrationRequest } from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-request';
import { zToBackendCompleteUserRegistrationResponse } from '#common/zod/backend/routes/users/complete-user-registration/complete-user-registration-response';

export class ToBackendCompleteUserRegistrationRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCompleteUserRegistrationRequest })
) {}

export class ToBackendCompleteUserRegistrationResponseDto extends createBackendResponseDto(
  { schema: zToBackendCompleteUserRegistrationResponse }
) {}
