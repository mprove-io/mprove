import { ChangeDetectorRef, Component } from '@angular/core';
import type { AssistantMessage } from '@opencode-ai/sdk/v2';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';

@Component({
  standalone: false,
  selector: 'm-context-usage-circle',
  templateUrl: './context-usage-circle.component.html'
})
export class ContextUsageCircleComponent {
  strokeWidth = 2;
  radius = 8 - this.strokeWidth / 2;
  circumference = 2 * Math.PI * this.radius;
  dashOffset = this.circumference;

  percentage = 0;
  total = 0;
  contextLimit: number | undefined;
  tooltipText = '';
  hasData = false;

  metrics$ = combineLatest([
    this.sessionBundleQuery.messages$,
    this.agentModelsQuery.models$
  ]).pipe(
    tap(([messages, models]) => {
      this.percentage = 0;
      this.total = 0;
      this.contextLimit = undefined;
      this.tooltipText = '';
      this.hasData = false;
      this.dashOffset = this.circumference;

      for (let i = messages.length - 1; i >= 0; i--) {
        let msg = messages[i];
        if (msg.role !== 'assistant') continue;

        let am = msg.ocMessage as AssistantMessage;
        if (!am.tokens) continue;

        let total =
          am.tokens.input +
          am.tokens.output +
          am.tokens.reasoning +
          am.tokens.cache.read +
          am.tokens.cache.write;

        if (total <= 0) continue;

        this.total = total;
        this.hasData = true;
        let model = models.find(m => m.id === am.modelID);
        this.contextLimit = model?.contextLimit;

        if (this.contextLimit) {
          this.percentage = Math.round((total / this.contextLimit) * 100);
          let clamped = Math.max(0, Math.min(100, this.percentage));
          this.dashOffset = this.circumference * (1 - clamped / 100);
          this.tooltipText = `${this.percentage}% of context limit`;
        } else {
          this.dashOffset = this.circumference;
          this.tooltipText = '';
        }

        break;
      }

      this.cd.detectChanges();
    })
  );

  constructor(
    private sessionBundleQuery: SessionBundleQuery,
    private agentModelsQuery: AgentModelsQuery,
    private cd: ChangeDetectorRef
  ) {}
}
