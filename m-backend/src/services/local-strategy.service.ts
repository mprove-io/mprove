import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from './users.service';

@Injectable()
export class LocalStrategyService extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super();
  }

  async validate(userId: string, password: string) {
    let user = await this.usersService.validateUser(userId, password);
    return user;
  }
}
