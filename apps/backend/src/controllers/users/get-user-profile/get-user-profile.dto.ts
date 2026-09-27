import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetUserProfileRequest } from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-request';
import { zToBackendGetUserProfileResponse } from '#common/zod/backend/routes/users/get-user-profile/get-user-profile-response';

export class ToBackendGetUserProfileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserProfileRequest })
) {}

export class ToBackendGetUserProfileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserProfileResponse })
) {}
