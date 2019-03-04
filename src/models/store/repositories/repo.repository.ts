import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.RepoEntity)
export class RepoRepository extends Repository<entities.RepoEntity> {}
