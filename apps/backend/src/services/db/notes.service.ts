import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class NotesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}
}
