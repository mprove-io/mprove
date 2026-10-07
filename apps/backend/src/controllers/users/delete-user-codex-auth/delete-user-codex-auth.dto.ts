import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteUserCodexAuthRequest } from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-request';
import { zToBackendDeleteUserCodexAuthResponse } from '#common/types/backend/routes/users/delete-user-codex-auth/delete-user-codex-auth-response';

export class ToBackendDeleteUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserCodexAuthRequest })
) {}

export class ToBackendDeleteUserCodexAuthResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteUserCodexAuthResponse }
) {}
