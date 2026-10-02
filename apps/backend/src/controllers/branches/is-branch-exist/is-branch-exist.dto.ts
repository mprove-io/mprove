import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendIsBranchExistRequest } from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-request';
import { zToBackendIsBranchExistResponse } from '#common/types/backend/routes/branches/is-branch-exist/is-branch-exist-response';

export class ToBackendIsBranchExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsBranchExistRequest })
) {}

export class ToBackendIsBranchExistResponseDto extends createBackendResponseDto(
  { schema: zToBackendIsBranchExistResponse }
) {}
