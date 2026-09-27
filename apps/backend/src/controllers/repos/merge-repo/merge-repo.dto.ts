import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendMergeRepoRequest } from '#common/zod/backend/routes/repos/merge-repo/merge-repo-request';
import { zToBackendMergeRepoResponse } from '#common/zod/backend/routes/repos/merge-repo/merge-repo-response';

export class ToBackendMergeRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMergeRepoRequest })
) {}

export class ToBackendMergeRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMergeRepoResponse })
) {}
