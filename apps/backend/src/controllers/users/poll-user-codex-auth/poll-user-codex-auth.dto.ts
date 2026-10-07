import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendPollUserCodexAuthRequest } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-request';
import { zToBackendPollUserCodexAuthResponse } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-response';

export class ToBackendPollUserCodexAuthRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPollUserCodexAuthRequest })
) {}

export class ToBackendPollUserCodexAuthResponseDto extends createBackendResponseDto(
  { schema: zToBackendPollUserCodexAuthResponse }
) {}
