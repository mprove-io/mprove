import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendStartUserCodexAuthRequest,
  zToBackendStartUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-start-user-codex-auth';

export class ToBackendStartUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendStartUserCodexAuthRequest })
) {}

export class ToBackendStartUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendStartUserCodexAuthResponse })
) {}
