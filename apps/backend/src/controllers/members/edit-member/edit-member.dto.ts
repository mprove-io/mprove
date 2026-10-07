import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditMemberRequest } from '#common/types/backend/routes/members/edit-member/edit-member-request';
import { zToBackendEditMemberResponse } from '#common/types/backend/routes/members/edit-member/edit-member-response';

export class ToBackendEditMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditMemberRequest })
) {}

export class ToBackendEditMemberResponseDto extends createBackendResponseDto({
  schema: zToBackendEditMemberResponse
}) {}
