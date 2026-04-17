import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendPushRepoRequest,
  zToBackendPushRepoResponse
} from '#common/zod/to-backend/repos/to-backend-push-repo';

export class ToBackendPushRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPushRepoRequest })
) {}

export class ToBackendPushRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPushRepoResponse })
) {}
