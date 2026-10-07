import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRevertRepoToLastCommitRequest } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import { zToBackendRevertRepoToLastCommitResponse } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';

export class ToBackendRevertRepoToLastCommitRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRevertRepoToLastCommitRequest })
) {}

export class ToBackendRevertRepoToLastCommitResponseDto extends createBackendResponseDto(
  { schema: zToBackendRevertRepoToLastCommitResponse }
) {}
