import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteUserCodexAuthRequest,
  zToBackendDeleteUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-delete-user-codex-auth';

export class ToBackendDeleteUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserCodexAuthRequest })
) {}

export class ToBackendDeleteUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteUserCodexAuthResponse })
) {}
