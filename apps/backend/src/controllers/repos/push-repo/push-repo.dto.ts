import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendPushRepoRequest } from '#common/zod/backend/routes/repos/push-repo/push-repo-request';
import { zToBackendPushRepoResponse } from '#common/zod/backend/routes/repos/push-repo/push-repo-response';

export class ToBackendPushRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPushRepoRequest })
) {}

export class ToBackendPushRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPushRepoResponse })
) {}
