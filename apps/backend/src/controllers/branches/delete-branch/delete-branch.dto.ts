import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteBranchRequest,
  zToBackendDeleteBranchResponse
} from '#common/zod/to-backend/branches/to-backend-delete-branch';

export class ToBackendDeleteBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteBranchRequest })
) {}

export class ToBackendDeleteBranchResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteBranchResponse })
) {}
