import { ChangeDetectorRef, Component } from '@angular/core';
import type { AssistantMessage } from '@opencode-ai/sdk/v2';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionModelsQuery } from '#front/app/queries/session-models.query';

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
    this.sessionModelsQuery.modelsOpencode$,
    this.sessionModelsQuery.modelsAi$
  ]).pipe(
    tap(([messages, modelsOpencode, modelsAi]) => {
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

        let session = this.sessionQuery.getValue();

        let models =
          session.type === SessionTypeEnum.Explorer ? modelsAi : modelsOpencode;

        let model = models.find(m => m.id === assistantMessage.modelID);
        this.contextLimit = model?.contextLimit;

        if (this.contextLimit) {
          this.percentage = Math.round((total / this.contextLimit) * 100);
          let clamped = Math.max(0, Math.min(100, this.percentage));
          this.dashOffset = this.circumference * (1 - clamped / 100);
          let contextLimit = this.formatTokenCount({
            count: this.contextLimit
          });
          this.tooltipText = `${this.percentage}% of context limit ${contextLimit}`;
        } else {
          this.dashOffset = this.circumference;
          this.tooltipText = '';
        }
      }

      this.cd.detectChanges();
    })
  );

  formatTokenCount(item: { count: number }): string {
    let { count } = item;

    if (count >= 1_000) {
      return `${Math.round(count / 1000)}k`;
    }

    return `${count}`;
  }

  constructor(
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionModelsQuery: SessionModelsQuery,
    private cd: ChangeDetectorRef
  ) {}
}
