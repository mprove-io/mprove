import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRevertRepoToLastCommitRequest,
  zToBackendRevertRepoToLastCommitResponse
} from '#common/zod/to-backend/repos/to-backend-revert-repo-to-last-commit';

export class ToBackendRevertRepoToLastCommitRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitRequest })
) {}

export class ToBackendRevertRepoToLastCommitResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitResponse })
) {}
