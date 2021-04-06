import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  title = 'front';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.startWatch();

    // throw new ClientError({
    //   message: '12345',
    //   originalError: 'oerr',
    //   reqInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
    //   reqTraceId: '1234e2341e',
    //   reqIdempotencyKey: '5324g5235g34',
    //   response: {
    //     a: 'gdfgdsfg',
    //     b: 'lmdglklkgcdfklgm'
    //   }
    // });

    // throw new Error('123');
  }
}
