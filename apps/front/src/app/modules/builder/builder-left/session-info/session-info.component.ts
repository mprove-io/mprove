import { ChangeDetectorRef, Component } from '@angular/core';
import type { Todo } from '@opencode-ai/sdk/v2';
import { interval } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionDataQuery } from '#front/app/queries/session-data.query';
import { TimeService } from '#front/app/services/time.service';

@Component({
  standalone: false,
  selector: 'm-session-info',
  templateUrl: './session-info.component.html'
})
export class SessionInfoComponent {
  sessionId: string;
  session: AgentSessionApi;
  todos: Todo[] = [];

  providerLabels: Record<string, string> = {
    opencode: 'Zen',
    openai: 'OpenAI',
    anthropic: 'Anthropic'
  };

  providerLabel = '-';
  completedCount = 0;
  totalCount = 0;

  session$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.session = x;
      this.sessionId = x?.sessionId;
      this.providerLabel = x?.provider
        ? this.providerLabels[x.provider] || x.provider
        : '-';
      this.lastActivityAgo = x?.lastActivityTs
        ? this.timeService.timeAgoFromNow(x.lastActivityTs)
        : '';
      this.cd.detectChanges();
    })
  );

  todos$ = this.sessionDataQuery.todos$.pipe(
    tap(x => {
      this.todos = x ?? [];
      this.completedCount = this.todos.filter(
        t => t.status === 'completed'
      ).length;
      this.totalCount = this.todos.length;
      this.cd.detectChanges();
    })
  );

  constructor(
    private sessionQuery: SessionQuery,
    private sessionDataQuery: SessionDataQuery,
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

  lastActivityAgo = '';

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
