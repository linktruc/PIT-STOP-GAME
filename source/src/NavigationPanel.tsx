import { BookOpen, ChevronRight, Flag, Home, Layers3, Link, Radio, Settings2, Trophy, Users, type LucideIcon } from 'lucide-react';

type Destination = 'menu' | 'crew' | 'watch' | 'chain' | 'roster' | 'roles' | 'leaderboard' | 'invite' | 'settings';
type Item = { destination: Destination; label: string; detail: string; icon: LucideIcon };

/** Presentation only: App retains the existing routes, room and invite logic. */
export default function NavigationPanel({ view, hasTeam, hasDisplayedRoom, focused, solo, onSelect }: {
  view: 'menu' | 'crew' | 'watch'; hasTeam: boolean; hasDisplayedRoom: boolean;
  focused: boolean; solo: boolean; onSelect: (destination: Destination) => void;
}) {
  const session: Item[] = [];
  if (view !== 'menu') session.push({ destination: 'menu', label: 'Main Menu', detail: hasTeam ? 'Your place on the team is saved.' : 'Return to the pit lane menu.', icon: Home });
  if (hasTeam && view !== 'crew') session.push({ destination: 'crew', label: view === 'menu' ? 'Resume Team' : 'My Team', detail: 'Return to your pit box.', icon: Flag });
  if (hasDisplayedRoom) session.push(
    { destination: 'chain', label: 'Full Workflow', detail: 'All 21 connected actions.', icon: Layers3 },
    { destination: 'roster', label: 'Team Members', detail: 'Roles and readiness.', icon: Users },
  );
  const explore: Item[] = [
    { destination: 'roles', label: 'All Roles', detail: 'The 15 playable positions.', icon: BookOpen },
    { destination: 'leaderboard', label: 'Leaderboard', detail: 'Global team times.', icon: Trophy },
  ];
  if (view !== 'watch' || focused) explore.push({ destination: 'watch', label: 'Watch Live', detail: 'Public team overview.', icon: Radio });
  if (hasTeam && !solo) explore.push({ destination: 'invite', label: 'Invite Link', detail: 'Copy the room directory link.', icon: Link });
  explore.push({ destination: 'settings', label: 'Settings', detail: 'Audio and scene controls.', icon: Settings2 });
  const group = (label: string, items: Item[]) => items.length > 0 && <section className="navigation-group" aria-label={label}>
    <h3>{label}</h3><div className="navigation-grid">{items.map(({ destination, label: name, detail, icon: Icon }) =>
      <button key={destination} type="button" onClick={() => onSelect(destination)}>
        <Icon className="navigation-icon" size={20} aria-hidden="true" />
        <span><strong>{name}</strong><small>{detail}</small></span>
        <ChevronRight className="navigation-arrow" size={14} aria-hidden="true" />
      </button>,
    )}</div>
  </section>;
  return <nav className="controls-menu" aria-label="Quick controls">{group('Your session', session)}{group('Pit lane', explore)}</nav>;
}
