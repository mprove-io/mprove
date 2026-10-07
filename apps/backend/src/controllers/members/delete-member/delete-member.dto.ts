import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteMemberRequest } from '#common/types/backend/routes/members/delete-member/delete-member-request';
import { zToBackendDeleteMemberResponse } from '#common/types/backend/routes/members/delete-member/delete-member-response';

export class ToBackendDeleteMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteMemberRequest })
) {}

export class ToBackendDeleteMemberResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteMemberResponse
}) {}
