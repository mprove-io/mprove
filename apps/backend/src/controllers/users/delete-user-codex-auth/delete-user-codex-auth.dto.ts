import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteUserCodexAuthRequest } from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-request';
import { zToBackendDeleteUserCodexAuthResponse } from '#common/zod/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-response';

export class ToBackendDeleteUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserCodexAuthRequest })
) {}

export class ToBackendDeleteUserCodexAuthResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteUserCodexAuthResponse }
) {}
