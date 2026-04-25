import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendPollUserCodexAuthRequest,
  zToBackendPollUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-poll-user-codex-auth';

export class ToBackendPollUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPollUserCodexAuthRequest })
) {}

export class ToBackendPollUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPollUserCodexAuthResponse })
) {}
