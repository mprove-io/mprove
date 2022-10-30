import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class EnvsRepository extends Repository<entities.EnvEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.EnvEntity, dataSource.createEntityManager());
  }
}
