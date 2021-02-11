import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.BranchEntity)
export class BranchesRepository extends Repository<entities.BranchEntity> {}
