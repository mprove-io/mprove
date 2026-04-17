import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSetUserCodexAuthRequest,
  zToBackendSetUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-set-user-codex-auth';

export class ToBackendSetUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserCodexAuthRequest })
) {}

export class ToBackendSetUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetUserCodexAuthResponse })
) {}
