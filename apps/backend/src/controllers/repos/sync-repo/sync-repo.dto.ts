import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSyncRepoRequest,
  zToBackendSyncRepoResponse
} from '#common/zod/to-backend/repos/to-backend-sync-repo';

export class ToBackendSyncRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSyncRepoRequest })
) {}

export class ToBackendSyncRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSyncRepoResponse })
) {}
