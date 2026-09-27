import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRevertRepoToLastCommitRequest } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import { zToBackendRevertRepoToLastCommitResponse } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';

export class ToBackendRevertRepoToLastCommitRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitRequest })
) {}

export class ToBackendRevertRepoToLastCommitResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitResponse })
) {}
