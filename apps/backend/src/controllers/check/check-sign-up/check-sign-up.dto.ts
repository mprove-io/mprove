import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCheckSignUpRequest,
  zToBackendCheckSignUpResponse
} from '#common/zod/to-backend/check/to-backend-check-sign-up';

export class ToBackendCheckSignUpRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckSignUpRequest })
) {}

export class ToBackendCheckSignUpResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckSignUpResponse })
) {}
