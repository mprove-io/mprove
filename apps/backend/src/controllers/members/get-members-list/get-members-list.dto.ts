import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetMembersListRequest,
  zToBackendGetMembersListResponse
} from '#common/zod/to-backend/members/to-backend-get-members-list';

export class ToBackendGetMembersListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersListRequest })
) {}

export class ToBackendGetMembersListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersListResponse })
) {}
