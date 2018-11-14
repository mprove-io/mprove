import { createSelector } from '@ngrx/store';

import { getSelectedProjectAnalyticsPlanId } from 'app/store/selectors/get-selected-project/get-selected-project-analytics-plan-id';
import * as interfaces from 'app/interfaces/_index';

export const getSelectedProjectAnalyticsPlans = createSelector(
  getSelectedProjectAnalyticsPlanId,
  (analyticsPlanId: number) => {
    let plans: interfaces.AnalyticsPlan[] = [
      {
        analytics_plan_id: 519436,
        name: 'FREE',
        price: '$ 0',
        description: ['All core features']
      },
      {
        analytics_plan_id: 533802,
        name: 'Basic',
        price: '$ 50',
        description: ['All core features', 'Dark Theme']
      }
      // {
      //   analytics_plan_id: 532846,
      //   name: 'Standard',
      //   price: '$ 150',
      //   description: [
      //     'Dark Theme',
      //     'Extra features: ...'
      //   ]
      // },
      // {
      //   analytics_plan_id: 532847,
      //   name: 'Business',
      //   price: '$ 450',
      //   description: [
      //     'Extra features: ...'
      //   ]
      // },
    ].map(x =>
      Object.assign({}, x, { switch: x.analytics_plan_id !== analyticsPlanId })
    );

    return plans;
  }
);
