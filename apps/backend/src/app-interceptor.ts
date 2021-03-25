import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from './barrels/common';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private idempsRepository: repositories.IdempsRepository
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<common.MyResponse>> { // : Promise<any>
    let request = context.switchToHttp().getRequest();
    let { user, body } = request;

    let idemp = await this.idempsRepository.findOne({});

    return next.handle().pipe(
      map(payload =>
        common.makeOkResponse({
          payload: payload,
          cs: this.cs,
          req: body
        })
      )
    );
  }
}
