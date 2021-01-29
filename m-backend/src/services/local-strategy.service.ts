import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from './users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'payload[]email',
      passwordField: 'payload[]password'
    });
  }

  async validate(email: string, password: string) {
    let user = await this.usersService.validateUser(email, password);
    return user;
  }
}
