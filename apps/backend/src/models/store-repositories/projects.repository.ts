import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.ProjectEntity)
export class ProjectsRepository extends Repository<entities.ProjectEntity> {}
