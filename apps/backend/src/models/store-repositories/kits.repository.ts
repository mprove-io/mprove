import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class KitsRepository extends Repository<entities.KitEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.KitEntity, dataSource.createEntityManager());
  }
}
