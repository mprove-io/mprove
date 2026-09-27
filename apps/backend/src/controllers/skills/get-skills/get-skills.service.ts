import { Injectable } from '@nestjs/common';
import { SKILLS_DATA } from '#backend/mprove-docs-cache/skills';
import type { ToBackendGetSkillsOutput } from '#common/zod/backend/routes/skills/get-skills/get-skills-response';

@Injectable()
export class GetSkillsService {
  async getSkills(): Promise<ToBackendGetSkillsOutput> {
    let payload: ToBackendGetSkillsOutput = {
      skillItems: SKILLS_DATA
    };

    return payload;
  }
}
