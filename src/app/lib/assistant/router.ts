export type AssistantStats = {
  totalRules: number;
  totalAssets: number;
  validations: number;
  passRate: number;
  passRateTrend: number;
  decisionsTrend: number;
};

export type AssistantValidationResult = {
  id: string;
  assetName: string;
  status: 'passed' | 'failed';
  passedRules: number;
  failedRules: number;
  timestamp: string;
  ruleName?: string;
};

export type AssistantLinkVariant = 'default' | 'outline' | 'ghost';

export type AssistantLinkAction = {
  type: 'link';
  label: string;
  href: string;
  variant?: AssistantLinkVariant;
};

export type AssistantAction = AssistantLinkAction | { type: 'runValidation'; label: string };

export type AssistantCard =
  | {
      type: 'validation_list';
      title: string;
      items: Array<{
        id: string;
        primary: string;
        secondary?: string;
        status: 'passed' | 'failed';
        timestamp: string;
        href: string;
      }>;
    };

export type AssistantResponse = {
  text: string;
  actions?: AssistantAction[];
  cards?: AssistantCard[];
  intent?: 'execute_rules';
};

export type AssistantContext = {
  stats?: AssistantStats;
  validations: AssistantValidationResult[];
};

function topFailingRules(validations: AssistantValidationResult[]) {
  const counts = new Map<string, number>();
  validations.forEach((v) => {
    if (v.status !== 'failed') return;
    const key = (v.ruleName || 'Rules execution').trim();
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));
}

export function routeAssistantQuery(queryRaw: string, ctx: AssistantContext): AssistantResponse {
  const query = queryRaw.trim().toLowerCase();
  const validations = ctx.validations ?? [];
  const failed = validations.filter((v) => v.status === 'failed');

  const link = (
    label: string,
    href: string,
    variant: AssistantLinkVariant = 'outline'
  ): AssistantLinkAction => ({
    type: 'link',
    label,
    href,
    variant,
  });

  if (/(execute|run).*(rules|validation)|^execute rules$/.test(query)) {
    return {
      text: "Running validation now. I’ll refresh your Recent Decisions when it completes.",
      intent: 'execute_rules',
      actions: [{ type: 'runValidation', label: 'Execute Rules' }],
    };
  }

  if (/(show|view).*(fail|failed|failures|attention)|needs attention/.test(query)) {
    if (failed.length === 0) {
      return {
        text: 'All clear — no failed decisions in your recent activity.',
        actions: [link('View validation results', '/dashboard/validation')],
      };
    }

    const offenders = topFailingRules(validations);
    const summary =
      failed.length > 10
        ? `You have ${failed.length} failed decisions. Top offenders: ${offenders
            .map((o) => `${o.name} (${o.count})`)
            .join(', ')}.`
        : `You have ${failed.length} failed decision${failed.length === 1 ? '' : 's'} that need attention.`;

    return {
      text: summary,
      actions: [link('View failures', '/dashboard/validation'), link('Run validation', '/dashboard/validation')],
      cards: [
        {
          type: 'validation_list',
          title: 'Failed decisions',
          items: failed.slice(0, 5).map((v) => ({
            id: v.id,
            primary: v.ruleName || 'Rules execution',
            secondary: v.assetName,
            status: v.status,
            timestamp: v.timestamp,
            href: `/dashboard/validation#validation-${v.id}`,
          })),
        },
      ],
    };
  }

  if (/create.*rule|new rule/.test(query)) {
    return {
      text: 'Sure — want to start with a new rule from scratch?',
      actions: [link('Create a rule', '/dashboard/rules/new', 'default'), link('Browse rules', '/dashboard/rules')],
    };
  }

  if (/upload.*asset|upload.*file|add.*asset/.test(query)) {
    return {
      text: 'Upload a file and I’ll include it in your next validation run.',
      actions: [link('Upload an asset', '/dashboard/assets', 'default'), link('View assets', '/dashboard/assets')],
    };
  }

  if (/recent decisions|show decisions|what happened/.test(query)) {
    return {
      text:
        validations.length === 0
          ? 'No decisions yet. Run validation to generate your first decision.'
          : 'Here are your most recent decisions.',
      actions: [link('View all decisions', '/dashboard/validation')],
      cards: [
        {
          type: 'validation_list',
          title: 'Recent decisions',
          items: validations.slice(0, 5).map((v) => ({
            id: v.id,
            primary: v.ruleName || 'Rules execution',
            secondary: v.assetName,
            status: v.status,
            timestamp: v.timestamp,
            href: `/dashboard/validation#validation-${v.id}`,
          })),
        },
      ],
    };
  }

  if (/pass rate|why.*pass|improve.*pass|drop.*pass/.test(query)) {
    const stats = ctx.stats;
    if (!stats) {
      return {
        text: 'I can explain pass-rate changes once your stats load.',
      };
    }

    const trend = stats.passRateTrend;
    const direction = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
    const delta = `${trend > 0 ? '+' : ''}${trend}`;
    const base = `Your pass rate is ${stats.passRate}%. It’s ${direction} (${delta} vs last week).`;
    const extra =
      trend <= -5 && failed.length > 0
        ? ` Most recent failures: ${failed
            .slice(0, 3)
            .map((v) => v.ruleName || 'Rules execution')
            .join(', ')}.`
        : '';

    return {
      text: base + extra,
      actions: [link('View validation', '/dashboard/validation')],
    };
  }

  return {
    text: 'Try one of these: “Show failures”, “Execute rules”, “Create a rule”, or “Show recent decisions”.',
    actions: [
      { type: 'runValidation', label: 'Execute Rules' },
      link('Create a rule', '/dashboard/rules/new'),
      link('Upload an asset', '/dashboard/assets'),
    ],
  };
}

