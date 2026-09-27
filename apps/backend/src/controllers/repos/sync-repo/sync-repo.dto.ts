import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSyncRepoRequest } from '#common/zod/backend/routes/repos/sync-repo/sync-repo-request';
import { zToBackendSyncRepoResponse } from '#common/zod/backend/routes/repos/sync-repo/sync-repo-response';

export class ToBackendSyncRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSyncRepoRequest })
) {}

export class ToBackendSyncRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSyncRepoResponse })
) {}
