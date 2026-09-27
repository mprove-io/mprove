import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendIsBranchExistRequest } from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-request';
import { zToBackendIsBranchExistResponse } from '#common/zod/backend/routes/branches/is-branch-exist/is-branch-exist-response';

export class ToBackendIsBranchExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsBranchExistRequest })
) {}

export class ToBackendIsBranchExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsBranchExistResponse })
) {}
