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

@Injectable()
export class AppInterceptor implements NestInterceptor {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<common.MyResponse> {
    const body = context.switchToHttp().getRequest().body;

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
