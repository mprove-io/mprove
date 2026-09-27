import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteMemberRequest } from '#common/zod/backend/routes/members/delete-member/delete-member-request';
import { zToBackendDeleteMemberResponse } from '#common/zod/backend/routes/members/delete-member/delete-member-response';

export class ToBackendDeleteMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteMemberRequest })
) {}

export class ToBackendDeleteMemberResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteMemberResponse })
) {}
