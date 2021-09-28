import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  @Input()
  avatar: string;

  @Input()
  initials: string;

  constructor() {}
}
