import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendPullRepoRequest,
  zToBackendPullRepoResponse
} from '#common/zod/to-backend/repos/to-backend-pull-repo';

export class ToBackendPullRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPullRepoRequest })
) {}

export class ToBackendPullRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPullRepoResponse })
) {}
