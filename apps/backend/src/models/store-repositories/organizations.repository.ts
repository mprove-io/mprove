import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.OrganizationEntity)
export class OrganizationsRepository extends Repository<entities.OrganizationEntity> {}
