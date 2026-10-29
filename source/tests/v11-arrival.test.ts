import { describe, expect, it } from 'vitest';
import { CAR_BODY_FOOTPRINTS, CREW } from '../src/scene/crew';
import { PIT_LANE_LAYOUT } from '../src/scene/environment';
import { ARRIVAL_ROUTE_LENGTH, arrivalPose, arrivalRoutePoint } from '../src/scene/rig';

const GO = 50_000;

describe('V11 authoritative curved pit-lane arrival', () => {
  it('starts in the travel lane, turns laterally, and finishes on a straight stop-box approach', () => {
    expect(arrivalPose(GO, GO - 3000)).toMatchObject({ carX: 8.6, carZ: 26, yaw: 0, progress: 0, entry: 0, arrived: false });
    expect(arrivalRoutePoint(23)).toMatchObject({ carX: 8.6, yaw: 0, steering: 0 });
    expect(arrivalRoutePoint(15).carX).toBeGreaterThan(3);
    expect(arrivalRoutePoint(15).carX).toBeLessThan(6);
    expect(arrivalRoutePoint(15).yaw).toBeGreaterThan(.7);
    expect(arrivalRoutePoint(PIT_LANE_LAYOUT.mergeZ)).toMatchObject({ carX: 0, yaw: 0, steering: 0 });
    expect(arrivalPose(GO, GO)).toMatchObject({ carX: 0, carZ: 0, yaw: 0, steering: 0, speed: 0, progress: 1, arrived: true });
    expect(arrivalPose(GO, GO + 60_000)).toMatchObject({ carX: 0, carZ: 0, yaw: 0, speed: 0, progress: 1, entry: 1 });
  });

  it('travels briskly below a 50km/h pit limit then brakes smoothly to zero at GO', () => {
    expect(ARRIVAL_ROUTE_LENGTH).toBeGreaterThan(28);
    expect(ARRIVAL_ROUTE_LENGTH).toBeLessThan(30);
    const poses = Array.from({ length: 301 }, (_, i) => arrivalPose(GO, GO - 3000 + i * 10));
    expect(Math.max(...poses.map(p => p.speed)) * 3.6).toBeLessThan(50);
    expect(poses[100].speed).toBeGreaterThan(12);
    expect(poses[270].speed).toBeLessThan(poses[200].speed);
    expect(poses[299].speed).toBeLessThan(.15);
    for (let i = 1; i < poses.length; i++) {
      const before = poses[i - 1], after = poses[i];
      expect(after.carZ).toBeLessThanOrEqual(before.carZ);
      expect(after.carX).toBeLessThanOrEqual(before.carX + 1e-10);
      expect(after.progress).toBeGreaterThan(before.progress);
      expect(Math.abs(after.yaw - before.yaw)).toBeLessThan(.032);
      // Wheel travel follows path distance, including the lateral turn.
      expect(after.wheelRoll).toBeLessThan(before.wheelRoll);
      const numericalSpeed = Math.hypot(after.carX - before.carX, after.carZ - before.carZ) * 100;
      expect(numericalSpeed).toBeLessThan(14);
      expect(after.entry).toBe(0);
    }
    expect(arrivalPose(GO, GO - 1).carZ).toBeLessThan(.00001);
    expect(arrivalPose(GO, GO + 250).entry).toBe(1);
  });

  it('keeps the entire turning car on pavement and clears waiting crew, jacks and tools', () => {
    // Actual waiting locations: front operator is centred ahead of the nose,
    // its trolley waits to the side; rear operator/trolley remain off-centre.
    const obstacles = [
      ...CREW.map(c => ({ x: c.kind === 'jack' ? (c.z < 0 ? 0 : -2.8) : Math.abs(c.x) < 2.4 ? Math.sign(c.x || 1) * 2.7 : c.x, z: c.z, radius: .32 })),
      { x: 2.8, z: -3.12, radius: .52 }, { x: -2.8, z: 2.35, radius: .52 },
      { x: -6.2, z: 3.9, radius: .67 }, { x: 5.8, z: 4.45, radius: .67 },
      { x: -5.45, z: 4.3, radius: .5 }, { x: 5.5, z: 4.1, radius: .5 },
      { x: -6.45, z: -2.75, radius: .14 }, { x: -6.45, z: 2.65, radius: .14 },
    ];
    let minimumPavementMargin = Infinity, minimumObstacleGap = Infinity;
    for (let now = GO - 3000; now <= GO; now += 5) {
      const pose = arrivalPose(GO, now), cos = Math.cos(pose.yaw), sin = Math.sin(pose.yaw);
      for (const part of CAR_BODY_FOOTPRINTS) {
        for (const localX of [-part.halfX, part.halfX]) for (const localZ of [part.minZ, part.maxZ]) {
          const x = pose.carX + localX * cos + localZ * sin;
          minimumPavementMargin = Math.min(minimumPavementMargin, x - PIT_LANE_LAYOUT.apron.left, PIT_LANE_LAYOUT.fastLane.right - x);
        }
        for (const obstacle of obstacles) {
          const dx = obstacle.x - pose.carX, dz = obstacle.z - pose.carZ;
          const x = dx * cos - dz * sin, z = dx * sin + dz * cos;
          const gapX = Math.max(0, Math.abs(x) - part.halfX);
          const gapZ = Math.max(part.minZ - z, z - part.maxZ, 0);
          minimumObstacleGap = Math.min(minimumObstacleGap, Math.hypot(gapX, gapZ) - obstacle.radius);
        }
      }
    }
    expect(minimumPavementMargin).toBeGreaterThan(1);
    expect(minimumObstacleGap).toBeGreaterThan(.1);
  });

  it('uses identical timestamps for player, focus, replay and a backwards reconnect seek', () => {
    const timestamps = [GO - 3000, GO - 2000, GO - 1000, GO - 175, GO, GO + 250];
    const player = timestamps.map(now => arrivalPose(GO, now));
    const focus = timestamps.map(now => arrivalPose(GO, now));
    const replay = timestamps.map(now => arrivalPose(GO, now));
    expect(focus).toEqual(player);
    expect(replay).toEqual(player);
    arrivalPose(GO, GO + 60_000);
    expect(arrivalPose(GO, GO - 2000)).toEqual(player[1]);
    expect(arrivalPose(null, GO)).toMatchObject({ carX: 8.6, carZ: 26, arrived: false });
    expect(arrivalPose(Number.NaN, GO).arrived).toBe(false);
  });
});
