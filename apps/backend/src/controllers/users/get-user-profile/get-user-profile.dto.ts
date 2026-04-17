import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetUserProfileRequest,
  zToBackendGetUserProfileResponse
} from '#common/zod/to-backend/users/to-backend-get-user-profile';

export class ToBackendGetUserProfileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserProfileRequest })
) {}

export class ToBackendGetUserProfileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetUserProfileResponse })
) {}
