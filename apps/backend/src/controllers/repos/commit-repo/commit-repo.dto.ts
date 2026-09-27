import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCommitRepoRequest } from '#common/zod/backend/routes/repos/commit-repo/commit-repo-request';
import { zToBackendCommitRepoResponse } from '#common/zod/backend/routes/repos/commit-repo/commit-repo-response';

export class ToBackendCommitRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCommitRepoRequest })
) {}

export class ToBackendCommitRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCommitRepoResponse })
) {}
