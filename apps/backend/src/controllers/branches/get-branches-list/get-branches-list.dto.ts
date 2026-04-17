import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetBranchesListRequest,
  zToBackendGetBranchesListResponse
} from '#common/zod/to-backend/branches/to-backend-get-branches-list';

export class ToBackendGetBranchesListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetBranchesListRequest })
) {}

export class ToBackendGetBranchesListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetBranchesListResponse })
) {}
