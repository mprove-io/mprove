import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditMemberRequest,
  zToBackendEditMemberResponse
} from '#common/zod/to-backend/members/to-backend-edit-member';

export class ToBackendEditMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditMemberRequest })
) {}

export class ToBackendEditMemberResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditMemberResponse })
) {}
