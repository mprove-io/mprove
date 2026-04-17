import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateBranchRequest,
  zToBackendCreateBranchResponse
} from '#common/zod/to-backend/branches/to-backend-create-branch';

export class ToBackendCreateBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateBranchRequest })
) {}

export class ToBackendCreateBranchResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateBranchResponse })
) {}
