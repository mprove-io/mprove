import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetMembersListRequest } from '#common/zod/backend/routes/members/get-members-list/get-members-list-request';
import { zToBackendGetMembersListResponse } from '#common/zod/backend/routes/members/get-members-list/get-members-list-response';

export class ToBackendGetMembersListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersListRequest })
) {}

export class ToBackendGetMembersListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetMembersListResponse }
) {}
