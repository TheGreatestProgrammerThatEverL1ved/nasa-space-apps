/**
 * GitHub Markdown anchors for the technical-rulebook sections cited by the
 * frozen catalog and fixture snapshots. Keep section keys aligned with the
 * rulebook's numbered headings; do not synthesize `#3.1`-style anchors.
 */
const RULE_ANCHORS = {
  '3.1': '31-bus',
  '3.2': '32-arrays',
  '3.3': '33-batteries',
  '3.4': '34-science-downlink-packages',
  '3.5': '35-retained-payload-pl-thermal',
  '4.1': '41-orbit-and-target-access',
  '4.2': '42-ground-contacts-and-arrivals',
  '4.3': '43-launch-booking',
  '5.2': '52-orbit-and-scheduled-modes',
} as const

export type RuleSection = keyof typeof RULE_ANCHORS

export const ruleRef = (section: RuleSection): string =>
  `docs/game-rules-technical.md#${RULE_ANCHORS[section]}`
