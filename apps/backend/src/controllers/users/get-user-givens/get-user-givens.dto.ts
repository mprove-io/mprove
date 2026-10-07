import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetUserGivensRequest } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-request';
import { zToBackendGetUserGivensResponse } from '#common/types/backend/routes/users/get-user-givens/get-user-givens-response';

export class ToBackendGetUserGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserGivensRequest })
) {}

export class ToBackendGetUserGivensResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetUserGivensResponse }
) {}
