import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCloneTestRepoRequest,
  zToBackendCloneTestRepoResponse
} from '#common/zod/to-backend/test-routes/to-backend-clone-test-repo';

export class ToBackendCloneTestRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloneTestRepoRequest })
) {}

export class ToBackendCloneTestRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloneTestRepoResponse })
) {}
