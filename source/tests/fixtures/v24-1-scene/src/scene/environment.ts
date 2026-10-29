import * as THREE from 'three';

/** Original, procedural trackside scenery. Photographs inform space, never textures/logos. */
export const PIT_LANE_LAYOUT = Object.freeze({
  stop: { x: 0, z: 0 }, laneLength: 152, apron: { left: -8.8, right: 6.4 },
  fastLane: { left: 6.4, right: 12.6 }, garagesX: -10.8, pitWallX: 13.1,
  // Arrival begins in the travel lane, then merges before the working crew.
  approachX: 8.6, approachZ: 26, turnStartZ: 22, mergeZ: 7.6, exitZ: -28,
});

type Builder = {
  scene: THREE.Scene; quality: 'low' | 'high';
  material: (color: THREE.ColorRepresentation, roughness?: number, metalness?: number) => THREE.MeshStandardMaterial;
  basic: (color: THREE.ColorRepresentation, opacity?: number) => THREE.MeshBasicMaterial;
  box: (parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => THREE.Mesh;
  mesh: (geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x?: number, y?: number, z?: number, sx?: number, sy?: number, sz?: number) => THREE.Mesh;
  rod: (parent: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, radius: number) => THREE.Mesh;
  graphic: (draw: (ctx: CanvasRenderingContext2D) => void, width?: number, height?: number) => THREE.CanvasTexture;
  decal: (parent: THREE.Object3D, texture: THREE.Texture, x: number, y: number, z: number, w: number, h: number, floor?: boolean) => THREE.Mesh;
  textTexture: (text: string, color?: string, size?: number) => THREE.CanvasTexture;
  geometries: Set<THREE.BufferGeometry>;
};

export function buildPitLane(b: Builder): void {
  const { scene, material, basic, box, mesh, rod, graphic, decal, textTexture, geometries } = b;
  const yellow = material('#edc24b', .89), white = material('#e1e6d9', .88);
  const graphite = material('#263640', .76, .28), steel = material('#596c73', .54, .4);
  const red = material('#d53539', .62, .15), dark = material('#142630', .85);
  const concrete = material('#8c9690', .98), asphalt = material('#39474a', .99);
  const grass = material('#496c5d', 1);
  // Broad ground and an uninterrupted road extend far beyond the working box.
  box(scene, grass, 0, -.19, 0, 110, .3, 176);
  box(scene, asphalt, 6.7, -.045, 0, 12.2, .08, 158);
  box(scene, concrete, -1.2, -.037, 0, 15.2, .09, 158);
  box(scene, material('#56636a', 1), 23, -.025, 0, 15, .1, 164);
  const grain = graphic(ctx => {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 512, 512);
    let seed = 9427;
    for (let n = 0; n < 15000; n++) {
      seed = (seed * 16807) % 2147483647; const x = seed % 512;
      seed = (seed * 16807) % 2147483647; const y = seed % 512;
      const alpha = (seed % 18) / 100;
      ctx.fillStyle = `rgba(25,37,36,${alpha})`; ctx.fillRect(x, y, 1 + n % 3, 1);
    }
    ctx.strokeStyle = '#56615e30'; ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
  });
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(9, 68);
  concrete.map = grain;
  asphalt.map = grain;
  // Concrete expansion seams and long perspective lines, rather than room tiles.
  const seam = material('#687875', .98);
  for (let z = -76; z < 77; z += 4) box(scene, seam, -1.2, .012, z, 15.1, .008, .025);
  box(scene, white, 6.4, .018, 0, .13, .012, 154);
  box(scene, yellow, -7.5, .019, 0, .12, .012, 154);
  for (let z = -74; z < 75; z += 4.6) box(scene, white, 9.8, .018, z, .095, .012, 2.1);
  for (const x of [-4.96, 4.96]) box(scene, yellow, x, .026, -.4, .12, .018, 9.2);
  for (const z of [-4.65, 3.83]) box(scene, yellow, 0, .026, z, 9.9, .018, .105);
  // The single origin above is shared by stop markings, crew, hubs and all travel.
  for (const x of [-1.57, 1.57]) {
    box(scene, white, x, .03, -.3, .045, .016, 5.7);
    box(scene, yellow, x + Math.sign(x) * .3, .032, -3.35, .65, .018, .12);
  }
  // One filled arrow silhouette: a straight shaft followed by a true triangular head.
  // Positive local Y becomes negative world Z after rotation: the arrow points along
  // the incoming car's travel direction. This avoids the old fork-shaped ">-" marking.
  function arrow(x: number, z: number, scale = 1) {
    const shape = new THREE.Shape();
    shape.moveTo(-.105, -.95); // tail/shaft
    shape.lineTo(.105, -.95);
    shape.lineTo(.105, .22);
    shape.lineTo(.48, .22);
    shape.lineTo(0, 1.16); // pointed front, ahead of the shaft
    shape.lineTo(-.48, .22);
    shape.lineTo(-.105, .22);
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape);
    geometries.add(geometry);
    const marking = mesh(geometry, yellow, scene, x, .044, z, scale, scale, scale);
    marking.rotation.x = -Math.PI / 2;
  }
  for (const z of [-11, -21, 12, 24, 42]) { arrow(0, z, 1.25); arrow(8.1, z + 1, .8); }
  decal(scene, textTexture('APEX / 07', '#e5dfbf', 74), -3.3, .034, -.1, 2.8, 1.05, true);
  decal(scene, textTexture('PIT LANE', '#e5dfbf', 70), 8.1, .033, -6.8, 2.4, .7, true);
  const skidMat = basic('#162324', .19);
  const plane = new THREE.PlaneGeometry(1, 1); geometries.add(plane);
  for (const x of [-1.12, 1.12]) for (let n = 0; n < 3; n++) {
    const skid = mesh(plane, skidMat, scene, x + n * .065, .034, 4, .033, 19, 1); skid.rotation.x = -Math.PI / 2;
  }
  // Garage fronts are a distant row along ONE side of the lane, not walls around the car.
  const garageShell = material('#bcc5bb', .87), garageRoof = material('#374a52', .8, .25);
  const glass = material('#638c98', .4, .28);
  for (let i = -6; i <= 6; i++) {
    const z = i * 10.8;
    box(scene, garageShell, -13.7, 2.1, z, 5.6, 4.2, 10.45);
    box(scene, dark, -10.84, 1.68, z, .1, 3.2, 8.7);
    box(scene, garageRoof, -11.1, 4.04, z, 7.2, .27, 10.8);
    for (const side of [-1, 1]) {
      box(scene, garageShell, -10.6, 1.95, z + side * 4.9, .55, 3.9, .42);
      box(scene, red, -10.29, 1.82, z + side * 4.9, .055, 3.55, .23);
    }
    box(scene, graphite, -10.47, 3.43, z, .4, .42, 9.5);
    for (let panel = -2; panel <= 2; panel++) box(scene, glass, -10.34, 3.71, z + panel * 1.6, .035, .19, 1.48);
    const brand = decal(scene, textTexture(i === 0 ? 'APEX // PIT 07' : `PADDOCK // ${String(i + 8).padStart(2, '0')}`, '#f2ede0', 46), -10.24, 3.38, z, 4.2, .47);
    brand.rotation.y = Math.PI / 2;
    // Shadowed inner bay stays at a distance; two simple stored wheels/tool boxes.
    box(scene, steel, -11.9, .5, z - 2.8, 1.15, .95, 1.9);
    box(scene, red, -11.25, .51, z - 2.8, .08, .82, 1.6);
  }
  // Low pit wall, transparent safety fence, and visible circuit beyond the fast lane.
  box(scene, concrete, 13.1, .37, 0, .65, .75, 154);
  box(scene, red, 12.76, .47, 0, .055, .24, 154);
  const fenceMat = basic('#a9bbb8', .27);
  for (let z = -76; z <= 76; z += 5.4) {
    box(scene, steel, 13.16, 1.35, z, .055, 1.95, .055);
    for (const y of [1, 1.5, 2.1]) box(scene, fenceMat, 13.16, y, z + 2.6, .025, .018, 5.4);
  }
  for (const x of [15.3, 30.3]) box(scene, white, x, .035, 0, .16, .014, 160);
  for (let z = -78; z < 78; z += 2.1) box(scene, (Math.round(z / 2.1) % 2 ? white : red), 30.7, .048, z, .65, .025, 2.08);
  // A distant bank of stands and light standards completes the track horizon.
  const stand = material('#637d7e', .95);
  for (let row = 0; row < 4; row++) box(scene, stand, 37 + row * 1.4, .5 + row * .55, 5, 1.6, .6 + row * 1.05, 108);
  for (const z of [-42, -12, 23, 54]) {
    box(scene, steel, 15.1, 4.5, z, .12, 9, .12);
    box(scene, graphite, 14.65, 8.95, z, 1.25, .2, .53);
    box(scene, white, 14.65, 8.83, z, 1.05, .035, .36);
  }
  // Original compressed-air booms over the working bay (IMG_1251/1247 context).
  for (const z of [-2.75, 2.65]) {
    box(scene, graphite, -6.45, 1.95, z, .18, 3.9, .18);
    box(scene, graphite, -2.05, 3.88, z, 8.95, .19, .21);
    box(scene, red, -4.9, 3.89, z - .13, 2.75, .15, .035);
    rod(scene, steel, new THREE.Vector3(-6.45, 2.6, z), new THREE.Vector3(-3.8, 3.88, z), .035);
    for (const x of [-2.15, 2.1]) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, 3.83, z), new THREE.Vector3(x + .25, 3.1, z + .14),
        new THREE.Vector3(x + .21, 2.35, z + .22), new THREE.Vector3(x + .2, 1.85, z + .3),
      ]);
      const hose = new THREE.TubeGeometry(curve, 12, .021, 4, false); geometries.add(hose); mesh(hose, dark, scene);
    }
  }
}
