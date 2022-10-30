import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class EvsRepository extends Repository<entities.EvEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.EvEntity, dataSource.createEntityManager());
  }
}
