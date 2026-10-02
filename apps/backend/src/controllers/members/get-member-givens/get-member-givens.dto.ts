import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetMemberGivensRequest } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-request';
import { zToBackendGetMemberGivensResponse } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-response';

export class ToBackendGetMemberGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetMemberGivensRequest })
) {}

export class ToBackendGetMemberGivensResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetMemberGivensResponse }
) {}
