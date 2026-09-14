import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import {
  zToBackendGetMemberGivensRequest,
  zToBackendGetMemberGivensResponse
} from '#common/zod/to-backend/members/to-backend-get-member-givens';

export class ToBackendGetMemberGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensRequest })
) {}

export class ToBackendGetMemberGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensResponse })
) {}
