import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditMemberRequest } from '#common/zod/backend/routes/members/edit-member/edit-member-request';
import { zToBackendEditMemberResponse } from '#common/zod/backend/routes/members/edit-member/edit-member-response';

export class ToBackendEditMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditMemberRequest })
) {}

export class ToBackendEditMemberResponseDto extends createBackendResponseDto({
  schema: zToBackendEditMemberResponse
}) {}
