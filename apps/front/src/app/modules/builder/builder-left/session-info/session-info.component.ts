import { ChangeDetectorRef, Component } from '@angular/core';
import type { Todo } from '@opencode-ai/sdk/v2';
import { interval } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { SessionApi } from '#common/interfaces/backend/session-api';
// import { AgentModelsQuery } from '#front/app/queries/agent-models.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { TimeService } from '#front/app/services/time.service';

@Component({
  standalone: false,
  selector: 'm-session-info',
  templateUrl: './session-info.component.html'
})
export class SessionInfoComponent {
  archivedReasonEnum = ArchivedReasonEnum;

  sessionId: string;
  session: SessionApi;
  todos: Todo[] = [];

  completedCount = 0;
  totalCount = 0;
  lastActivityAgo = '';

  usageDisplay = '-';
  providerDisplay = '-';
  modelDisplay = '-';

  providerLabels: Record<string, string> = {
    opencode: 'Zen',
    openai: 'OpenAI',
    anthropic: 'Anthropic'
  };

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.session = x;
      this.sessionId = x?.sessionId;
      this.lastActivityAgo = x?.lastActivityTs
        ? this.timeService.timeAgoFromNow(x.lastActivityTs)
        : '';

      if (x?.model && x.model !== 'default' && x.model.includes('/')) {
        let parts = x.model.split('/');
        this.providerDisplay = this.providerLabels[parts[0]] || parts[0];
        this.modelDisplay = parts.slice(1).join('/');
      } else {
        this.providerDisplay = x?.model || '-';
        this.modelDisplay = '-';
      }

      this.cd.detectChanges();
    })
  );

  todos$ = this.sessionBundleQuery.todos$.pipe(
    tap(x => {
      this.todos = x ?? [];
      this.completedCount = this.todos.filter(
        t => t.status === 'completed'
      ).length;
      this.totalCount = this.todos.length;
      this.cd.detectChanges();
    })
  );

  // metrics$ = combineLatest([
  //   this.sessionBundleQuery.messages$,
  //   this.agentModelsQuery.models$
  // ]).pipe(
  //   tap(([messages, models]) => {
  //     this.usageDisplay = '-';
  //
  //     for (let i = messages.length - 1; i >= 0; i--) {
  //       let msg = messages[i];
  //       if (msg.role !== 'assistant') continue;
  //
  //       let am = msg.ocMessage as AssistantMessage;
  //       if (!am.tokens) continue;
  //
  //       let total =
  //         am.tokens.input +
  //         am.tokens.output +
  //         am.tokens.reasoning +
  //         am.tokens.cache.read +
  //         am.tokens.cache.write;
  //
  //       if (total <= 0) continue;
  //
  //       let model = models.find(m => m.id === am.modelID);
  //       if (model?.contextLimit) {
  //         let pct = Math.round((total / model.contextLimit) * 100);
  //         this.usageDisplay = `${pct}% - ${total.toLocaleString()} of ${model.contextLimit.toLocaleString()}`;
  //       } else {
  //         this.usageDisplay = total.toLocaleString();
  //       }
  //
  //       break;
  //     }
  //
  //     this.cd.detectChanges();
  //   })
  // );

  constructor(
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    // private agentModelsQuery: AgentModelsQuery,
    private timeService: TimeService,
    private cd: ChangeDetectorRef
  ) {}

  formatTimestamp(ts: number): string {
    if (!ts) return '-';
    let d = new Date(ts);
    let year = d.getFullYear();
    let month = String(d.getMonth() + 1).padStart(2, '0');
    let day = String(d.getDate()).padStart(2, '0');
    let hours = String(d.getHours()).padStart(2, '0');
    let minutes = String(d.getMinutes()).padStart(2, '0');
    let seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  interval$ = interval(1000).pipe(
    startWith(0),
    tap(() => {
      this.lastActivityAgo = this.session?.lastActivityTs
        ? this.timeService.timeAgoFromNow(this.session.lastActivityTs)
        : '-';
      this.cd.detectChanges();
    })
  );
}
