import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCommitRepoRequest,
  zToBackendCommitRepoResponse
} from '#common/zod/to-backend/repos/to-backend-commit-repo';

export class ToBackendCommitRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCommitRepoRequest })
) {}

export class ToBackendCommitRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCommitRepoResponse })
) {}
