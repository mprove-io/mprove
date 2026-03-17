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
  strokeWidth = 2.5;
  radius = 11 - this.strokeWidth / 2;
  circumference = 2 * Math.PI * this.radius;
  dashOffset = this.circumference;

  percentage = 0;
  total = 0;
  contextLimit: number | undefined;
  tooltipText = '';
  hasData = false;

  contextUsage$ = combineLatest([
    this.sessionBundleQuery.messages$,
    this.agentModelsQuery.modelsOpencode$
  ]).pipe(
    tap(([messages, models]) => {
      this.percentage = 0;
      this.total = 0;
      this.contextLimit = undefined;
      this.tooltipText = '';
      this.hasData = false;
      this.dashOffset = this.circumference;

      let found = [...messages].reverse().find(msg => {
        if (msg.role !== 'assistant') return false;

        let assistantMessage = msg.ocMessage as AssistantMessage;

        if (!assistantMessage.tokens) return false;

        let total =
          assistantMessage.tokens.input +
          assistantMessage.tokens.output +
          assistantMessage.tokens.reasoning +
          assistantMessage.tokens.cache.read +
          assistantMessage.tokens.cache.write;

        return total > 0;
      });

      if (found) {
        let assistantMessage = found.ocMessage as AssistantMessage;

        let total =
          assistantMessage.tokens.input +
          assistantMessage.tokens.output +
          assistantMessage.tokens.reasoning +
          assistantMessage.tokens.cache.read +
          assistantMessage.tokens.cache.write;

        this.total = total;
        this.hasData = true;
        let model = models.find(m => m.id === assistantMessage.modelID);
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
