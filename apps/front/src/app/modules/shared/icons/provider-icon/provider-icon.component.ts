import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-provider-icon',
  templateUrl: 'provider-icon.component.html'
})
export class ProviderIconComponent {
  @Input()
  providerId: string;

  openai = 'openai';
  anthropic = 'anthropic';
  opencode = 'opencode';

  constructor() {}
}
