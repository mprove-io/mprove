import { Component, Input } from '@angular/core';
import {
  ANTHROPIC_PROVIDER_ID,
  CODEX_PROVIDER_ID,
  OPENAI_PROVIDER_ID
} from '#common/constants/providers';

@Component({
  standalone: false,
  selector: 'm-provider-icon',
  templateUrl: 'provider-icon.component.html'
})
export class ProviderIconComponent {
  @Input()
  providerId: string;

  openaiProviderId = OPENAI_PROVIDER_ID;
  anthropicProviderId = ANTHROPIC_PROVIDER_ID;
  codexProviderId = CODEX_PROVIDER_ID;

  constructor() {}
}
