import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetMembersListRequest } from '#common/types/backend/routes/members/get-members-list/get-members-list-request';
import { zToBackendGetMembersListResponse } from '#common/types/backend/routes/members/get-members-list/get-members-list-response';

export class ToBackendGetMembersListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMembersListRequest })
) {}

export class ToBackendGetMembersListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetMembersListResponse }
) {}
