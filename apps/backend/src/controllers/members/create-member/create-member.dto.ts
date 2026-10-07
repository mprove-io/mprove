import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateMemberRequest } from '#common/types/backend/routes/members/create-member/create-member-request';
import { zToBackendCreateMemberResponse } from '#common/types/backend/routes/members/create-member/create-member-response';

export class ToBackendCreateMemberRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateMemberRequest })
) {}

export class ToBackendCreateMemberResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateMemberResponse
}) {}
