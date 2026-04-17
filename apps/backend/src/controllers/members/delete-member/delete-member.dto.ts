import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteMemberRequest,
  zToBackendDeleteMemberResponse
} from '#common/zod/to-backend/members/to-backend-delete-member';

export class ToBackendDeleteMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteMemberRequest })
) {}

export class ToBackendDeleteMemberResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteMemberResponse })
) {}
