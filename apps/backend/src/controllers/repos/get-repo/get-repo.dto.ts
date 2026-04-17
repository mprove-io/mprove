import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetRepoRequest,
  zToBackendGetRepoResponse
} from '#common/zod/to-backend/repos/to-backend-get-repo';

export class ToBackendGetRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRepoRequest })
) {}

export class ToBackendGetRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRepoResponse })
) {}
