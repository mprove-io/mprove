import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendStartUserCodexAuthRequest } from '#common/zod/backend/routes/users/start-user-codex-auth/start-user-codex-auth-request';
import { zToBackendStartUserCodexAuthResponse } from '#common/zod/backend/routes/users/start-user-codex-auth/start-user-codex-auth-response';

export class ToBackendStartUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendStartUserCodexAuthRequest })
) {}

export class ToBackendStartUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendStartUserCodexAuthResponse })
) {}
