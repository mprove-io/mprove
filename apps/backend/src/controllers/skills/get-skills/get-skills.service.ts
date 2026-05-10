import { Injectable } from '@nestjs/common';
import { SKILLS_DATA } from '#common/constants/skills-data';
import type { ToBackendGetSkillsResponsePayload } from '#common/zod/to-backend/skills/to-backend-get-skills';

@Injectable()
export class GetSkillsService {
  async getSkills(): Promise<ToBackendGetSkillsResponsePayload> {
    let payload: ToBackendGetSkillsResponsePayload = {
      skillItems: SKILLS_DATA
    };

    return payload;
  }
}
