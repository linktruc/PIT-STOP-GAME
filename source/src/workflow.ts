import type { Room, Task } from './types';
import { CORNERS, taskLabel } from './types';
import { createTasks } from './engine';

export type WorkflowState = 'done' | 'available' | 'locked';
export type WorkflowPart = { id: string; label: string; fullLabel: string; state: WorkflowState };
export type WorkflowSlot = { key: string; label: string; context: string; action: string; state: WorkflowState; taskIds: string[]; parts: WorkflowPart[] };
/** Visual grouping only. All 21 tasks and their independent dependencies remain unchanged. */
export const WORKFLOW_GROUPS = [
  { key: 'LIFT', label: 'Lift car', parts: [['FRONT_LIFT', 'Front'], ['REAR_LIFT', 'Rear']] },
  { key: 'LOOSEN', label: 'Loosen wheel nuts', parts: CORNERS.map(c => [`${c}_GUN_LOOSEN`, c]) },
  { key: 'REMOVE', label: 'Remove old wheels', parts: CORNERS.map(c => [`${c}_WHEEL_OFF`, c]) },
  { key: 'FIT', label: 'Fit new wheels', parts: CORNERS.map(c => [`${c}_WHEEL_ON`, c]) },
  { key: 'TIGHTEN', label: 'Tighten wheel nuts', parts: CORNERS.map(c => [`${c}_GUN_TIGHTEN`, c]) },
  { key: 'LOWER', label: 'Lower car', parts: [['FRONT_LOWER', 'Front'], ['REAR_LOWER', 'Rear']] },
  { key: 'RELEASE', label: 'Release car', parts: [['GREEN_RELEASE', 'Release']] },
] as const;

/** A contextual two-line milestone, measured from its text rather than a card width. */
export const RAIL_LABEL_MIN = 76;
export const RAIL_PADDING = 16;
/** Phase/corner is presentation order only; these are not serial dependencies. */
export const TASK_DISPLAY_ORDER = [
  'FRONT_LIFT', 'REAR_LIFT',
  ...CORNERS.map(corner => `${corner}_GUN_LOOSEN`),
  ...['WHEEL_OFF', 'WHEEL_ON'].flatMap(stage => CORNERS.map(corner => `${corner}_${stage}`)),
  ...CORNERS.map(corner => `${corner}_GUN_TIGHTEN`),
  'FRONT_LOWER', 'REAR_LOWER', 'GREEN_RELEASE',
];
const rank = new Map(TASK_DISPLAY_ORDER.map((id, index) => [id, index]));
const compareTask = (a: Task, b: Task) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99) || a.id.localeCompare(b.id);
const CORNER_CONTEXT: Record<string, string> = { FL: 'Front-left wheel', FR: 'Front-right wheel', RL: 'Rear-left wheel', RR: 'Rear-right wheel' };

export function compactAction(id: string) { return taskLabel(id); }
export function milestoneLabel(id: string) {
  if (id === 'GREEN_RELEASE') return { context: 'All crew clear', action: 'Release car' };
  if (id.startsWith('FRONT_') || id.startsWith('REAR_')) return { context: id.startsWith('FRONT_') ? 'Front of car' : 'Rear of car', action: id.endsWith('LIFT') ? 'Lift car' : 'Lower car' };
  return { context: CORNER_CONTEXT[id.slice(0, 2)] ?? 'Wheel crew', action: id.endsWith('GUN_LOOSEN') ? 'Loosen nut' : id.endsWith('WHEEL_OFF') ? 'Remove wheel' : id.endsWith('WHEEL_ON') ? 'Fit new wheel' : 'Tighten nut' };
}
/** Container measurement includes the font's longest contextual/action line. */
export function ribbonCapacity(width: number, measuredLabelWidth = RAIL_LABEL_MIN): number {
  const usable = Math.max(0, (Number.isFinite(width) ? width : 390) - RAIL_PADDING);
  return Math.max(1, Math.min(21, Math.floor(usable / Math.max(RAIL_LABEL_MIN, measuredLabelWidth))));
}
export function ribbonTileWidth(width: number, capacity = ribbonCapacity(width)): number {
  return Math.max(1, (width - RAIL_PADDING) / capacity);
}
/** Desktop rows use measured available height; a larger screen reveals more jobs. */
export function verticalRibbonCapacity(height: number, rowHeight = 43): number {
  const usable = Math.max(0, (Number.isFinite(height) ? height : 320) - 54);
  return Math.max(1, Math.min(21, Math.floor(usable / Math.max(38, rowHeight))));
}
export const roundKey = (room: Room) => `${room.id}:${room.round?.id ?? 'waiting'}`;
export const completedCount = (room: Room) => room.round?.tasks.filter(task => task.status === 'DONE').length ?? 0;
/** Ignore a stale reconnect/poll response rather than making a round run backwards. */
export function newestWorkflowSnapshot(previous: Room, incoming: Room): Room {
  return roundKey(previous) === roundKey(incoming) && completedCount(incoming) < completedCount(previous) ? previous : incoming;
}

/**
 * Stable phase/corner order is independent of packet order, completion order and
 * viewer identity. The window advances only when a WHOLE phase has completed;
 * local status colors still expose each real parallel task. The total sweep is
 * a separate completed/21 instrument and never claims these tasks are serial.
 */
export function rollingWorkflow(room: Room, width = 390, measuredLabelWidth = RAIL_LABEL_MIN, measuredCapacity?: number) {
  const tasks = room.round?.tasks ?? createTasks(room.players);
  const sorted = [...tasks].sort(compareTask);
  const completed = sorted.filter(task => task.status === 'DONE');
  const available = sorted.filter(task => task.status === 'AVAILABLE');
  const byId = new Map(sorted.map(task => [task.id, task]));
  const stream: WorkflowSlot[] = WORKFLOW_GROUPS.map(group => {
    const parts: WorkflowPart[] = group.parts.map(([id, label]) => {
      const task = byId.get(id);
      const state: WorkflowState = task?.status === 'DONE' ? 'done' : task?.status === 'AVAILABLE' ? 'available' : 'locked';
      return { id, label, fullLabel: task ? taskLabel(task) : id, state };
    });
    const state: WorkflowState = parts.every(part => part.state === 'done') ? 'done' : parts.some(part => part.state === 'available') ? 'available' : 'locked';
    return { key: group.key, label: group.label, context: '', action: group.label, state, taskIds: parts.map(part => part.id), parts };
  });
  // A visual group only advances when ALL its real parallel jobs finish;
  // individual markers still reveal any corners that finish early.
  const firstPending = stream.findIndex(slot => slot.state !== 'done');
  const phaseStart = firstPending < 0 ? stream.length - 1 : firstPending;
  const capacity = Math.min(stream.length, measuredCapacity === undefined ? ribbonCapacity(width, measuredLabelWidth) : Math.max(1, Math.floor(measuredCapacity)));
  // Never let a cramped panel show ONLY the previous finished task while a
  // ready task sits just outside the viewport. Also handle parallel ready
  // tasks that may be in a later presentation group.
  const firstReady = stream.findIndex(slot => slot.state === 'available');
  const focus = firstReady >= 0 && stream[phaseStart]?.state === 'locked' ? firstReady : phaseStart;
  const lookBehind = capacity >= 3 ? 1 : 0;
  const offset = Math.min(Math.max(0, focus - lookBehind), Math.max(0, stream.length - capacity));
  // FRONT_LIFT also begins with "FR"; only a delimited wheel corner is a wheel job.
  const wheelCrews = new Set(available.filter(task => /^(FL|FR|RL|RR)_/.test(task.id)).map(task => task.id.slice(0, 2))).size;
  const jacksReady = available.filter(task => /^(FRONT|REAR)_(LIFT|LOWER)$/.test(task.id)).length;
  const wheelSummary = `${wheelCrews} wheel crew${wheelCrews === 1 ? '' : 's'}`;
  const jackSummary = `${jacksReady} jack${jacksReady === 1 ? '' : 's'} ready`;
  const activity = wheelCrews && jacksReady ? `${wheelSummary} · ${jackSummary}` : wheelCrews ? `${wheelSummary} active` : jacksReady ? jackSummary : available.some(task => task.id === 'GREEN_RELEASE') ? 'Release ready' : 'Waiting on crew';
  return {
    tasks, count: completed.length, active: available.length, capacity, offset, stream,
    slots: stream.slice(offset, offset + capacity),
    phase: room.status === 'WAITING' || !room.round || room.status === 'COUNTDOWN' ? 'Wait for GO signal'
      : completed.length === 21 ? 'Car released' : activity,
  };
}
