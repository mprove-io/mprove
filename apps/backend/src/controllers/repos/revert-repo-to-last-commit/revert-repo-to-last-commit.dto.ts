import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRevertRepoToLastCommitRequest } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import { zToBackendRevertRepoToLastCommitResponse } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';

export class ToBackendRevertRepoToLastCommitRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitRequest })
) {}

export class ToBackendRevertRepoToLastCommitResponseDto extends createBackendResponseDto(
  { schema: zToBackendRevertRepoToLastCommitResponse }
) {}
