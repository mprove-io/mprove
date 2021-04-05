import { Component, OnInit } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  selector: 'm-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.startWatch();
  }
}
