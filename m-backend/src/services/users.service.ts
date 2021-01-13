import { api } from '../barrels/api';
import { helper } from '../barrels/helper';
import { enums } from '../barrels/enums';
import { generator } from '../barrels/generator';
import { UserEntity } from '../store-entities/user.entity';
import { db } from '../barrels/db';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import * as crypto from 'crypto';

// import { CreateUserDto } from './dto/create-user.dto';
// import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private connection: Connection
  ) {}

  // create(createUserDto: CreateUserDto): Promise<User> {
  //   const user = new User();
  //   user.firstName = createUserDto.firstName;
  //   user.lastName = createUserDto.lastName;

  //   return this.usersRepository.save(user);
  // }

  // async findAll(): Promise<User[]> {
  //   return this.usersRepository.find();
  // }

  // async remove(id: string): Promise<void> {
  //   await this.usersRepository.delete(id);
  // }

  async findOneById(item: { id: string }): Promise<UserEntity> {
    return await this.usersRepository.findOne(item.id);
  }

  async addFirstUser(item: { userId: string; password: string }) {
    let { userId, password } = item;

    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');

    let alias = await this.findAlias({ userId: userId });

    let user = generator.makeUser({
      user_id: userId,
      email_verified: enums.bEnum.TRUE,
      salt: salt,
      hash: hash,
      alias: alias
    });

    let users = [user];

    let newServerTs = helper.makeTs();
    users = helper.refreshServerTs(users, newServerTs);

    await this.connection.transaction(async manager => {
      await db.insertRecords({
        manager: manager,
        records: {
          users: users
        }
        // skipChunk: true, // no sessions needs to be updated on server start
        // serverTs: newServerTs
        // sourceInitId: undefined
      });
      // .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_INSERT))
    });
    // .catch(e =>
    //   helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION)
    // )
  }

  async findAlias(item: { userId: string }) {
    let { userId } = item;

    let reg = api.MyRegex.CAPTURE_ALIAS();
    let r = reg.exec(userId);

    let alias = r ? r[1] : undefined;

    // if (!alias) {
    //   throw new ServerError({ name: enums.otherErrorsEnum.EMAIL_ALIAS });
    // }

    let count = 2;

    let restart = true;

    while (restart) {
      let aliasUser = await this.usersRepository.findOne({ alias: alias });

      if (helper.isDefined(aliasUser)) {
        alias = `${alias}${count}`;
        count++;
      } else {
        restart = false;
      }
    }

    return alias;
  }
}
