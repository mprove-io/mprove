import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'm-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent {
  constructor(private router: Router) {}
}
