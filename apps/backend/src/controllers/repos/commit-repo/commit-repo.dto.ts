import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCommitRepoRequest } from '#common/zod/backend/routes/repos/commit-repo/commit-repo-request';
import { zToBackendCommitRepoResponse } from '#common/zod/backend/routes/repos/commit-repo/commit-repo-response';

export class ToBackendCommitRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCommitRepoRequest })
) {}

export class ToBackendCommitRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendCommitRepoResponse
}) {}
