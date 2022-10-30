import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class BranchesRepository extends Repository<entities.BranchEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.BranchEntity, dataSource.createEntityManager());
  }
}
