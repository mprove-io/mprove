import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetOrgUsersRequest } from '#common/types/backend/routes/org-users/get-org-users/get-org-users-request';
import { zToBackendGetOrgUsersResponse } from '#common/types/backend/routes/org-users/get-org-users/get-org-users-response';

export class ToBackendGetOrgUsersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetOrgUsersRequest })
) {}

export class ToBackendGetOrgUsersResponseDto extends createBackendResponseDto({
  schema: zToBackendGetOrgUsersResponse
}) {}
