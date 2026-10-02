import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCheckSignUpRequest } from '#common/types/backend/routes/check/check-sign-up/check-sign-up-request';
import { zToBackendCheckSignUpResponse } from '#common/types/backend/routes/check/check-sign-up/check-sign-up-response';

export class ToBackendCheckSignUpRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCheckSignUpRequest })
) {}

export class ToBackendCheckSignUpResponseDto extends createBackendResponseDto({
  schema: zToBackendCheckSignUpResponse
}) {}
