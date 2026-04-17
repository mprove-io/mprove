import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRevertRepoToRemoteRequest,
  zToBackendRevertRepoToRemoteResponse
} from '#common/zod/to-backend/repos/to-backend-revert-repo-to-remote';

export class ToBackendRevertRepoToRemoteRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToRemoteRequest })
) {}

export class ToBackendRevertRepoToRemoteResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToRemoteResponse })
) {}
