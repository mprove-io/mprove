import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCheckSignUpRequest } from '#common/zod/backend/routes/check/check-sign-up/check-sign-up-request';
import { zToBackendCheckSignUpResponse } from '#common/zod/backend/routes/check/check-sign-up/check-sign-up-response';

export class ToBackendCheckSignUpRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckSignUpRequest })
) {}

export class ToBackendCheckSignUpResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckSignUpResponse })
) {}
