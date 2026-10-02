import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetBranchesListRequest } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-request';
import { zToBackendGetBranchesListResponse } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-response';

export class ToBackendGetBranchesListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetBranchesListRequest })
) {}

export class ToBackendGetBranchesListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetBranchesListResponse }
) {}
