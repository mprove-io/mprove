import { EntityRepository, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@EntityRepository(entities.VizEntity)
export class VizsRepository extends Repository<entities.VizEntity> {}
