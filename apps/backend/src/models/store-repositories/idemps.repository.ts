import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class IdempsRepository extends Repository<entities.IdempEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.IdempEntity, dataSource.createEntityManager());
  }
}
