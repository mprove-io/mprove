import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCloneTestRepoRequest } from '#common/zod/backend/routes/test-routes/clone-test-repo/clone-test-repo-request';
import { zToBackendCloneTestRepoResponse } from '#common/zod/backend/routes/test-routes/clone-test-repo/clone-test-repo-response';

export class ToBackendCloneTestRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloneTestRepoRequest })
) {}

export class ToBackendCloneTestRepoResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloneTestRepoResponse })
) {}
