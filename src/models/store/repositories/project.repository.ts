import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.ProjectEntity)
export class ProjectRepository extends Repository<entities.ProjectEntity> {
}
