import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class RepsRepository extends Repository<entities.RepEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.RepEntity, dataSource.createEntityManager());
  }
}
