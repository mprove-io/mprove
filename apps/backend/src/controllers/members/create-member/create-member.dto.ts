import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateMemberRequest } from '#common/zod/backend/routes/members/create-member/create-member-request';
import { zToBackendCreateMemberResponse } from '#common/zod/backend/routes/members/create-member/create-member-response';

export class ToBackendCreateMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateMemberRequest })
) {}

export class ToBackendCreateMemberResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateMemberResponse
}) {}
