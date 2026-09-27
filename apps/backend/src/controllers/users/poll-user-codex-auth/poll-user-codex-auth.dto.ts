import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendPollUserCodexAuthRequest } from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-request';
import { zToBackendPollUserCodexAuthResponse } from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-response';

export class ToBackendPollUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPollUserCodexAuthRequest })
) {}

export class ToBackendPollUserCodexAuthResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPollUserCodexAuthResponse })
) {}
