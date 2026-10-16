const apiFailureDecisionValues = ['handled', 'use-default'] as const;

export type ApiFailureDecision = (typeof apiFailureDecisionValues)[number];
