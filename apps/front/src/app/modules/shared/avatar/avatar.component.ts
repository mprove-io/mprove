import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { RESTRICTED_USER_ALIAS } from '#common/constants/top';
import { UserQuery } from '~front/app/queries/user.query';

@Component({
  standalone: false,
  selector: 'm-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent {
  restrictedUserAlias = RESTRICTED_USER_ALIAS;

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

  constructor(
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}
}
