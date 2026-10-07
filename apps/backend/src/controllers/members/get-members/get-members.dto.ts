import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetMembersRequest } from '#common/types/backend/routes/members/get-members/get-members-request';
import { zToBackendGetMembersResponse } from '#common/types/backend/routes/members/get-members/get-members-response';

export class ToBackendGetMembersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersRequest })
) {}

export class ToBackendGetMembersResponseDto extends createBackendResponseDto({
  schema: zToBackendGetMembersResponse
}) {}
