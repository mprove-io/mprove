import { Location } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';

@Component({
  selector: 'm-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss']
})
export class SpaceComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('sidenav') sidenav: MatSidenav;

  private readonly LOGIN_URL: string = '/login';

  constructor(
    private printer: services.PrinterService,
    private router: Router,
    private location: Location,
    private auth: services.AuthService,
    private doCheckService: services.DoCheckService,
    private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.doCheckService.startCheck();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  ngOnDestroy() {
    this.doCheckService.stopCheck();
  }

  signin() {
    let pathArray = this.location.path().split('/');

    if (pathArray.length === 2 && pathArray[1] === 'login') {
      localStorage.removeItem('redirect_url');
      this.auth.login();

    } else {
      this.router.navigate([this.LOGIN_URL]);
    }
  }

  isAuthenticated() {
    return this.auth.authenticated();
  }

  close() {
    this.sidenav.close();
  }

  activateEvent(event: any) {
    this.printer.log(enums.busEnum.ACTIVATE_EVENT, 'from SpaceComponent:', event);
  }

  deactivateEvent(event: any) {
    this.printer.log(enums.busEnum.DEACTIVATE_EVENT, 'from SpaceComponent:', event);
  }
}
