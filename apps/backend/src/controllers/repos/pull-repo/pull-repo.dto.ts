import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendPullRepoRequest } from '#common/zod/backend/routes/repos/pull-repo/pull-repo-request';
import { zToBackendPullRepoResponse } from '#common/zod/backend/routes/repos/pull-repo/pull-repo-response';

export class ToBackendPullRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPullRepoRequest })
) {}

export class ToBackendPullRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPullRepoResponse })
) {}
