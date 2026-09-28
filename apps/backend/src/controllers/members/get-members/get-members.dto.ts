import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetMembersRequest } from '#common/zod/backend/routes/members/get-members/get-members-request';
import { zToBackendGetMembersResponse } from '#common/zod/backend/routes/members/get-members/get-members-response';

export class ToBackendGetMembersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersRequest })
) {}

export class ToBackendGetMembersResponseDto extends createBackendResponseDto({
  schema: zToBackendGetMembersResponse
}) {}
