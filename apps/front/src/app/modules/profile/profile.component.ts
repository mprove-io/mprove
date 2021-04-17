import { Component, OnInit } from '@angular/core';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  constructor(private authService: AuthService, public userQuery: UserQuery) {}

  ngOnInit() {
    this.authService.startWatch();
  }
}
