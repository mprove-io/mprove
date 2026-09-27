import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetBranchesListRequest } from '#common/zod/backend/routes/branches/get-branches-list/get-branches-list-request';
import { zToBackendGetBranchesListResponse } from '#common/zod/backend/routes/branches/get-branches-list/get-branches-list-response';

export class ToBackendGetBranchesListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetBranchesListRequest })
) {}

export class ToBackendGetBranchesListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetBranchesListResponse })
) {}
