import { EntityRepository, Repository } from 'typeorm';
import { entities } from '../../../barrels/entities';

@EntityRepository(entities.FileEntity)
export class FileRepository extends Repository<entities.FileEntity> {}
