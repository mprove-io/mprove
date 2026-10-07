import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteBranchRequest } from '#common/types/backend/routes/branches/delete-branch/delete-branch-request';
import { zToBackendDeleteBranchResponse } from '#common/types/backend/routes/branches/delete-branch/delete-branch-response';

export class ToBackendDeleteBranchRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteBranchRequest })
) {}

export class ToBackendDeleteBranchResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteBranchResponse
}) {}
