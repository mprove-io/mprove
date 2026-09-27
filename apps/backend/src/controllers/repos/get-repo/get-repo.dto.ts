import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetRepoRequest } from '#common/zod/backend/routes/repos/get-repo/get-repo-request';
import { zToBackendGetRepoResponse } from '#common/zod/backend/routes/repos/get-repo/get-repo-response';

export class ToBackendGetRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRepoRequest })
) {}

export class ToBackendGetRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRepoResponse })
) {}
