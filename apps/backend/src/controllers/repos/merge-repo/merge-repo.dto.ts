import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendMergeRepoRequest,
  zToBackendMergeRepoResponse
} from '#common/zod/to-backend/repos/to-backend-merge-repo';

export class ToBackendMergeRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMergeRepoRequest })
) {}

export class ToBackendMergeRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMergeRepoResponse })
) {}
