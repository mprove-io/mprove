import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendPullRepoRequest } from '#common/types/backend/routes/repos/pull-repo/pull-repo-request';
import { zToBackendPullRepoResponse } from '#common/types/backend/routes/repos/pull-repo/pull-repo-response';

export class ToBackendPullRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPullRepoRequest })
) {}

export class ToBackendPullRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendPullRepoResponse
}) {}
