import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteBranchRequest } from '#common/zod/backend/routes/branches/delete-branch/delete-branch-request';
import { zToBackendDeleteBranchResponse } from '#common/zod/backend/routes/branches/delete-branch/delete-branch-response';

export class ToBackendDeleteBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteBranchRequest })
) {}

export class ToBackendDeleteBranchResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteBranchResponse })
) {}
