import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ViewChild
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';

@Component({
  selector: 'm-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss']
})
export class SpaceComponent implements AfterViewChecked {
  @ViewChild('sidenav') sidenav: MatSidenav;

  private readonly LOGIN_URL: string = '/login';
  private readonly REGISTER_URL: string = '/register';

  constructor(
    private printer: services.PrinterService,
    private router: Router,
    private auth: services.AuthService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  register() {
    this.router.navigate([this.REGISTER_URL]);
  }
  signin() {
    this.router.navigate([this.LOGIN_URL]);
  }

  isAuthenticated() {
    return this.auth.authenticated();
  }

  close() {
    this.sidenav.close();
  }

  activateEvent(event: any) {
    this.printer.log(
      enums.busEnum.ACTIVATE_EVENT,
      'from SpaceComponent:',
      event
    );
  }

  deactivateEvent(event: any) {
    this.printer.log(
      enums.busEnum.DEACTIVATE_EVENT,
      'from SpaceComponent:',
      event
    );
  }
}
