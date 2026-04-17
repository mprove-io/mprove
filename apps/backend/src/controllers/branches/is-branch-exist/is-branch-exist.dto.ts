import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendIsBranchExistRequest,
  zToBackendIsBranchExistResponse
} from '#common/zod/to-backend/branches/to-backend-is-branch-exist';

export class ToBackendIsBranchExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsBranchExistRequest })
) {}

export class ToBackendIsBranchExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsBranchExistResponse })
) {}
