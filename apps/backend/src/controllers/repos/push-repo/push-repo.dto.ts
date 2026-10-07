import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendPushRepoRequest } from '#common/types/backend/routes/repos/push-repo/push-repo-request';
import { zToBackendPushRepoResponse } from '#common/types/backend/routes/repos/push-repo/push-repo-response';

export class ToBackendPushRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPushRepoRequest })
) {}

export class ToBackendPushRepoResponseDto extends createBackendResponseDto({
  schema: zToBackendPushRepoResponse
}) {}
