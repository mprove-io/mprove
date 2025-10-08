import { Injectable } from '@nestjs/common';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapKitService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}
}
