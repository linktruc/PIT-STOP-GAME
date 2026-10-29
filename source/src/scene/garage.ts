import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Room, Task } from '../types';
import { TaskAnimationTimeline } from './animation';
import { LiveSceneAudio } from './liveAudio';
import { teamCrewColor } from './colors';
import { SceneClock, FramePacer, CrewMotion } from './motion';
import {WheelHandling,offWheelStation,onWheelStation,wheelGripAnchors} from './wheelHandling';
import {DepartureMotion,releaseGesture} from './departure';
import {GunnerMotion} from './gunnerMotion';
import {playerCameraPose,type PlayerCameraMode} from './playerCamera';
import {stabilizerExitPhase,stabilizerStation,rearJackApproach} from './staging';
import {workDone,workPhase} from './work';
import { departurePose, arrivalPose, isCrewTap } from './rig';
import { buildPitLane, PIT_LANE_LAYOUT } from './environment';
import { CREW, CORNER_POSITIONS, gunnerKneelingPose, supportCrewClear, supportHandAnchors, type Crew } from './crew';
type KneelingLeg = {thigh:THREE.Mesh;shin:THREE.Mesh;foot:THREE.Mesh;knee:THREE.Mesh};
type Actor = { spec: Crew; group: THREE.Group; body: THREE.Group; head:THREE.Group; arms: THREE.Group[]; legs: THREE.Group[]; kneelingLegs?:KneelingLeg[]; tool?: THREE.Group; socket?:THREE.Group; forearms: THREE.Group[]; hands: THREE.Mesh[]; carry: THREE.Group; selectionRing: THREE.Mesh; selectionGlow: THREE.Mesh; ring: THREE.Mesh; glow: THREE.Mesh; suit: THREE.MeshStandardMaterial };
type WheelCorner = { key: string; x: number; z: number; wheel: THREE.Group; old: THREE.Group; fresh: THREE.Group };

export type CrewSelection = {name:string;role:string}|null;
export type PitView = NonNullable<ReturnType<typeof createPitGarageScene>>;
export function createPitGarageScene(element: HTMLElement, options: {quality?:'low'|'high';renderer?:THREE.WebGLRenderer;manual?:boolean;marker?:{current:HTMLDivElement|null};tooltip?:{current:HTMLButtonElement|null};setSelected?:(selection:CrewSelection)=>void;setFallback?:(fallback:boolean)=>void;onTaskCue?:(taskId:string)=>void;onCameraModeChange?:(mode:PlayerCameraMode)=>void}={}) {
 const quality=options.quality??'high'; const manual=options.manual??false;
 const sceneDebug = new URLSearchParams(window.location.search).has('sceneDebug');
 const contactDebug=sceneDebug&&(!manual||new URLSearchParams(window.location.search).has('contactDebug'));
 const marker=options.marker??{current:null};const tooltip=options.tooltip??{current:null};const selectedActor={current:null as number|null};
 const setSelected=options.setSelected??(()=>{});const setFallback=options.setFallback??(()=>{});
 const latest={current:{room:null as Room|null|undefined,playerId:null as string|null|undefined,sceneActive:true,presentationTime:undefined as number|undefined,clockOffset:0,poseRevision:0}};
 const timeline={current:new TaskAnimationTimeline()};
 const sceneClock=new SceneClock();
 const framePacer=new FramePacer();
 const liveAudio=new LiveSceneAudio();
 const crewMotion=new CrewMotion();
 const wheelHandling=new WheelHandling();
 const departureMotion=new DepartureMotion();
 const gunnerMotion=new GunnerMotion();
 const gunCueTimes=new Map<string,number>();let gunCueRound:string|null=null;
 const fittedGrips=new Map<string,THREE.Vector3[]>();
 const gunNutAnchors=new Map<string,THREE.Vector3>();
 let attachmentRound:string|null=null;
 const gunGripAnchors=[new THREE.Vector3(0,-.16,0),new THREE.Vector3(0,0,-.22)];
 let renderInvalidated=true;
 let appliedCrewColor: string | null | undefined;
 const deselect=()=>{selectedActor.current=null;setSelected(null);renderInvalidated=true;};
 const update=(room?:Room|null,playerId?:string|null,sceneActive=true,presentationTime?:number,serverNow?:number,clockOffsetOverride?:number,poseRevision=0)=>{
  const prior=latest.current; renderInvalidated=true;
  if(prior.poseRevision!==poseRevision){crewMotion.reset();wheelHandling.reset();departureMotion.reset();gunnerMotion.reset();gunCueTimes.clear();fittedGrips.clear();gunNutAnchors.clear();}
  if(prior.room?.id!==room?.id || prior.room?.players.find(p=>p.id===prior.playerId)?.role!==room?.players.find(p=>p.id===playerId)?.role) deselect();
  latest.current={room,playerId,sceneActive,presentationTime,clockOffset:clockOffsetOverride??(room?.solo?0:serverNow===undefined?prior.clockOffset:serverNow-Date.now()),poseRevision};
  // Replay rebuilds the deterministic event clock; live retains visible phases.
  if ((prior.presentationTime === undefined) !== (presentationTime === undefined)) timeline.current = new TaskAnimationTimeline();
  if (presentationTime !== undefined) timeline.current.ingestRecorded(room?.round ?? null);
  else timeline.current.ingestLive(room?.round ?? null, Date.now()+latest.current.clockOffset);
 };
    let renderer: THREE.WebGLRenderer;
    try { renderer = options.renderer ?? new THREE.WebGLRenderer({ antialias: quality === 'high', alpha: false, powerPreference: 'high-performance' }); setFallback(false); }
    catch { setFallback(true); return null; }
    let disposed = false;
    let frame = 0;
    let visible = true;
    let lastPresentationTime: number|undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#9ebbc5'); scene.fog = new THREE.Fog('#9ebbc5', 35, 105);
    const camera = new THREE.PerspectiveCamera(39, 1, .1, 165);
    if (!manual) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.55 : 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = quality === 'high'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;touch-action:none;outline:none;cursor:grab';
    renderer.domElement.setAttribute('aria-label', 'Pit lane camera. Drag or swipe to rotate; scroll or pinch to zoom.');
    if (!manual) {
      renderer.domElement.setAttribute('tabindex', '0'); element.prepend(renderer.domElement);

    }
    const controls = new OrbitControls(camera, renderer.domElement);
    let userCamera=false;let arrivalCameraActive=false;let cameraRoundId:string|null=null;
    let arrivalUserOrbit=false;
    let landingCameraStartedAt:number|null=null;
    const landingCameraStart=new THREE.Vector3();
    // Moving the OrbitControls target and the camera by the same delta keeps
    // any user-selected azimuth/elevation while the car enters the pit lane.
    const shiftCameraTarget=(target:THREE.Vector3)=>{
      camera.position.add(target.clone().sub(controls.target));
      controls.target.copy(target);
      controls.update();
    };
    const isCountdownApproach=()=>{
      const round=latest.current.room?.round;
      if(!round || !Number.isFinite(round.goAt))return false;
      const now=latest.current.presentationTime??Date.now()+latest.current.clockOffset;
      // Keep the chosen angle editable during the short return to the work bay.
      return now>=round.goAt-3000 && (now<round.goAt || (arrivalCameraActive && now<round.goAt+650));
    };
    controls.enabled = !manual;
    controls.enableDamping = !motion.matches; controls.dampingFactor = .075; controls.enablePan = false;
    controls.minDistance = 10; controls.maxDistance = 24; controls.minPolarAngle = .04; controls.maxPolarAngle = 1.35; controls.rotateSpeed = .65; controls.zoomSpeed = .5;
    let cameraMode:PlayerCameraMode='overview';
    const resetCamera = () => {
      cameraMode='overview';controls.enabled=true;options.onCameraModeChange?.('overview');camera.near=.1;camera.fov=39;camera.updateProjectionMatrix();
      userCamera=false;
      arrivalUserOrbit=false;
      landingCameraStartedAt=null;
      controls.minDistance=10;
      controls.maxDistance=24;
      const mobile = !manual && element.clientWidth / element.clientHeight < .95;
      controls.target.set(mobile ? 0 : .6, .38, mobile ? -1.8 : .4);
      camera.position.set(mobile ? 11.2 : manual ? 11.5 : 8.6, mobile ? 12 : manual ? 10.5 : 8.3, mobile ? -14 : manual ? -14.5 : -11.6); controls.update();
    };
    resetCamera();
    const onCameraChange = () => { renderInvalidated=true; element.dataset.cameraYaw = controls.getAzimuthalAngle().toFixed(3); };
    controls.addEventListener('change', onCameraChange);
    controls.addEventListener('start', () => {
      if(isCountdownApproach()) {
        // An orbit changes the viewing angle, NOT the tracked position.
        arrivalUserOrbit=true;
        landingCameraStartedAt=null;
      } else {
        userCamera=true;arrivalCameraActive=false;
      }
      renderer.domElement.style.cursor='grabbing';
    });
    controls.addEventListener('end', () => { renderer.domElement.style.cursor = 'grab'; });
    if (!manual) window.addEventListener('pit-camera-reset', resetCamera);
    const setPlayerCamera=(mode:PlayerCameraMode)=>{
      if(mode==='overview'){resetCamera();return;}
      cameraMode=mode;controls.enabled=false;userCamera=true;arrivalCameraActive=false;renderInvalidated=true;options.onCameraModeChange?.(mode);
    };
    const setCameraView = (view: 'top'|'diagonal'|'front') => {
      cameraMode='overview';controls.enabled=true;options.onCameraModeChange?.('overview');
      userCamera=true;arrivalCameraActive=false;
      controls.target.set(0, .35, 0);
      const positions = {top:[0,19,-.02],diagonal:[11,12,-15],front:[.7,5.2,-18]} as const;
      const [x,y,z]=positions[view]; camera.position.set(x,y,z); controls.update(); element.dataset.cameraView=view;
    };
    const cameraViewEvent = (event: Event) => { const view=(event as CustomEvent).detail; if(view==='top'||view==='diagonal'||view==='front')setCameraView(view); };
    const setCrewCloseup=(role:string,view:'top'|'diagonal'|'front')=>{
      cameraMode='overview';controls.enabled=true;options.onCameraModeChange?.('overview');
      const crew=CREW.find(c=>c.role===role)??CREW.find(c=>c.support===(role.startsWith('NOSE')?'nose':'sidepod')&&Math.sign(c.x)===(role.endsWith('LEFT')?-1:1));
      if(!crew)return;userCamera=true;arrivalCameraActive=false;controls.minDistance=2;
      const x=crew.support==='nose'?crew.x:crew.support==='sidepod'?crew.x:crew.x*.82,z=crew.z;
      controls.target.set(x,.64,z);
      const offset=view==='top'?new THREE.Vector3(0,5.5,-.01):view==='front'?new THREE.Vector3(Math.sign(x)*.4,1.1,-4.4):new THREE.Vector3(Math.sign(x)*3.4,2.5,-3.0);
      camera.position.copy(controls.target).add(offset);controls.update();renderInvalidated=true;
    };
    if (!manual) window.addEventListener('pit-camera-view', cameraViewEvent);
    const keyCamera = (event: KeyboardEvent) => {
      if (event.key === 'Home' || event.key.toLowerCase() === 'r') { resetCamera(); event.preventDefault(); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        userCamera=true;arrivalCameraActive=false;
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), event.key === 'ArrowLeft' ? -.12 : .12);
        camera.position.copy(controls.target).add(offset); controls.update(); event.preventDefault();
      }
    };
    if (!manual) renderer.domElement.addEventListener('keydown', keyCamera);
    const materials = new Set<THREE.Material>(); const geometries = new Set<THREE.BufferGeometry>(); const textures = new Set<THREE.Texture>();
    function material(color: THREE.ColorRepresentation, roughness = .65, metalness = .08) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true }); materials.add(mat); return mat;
    }
    function basic(color: THREE.ColorRepresentation, opacity = 1) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity === 1 }); materials.add(mat); return mat;
    }
    const red = material('#ed242f', .38, .2); const darkRed = material('#a70f25', .5, .15); const white = material('#f3eee4', .4, .1);
    const graphite = material('#202a36', .56, .3); const rubber = material('#11171e', .96, .03); const metal = material('#9cabb4', .3, .72);
    const darkMetal = material('#3f505f', .5, .5); const black = material('#080e17', .22, .4); const gold = basic('#ffcf47');
    const selectionCyan = basic('#6ce8d9'); const selectionWash = basic('#56ded3', .18);
    const boxGeo = new THREE.BoxGeometry(1, 1, 1); geometries.add(boxGeo);
    const sphereGeo = new THREE.IcosahedronGeometry(1, 1); geometries.add(sphereGeo);
    const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 12); geometries.add(cylinderGeo);
    const planeGeo = new THREE.PlaneGeometry(1, 1); geometries.add(planeGeo);
    const ringGeo = new THREE.TorusGeometry(1, .025, 4, 40); geometries.add(ringGeo);
    function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
      const object = new THREE.Mesh(geometry, mat); object.position.set(x, y, z); object.scale.set(sx, sy, sz); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
    }
    function box(parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) { return mesh(boxGeo, mat, parent, x, y, z, sx, sy, sz); }
    function rod(parent: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, radius: number) {
      const object = mesh(cylinderGeo, mat, parent, 0, 0, 0, radius, a.distanceTo(b), radius); object.position.copy(a).add(b).multiplyScalar(.5);
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return object;
    }
    function graphic(draw: (ctx: CanvasRenderingContext2D) => void, width = 512, height = 256) {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const context = canvas.getContext('2d'); if (context) draw(context);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); return texture;
    }
    function decal(parent: THREE.Object3D, texture: THREE.Texture, x: number, y: number, z: number, w: number, h: number, floor = false) {
      const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }); materials.add(mat);
      const plane = mesh(planeGeo, mat, parent, x, y, z, w, h, 1); plane.castShadow = false; if (floor) plane.rotation.x = -Math.PI / 2; return plane;
    }
    function textTexture(text: string, color = '#f6eee3', size = 90) {
      return graphic(ctx => { ctx.font = `900 ${size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, 256, 128); });
    }
    // Open daylight, warm sunlight and restrained fill retain the low-poly contrast.
    scene.add(new THREE.HemisphereLight('#c5e5ee', '#414d42', 2.0));
    const key = new THREE.DirectionalLight('#ffe4ba', 3.7); key.position.set(-8, 14, -10); key.castShadow = quality === 'high'; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: .5, far: 44 }); key.shadow.normalBias = .025; key.shadow.bias = -.00015; scene.add(key);
    const rim = new THREE.DirectionalLight('#9bcbd9', 1.2); rim.position.set(8, 6, 7); scene.add(rim);
    buildPitLane({scene,quality,material,basic,box,mesh,rod,graphic,decal,textTexture,geometries});
    function toolCart(x: number, z: number, angle: number) {
      const cart = new THREE.Group(); cart.position.set(x, 0, z); cart.rotation.y = angle; scene.add(cart);
      box(cart, red, 0, .47, 0, .86, .71, .58); box(cart, graphite, 0, .87, 0, .94, .09, .64);
      for (let y = .25; y < .8; y += .17) { box(cart, darkRed, 0, y, -.296, .75, .13, .02); box(cart, metal, 0, y + .025, -.315, .46, .02, .02); }
      for (const xx of [-.33, .33]) for (const zz of [-.22, .22]) { const caster = mesh(cylinderGeo, rubber, cart, xx, .1, zz, .09, .06, .09); caster.rotation.z = Math.PI / 2; }
      for (let i = 0; i < 3; i++) { const tool = box(cart, metal, -.22 + i * .17, .94, 0, .04, .04, .3); tool.rotation.y = -.3; }
      rod(cart, metal, new THREE.Vector3(.48, .6, -.2), new THREE.Vector3(.48, 1, -.2), .025);
    }
    toolCart(-6.2, 3.9, -.25); toolCart(5.8, 4.45, .5);
    // Original angular red single-seater with twin white nose stripes.
    const car = new THREE.Group(); scene.add(car); const chassis = new THREE.Group(); car.add(chassis);
    box(chassis, black, 0, .26, .15, 1.52, .12, 3.8); box(chassis, red, 0, .48, .45, .84, .43, 3.2);
    const noseGeo = new THREE.BufferGeometry();
    noseGeo.setAttribute('position', new THREE.Float32BufferAttribute([
      -.36,.72,-.72, .36,.72,-.72, -.12,.43,-3.02, .36,.72,-.72, .12,.43,-3.02, -.12,.43,-3.02,
      -.36,.72,-.72, -.12,.43,-3.02, -.14,.26,-3.02, -.36,.72,-.72, -.14,.26,-3.02, -.38,.30,-.72,
      .36,.72,-.72, .38,.30,-.72, .14,.26,-3.02, .36,.72,-.72, .14,.26,-3.02, .12,.43,-3.02,
      -.12,.43,-3.02, .12,.43,-3.02, .14,.26,-3.02, -.12,.43,-3.02, .14,.26,-3.02, -.14,.26,-3.02,
    ], 3)); noseGeo.computeVertexNormals(); geometries.add(noseGeo); mesh(noseGeo, red, chassis);
    for (const x of [-.085, .085]) { const line = box(chassis, white, x, .578, -1.89, .052, .015, 2.22); line.rotation.x = -.129; }
    for (const side of [-1, 1]) {
      const pod = box(chassis, red, side * .61, .47, .52, .57, .41, 2.06); pod.rotation.y = side * -.08;
      box(chassis, darkRed, side * .8, .38, .82, .12, .24, 1.1); box(chassis, black, side * .61, .6, -.51, .39, .2, .19); box(chassis, white, side * .77, .697, .46, .055, .015, 1.35);
      const brand = decal(chassis, textTexture('APEX', '#ffffff', 110), side * .91, .49, .62, .8, .23); brand.rotation.y = side * Math.PI / 2;
      rod(chassis, metal, new THREE.Vector3(side * .27, .39, -1.4), new THREE.Vector3(side * 1.1, .42, -1.58), .025);
      rod(chassis, graphite, new THREE.Vector3(side * .28, .56, -1.1), new THREE.Vector3(side * 1.1, .42, -1.58), .03);
      rod(chassis, graphite, new THREE.Vector3(side * .30, .5, 1.03), new THREE.Vector3(side * 1.1, .42, 1.42), .035);
      rod(chassis, graphite, new THREE.Vector3(side * .28, .32, 1.9), new THREE.Vector3(side * 1.1, .42, 1.42), .027);
      rod(chassis, graphite, new THREE.Vector3(side * .3, .78, -.48), new THREE.Vector3(side * .65, .77, -.6), .025); box(chassis, red, side * .68, .8, -.59, .19, .08, .12);
    }
    mesh(sphereGeo, black, chassis, 0, .77, -.01, .31, .13, .53);
    const haloGeo = new THREE.TorusGeometry(.31, .033, 5, 20, Math.PI * 1.8); geometries.add(haloGeo);
    const halo = mesh(haloGeo, graphite, chassis, 0, .96, -.02); halo.rotation.x = Math.PI / 2; halo.scale.y = 1.5;
    rod(chassis, graphite, new THREE.Vector3(0, .73, -.48), new THREE.Vector3(0, .99, -.36), .028);
    mesh(sphereGeo, white, chassis, 0, .84, .1, .16, .15, .19); mesh(sphereGeo, black, chassis, 0, .84, -.04, .14, .065, .09);
    const engineGeo = new THREE.ConeGeometry(.34, 1.75, 4); geometries.add(engineGeo); const engine = mesh(engineGeo, red, chassis, 0, .86, 1.04, 1, 1, .85); engine.rotation.x = -Math.PI / 2;
    const fin = box(chassis, darkRed, 0, .91, 1.12, .07, .57, .95); fin.rotation.x = -.16;
    box(chassis, black, 0, .27, -3.03, 2.95, .10, .5); box(chassis, white, 0, .37, -3.04, 2.82, .065, .39); box(chassis, red, 0, .43, -2.97, 2.7, .045, .23);
    for (const side of [-1, 1]) {
      box(chassis, white, side * 1.43, .43, -3.01, .07, .37, .58);
      const wingText = decal(chassis, textTexture('APEX', '#18232e', 110), side * .9, .412, -3.07, .59, .23, true); wingText.rotation.z = Math.PI;
    }
    for (const x of [-.49, .49]) box(chassis, graphite, x, .78, 2.06, .055, .84, .13);
    box(chassis, red, 0, 1.17, 2.07, 2.07, .12, .48); box(chassis, white, 0, 1.27, 2.1, 2.02, .045, .35);
    for (const side of [-1, 1]) box(chassis, darkRed, side * 1.04, 1.19, 2.08, .065, .42, .54);
    const carNumber = decal(chassis, textTexture('07', '#fdf7ec', 150), 0, .71, -1.17, .31, .38, true); carNumber.rotation.z = Math.PI;
    const tyreGeo = new THREE.CylinderGeometry(.43, .43, .39, 16); tyreGeo.rotateZ(Math.PI / 2); geometries.add(tyreGeo);
    const rimGeo = new THREE.CylinderGeometry(.27, .27, .405, 12); rimGeo.rotateZ(Math.PI / 2); geometries.add(rimGeo);
    const tyreRingGeo = new THREE.TorusGeometry(.35, .013, 4, 24); tyreRingGeo.rotateY(Math.PI / 2); geometries.add(tyreRingGeo);
    function wheel() {
      const group = new THREE.Group(); mesh(tyreGeo, rubber, group); mesh(rimGeo, graphite, group);
      for (const side of [-1, 1]) {
        mesh(tyreRingGeo, red, group, side * .205, 0, 0);
        const nut = mesh(cylinderGeo, metal, group, side * .219, 0, 0, .073, .04, .073); nut.rotation.z = Math.PI / 2;
        for (let n = 0; n < 6; n++) { const spoke = box(group, darkMetal, side * .211, 0, 0, .018, .47, .036); spoke.rotation.x = n * Math.PI / 3; }
      }
      return group;
    }
    const corners: WheelCorner[] = CORNER_POSITIONS.map(([key, x, z]) => {
      const tyre = wheel(); tyre.position.set(x, .44, z); car.add(tyre);
      const old = wheel(); old.visible = false; scene.add(old);
      const fresh = wheel(); fresh.position.set(x + Math.sign(x) * 1.72, .44, z - .84); scene.add(fresh);
      return { key, x, z, wheel: tyre, old, fresh };
    });
    for (const [x, z] of [[-5.45, 4.3], [5.5, 4.1], [-5.8, .3], [5.7, 1.9]]) for (let i = 0; i < 3; i++) {
      const spare = wheel(); spare.rotation.z = Math.PI / 2; spare.position.set(x, .23 + i * .41, z); scene.add(spare);
    }
    const coneGeo = new THREE.ConeGeometry(.19, .6, 6); geometries.add(coneGeo);
    for (const x of [-5.6, 5.6]) { mesh(coneGeo, red, scene, x, .3, -3.6); box(scene, black, x, .035, -3.6, .43, .07, .43); mesh(cylinderGeo, white, scene, x, .27, -3.6, .115, .1, .115); }
    // Independently articulated jacks retain their individual axle offsets.
    const jacks = [true, false].map(front => {
      const group = new THREE.Group(); group.position.set(0, 0, front ? -3.12 : 2.35); if (!front) group.rotation.y = Math.PI; scene.add(group);
      box(group, red, 0, .13, -.21, .45, .17, .73); const plate = box(group, metal, 0, .23, .08, .37, .08, .29); const piston = mesh(cylinderGeo, metal, group, 0, .2, 0, .055, .2, .055);
      plate.userData.animated = true; piston.userData.animated = true;
      for (const x of [-.24, .24]) { const caster = mesh(cylinderGeo, rubber, group, x, .1, -.3, .09, .07, .09); caster.rotation.z = Math.PI / 2; }
      const handle = new THREE.Group(); handle.position.set(0, .16, -.42); group.add(handle); rod(handle, metal, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .83, -.65), .035); box(handle, black, 0, .83, -.65, .44, .065, .08);
      const grip = new THREE.Group(); grip.position.set(0, .83, -.65); handle.add(grip); return { group, handle, grip, plate, piston, front };
    });
    // Unlit, non-tone-mapped lamp colors prevent HDR/emissive white clipping.
    // Exactly one lamp is illuminated: RED while stopping/servicing; GREEN on release.
    const redLampMat = new THREE.MeshBasicMaterial({ color: '#ff392c', toneMapped: false }); materials.add(redLampMat);
    const greenLampMat = new THREE.MeshBasicMaterial({ color: '#172b22', toneMapped: false }); materials.add(greenLampMat);
    const signal = new THREE.Group(); signal.position.set(3.8, 0, -4.08); scene.add(signal);
    box(signal, graphite, 0, .07, 0, .56, .14, .54); mesh(cylinderGeo, metal, signal, 0, .94, 0, .035, 1.8, .035); box(signal, black, 0, 1.86, 0, .38, .76, .25);
    mesh(sphereGeo, redLampMat, signal, 0, 2.05, -.15, .12, .12, .045); mesh(sphereGeo, greenLampMat, signal, 0, 1.68, -.15, .12, .12, .045);
    for (const corner of corners) {
      const side = Math.sign(corner.x); const points: THREE.Vector3[] = [];
      for (let n = 0; n <= 32; n++) points.push(new THREE.Vector3(corner.x + side * (.7 + n / 32 * 2.6), .04, corner.z + Math.sin(n / 32 * Math.PI * 8) * .11));
      const hose = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), quality === 'high' ? 40 : 20, .018, 4, false); geometries.add(hose); mesh(hose, darkRed, scene);
    }
    // Twenty-two angular crew with shoulder/hip pivots, black visors and equipment.
    const actors: Actor[] = CREW.map((spec, index) => {
      const group = new THREE.Group(); group.position.set(spec.x, 0, spec.z); group.rotation.y = spec.angle ?? 0; scene.add(group);
      const body = new THREE.Group(); group.add(body);
      const suit = material(spec.role ? '#ef3039' : index % 2 ? '#577380' : '#2e4659', .81, .03);
      suit.name = 'crew-suit';
      const legs: THREE.Group[] = [];
      const kneelingLegs: KneelingLeg[] | undefined=['gun','off','on'].includes(spec.kind)?[]:undefined;
      for (const side of [-1, 1]) {
        const leg = new THREE.Group(); leg.position.set(side * .115, .56, 0); group.add(leg); legs.push(leg);
        if(kneelingLegs){
          leg.position.set(0,0,0);
          const thigh=box(leg,suit,0,0,0,.17,1,.19),shin=box(leg,suit,0,0,0,.145,1,.16),foot=box(leg,black,0,.075,0,.19,.14,.31),knee=box(leg,graphite,0,0,0,.185,.14,.17);
          [thigh,shin,foot,knee].forEach(part=>{part.userData.animated=true;});
          kneelingLegs.push({thigh,shin,foot,knee});continue;
        }
        const thigh = box(leg, suit, 0, -.15, .005, .17, .31, .2); thigh.rotation.x = -.08;
        box(leg, graphite, 0, -.28, -.105, .18, .15, .08); box(leg, suit, 0, -.4, .025, .14, .25, .16); box(leg, white, 0, -.47, -.07, .145, .055, .022); box(leg, black, 0, -.53, -.065, .19, .14, .31);
      }
      box(body, suit, 0, .84, 0, .43, .53, .29); box(body, graphite, 0, .61, 0, .43, .09, .3); box(body, white, 0, .87, -.153, .41, .1, .025);
      for (const side of [-1, 1]) box(body, graphite, side * .19, .78, -.02, .065, .29, .29);
      box(body, darkRed, 0, .96, -.17, .19, .07, .02);
      const arms: THREE.Group[] = []; const forearms: THREE.Group[] = []; const hands: THREE.Mesh[] = [];
      for (const side of [-1, 1]) {
        const arm = new THREE.Group(); arm.position.set(side * .26, 1.03, 0); body.add(arm); arms.push(arm);
        box(arm, suit, 0, -.195, 0, .17, .39, .2); const fore = new THREE.Group(); fore.position.y = -.39; arm.add(fore); forearms.push(fore); box(fore, suit, 0, -.17, 0, .14, .34, .16); box(fore, white, 0, -.31, 0, .145, .065, .17); const hand = mesh(sphereGeo, black, fore, 0, -.39, 0, .09, .095, .09); hands.push(hand);
      }
      const head=new THREE.Group();body.add(head);
      mesh(sphereGeo, suit, head, 0, 1.29, -.008, .235, .253, .23); mesh(sphereGeo, black, head, 0, 1.31, -.196, .198, .1, .065); box(head, white, 0, 1.44, -.02, .075, .035, .31); box(head, graphite, 0, 1.13, -.12, .25, .06, .15);
      let tool: THREE.Group | undefined;let socket:THREE.Group|undefined;
      if (spec.kind === 'gun') {
        tool = new THREE.Group(); tool.position.set(0, .6, -.6); body.add(tool); box(tool, metal, 0, 0, -.1, .15, .14, .34); box(tool, black, 0, -.11, 0, .085, .21, .1);
        const barrel = mesh(cylinderGeo, darkMetal, tool, 0, 0, -.32, .055, .18, .055); barrel.rotation.x = Math.PI / 2; box(tool, red, 0, .08, -.1, .13, .045, .17);
        socket=new THREE.Group();socket.position.z=-.41;tool.add(socket);
        const bit=mesh(cylinderGeo,metal,socket,0,0,0,.052,.05,.052);bit.rotation.x=Math.PI/2;
        box(socket,white,.033,0,-.026,.024,.075,.012);
      }
      if (spec.kind === 'release') box(arms[1], black, 0, -.48, -.09, .26, .035, .31);
      if (spec.kind === 'ambient' && index > 18) box(arms[0], graphite, 0, -.45, -.09, .23, .045, .3);
      const ring = mesh(ringGeo, gold, group, 0, .035, 0, .48, .48, .48); ring.rotation.x = -Math.PI / 2; ring.castShadow = false; ring.visible = false;
      const glow = mesh(cylinderGeo, basic('#ffd354', .12), group, 0, .035, 0, .47, .025, .47); glow.castShadow = false; glow.visible = false;
      ring.userData.animated = true; glow.userData.animated = true;
      const carry = new THREE.Group(); carry.position.set(0, .72, -.66); body.add(carry); const selectionRing = mesh(ringGeo, selectionCyan, group, 0, .045, 0, .55, .55, .55); selectionRing.rotation.x = -Math.PI / 2; selectionRing.castShadow = false; selectionRing.visible = false; selectionRing.userData.animated = true;
      const selectionGlow = mesh(cylinderGeo, selectionWash, group, 0, .04, 0, .54, .025, .54); selectionGlow.castShadow = false; selectionGlow.visible = false; selectionGlow.userData.animated = true;
      return { spec, group, body, head, arms, forearms, hands, carry, legs, kneelingLegs, tool, socket, ring, glow, selectionRing, selectionGlow, suit };
    });
    // Batch static geometry per material inside each independently animated group.
    // All shoulder, hip, tool, wheel and jack pivots remain separate and editable.
    function batch(object: THREE.Object3D) {
      for (const child of [...object.children]) if (!(child instanceof THREE.Mesh)) batch(child);
      const buckets = new Map<string, THREE.Mesh[]>();
      for (const child of object.children) {
        if (!(child instanceof THREE.Mesh) || child.userData.animated || Array.isArray(child.material)) continue;
        const key = `${child.material.uuid}/${child.castShadow}/${child.receiveShadow}/${!!child.geometry.index}/${Object.keys(child.geometry.attributes).sort().join(',')}`;
        buckets.set(key, [...(buckets.get(key) ?? []), child]);
      }
      for (const objects of buckets.values()) {
        if (objects.length < 2) continue;
        const copies = objects.map(object => { object.updateMatrix(); return object.geometry.clone().applyMatrix4(object.matrix); });
        const geometry = mergeGeometries(copies); copies.forEach(copy => copy.dispose()); if (!geometry) continue;
        geometries.add(geometry); const merged = new THREE.Mesh(geometry, objects[0].material);
        merged.castShadow = objects[0].castShadow; merged.receiveShadow = objects[0].receiveShadow;
        objects.forEach(object => object.removeFromParent()); object.add(merged);
      }
    }
    // Cache immutable role categories once; no per-pair closure or string search in each frame.
    const picks = actors.map((actor, index) => {
      const hit = mesh(boxGeo, basic('#ffffff', 0), actor.group, 0, .83, 0, .79, 1.75, .79);
      hit.userData.animated = true; hit.userData.actorIndex = index; hit.castShadow = false; return hit;
    });
    let down = { x: 0, y: 0, time: 0 }; const raycaster = new THREE.Raycaster();
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY, time: performance.now() }; };
    const pointerUp = (event: PointerEvent) => {
      if (!isCrewTap(down, { x: event.clientX, y: event.clientY, time: performance.now() })) return;
      const rect = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
      // V10.3 used transparent crew hitboxes. In dense V11 layouts the
      // ray can miss a small hitbox; a bounded screen-space crew fallback makes
      // selection reliable without selecting distant props or stealing drags.
      const hit = raycaster.intersectObjects(picks, false)[0];
      let actor = hit ? actors[hit.object.userData.actorIndex] : undefined;
      if (!actor) {
        scene.updateMatrixWorld(true);
        let nearest = Math.min(44, Math.max(27, rect.width * .035));
        for (const candidate of actors) {
          const point = candidate.group.localToWorld(new THREE.Vector3(0, 1.05, 0)).project(camera);
          if (point.z < -1 || point.z > 1) continue;
          const px = rect.left + (point.x + 1) * rect.width / 2;
          const py = rect.top + (1 - point.y) * rect.height / 2;
          const dist = Math.hypot(event.clientX - px, event.clientY - py);
          if (dist < nearest) { nearest = dist; actor = candidate; }
        }
      }
      const player = latest.current.room?.players.find(p => p.role === actor?.spec.role);
      selectedActor.current = actor && player?.id !== latest.current.playerId ? actors.indexOf(actor) : null;
      renderInvalidated=true;
      const selection = actor && player?.id !== latest.current.playerId ? { name: player?.nickname ?? 'Bot', role: actor.spec.support === 'sidepod' ? 'Stabilizer' : actor.spec.support === 'nose' ? 'Front Wing Adjuster' : actor.spec.role ? actor.spec.role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : 'Pit Crew' } : null;
      setSelected(selection);
    };
    if (!manual) { renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp); }
    batch(scene);
    let mobileLayout = element.clientWidth / element.clientHeight < .95;
    const resize = () => {
      renderInvalidated=true;
      const width = element.clientWidth; const height = element.clientHeight; if (!width || !height) return;
      const mobile = !manual && width / height < .95; if (mobile !== mobileLayout) { mobileLayout = mobile; if(cameraMode==='overview')resetCamera(); }
      if (!manual) renderer.setSize(width, height, false); camera.aspect = width / height; camera.fov = width / height < .85 ? 54 : width / height > 2.25 ? 34 : 39; camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; }); intersection.observe(element);
    const lost = (event: Event) => { event.preventDefault(); disposed = true; cancelAnimationFrame(frame); setFallback(true); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const smooth = (value: number) => { const p = THREE.MathUtils.clamp(value, 0, 1); return p * p * (3 - 2 * p); };
    const mix = THREE.MathUtils.lerp; const markerPosition = new THREE.Vector3();
    let taskMap = new Map<string, Task>(); const roleTasks=new Map<string,Task[]>(); const noTasks:Task[]=[]; let previousRoom: Room | null | undefined;
    function draw(frameNow: number) {
      if (disposed) return; if (!manual) frame = requestAnimationFrame(draw);
      if (!latest.current.sceneActive || document.hidden || (!manual && (!visible || !framePacer.accept(frameNow,quality==='low'||motion.matches?30:60)))) return;
      controls.update();
      const { room, playerId, presentationTime, clockOffset } = latest.current;
      const crewColor = teamCrewColor(room);
      if (crewColor !== appliedCrewColor) {
        actors.forEach((actor, index) => actor.suit.color.set(actor.spec.role ? crewColor ?? '#ef3039' : index % 2 ? '#577380' : '#2e4659'));
        appliedCrewColor = crewColor;
      }
      // A new pit stop must restore the automatic approach camera. Manual
      // drag/zoom can still take over for the remainder of this round.
      const newRoundId=room?.round?.id??null;
      if (newRoundId!==cameraRoundId) {
        cameraRoundId=newRoundId;
        userCamera=false;arrivalCameraActive=false;
        arrivalUserOrbit=false;landingCameraStartedAt=null;
        if (!manual&&cameraMode==='overview') resetCamera();
      }
      if(presentationTime!==undefined && presentationTime===lastPresentationTime && !renderInvalidated)return;
      lastPresentationTime=presentationTime; renderInvalidated=false;
      const now = presentationTime ?? sceneClock.read(frameNow, Date.now() + clockOffset);
      const workNow=presentationTime??Date.now()+clockOffset;
      const workTasks=new Map((room?.round?.tasks??[]).map(task=>[task.id,task]));
      const workComplete=(id:string)=>workDone(workTasks.get(id),workNow);
      const workProgress=(id:string)=>workPhase(workTasks.get(id),workNow);
      const arrival = arrivalPose(room?.round?.goAt, now);
      // The car stays the OrbitControls tracking anchor throughout 3-2-1.
      // Dragging/orbiting changes only the angle: it must not freeze the target
      // at the approach road while the car continues into the pit box.
      const approaching=!manual&&cameraMode==='overview'&&!userCamera&&room?.round&&now>=room.round.goAt-3000&&now<room.round.goAt;
      if(approaching){
        const mobile=element.clientWidth/element.clientHeight<.95;
        const target=new THREE.Vector3(mobile?0:.6,.38,mobile?-1.8:.4)
          .add(new THREE.Vector3(arrival.carX*.9,0,arrival.carZ*.9));
        controls.maxDistance=60;
        if(arrivalUserOrbit){
          // OrbitControls has already applied user drag/zoom in draw().
          // Translate that user-defined camera pose along the car's route.
          shiftCameraTarget(target);
        }else{
          const base=new THREE.Vector3(mobile?0:.6,.38,mobile?-1.8:.4);
          const defaultPosition=new THREE.Vector3(mobile?11.2:8.6,mobile?12:8.3,mobile?-14:-11.6);
          const offset=defaultPosition.sub(base).multiplyScalar(1+.8*(1-arrival.progress));
          controls.target.copy(target);
          camera.position.copy(target).add(offset);
          controls.update();
        }
        arrivalCameraActive=true;
        landingCameraStartedAt=null;
      }else if(!manual&&arrivalCameraActive&&!userCamera){
        // Settle on the work bay after GO while retaining the angle the user
        // selected during approach, with no instant jump or stranded camera.
        const mobile=element.clientWidth/element.clientHeight<.95;
        const home=new THREE.Vector3(mobile?0:.6,.38,mobile?-1.8:.4);
        if(landingCameraStartedAt===null){
          landingCameraStartedAt=now;
          landingCameraStart.copy(controls.target);
        }
        const fraction=THREE.MathUtils.clamp((now-landingCameraStartedAt)/600,0,1);
        const eased=fraction*fraction*(3-2*fraction);
        const target=landingCameraStart.clone().lerp(home,eased);
        shiftCameraTarget(target);
        if(fraction>=1){
          const offset=camera.position.clone().sub(controls.target);
          offset.clampLength(10,24);
          camera.position.copy(controls.target).add(offset);
          controls.maxDistance=24;
          controls.update();
          arrivalCameraActive=false;
          arrivalUserOrbit=false;
          landingCameraStartedAt=null;
        }
      }
      if (room !== previousRoom) { previousRoom = room; taskMap = new Map((room?.round?.tasks ?? []).map(task => [task.id, task]));roleTasks.clear();for(const task of taskMap.values()){const list=roleTasks.get(task.role)??[];list.push(task);roleTasks.set(task.role,list);} }
      const animation = timeline.current;
      const done = (id: string) => animation.isDone(id, now);
      const progress = (id: string) => animation.posePhase(id, now);
      const active = (id: string) => { const receipt = animation.receipt(id); return !!receipt && now >= receipt.startsAt && now < receipt.endsAt; };
      const localPhase = (id: string) => progress(id);
      const axleHeight = (prefix: string) => {
        const lift = workProgress(`${prefix}_LIFT`); const lower = workProgress(`${prefix}_LOWER`);
        if (workComplete(`${prefix}_LOWER`)) return 0;
        if (lower !== null) return .27 * (1 - smooth(lower));
        if (workComplete(`${prefix}_LIFT`)) return .27;
        return lift === null ? 0 : .27 * smooth(lift);
      };
      const frontHeight = axleHeight('FRONT'); const rearHeight = axleHeight('REAR');
      chassis.position.y = (frontHeight + rearHeight) / 2; chassis.rotation.x = (frontHeight - rearHeight) / 4.2;
      const localActive = animation.activeTaskIds(now);
      // Diagnostic task lists must not be JSON-serialized into DOM every rendered frame.
      element.dataset.frontLift = frontHeight.toFixed(3); element.dataset.rearLift = rearHeight.toFixed(3); element.dataset.animationTasks = motion.matches ? '' : [...new Set([...animation.activeTaskIds(now), ...localActive])].join(',');
      const released = workComplete('GREEN_RELEASE');
      // Retreat starts only after both visual lower operations. Late snapshots settle immediately.
      const lowerEnds = ['FRONT_LOWER', 'REAR_LOWER'].map(id => animation.receipt(id));
      const releaseReceipt=animation.receipt('GREEN_RELEASE');
      const releaseTask=workTasks.get('GREEN_RELEASE');
      const departReceipt=releaseReceipt?{...releaseReceipt,startsAt:Math.max(releaseReceipt.startsAt,releaseTask?.completedAt??releaseTask?.dueAt??Infinity)}:undefined;
      const departure=departurePose(lowerEnds,departReceipt,now,false);
      const retreat=departure.retreat;let drive=0;
      car.position.z = arrival.carZ + drive * PIT_LANE_LAYOUT.exitZ; car.position.x = arrival.carX;car.rotation.y=arrival.yaw;
      const clearBeforeArrival = 1 - arrival.entry;
      element.dataset.carArrival = arrival.progress.toFixed(3); element.dataset.sceneClock = String(now); element.dataset.carZ = car.position.z.toFixed(3);element.dataset.carX=car.position.x.toFixed(3);element.dataset.carYaw=arrival.yaw.toFixed(3);element.dataset.wheelRoll=arrival.wheelRoll.toFixed(3);element.dataset.workPhase = String(arrival.arrived);
      element.dataset.carDeparture = drive.toFixed(3); element.dataset.laneClear = String(retreat >= .999);
      for (const jack of jacks) {
        // Front operator and trolley share the centreline before arrival.
        // Rear operator and trolley approach together. After lowering, pull
        // away from the axle before clearing sideways, outside carrier routes.
        jack.group.position.x = jack.front ? 3.5 * retreat : -Math.max(3.5 * retreat,2.2 * clearBeforeArrival);
        jack.group.position.z=(jack.front?-3.12:2.35)+(jack.front?-3:3)*retreat+(jack.front?0:rearJackApproach(clearBeforeArrival).z);
        const height = jack.front ? frontHeight : rearHeight; const prefix = jack.front ? 'FRONT' : 'REAR'; const taskId = localActive.includes(`${prefix}_LOWER`) || active(`${prefix}_LOWER`) ? `${prefix}_LOWER` : `${prefix}_LIFT`;
        const pumping = localActive.includes(taskId) || active(taskId); const p = localActive.includes(taskId) ? localPhase(taskId) ?? 0 : progress(taskId) ?? 0;
        jack.plate.position.y = .23 + height; jack.piston.scale.y = .2 + height; jack.handle.rotation.x = pumping ? Math.sin(p * Math.PI * 3) * .23 - .12 : -height * .7;
      }
      const green = released;
      redLampMat.color.set(green ? '#301919' : '#ff392c');
      greenLampMat.color.set(green ? '#18db67' : '#172b22');
      if(attachmentRound!==(room?.round?.id??null)){attachmentRound=room?.round?.id??null;fittedGrips.clear();gunNutAnchors.clear();}
      if(gunCueRound!==(room?.round?.id??null)){gunCueRound=room?.round?.id??null;gunCueTimes.clear();}
      const gunFrames=new Map(corners.map(corner=>[corner.key,gunnerMotion.sample(room?.round?.id??null,corner.key,workNow,workTasks.get(corner.key.startsWith('F')?'FRONT_LIFT':'REAR_LIFT'),workTasks.get(`${corner.key}_GUN_LOOSEN`),workTasks.get(`${corner.key}_WHEEL_ON`),workTasks.get(`${corner.key}_GUN_TIGHTEN`),arrival.entry>=.999,wheelHandling.fitted(corner.key),wheelHandling.extracted(corner.key),wheelHandling.clearForGunner(corner.key,workNow))]));
      const wheelFrames=new Map(corners.map(corner=>[corner.key,wheelHandling.sample(room?.round?.id??null,corner.key,workNow,workTasks.get(`${corner.key}_GUN_LOOSEN`),workTasks.get(`${corner.key}_WHEEL_OFF`),workTasks.get(`${corner.key}_WHEEL_ON`),gunFrames.get(corner.key)!.loosenClear)]));
      const supportExit=stabilizerExitPhase(room?.round?.tasks??[],workNow);
      const rearApproach=rearJackApproach(clearBeforeArrival);
      const mine = room?.players.find(player => player.id === playerId);
      if (marker.current) marker.current.style.display = mine ? 'block' : 'none';
      for (let index = 0; index < actors.length; index++) {
        const actor = actors[index]; const { spec, group, body, arms, legs } = actor;
        const actorRetreat=spec.kind==='gun'?retreat*gunFrames.get(spec.role!.slice(0,2))!.retreatGuard:retreat;
        const ownTasks = roleTasks.get(spec.role??'')??noTasks;
        const immediate = ownTasks.find(task => localActive.includes(task.id));
        let task=immediate; if(!task)for(const candidate of ownTasks)if(animation.posePhase(candidate.id,now)!==null)task=candidate; if(!task&&spec.kind==='on')task=ownTasks.find(t=>t.enabledAt!==null&&t.enabledAt<=workNow); const available = arrival.arrived && ownTasks.some(task => task.enabledAt !== null && workNow >= task.enabledAt && (task.completedAt === null || workNow < task.completedAt)); const complete = ownTasks.length > 0 && ownTasks.every(task => workComplete(task.id));
        const p = task ? immediate ? localPhase(task.id) ?? 0 : progress(task.id) ?? 0 : 0; const work = task ? Math.sin(p * Math.PI) : 0; const t = now * .001 + index * .83; const isYou = !!spec.role && mine?.role === spec.role;
        const isSelected = selectedActor.current === index && !isYou; actor.selectionRing.visible = isSelected; actor.selectionGlow.visible = isSelected;
        actor.ring.visible = isYou; actor.glow.visible = isYou; actor.ring.scale.setScalar(.48 + (available && !motion.matches ? Math.sin(now * .005) * .025 : 0));
        (actor.glow.material as THREE.MeshBasicMaterial).opacity = available ? .24 : complete ? .08 : .13;
        actor.suit.emissive.set(isYou ? '#a76a03' : isSelected ? '#12655f' : '#000000'); actor.suit.emissiveIntensity = isYou && available ? .24 : isYou ? .1 : isSelected ? .32 : 0;
        group.position.set(spec.x, 0, spec.z); group.rotation.y = spec.angle ?? 0; body.position.y = motion.matches ? 0 : Math.sin(t * 1.4) * .012; body.rotation.set(0, 0, 0); legs.forEach(leg => { leg.rotation.set(0, 0, 0); });
        actor.forearms.forEach(fore => fore.rotation.set(0, 0, 0));
        arms.forEach((arm, side) => { arm.rotation.set(.15+(motion.matches?0:Math.sin(t*1.6+side)*.025),0,side===0?-.09:.09); });
        if (spec.kind === 'gun') {
          const corner=spec.role!.slice(0,2);
          const handoff=gunFrames.get(corner)!.stance;
          const pose=gunnerKneelingPose(0);const standing=Math.max(actorRetreat,clearBeforeArrival,handoff);
          // 1.25m also clears the OFF carrier's outward-leaning helmet. The
          // shorter .85m proposal cleared hips but intersected that head sweep.
          group.position.x+=Math.sign(spec.x)*1.25*handoff;group.position.z+=.20+.35*Math.sin(Math.PI*handoff);
          body.position.set(0,mix(-.12,0,standing),mix(.04,0,standing));body.rotation.x=mix(.08,0,standing);
          actor.kneelingLegs?.forEach((leg,i)=>{
            const anchor=pose.legs[i],side=i===0?-1:1;
            const hip=new THREE.Vector3(...anchor.hip).lerp(new THREE.Vector3(side*.115,.56,0),standing);
            const knee=new THREE.Vector3(...anchor.knee).lerp(new THREE.Vector3(side*.115,.31,-.025),standing);
            const ankle=new THREE.Vector3(...anchor.ankle).lerp(new THREE.Vector3(side*.115,.10,0),standing);
            for(const [part,a,b]of [[leg.thigh,hip,knee],[leg.shin,knee,ankle]]as const){part.position.copy(a).add(b).multiplyScalar(.5);part.scale.y=a.distanceTo(b);part.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),b.clone().sub(a).normalize());}
            leg.knee.position.copy(knee);leg.foot.position.set(...anchor.foot).lerp(new THREE.Vector3(side*.115,.075,-.065),standing);
          });
          arms.forEach(arm=>{arm.rotation.x=.85;});
        } else if (spec.kind === 'off' || spec.kind === 'on') {
          const corner=corners.find(c=>spec.role?.startsWith(c.key))!,frame=wheelFrames.get(corner.key)!;
          const height=corner.key.startsWith('F')?frontHeight:rearHeight;
          const station=spec.kind==='off'?offWheelStation(corner,frame,height):onWheelStation(corner,frame,height);
          group.position.x=station.x;group.position.z=station.z;
          const crouch=station.crouch,standing=1-crouch,pose=gunnerKneelingPose(0);
          body.position.set(0,-.10*crouch,.04*crouch);body.rotation.x=-.04*crouch;
          actor.kneelingLegs?.forEach((leg,i)=>{
            const anchor=pose.legs[i],side=i===0?-1:1;
            const hip=new THREE.Vector3(...anchor.hip).lerp(new THREE.Vector3(side*.115,.56,0),standing);
            const knee=(i===0?new THREE.Vector3(-.19,.30,-.18):new THREE.Vector3(.24,.095,.10)).lerp(new THREE.Vector3(side*.115,.31,-.025),standing);
            const ankle=(i===0?new THREE.Vector3(-.19,.10,-.18):new THREE.Vector3(.39,.10,.23)).lerp(new THREE.Vector3(side*.115,.10,0),standing);
            for(const [part,a,b]of [[leg.thigh,hip,knee],[leg.shin,knee,ankle]]as const){part.position.copy(a).add(b).multiplyScalar(.5);part.scale.y=a.distanceTo(b);part.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),b.clone().sub(a).normalize());}
            leg.knee.position.copy(knee);leg.foot.position.copy(i===0?new THREE.Vector3(-.19,.075,-.22):new THREE.Vector3(.40,.075,.27)).lerp(new THREE.Vector3(side*.115,.075,-.065),standing);
          });
          arms.forEach(arm=>{arm.rotation.x=.3;});
        } else if (spec.kind === 'jack') {
          body.rotation.x = -.16 - work * .23; body.position.y -= work * .1; arms.forEach(arm => { arm.rotation.x = .9 + (task ? Math.sin(p * Math.PI * 3) * .28 : 0); });
          // Front jack stands planted ahead of the car's nose before arrival.
          // The rear jack still advances into position as the car stops.
          group.position.x = spec.role === 'FRONT_JACK' ? 3.5 * retreat : -Math.max(3.5 * retreat,-rearApproach.x);
          group.position.z=spec.z+(spec.role==='FRONT_JACK'?-3:3)*retreat+(spec.role==='REAR_JACK'?rearApproach.z:0);
        } else if (spec.kind === 'release') {
          const signal=releaseGesture(releaseTask?.completedAt,workNow);
          arms[1].rotation.x=.6+signal*2.15;arms[1].rotation.z=.15-signal*.65;group.rotation.y+=(signal*.3);
        } else { body.rotation.x = spec.support === 'sidepod' ? -.11 : spec.support==='nose'?-.055:index < 19 ? -.18 : -.025;
          if(spec.support==='nose'){body.position.z=.13;legs.forEach(leg=>{leg.position.z=.07;});}
          if (index < 19) arms.forEach(arm => { arm.rotation.x = .75; }); if (released&&!spec.support) { arms[0].rotation.x = 1.8; group.position.x += Math.sign(spec.x) * .3; } }
        if(spec.support==='sidepod'){const station=stabilizerStation(Math.sign(spec.x),spec.z,clearBeforeArrival,supportExit);group.position.x=station.x;group.position.z=station.z;}
        if (spec.kind !== 'jack' && spec.kind !== 'off' && spec.kind !== 'on' && spec.kind !== 'release' && spec.support!=='sidepod') group.position.x = mix(group.position.x, Math.sign(spec.x || 1) * Math.max(Math.abs(group.position.x),2.7), Math.max(actorRetreat, clearBeforeArrival));

      }
      // Contact stations and reserved corridors are kinematic. A generic
      // avoidance solver must not push a gunner away from the nut every frame.
      const motionTargets=actors.map(actor=>({x:actor.group.position.x,z:actor.group.position.z,fixed:true,exact:['gun','off','on','release'].includes(actor.spec.kind)}));
      const positions=crewMotion.sample(room?.round?.id??null,now,motionTargets);
      if(sceneDebug)element.dataset.motionLag=String(Math.max(...positions.map((p,i)=>Math.hypot(p.x-motionTargets[i].x,p.z-motionTargets[i].z))));
      actors.forEach((actor,i)=>{actor.group.position.x=positions[i].x;actor.group.position.z=positions[i].z;});
      for(const jack of jacks){
        const operator=actors.find(a=>a.spec.role===(jack.front?'FRONT_JACK':'REAR_JACK'))!;
        jack.group.position.x=operator.group.position.x;
        jack.group.position.z=operator.group.position.z+(jack.front?1.66:-1.68);
      }
      const laneClear=actors.every(actor=>Math.abs(actor.group.position.x)>=2.2)&&jacks.every(jack=>Math.abs(jack.group.position.x)>=2.1);
      drive=departureMotion.sample(room?.round?.id??null,now,released?departure.drive:0,laneClear);
      car.position.z=arrival.carZ+drive*PIT_LANE_LAYOUT.exitZ;
      scene.updateMatrixWorld(true);
      const world = (object: THREE.Object3D, offset = new THREE.Vector3()) => object.localToWorld(offset.clone());
      const followed=mine?actors.find(a=>a.spec.role===mine.role):undefined;
      for(const actor of actors)actor.head.visible=!(cameraMode==='first-person'&&actor===followed);
      if(cameraMode!=='overview'&&followed){
        const root=followed.group.position,head=world(followed.body,new THREE.Vector3(0,1.29,-.008));
        const forward=new THREE.Vector3(0,0,-1).applyQuaternion(followed.group.quaternion);
        const pose=playerCameraPose(cameraMode,root,head,forward);
        camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);
        camera.fov=pose.fov;camera.near=pose.near;camera.updateProjectionMatrix();camera.updateMatrixWorld();
        if(marker.current&&cameraMode==='first-person')marker.current.style.visibility='hidden';
      }
      if(sceneDebug)element.dataset.playerCamera=JSON.stringify({mode:cameraMode,role:followed?.spec.role,position:camera.position.toArray(),fov:camera.fov});
        if (marker.current && mine) {
          const actor=actors.find(a=>a.spec.role===mine.role)!;const group=actor.group;
          const ownTasks=roleTasks.get(mine.role)??noTasks;
          const available=ownTasks.some(t=>t.enabledAt!==null&&workNow>=t.enabledAt&&(t.completedAt===null||workNow<t.completedAt));
          const complete=ownTasks.length>0&&ownTasks.every(t=>workComplete(t.id));const immediate=ownTasks.some(t=>localActive.includes(t.id));
          markerPosition.set(group.position.x, 1.77 + (available && !motion.matches ? Math.sin(now * .004) * .035 : 0), group.position.z).project(camera);
          const x = (markerPosition.x * .5 + .5) * element.clientWidth; const y = (-markerPosition.y * .5 + .5) * element.clientHeight;
          const labelX = THREE.MathUtils.clamp(x, marker.current.offsetWidth / 2 + 8, element.clientWidth - marker.current.offsetWidth / 2 - 8); marker.current.style.setProperty('--you-pointer-offset', `${x-labelX}px`);
          marker.current.style.transform = `translate(${labelX}px, ${y}px) translate(-50%, -100%)`; marker.current.style.visibility = cameraMode==='first-person'||markerPosition.z > 1 || markerPosition.z < -1 ? 'hidden' : 'visible';
          marker.current.dataset.state = immediate ? 'accepted' : available ? 'ready' : complete ? 'done' : 'waiting';
          marker.current.style.boxShadow = immediate ? '0 0 0 5px #ffd45733, 0 0 28px #ffd457aa' : available ? '0 0 20px #ffd45777' : '0 3px 15px #0008, 0 0 16px #ffd45745';
        }
      let maxGripError = 0;
      const poseHands = (actor: Actor, targets: THREE.Vector3[]) => {
        targets.forEach((target, i) => {
          const arm = actor.arms[i]; const fore = actor.forearms[i];
          arm.rotation.set(0, 0, 0); arm.updateWorldMatrix(true, true);
          const shoulder = world(arm); const delta = target.clone().sub(shoulder); const distance = delta.length();
          const d = Math.min(.778, Math.max(.02, distance)); const direction = delta.normalize();
          // Equal-length two-bone IK, elbow bends away from the torso.
          const pole=new THREE.Vector3(i===0?-.7:.7,-.15,-.4).applyQuaternion(actor.body.getWorldQuaternion(new THREE.Quaternion()));
          const bend=pole.addScaledVector(direction,-pole.dot(direction));
          if(bend.lengthSq()<1e-8){bend.set(0,0,1).applyQuaternion(actor.body.getWorldQuaternion(new THREE.Quaternion()));bend.addScaledVector(direction,-bend.dot(direction));}
          bend.normalize();
          const elbow = shoulder.clone().addScaledVector(direction, d / 2).addScaledVector(bend, Math.sqrt(.39 ** 2 - (d / 2) ** 2));
          const localElbow = actor.body.worldToLocal(elbow.clone()).sub(arm.position);
          arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), localElbow.normalize()); arm.updateWorldMatrix(true, true);
          const localTarget = arm.worldToLocal(target.clone()).sub(fore.position);
          fore.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), localTarget.normalize()); fore.updateWorldMatrix(true, true);
          maxGripError = Math.max(maxGripError, world(actor.hands[i]).distanceTo(target));
        });
      };
      const heldToolErrors: Record<string,number> | null = sceneDebug ? {} : null;
      for (const corner of corners) {
        const side = Math.sign(corner.x); const height = corner.key.startsWith('F') ? frontHeight : rearHeight;
        const hub = world(car, new THREE.Vector3(corner.x, .44 + height, corner.z));
        const offId = `${corner.key}_WHEEL_OFF`, onId = `${corner.key}_WHEEL_ON`;
        const frame=wheelFrames.get(corner.key)!;
        const offActor=actors.find(a=>a.spec.role===offId)!,onActor=actors.find(a=>a.spec.role===onId)!;
        const offCarry=world(offActor.group,new THREE.Vector3(0,.74,-.64));
        const onCarry=world(onActor.group,new THREE.Vector3(0,.74,-.54));
        corner.wheel.position.set(corner.x,.44+height,corner.z);corner.wheel.rotation.x=arrival.wheelRoll-drive*62;corner.wheel.rotation.y=corner.key.startsWith('F')?arrival.steering:0;
        corner.wheel.visible=frame.extract<=0||frame.fit>=1;
        corner.old.visible=frame.extract>0;
        const discard=new THREE.Vector3(corner.x+side*4.4,.44,corner.z+1.1);
        corner.old.position.copy(hub).lerp(offCarry,frame.extract).lerp(discard,frame.lower);
        corner.old.quaternion.identity();
        corner.fresh.visible=frame.fit<1;
        corner.fresh.position.copy(onCarry).lerp(hub,frame.fit);corner.fresh.quaternion.identity();
        const grips=wheelGripAnchors(side);
        if(frame.offPrep>.82&&frame.release<1){
          const grab=smooth((frame.offPrep-.82)/.18)*(1-frame.release);
          const targets=grips.map((p,i)=>world(corner.old,new THREE.Vector3(...p)).lerp(world(offActor.hands[i]),1-grab));
          poseHands(offActor,targets);
        }
        if(frame.fit>=1&&!fittedGrips.has(corner.key))fittedGrips.set(corner.key,grips.map(p=>world(corner.fresh,new THREE.Vector3(...p))));
        if(frame.onRelease<1){
          const frozen=frame.fit>=1?fittedGrips.get(corner.key):undefined;
          const targets=grips.map((p,i)=>(frozen?.[i].clone()??world(corner.fresh,new THREE.Vector3(...p))).lerp(world(onActor.hands[i]),frame.onRelease));
          poseHands(onActor,targets);
        }
        const gunner = actors.find(a => a.spec.role === `${corner.key}_GUNNER`)!;
        if (gunner.tool) {
          const shot=gunFrames.get(corner.key)!;
          const stow=Math.max(shot.stow,clearBeforeArrival,retreat*shot.retreatGuard);
          const liveNut=hub.clone().add(new THREE.Vector3(side*.22,0,0));
          const working=shot.firing||shot.pending||!workComplete(`${corner.key}_GUN_${shot.operation==='tighten'?'TIGHTEN':'LOOSEN'}`);
          if(working||!gunNutAnchors.has(corner.key))gunNutAnchors.set(corner.key,liveNut);
          const nut=(working?liveNut:gunNutAnchors.get(corner.key)!).clone();
          const engaged=new THREE.Vector3(side*Math.sqrt(.41**2-.15**2),.15,0);
          const retracted=new THREE.Vector3(side*.58,.22,0);
          const muzzleBase=nut.clone().add(retracted.lerp(engaged,shot.approach));
          const held=world(gunner.body,new THREE.Vector3(0,.69,-.42));
          muzzleBase.lerp(held,stow);
          const workDirection=nut.clone().sub(muzzleBase).normalize();
          const heldDirection=world(gunner.body,new THREE.Vector3(0,1.09,-.52)).sub(held).normalize();
          const direction=workDirection.lerp(heldDirection,stow).normalize();
          gunner.tool.position.copy(gunner.body.worldToLocal(muzzleBase.clone()));
          const aim=gunner.body.worldToLocal(muzzleBase.clone().add(direction)).sub(gunner.tool.position).normalize();
          gunner.tool.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),aim);
          gunner.tool.updateWorldMatrix(true,true);
          const gunGrips=side<0?[gunGripAnchors[1],gunGripAnchors[0]]:gunGripAnchors;
          // Project the rigid tool into the intersection of BOTH arm reach spheres.
          // Translating the whole gun preserves the two handles; no floating gloves.
          for(let pass=0;pass<12;pass++){let adjusted=false;for(let i=0;i<2;i++){
            const grip=world(gunner.tool,gunGrips[i]),shoulder=world(gunner.arms[i]);
            const offset=grip.sub(shoulder),distance=offset.length();
            if(distance>.750001){adjusted=true;
              const centre=world(gunner.tool).addScaledVector(offset,-(distance-.75)/distance);
              gunner.tool.position.copy(gunner.body.worldToLocal(centre));gunner.tool.updateWorldMatrix(true,true);
            }
          }
          if(!adjusted)break; }
          const muzzle=world(gunner.tool,new THREE.Vector3(0,0,-.41));
          const spinning=shot.firing&&muzzle.distanceTo(nut)<.025&&stow<.05;
          const cueId=`${corner.key}_GUN_${shot.operation==='tighten'?'TIGHTEN':'LOOSEN'}`,cueReceipt=animation.receipt(cueId);
          if(spinning&&cueReceipt&&(cueReceipt.endsAt>now||shot.pending)&&!gunCueTimes.has(cueId))gunCueTimes.set(cueId,now);
          if(gunner.socket&&spinning)gunner.socket.rotation.z=shot.rotation;
          gunner.tool.userData.contact=muzzle.distanceTo(nut);gunner.tool.userData.spinning=spinning;gunner.tool.userData.operation=shot.operation;
          poseHands(gunner,gunGrips.map(anchor=>world(gunner.tool!,anchor)));
          if (heldToolErrors) heldToolErrors[gunner.spec.role!] = Math.max(...gunGrips.map((anchor,i)=>world(gunner.hands[i]).distanceTo(world(gunner.tool!,anchor))));
          // Never leave the gun across the departure corridor.
          gunner.tool.visible = true;
        }
      }
      let supportContactError = 0;
      for (const actor of actors) {
        if (!actor.spec.support || arrival.entry < .999 || (actor.spec.support==='sidepod'?supportExit>=.18:retreat>.001)) continue;
        const axleLift = actor.spec.support === 'nose' ? frontHeight : (frontHeight + rearHeight) / 2;
        const anchors = supportHandAnchors(actor.spec, axleLift).map(([x,y,z])=>new THREE.Vector3(x,y,z));
        const release=actor.spec.support==='sidepod'?smooth(supportExit/.18):0;
        poseHands(actor,anchors.map((a,i)=>a.lerp(world(actor.hands[i]),release)));
        supportContactError = Math.max(supportContactError, ...anchors.map((anchor,index)=>world(actor.hands[index]).distanceTo(anchor)));
      }
      for (const jack of jacks) {
        // Both jack grips are solved in world space in every scene state.
        // Both operators hold their trolley continuously, including countdown.
        const operator = actors.find(a => a.spec.role === (jack.front ? 'FRONT_JACK' : 'REAR_JACK'))!;
        const grips=[-1,1].map(side=>world(jack.grip,new THREE.Vector3(side*.18,0,0)));
        poseHands(operator,grips);
        if (heldToolErrors) heldToolErrors[operator.spec.role!]=Math.max(...grips.map((grip,i)=>world(operator.hands[i]).distanceTo(grip)));
      }
      element.dataset.sceneModel = 'full-pit-lane-v11'; element.dataset.crewCount = String(actors.length); element.dataset.supportClear = String(supportCrewClear(car.position.z, Math.max(retreat, clearBeforeArrival))); element.dataset.selectedRole = selectedActor.current === null ? '' : actors[selectedActor.current].spec.role ?? 'SUPPORT'; element.dataset.selectedColor = selectedActor.current === null ? '' : '#6ce8d9';
      element.dataset.laneClear = String(laneClear); element.dataset.carDeparture = drive.toFixed(3); element.dataset.maxGripError = maxGripError.toFixed(3); element.dataset.supportContactError = supportContactError.toFixed(3); element.dataset.supportBodyClear = element.dataset.supportClear; element.dataset.carZ = car.position.z.toFixed(3);
      // V10.3: the nameplate is owned by React, not a detached body element.
      if (tooltip.current && selectedActor.current !== null) {
        const actor=actors[selectedActor.current];
        const point=actor.group.localToWorld(new THREE.Vector3(0,1.65,0)).project(camera);
        const w=element.clientWidth,h=element.clientHeight;
        if (w>0 && h>0) {
          tooltip.current.style.left=`${THREE.MathUtils.clamp((point.x*.5+.5)*w, Math.min(85,w/2), Math.max(w-85,w/2))}px`;
          tooltip.current.style.top=`${THREE.MathUtils.clamp((-point.y*.5+.5)*h, Math.min(85,h/2), Math.max(h-85,h/2))}px`;
        }
      }
      if (sceneDebug) {
      const probeCache=new Map(actors.map(actor=>{
        const points=[.61,.84,1.03,1.29].map((y,i)=>({point:world(actor.body,new THREE.Vector3(0,y,0)),radius:i===3?.235:.21}));
        if(actor.kneelingLegs)for(const leg of actor.kneelingLegs)points.push({point:world(leg.foot),radius:.14},{point:world(leg.knee),radius:.095});
        else for(const x of [-.115,.115])points.push({point:world(actor.group,new THREE.Vector3(x,.075,-.065)),radius:.14});
        return [actor,points] as const;
      }));
      const bodyPair=(a:Actor,b:Actor)=>{
        let result={clearance:Infinity,a:[] as number[],b:[] as number[],radii:[] as number[]};
        for(const p of probeCache.get(a)!)for(const q of probeCache.get(b)!){const clearance=p.point.distanceTo(q.point)-p.radius-q.radius;if(clearance<result.clearance)result={clearance,a:p.point.toArray(),b:q.point.toArray(),radii:[p.radius,q.radius]};}
        return result;
      };
      const bodyClearance=(a:Actor,b:Actor)=>bodyPair(a,b).clearance;
      element.dataset.crewSafety=JSON.stringify({
        gunPairs:actors.filter(a=>a.spec.kind==='gun').flatMap(a=>actors.filter(b=>b!==a&&(b.spec.role?.slice(0,2)===a.spec.role?.slice(0,2)||b.spec.support==='sidepod'&&Math.sign(b.spec.x)===Math.sign(a.spec.x))).map(b=>({pair:`${a.spec.role}/${b.spec.role??'Stabilizer'}`,...bodyPair(a,b),aRoot:a.group.position.toArray(),bRoot:b.group.position.toArray(),stance:gunFrames.get(a.spec.role!.slice(0,2))!.stance}))),
        gunners:actors.filter(a=>a.spec.kind==='gun').map(a=>({role:a.spec.role,position:a.group.position.toArray(),hands:a.hands.map(h=>world(h).toArray()),head:world(a.body,new THREE.Vector3(0,1.29,-.008)).toArray(),shoulders:a.arms.map(x=>world(x).toArray()),elbows:a.forearms.map(x=>world(x).toArray()),contact:a.tool?.userData.contact,spinning:a.tool?.userData.spinning,operation:a.tool?.userData.operation,rotor:a.socket?.rotation.z})),
        handlerSupport:actors.filter(a=>a.spec.kind==='on').flatMap(a=>actors.filter(b=>b.spec.support==='sidepod').map(b=>({pair:`${a.spec.role}/${Math.sign(b.spec.x)}`,clearance:bodyClearance(a,b)}))),
        rearJackRL:Math.min(...actors.filter(a=>a.spec.role==='RL_WHEEL_OFF').flatMap(a=>[...a.kneelingLegs!.flatMap(l=>[world(l.foot),world(l.knee)]),...[.61,.84,1.03,1.29].map(y=>world(a.body,new THREE.Vector3(0,y,0)))].map(point=>new THREE.Box3().setFromObject(jacks.find(j=>!j.front)!.group).distanceToPoint(point))))
      });
      element.dataset.releaseGreen=String(green);
      element.dataset.wheelRig=JSON.stringify(corners.map(corner=>{
        const frame=wheelFrames.get(corner.key)!;
        return {corner:corner.key,frame,hub:{position:world(corner.wheel).toArray(),visible:corner.wheel.visible},old:{position:corner.old.position.toArray(),visible:corner.old.visible},fresh:{position:corner.fresh.position.toArray(),visible:corner.fresh.visible},owners:['off','on'].map(kind=>{
          const actor=actors.find(a=>a.spec.role===`${corner.key}_WHEEL_${kind==='off'?'OFF':'ON'}`)!;
          const wheel=kind==='off'?corner.old:corner.fresh;
          const targets=wheelGripAnchors(Math.sign(corner.x)).map(p=>world(wheel,new THREE.Vector3(...p)));
          const clearance=actors.map(other=>{
            const points=[.61,.84,1.03,1.29].map((y,i)=>({point:world(other.body,new THREE.Vector3(0,y,0)),radius:i===3?.235:.21}));
            if(other.kneelingLegs)for(const leg of other.kneelingLegs){points.push({point:world(leg.foot),radius:.14},{point:world(leg.knee),radius:.095});}
            else for(const x of [-.115,.115])points.push({point:world(other.group,new THREE.Vector3(x,.075,-.065)),radius:.14});
            return {role:other.spec.role??other.spec.support??'ambient',value:Math.min(...points.map(({point,radius})=>{
              const local=wheel.worldToLocal(point),axial=Math.abs(local.x)-.225,radial=Math.hypot(local.y,local.z)-.43;
              return Math.hypot(Math.max(axial,0),Math.max(radial,0))+Math.min(Math.max(axial,radial),0)-radius;
            }))};
          });
          return {kind,position:actor.group.position.toArray(),yaw:actor.group.rotation.y,hands:actor.hands.map(h=>world(h).toArray()),gripError:Math.max(...actor.hands.map((h,i)=>world(h).distanceTo(targets[i]))),clearance};
        })};
      }));
      const signalActor=actors.find(a=>a.spec.kind==='release')!;
      element.dataset.releasePose=JSON.stringify({position:signalActor.group.position.toArray(),yaw:signalActor.group.rotation.y,arm:signalActor.arms[1].rotation.toArray()});
      element.dataset.wheelWork=JSON.stringify(corners.map(c=>({corner:c.key,hubVisible:c.wheel.visible,newWheelVisible:c.fresh.visible})));
      element.dataset.workState=JSON.stringify([...workTasks.values()].map(task=>({id:task.id,phase:workPhase(task,workNow),done:workDone(task,workNow),enabledAt:task.enabledAt,completedAt:task.completedAt})));
      element.dataset.heldToolErrors=JSON.stringify(heldToolErrors);
      element.dataset.oldWheelPlacements=JSON.stringify(corners.map(corner=>{
        const actor=actors.find(a=>a.spec.role===`${corner.key}_WHEEL_OFF`)!;
        const pose=wheelFrames.get(corner.key)!;
        return {corner:corner.key,pose,target:motionTargets[actors.indexOf(actor)],position:corner.old.position.toArray(),visible:corner.old.visible,
          handError:pose&&pose.extract>0&&pose.release===0?Math.max(...wheelGripAnchors(Math.sign(corner.x)).map((p,i)=>world(actor.hands[i]).distanceTo(world(corner.old,new THREE.Vector3(...p))))):0};
      }));
      if(contactDebug){
      const hardware: {owner:Actor;box:THREE.Box3}[] = actors.filter(a=>a.tool).map(owner=>({owner,box:new THREE.Box3().setFromObject(owner.tool!)}));
      for(const jack of jacks) hardware.push({owner:actors.find(a=>a.spec.role===(jack.front?'FRONT_JACK':'REAR_JACK'))!,box:new THREE.Box3().setFromObject(jack.group)});
      for(const corner of corners) for(const [object,suffix] of [[corner.old,'WHEEL_OFF'],[corner.fresh,'WHEEL_ON']] as const) {
        if(object.visible) hardware.push({owner:actors.find(a=>a.spec.role===`${corner.key}_${suffix}`)!,box:new THREE.Box3().setFromObject(object)});
      }
      const toolContacts: string[]=[];
      for(const tool of hardware)for(const other of actors){
        if(tool.owner===other)continue;
        const centres=[.61,.84,1.03,1.29].map(y=>world(other.body,new THREE.Vector3(0,y,0)));
        centres.push(...[-.115,.115].map(x=>world(other.group,new THREE.Vector3(x,.18,0))));
        if(centres.some(c=>tool.box.distanceToPoint(c)<.21))toolContacts.push(`${tool.owner.spec.role} / ${other.spec.role??other.spec.support??'ambient'}`);
      }
      element.dataset.toolContacts=JSON.stringify(toolContacts);
      const toolPairs:string[]=[];
      for(let i=0;i<hardware.length;i++)for(let j=i+1;j<hardware.length;j++)if(hardware[i].owner!==hardware[j].owner&&hardware[i].box.intersectsBox(hardware[j].box))toolPairs.push(`${hardware[i].owner.spec.role}/${hardware[j].owner.spec.role}`);
      element.dataset.toolPairs=JSON.stringify(toolPairs);
      }
      element.dataset.crewTargets = JSON.stringify(actors.map(a => { const point = new THREE.Vector3(a.group.position.x, 1.35, a.group.position.z).project(camera); return { role: a.spec.role ?? 'SUPPORT', x: (point.x * .5 + .5) * element.clientWidth, y: (-point.y * .5 + .5) * element.clientHeight }; }));
      element.dataset.gunnerPoses=JSON.stringify(actors.filter(a=>a.spec.kind==='gun').map(a=>({role:a.spec.role,tightenPhase:progress(`${a.spec.role!.slice(0,2)}_GUN_TIGHTEN`),tightenDone:done(`${a.spec.role!.slice(0,2)}_GUN_TIGHTEN`),position:a.group.position.toArray(),hands:a.hands.map(h=>world(h).toArray()),tool:a.tool?world(a.tool).toArray():null,contact:a.tool?.userData.contact,spinning:a.tool?.userData.spinning,operation:a.tool?.userData.operation,rotor:a.socket?.rotation.z,torso:[a.body.position.y,a.body.position.z,a.body.rotation.x],head:world(a.body,new THREE.Vector3(0,1.29,-.008)).toArray(),feet:a.kneelingLegs?.map(leg=>world(leg.foot).toArray()),knees:a.kneelingLegs?.map(leg=>world(leg.knee).toArray())})));
      element.dataset.crewBodyPositions=JSON.stringify(actors.map(a=>({role:a.spec.role??a.spec.support??'SUPPORT',x:a.group.position.x,z:a.group.position.z,centres:[.61,.84,1.03,1.29].map(y=>world(a.body,new THREE.Vector3(0,y,0)).toArray())})));
      const carPoint=world(car,new THREE.Vector3(0,.5,0)).project(camera);
      element.dataset.carViewport=JSON.stringify({x:(carPoint.x*.5+.5)*element.clientWidth,y:(-carPoint.y*.5+.5)*element.clientHeight,visible:Math.abs(carPoint.x)<1&&Math.abs(carPoint.y)<1&&Math.abs(carPoint.z)<1});
      const carPoints=[-1.5,1.5].flatMap(x=>[-3.35,2.4].flatMap(z=>[.1,1.45].map(y=>world(car,new THREE.Vector3(x,y,z)).project(camera))));
      element.dataset.carBounds=JSON.stringify({left:Math.min(...carPoints.map(p=>(p.x*.5+.5)*element.clientWidth)),right:Math.max(...carPoints.map(p=>(p.x*.5+.5)*element.clientWidth)),top:Math.min(...carPoints.map(p=>(-p.y*.5+.5)*element.clientHeight)),bottom:Math.max(...carPoints.map(p=>(-p.y*.5+.5)*element.clientHeight))});
      } // sceneDebug only — no JSON/DOM allocation every live animation frame
      try { renderer.render(scene, camera); } catch { setFallback(true); disposed = true; return; }
      // Sound follows this exact rendered pose clock, never the snapshot DONE clock.
      const audibleReceipts=options.onTaskCue?Array.from(animation.allReceipts()).flatMap(receipt=>{
        if(!receipt.taskId.includes('_GUN_'))return [receipt];
        const startsAt=gunCueTimes.get(receipt.taskId);return startsAt===undefined?[]:[{...receipt,startsAt,endsAt:startsAt+140}];
      }):[];
      if(options.onTaskCue)for(const taskId of liveAudio.poll(room?.round?.id??null,now,audibleReceipts)){
        if(sceneDebug){const receipt=audibleReceipts.find(r=>r.taskId===taskId);element.dataset.lastTaskCue=JSON.stringify({taskId,now,startsAt:receipt?.startsAt,endsAt:receipt?.endsAt});}
        options.onTaskCue(taskId);
      }
    }
    onCameraChange(); if (!manual) frame = requestAnimationFrame(draw);
    const dispose = () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); window.removeEventListener('pit-camera-reset', resetCamera); window.removeEventListener('pit-camera-view', cameraViewEvent); controls.removeEventListener('change', onCameraChange); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('keydown', keyCamera); renderer.domElement.removeEventListener('webglcontextlost', lost);
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(mat => mat.dispose()); textures.forEach(texture => texture.dispose()); if (!options.renderer) { renderer.dispose(); renderer.domElement.remove(); }
    };

    return { update, render: draw, deselect, setCameraView, setCrewCloseup, setPlayerCamera, dispose };
}
