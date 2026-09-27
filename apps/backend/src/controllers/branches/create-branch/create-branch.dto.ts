import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateBranchRequest } from '#common/zod/backend/routes/branches/create-branch/create-branch-request';
import { zToBackendCreateBranchResponse } from '#common/zod/backend/routes/branches/create-branch/create-branch-response';

export class ToBackendCreateBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateBranchRequest })
) {}

export class ToBackendCreateBranchResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateBranchResponse })
) {}
