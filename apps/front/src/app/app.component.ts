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
    throw Error('123');
    this.authService.startWatch();
  }
}
