import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCompleteUserRegistrationRequest } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-request';
import { zToBackendCompleteUserRegistrationResponse } from '#common/types/backend/routes/users/complete-user-registration/complete-user-registration-response';

export class ToBackendCompleteUserRegistrationRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCompleteUserRegistrationRequest })
) {}

export class ToBackendCompleteUserRegistrationResponseDto extends createBackendResponseDto(
  { schema: zToBackendCompleteUserRegistrationResponse }
) {}
