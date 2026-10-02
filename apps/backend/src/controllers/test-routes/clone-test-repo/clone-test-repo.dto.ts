import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCloneTestRepoRequest } from '#common/types/backend/routes/test-routes/clone-test-repo/clone-test-repo-request';
import { zToBackendCloneTestRepoResponse } from '#common/types/backend/routes/test-routes/clone-test-repo/clone-test-repo-response';

export class ToBackendCloneTestRepoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCloneTestRepoRequest })
) {}

export class ToBackendCloneTestRepoResponseDto extends createBackendResponseDto(
  { schema: zToBackendCloneTestRepoResponse }
) {}
