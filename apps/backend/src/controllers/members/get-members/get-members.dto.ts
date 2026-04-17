import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetMembersRequest,
  zToBackendGetMembersResponse
} from '#common/zod/to-backend/members/to-backend-get-members';

export class ToBackendGetMembersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersRequest })
) {}

export class ToBackendGetMembersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersResponse })
) {}
