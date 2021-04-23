import { Component, Input } from '@angular/core';
import { UserQuery } from '~front/app/queries/user.query';

@Component({
  selector: 'm-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  @Input()
  avatar: string;

  constructor(public userQuery: UserQuery) {}
}
