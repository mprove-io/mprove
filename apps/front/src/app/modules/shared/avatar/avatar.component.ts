import { Component, Input } from '@angular/core';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';

@Component({
  selector: 'm-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  @Input()
  avatarBig: string;

  constructor(public userQuery: UserQuery, public navQuery: NavQuery) {}
}
