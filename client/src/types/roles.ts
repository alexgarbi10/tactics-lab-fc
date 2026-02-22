export type PositionName =
  | 'GK' | 'CB' | 'LB' | 'RB'
  | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM'
  | 'LW' | 'RW' | 'CF' | 'ST';

export const ROLES: Record<PositionName, string[]> = {
  GK:  ['Goalkeeper', 'Sweeper-Keeper'],
  CB:  ['Stopper', 'Ball-Playing CB', 'Aggressive CB'],
  LB:  ['Defensive LB', 'Attacking LB', 'Inverted LB'],
  RB:  ['Defensive RB', 'Attacking RB', 'Inverted RB'],
  CDM: ['Defensive Mid', 'Deep Playmaker', 'Double Pivot'],
  CM:  ['Box-to-Box', 'Deep Playmaker', 'Mezzala', 'Half-Forward'],
  CAM: ['Playmaker', 'Shadow Striker', 'Advanced Playmaker'],
  LM:  ['Winger', 'Inverted Winger', 'Mezzala'],
  RM:  ['Winger', 'Inverted Winger', 'Inverted Mezzala'],
  LW:  ['Winger', 'Inside Forward', 'False Nine'],
  RW:  ['Winger', 'Inside Forward', 'False Nine'],
  CF:  ['Target Man', 'Poacher', 'False Nine'],
  ST:  ['Poacher', 'Target Man', 'Complete Striker'],
};
