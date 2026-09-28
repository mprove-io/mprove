import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetServerUsersRequest } from '#common/zod/backend/routes/users/get-server-users/get-server-users-request';
import { zToBackendGetServerUsersResponse } from '#common/zod/backend/routes/users/get-server-users/get-server-users-response';

export class ToBackendGetServerUsersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetServerUsersRequest })
) {}

export class ToBackendGetServerUsersResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetServerUsersResponse }
) {}
