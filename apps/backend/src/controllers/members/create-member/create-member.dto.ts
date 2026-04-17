import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateMemberRequest,
  zToBackendCreateMemberResponse
} from '#common/zod/to-backend/members/to-backend-create-member';

export class ToBackendCreateMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateMemberRequest })
) {}

export class ToBackendCreateMemberResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateMemberResponse })
) {}
