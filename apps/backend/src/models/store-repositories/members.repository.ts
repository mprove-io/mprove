import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { entities } from '~backend/barrels/entities';

@Injectable()
export class MembersRepository extends Repository<entities.MemberEntity> {
  constructor(private dataSource: DataSource) {
    super(entities.MemberEntity, dataSource.createEntityManager());
  }
}
