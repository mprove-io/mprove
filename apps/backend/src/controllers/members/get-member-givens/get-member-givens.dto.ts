import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetMemberGivensRequest } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-request';
import { zToBackendGetMemberGivensResponse } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-response';

export class ToBackendGetMemberGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensRequest })
) {}

export class ToBackendGetMemberGivensResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetMemberGivensResponse }
) {}
