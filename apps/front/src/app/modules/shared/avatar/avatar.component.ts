import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  @Input()
  avatar: string;

  @Input()
  initials: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  constructor(private userQuery: UserQuery, private cd: ChangeDetectorRef) {}
}
