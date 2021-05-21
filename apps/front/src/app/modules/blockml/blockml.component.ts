import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-blockml',
  templateUrl: './blockml.component.html'
})
export class BlockmlComponent implements OnInit {
  pathBlockml = common.PATH_BLOCKML;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );
  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    let ar = this.router.url.split('/');
    this.lastUrl = ar[ar.length - 1];
  }
}
