import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, Info, LockKeyhole, Zap } from 'lucide-react';
import { createTasks } from './engine';
import { completedCount, newestWorkflowSnapshot, rollingWorkflow, roundKey, TASK_DISPLAY_ORDER, WORKFLOW_GROUPS, verticalRibbonCapacity } from './workflow';
import { CORNERS, taskLabel, type Role, type Room, type Task } from './types';
import './chain.css';
import './v11-workflow.css';

interface RoleGuide { position: string; summary: string; stages: string[]; requires: string; unlocks: string }
const CORNER_NAMES = { FL: 'Front-left', FR: 'Front-right', RL: 'Rear-left', RR: 'Rear-right' };

/** Presentation only: all dependency/eligibility decisions remain in the engine. */
export function getRoleGuide(role: Role, tasks: Task[]): RoleGuide {
  const ownedTasks = tasks.filter(task => task.role === role).sort((a, b) => TASK_DISPLAY_ORDER.indexOf(a.id) - TASK_DISPLAY_ORDER.indexOf(b.id));
  const stages = ownedTasks.map(task => taskLabel(task));
  if (role === 'FRONT_JACK' || role === 'REAR_JACK') {
    const end = role === 'FRONT_JACK' ? 'front' : 'rear';
    return {
      position: `${end === 'front' ? 'Front' : 'Rear'} of the car`,
      summary: `You use the main button twice: lift the ${end} at GO, then lower it once both ${end} wheel nuts are tightened.`,
      stages,
      requires: `First press: wait for GO signal. Second press: wait for both ${end} wheel nuts to be tightened.`,
      unlocks: `The ${end} wheel crews can work after your lift.`,
    };
  }
  if (role === 'RELEASE_CONTROLLER') return {
    position: 'Pit exit / whole crew',
    summary: 'Watch all four wheel crews and both jack operators. Press once to release the car when the entire stop is safe.',
    stages,
    requires: 'Wait for all four wheel nuts to be tightened and both jack operators to lower the car.',
    unlocks: 'The car leaves the pit box and the official timer stops.',
  };
  const corner = role.slice(0, 2) as keyof typeof CORNER_NAMES;
  const wheel = CORNER_NAMES[corner].toLowerCase();
  const end = corner.startsWith('F') ? 'front' : 'rear';
  if (role.endsWith('GUNNER')) return {
    position: `${CORNER_NAMES[corner]} wheel`,
    summary: `Use your wheel gun twice: loosen the ${wheel} wheel nut after the car is lifted, then tighten it once the new wheel is fitted.`,
    stages,
    requires: `First press: wait for the ${end} jack to lift. Second press: wait for the new wheel to be fitted.`,
    unlocks: 'Your first action allows wheel removal; your second secures the new wheel before lowering.',
  };
  if (role.endsWith('WHEEL_OFF')) return {
    position: `${CORNER_NAMES[corner]} wheel`,
    summary: `Press once to pull the old ${wheel} wheel off the hub and move it clear.`,
    stages,
    requires: `Wait for the ${wheel} wheel nut to be loosened.`,
    unlocks: 'The new-wheel fitter can fit the fresh wheel.',
  };
  return {
    position: `${CORNER_NAMES[corner]} wheel`,
    summary: `Press once to bring in the fresh ${wheel} wheel and fit it on the hub.`,
    stages,
    requires: `Wait for the crew to remove the old ${wheel} wheel.`,
    unlocks: 'The gunner can tighten this wheel after fitting.',
  };
}

export function roomTasks(room: Room): Task[] { return room.round?.tasks ?? createTasks(room.players); }
export function personalPaths(tasks: Task[], playerId: string) { return tasks.filter(t => t.ownerId === playerId).map(task => ({ task, predecessors: tasks.filter(t => task.dependencies.includes(t.id)), successors: tasks.filter(t => t.dependencies.includes(task.id)) })); }

/** Trailing coalescing: a packet burst produces one display target, never a queue. */
function useWorkflowSnapshot(room: Room) {
  const [shown, setShown] = useState(room);
  const pending = useRef(room);
  useEffect(() => {
    pending.current = newestWorkflowSnapshot(pending.current, room);
    if (roundKey(shown) !== roundKey(room)) {
      setShown(room);
      return;
    }
    const timer = window.setTimeout(() => setShown(previous => newestWorkflowSnapshot(previous, pending.current)), 160);
    return () => window.clearTimeout(timer);
  }, [room, shown]);
  return roundKey(shown) === roundKey(room) ? shown : room;
}

/** One interruptible interpolation, shared by the contiguous sweep and count. */
function useCompletionSweep(target: number, key: string) {
  const [position, setPosition] = useState({ key, value: target });
  const current = useRef(position);
  useEffect(() => {
    const old = current.current;
    const start = old.key === key ? old.value : target;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || start === target) {
      current.current = { key, value: target };
      setPosition(current.current);
      return;
    }
    const at = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - at) / 360);
      const value = Math.max(start, start + (target - start) * (1 - Math.pow(1 - t, 3)));
      current.current = { key, value };
      setPosition(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key, target]);
  return position.key === key ? position.value : target;
}

export const MiniChain = memo(function MiniChain({ room, playerId, onOpen }: { room: Room; playerId?: string | null; onOpen: () => void }) {
  const element = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState({ width: 390, label: 76, height: 62, railWidth: 372, railHeight: 36, vertical: false });
  useEffect(() => {
    const button = element.current;
    if (!button) return;
    const measure = () => {
      const bounds = button.getBoundingClientRect();
      const width = Math.round(bounds.width), height = Math.round(bounds.height);
      const vertical = getComputedStyle(button).getPropertyValue('--workflow-direction').trim() === 'vertical';
      const railBounds = viewport.current?.getBoundingClientRect();
      const railWidth = Math.round(railBounds?.width ?? Math.max(1, width - 16));
      const railHeight = Math.round(railBounds?.height ?? Math.max(1, height - 70));
      const context = document.createElement('canvas').getContext('2d');
      let label = 116;
      if (context) {
        const labels = WORKFLOW_GROUPS.map(group => ({ context: '', action: group.label }));
        context.font = "500 11px 'Barlow Condensed', sans-serif";
        label = Math.max(label, ...labels.map(item => Math.ceil(context.measureText(item.context).width + 6)));
        context.font = "600 11px Barlow, sans-serif";
        label = Math.max(label, ...labels.map(item => Math.ceil(context.measureText(item.action).width + 6)));
      }
      if (width > 0) setMetrics(previous => previous.width === width && previous.label === label && previous.height === height && previous.railWidth === railWidth && previous.railHeight === railHeight && previous.vertical === vertical ? previous : { width, label, height, railWidth, railHeight, vertical });
    };
    measure();
    void document.fonts?.ready.then(measure);
    // Orientation and dynamic Safari toolbar changes can change the rail
    // direction without changing its outer pixel size. Re-measure both.
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure);
    window.visualViewport?.addEventListener('resize', measure, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    observer?.observe(button);
    if (viewport.current) observer?.observe(viewport.current);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);
  const snapshot = useWorkflowSnapshot(room);
  const flow = useMemo(() => rollingWorkflow(snapshot, metrics.railWidth + 16, metrics.label, metrics.vertical ? verticalRibbonCapacity(metrics.railHeight + 54) : undefined), [snapshot, metrics]);
  const sweep = useCompletionSweep(flow.count, roundKey(snapshot));
  const taskById = new Map(flow.tasks.map(task => [task.id, task]));
  // Stable all-phase track: changing offset only changes a single GPU composited transform.
  // The seven nodes never unmount/reappear when the leading completed phase leaves view.
  const cellSize = metrics.vertical
    ? Math.max(1, metrics.railHeight / flow.capacity)
    : Math.max(1, metrics.railWidth / flow.capacity);
  const move = -flow.offset * cellSize;
  const trackStyle = metrics.vertical
    ? { gridAutoRows: `${cellSize}px`, transform: `translate3d(0, ${move}px, 0)` }
    : { gridAutoColumns: `${cellSize}px`, transform: `translate3d(${move}px, 0, 0)` };
  return <button ref={element} type="button" className="mini-chain rolling-chain live-workflow milestone-workflow" onClick={onOpen}
    aria-label={`Open full workflow. ${flow.count} of 21 complete. ${flow.phase}. Parallel tasks are a progress summary. ${flow.slots.map(slot => `${slot.label}: ${slot.state}`).join('. ')}`}
    data-progress={flow.count} data-visual-progress={sweep.toFixed(3)} data-visible-count={flow.slots.length} data-measured-width={metrics.width} data-label-width={metrics.label} data-window-start={flow.offset} data-ready-count={flow.active} data-orientation={metrics.vertical ? 'vertical' : 'horizontal'}>
    <span className="rail-meta"><span>{flow.phase}</span><b><span className="rail-count">{Math.floor(sweep + .001).toString().padStart(2, '0')}</span><span>/21</span><span className="rail-open">WORKFLOW ↗</span></b></span>
    <span className="rail-summary">Parallel jobs · progress summary</span>
    <span ref={viewport} className="rail-viewport" aria-hidden="true">
    <span className="milestone-rail milestone-track" style={trackStyle}>{flow.stream.map((slot, index) => {
      const owned = !!playerId && slot.taskIds.some(id => taskById.get(id)?.ownerId === playerId);
      return <span key={`${roundKey(snapshot)}:${slot.key}`} className={`rail-milestone grouped-milestone ${slot.state}${owned ? ' owned' : ''}`}
        data-slot={index} data-task-ids={slot.taskIds.join(',')} data-visible={index >= flow.offset && index < flow.offset + flow.capacity} data-owned={owned} data-status={slot.state}
        title={`${slot.action}: ${slot.parts.map(part => `${part.fullLabel} (${part.state})`).join('; ')}${owned ? ' · YOUR TASK IN THIS GROUP' : ''}`}>
        <span className="rail-tick">{slot.state === 'done' ? <Check size={10} strokeWidth={3} /> : slot.state === 'locked' ? <LockKeyhole size={9} /> : <Zap size={9} fill="currentColor" />}</span>
        <span className="rail-group-parts">{slot.parts.map(part => <span key={part.id}
          className={`rail-part ${part.state}${!!playerId && taskById.get(part.id)?.ownerId === playerId ? ' yours' : ''}`}
          title={`${part.fullLabel} — ${part.state}`}>
          <span>{part.label}</span>{part.state === 'done' ? <Check size={8} strokeWidth={3} aria-label="Done" /> : <span className="part-pip">{part.state === 'locked' ? '–' : '!'}</span>}
        </span>)}</span>
        <span className="rail-action">{slot.action}</span>
      </span>;
    })}</span></span>
    <span className="rail-total" role="progressbar" aria-label="Total completed tasks; parallel jobs are not serial dependencies" aria-valuenow={flow.count} aria-valuemin={0} aria-valuemax={21}>
      <span className="rail-total-fill" style={{ transform: `scaleX(${sweep / 21})` }} />
    </span>
  </button>;
});

const WHEEL_STAGES = ['WHEEL_OFF', 'WHEEL_ON'];
const STAGE_TITLES = ['Remove old wheel', 'Fit new wheel'];
type Anchor = { x: number; top: number; bottom: number };
export default memo(function ChainHUD({ room, playerId }: { room: Room; playerId?: string | null; expanded?: boolean }) {
  const tasks = useMemo(() => roomTasks(room), [room]);
  const [selected, setSelected] = useState<string | null>(null);
  const graph = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<{ width: number; height: number; points: Record<string, Anchor> }>({ width: 320, height: 500, points: {} });
  const inspected = tasks.find(task => task.id === selected);
  const roster = room.round?.players ?? room.players;
  const owner = (task: Task) => task.ownerId === null ? 'Bot' : roster.find(player => player.id === task.ownerId)?.nickname ?? 'Crew member';
  useLayoutEffect(() => {
    const host = graph.current;
    if (!host) return;
    const measure = () => {
      const bounds = host.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const points: Record<string, Anchor> = {};
      host.querySelectorAll<HTMLElement>('[data-task-id]').forEach(node => {
        const rect = node.getBoundingClientRect();
        points[node.dataset.taskId!] = { x: rect.x + rect.width / 2 - bounds.x, top: rect.top - bounds.top, bottom: rect.bottom - bounds.top };
      });
      setGeometry({ width: bounds.width, height: bounds.height, points });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);
  const node = (id: string, label?: string) => {
    const task = tasks.find(task => task.id === id)!;
    const owned = !!playerId && task.ownerId === playerId;
    const name = owner(task);
    return <button key={id} type="button" className={`chain-node ${task.status.toLowerCase()}${owned ? ' yours' : ''}${selected === id ? ' selected' : ''}`}
      data-task-id={id} data-status={task.status} data-owned={owned} data-owner={name} data-dependencies={task.dependencies.join(',')}
      title={`${taskLabel(task)} · ${name} · ${task.status.toLowerCase()}`}
      aria-label={`${taskLabel(task)}. ${name}. ${task.status === 'AVAILABLE' ? 'Ready' : task.status === 'DONE' ? 'Done' : 'Blocked'}${owned ? '. Your task' : ''}`}
      aria-pressed={selected === id} onClick={() => setSelected(current => current === id ? null : id)}>
      <span className="chain-node-title">{label ?? taskLabel(task)}</span>
      <span className="chain-node-owner">{task.status === 'DONE' ? <Check size={9} /> : task.status === 'LOCKED' ? <LockKeyhole size={8} /> : <i className="chain-ready-dot" />}<span>{name}</span>{owned && <b className="board-you">YOU</b>}</span>
    </button>;
  };
  return <section className="chain-hud connected-workflow v11-board" aria-label="Full 21-step workflow">
    <div className="graph-summary"><strong>{completedCount(room)}/21 complete</strong><span>Lift → loosen → change wheels → tighten → lower</span></div>
    <div ref={graph} className="connected-graph" aria-label="All 21 tasks, their assignees and exact dependencies">
      <svg className="graph-edges" viewBox={`0 0 ${geometry.width} ${geometry.height}`} preserveAspectRatio="none" aria-hidden="true">
        {tasks.flatMap(task => task.dependencies.map(id => {
          const parent = tasks.find(candidate => candidate.id === id)!;
          const from = geometry.points[id], to = geometry.points[task.id];
          const safety = task.id === 'GREEN_RELEASE' && !id.endsWith('LOWER');
          let path = '';
          if (from && to) {
            const long = to.top - from.bottom > 75;
            const side = from.x < geometry.width / 2 ? 3 : geometry.width - 3;
            path = safety || long
              ? `M ${from.x} ${from.bottom} V ${from.bottom + 3} H ${side} V ${to.top - 3} H ${to.x} V ${to.top}`
              : `M ${from.x} ${from.bottom} C ${from.x} ${(from.bottom + to.top) / 2}, ${to.x} ${(from.bottom + to.top) / 2}, ${to.x} ${to.top}`;
          }
          return <path key={`${id}-${task.id}`} d={path} className={`graph-edge ${task.status === 'DONE' ? 'done' : parent.status === 'DONE' && task.status === 'AVAILABLE' ? 'live' : ''}${safety ? ' redundant' : ''}`} data-from={id} data-to={task.id} />;
        }))}
      </svg>
      <div className="axle-columns">{(['FRONT', 'REAR'] as const).map((axle, axleIndex) => <section className="axle-board" key={axle} aria-label={`${axle === 'FRONT' ? 'Front' : 'Rear'} axle`}>
        <div className="wheel-lane-name">{axle === 'FRONT' ? 'Front left' : 'Rear left'}</div><div className="wheel-lane-name">{axle === 'FRONT' ? 'Front right' : 'Rear right'}</div>
        <div className="axle-jack">{node(`${axle}_LIFT`)}</div>
        {CORNERS.slice(axleIndex * 2, axleIndex * 2 + 2).map(corner => node(`${corner}_GUN_LOOSEN`, 'Loosen wheel nut'))}
        {WHEEL_STAGES.flatMap((stage, index) => CORNERS.slice(axleIndex * 2, axleIndex * 2 + 2).map(corner => node(`${corner}_${stage}`, STAGE_TITLES[index])))}
        {CORNERS.slice(axleIndex * 2, axleIndex * 2 + 2).map(corner => node(`${corner}_GUN_TIGHTEN`, 'Tighten wheel nut'))}
        <div className="axle-jack">{node(`${axle}_LOWER`)}</div>
      </section>)}</div>
      <div className="release-join">{node('GREEN_RELEASE')}</div>
    </div>
    <div className="graph-legend" aria-label="Task state legend"><span><i className="blocked" />Blocked</span><span><i className="available" />Ready</span><span><i className="done" />Done</span><span><i className="owned" />YOU</span></div>
    <p className={`chain-inspect${inspected ? ' inspecting' : ''}`} role="status">{inspected ? `${taskLabel(inspected)} · ${owner(inspected)} · ${inspected.status === 'AVAILABLE' ? 'Ready' : inspected.status === 'DONE' ? 'Completed' : 'Blocked'}` : 'Tap a task for its full name and crew member.'}</p>
  </section>;
});

export function RoleBriefing({ room, playerId }: { room: Room; playerId: string }) {
  const player = room.players.find(candidate => candidate.id === playerId);
  if (!player) return null;
  const tasks = roomTasks(room);
  const guide = getRoleGuide(player.role, tasks);
  return <div className="role-briefing v10-role-briefing">
    <span>YOUR JOB</span><p>{guide.summary}</p>
    <ol>{guide.stages.map(stage => <li key={stage}>{stage}</li>)}</ol>
    <span>WHEN TO PRESS</span><p>{guide.requires}</p>
    <p className="role-briefing-tip">Watch the crew and workflow, then use the main action button. An early press locks your button for 2 seconds; the team timer keeps running.</p>
    <small><Info size={13} />{guide.position}</small>
  </div>;
}

const ROLE_FAMILIES = [
  ['Wheel Gun Operator', 'Loosen the wheel nut after lifting, then tighten it after the new wheel is fitted.'],
  ['Old Wheel Remover', 'Remove the old wheel after your jack lifts the car.'],
  ['New Wheel Fitter', 'Fit the fresh wheel after the old wheel has been removed.'],
  ['Front Jack Operator', 'Lift at GO, then lower after both front wheel nuts are tightened.'],
  ['Rear Jack Operator', 'Lift at GO, then lower after both rear wheel nuts are tightened.'],
  ['Release Controller', 'Release the car after all four wheels are secured and both jacks are down.'],
];
export function AllRoles() {
  return <div className="all-roles role-families">{ROLE_FAMILIES.map(([name, description]) => <section key={name}><h3>{name}</h3><p>{description}</p></section>)}<p className="panel-note">Four wheel corners share these professions. Seven extra support crew are visual bots.</p></div>;
}
