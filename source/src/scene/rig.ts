import { MathUtils } from 'three';
import type { AnimationReceipt } from './animation';
import { PIT_LANE_LAYOUT } from './environment';
const smooth = (value: number) => { const p = MathUtils.clamp(value, 0, 1); return p * p * (3 - 2 * p); };
/** Deterministic presentation clock. No official timings or task state are changed. */
export function departurePose(lowerEnds: (AnimationReceipt | undefined)[], release: AnimationReceipt | undefined, now: number, reduced = false) {
  if (!lowerEnds.every(Boolean)) return { retreat: 0, drive: 0 };
  const settled = lowerEnds.every(r => r!.startsAt === r!.endsAt);
  const lowerAt = Math.max(...lowerEnds.map(r => r!.endsAt));
  const retreat = reduced || settled ? Number(now >= lowerAt) : smooth((now - lowerAt) / 750);
  const departAt = Math.max(release?.startsAt ?? Infinity, lowerAt + (settled || reduced ? 0 : 750));
  const drive = !release ? 0 : release.startsAt === release.endsAt && settled ? 1 : smooth((now - departAt) / (reduced ? 1 : 1000));
  return { retreat, drive };
}
export function isCrewTap(down: { x: number; y: number; time: number }, up: { x: number; y: number; time: number }) {
  return Math.hypot(up.x - down.x, up.y - down.y) <= 11 && up.time - down.time <= 750;
}

const ARRIVAL_MS = 3000;
const TYRE_RADIUS = .43;
const WHEELBASE = 3;

/** A C2 lateral blend: fast lane first, then the bay, then a straight final brake.
 * The turn finishes behind the entire working group, not through the side crew.
 * Derivatives also give an honest heading/steering angle instead of sliding the car.
 */
export function arrivalRoutePoint(carZ: number) {
  const { approachX, turnStartZ, mergeZ } = PIT_LANE_LAYOUT;
  const span = turnStartZ - mergeZ;
  const u = MathUtils.clamp((carZ - mergeZ) / span, 0, 1);
  const blend = u * u * u * (10 - 15 * u + 6 * u * u);
  const slope = approachX * 30 * u * u * (1 - u) * (1 - u) / span;
  const second = approachX * 60 * u * (1 - u) * (1 - 2 * u) / (span * span);
  const curvature = -second / Math.pow(1 + slope * slope, 1.5);
  return { carX: approachX * blend, carZ, yaw: Math.atan(slope), steering: curvature === 0 ? 0 : Math.atan(WHEELBASE * curvature) };
}

// Arc length prevents the lateral turn from secretly doubling the travel speed.
// This immutable table is shared by live, spectator and replay; no frame history.
const routeSamples = Array.from({ length: 513 }, (_, index) => {
  return { ...arrivalRoutePoint(PIT_LANE_LAYOUT.approachZ * (1 - index / 512)), distance: 0 };
});
for (let index = 1; index < routeSamples.length; index++) {
  const previous = routeSamples[index - 1], sample = routeSamples[index];
  sample.distance = previous.distance + Math.hypot(sample.carX - previous.carX, sample.carZ - previous.carZ);
}
export const ARRIVAL_ROUTE_LENGTH = routeSamples.at(-1)!.distance;

function routeAtDistance(distance: number) {
  let lower = 0, upper = routeSamples.length - 1;
  while (upper - lower > 1) {
    const middle = (lower + upper) >>> 1;
    if (routeSamples[middle].distance < distance) lower = middle;
    else upper = middle;
  }
  const a = routeSamples[lower], b = routeSamples[upper];
  return arrivalRoutePoint(MathUtils.lerp(a.carZ, b.carZ, (distance - a.distance) / (b.distance - a.distance)));
}

/** Authoritative 3–2–1 travel. Seeking/reconnecting never restarts this motion.
 * Brisk initial speed, a smooth lane change, then decisive braking to zero at GO.
 * `entry` deliberately stays zero until GO so jacks/crew keep the arrival clear.
 */
export function arrivalPose(goAt: number | null | undefined, now: number) {
  const validGo = goAt !== null && goAt !== undefined && Number.isFinite(goAt);
  const time = validGo ? MathUtils.clamp((now - goAt + ARRIVAL_MS) / ARRIVAL_MS, 0, 1) : 0;
  const progress = time + time * time - time * time * time;
  const distance = ARRIVAL_ROUTE_LENGTH * progress;
  const pose = routeAtDistance(distance);
  return {
    ...pose, progress, wheelRoll: -distance / TYRE_RADIUS,
    speed: validGo && now >= goAt - ARRIVAL_MS && now < goAt ? ARRIVAL_ROUTE_LENGTH / 3 * (1 + 2 * time - 3 * time * time) : 0,
    entry: validGo ? smooth((now - goAt) / 250) : 0,
    arrived: validGo && now >= goAt,
  };
}
