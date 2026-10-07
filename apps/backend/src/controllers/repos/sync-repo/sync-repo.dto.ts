import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSyncRepoRequest } from '#common/types/backend/routes/repos/sync-repo/sync-repo-request';
import { zToBackendSyncRepoResponse } from '#common/types/backend/routes/repos/sync-repo/sync-repo-response';

export class ToBackendSyncRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSyncRepoRequest })
) {}

export class ToBackendSyncRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendSyncRepoResponse
}) {}
