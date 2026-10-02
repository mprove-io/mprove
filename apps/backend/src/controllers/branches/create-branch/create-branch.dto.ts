import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateBranchRequest } from '#common/types/backend/routes/branches/create-branch/create-branch-request';
import { zToBackendCreateBranchResponse } from '#common/types/backend/routes/branches/create-branch/create-branch-response';

export class ToBackendCreateBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateBranchRequest })
) {}

export class ToBackendCreateBranchResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateBranchResponse
}) {}
