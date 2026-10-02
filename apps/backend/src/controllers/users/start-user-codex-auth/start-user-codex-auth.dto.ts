import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendStartUserCodexAuthRequest } from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-request';
import { zToBackendStartUserCodexAuthResponse } from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-response';

export class ToBackendStartUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendStartUserCodexAuthRequest })
) {}

export class ToBackendStartUserCodexAuthResponseDto extends createBackendResponseDto(
  { schema: zToBackendStartUserCodexAuthResponse }
) {}
