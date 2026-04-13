import { createZodDto } from 'nestjs-zod';
import {
  zToBackendSetUserNameRequest,
  zToBackendSetUserNameResponse
} from '#common/zod/to-backend/users/to-backend-set-user-name';

export class ToBackendSetUserNameRequestDto extends createZodDto(
  zToBackendSetUserNameRequest
) {}

export class ToBackendSetUserNameResponseDto extends createZodDto(
  zToBackendSetUserNameResponse
) {}
