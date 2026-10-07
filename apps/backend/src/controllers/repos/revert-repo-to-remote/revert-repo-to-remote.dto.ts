import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRevertRepoToRemoteRequest } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import { zToBackendRevertRepoToRemoteResponse } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';

export class ToBackendRevertRepoToRemoteRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToRemoteRequest })
) {}

export class ToBackendRevertRepoToRemoteResponseDto extends createBackendResponseDto(
  { schema: zToBackendRevertRepoToRemoteResponse }
) {}
