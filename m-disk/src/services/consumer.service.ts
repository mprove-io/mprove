import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerService {
  async do(): Promise<string> {
    return 'm-disk ConsumerService.do Hello!';
  }
}
