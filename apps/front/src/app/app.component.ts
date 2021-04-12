import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { MyDialogService } from './services/my-dialog.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'front';

  constructor(
    private authService: AuthService,
    private myDialogService: MyDialogService
  ) {}

  ngOnInit() {
    this.authService.startWatch();

    // throw new Error('appComponent ngOnInit');

    // this.myDialogService.showEmailConfirmed();
    // this.myDialogService.showPasswordResetSent('test123123@example.com');

    // this.myDialogService.showError({
    //   errorData: {
    //     message: '8j2jf3894fj598324fj5983724f5893j24f598j739284f57j398f'
    //   },
    //   isThrow: false
    // });
  }
}
