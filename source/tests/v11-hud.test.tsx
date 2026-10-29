import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdminForm } from '../src/GamePanels';
import { hudBottomReservation, visibleBottomReservation } from '../src/useHudClearance';

const viewport={width:390,height:844};
function rect(left:number,top:number,width:number,height:number){return {left,top,right:left+width,bottom:top+height,width,height};}
describe('visible hosting overlay clearance',()=>{
 it('reserves only the actual visible bottom overlay height',()=>{
  expect(visibleBottomReservation(rect(190,754,200,90),viewport)).toBe(90);
  expect(visibleBottomReservation(rect(190,810,200,34),viewport)).toBe(34);
  expect(visibleBottomReservation(rect(190,720,200,90),viewport)).toBe(124); // badge above the 34px iPhone home area
 });
 it('adds no arbitrary reservation when a badge is absent or hidden offscreen',()=>{
  expect(visibleBottomReservation(rect(0,0,0,0),viewport)).toBe(0);
  expect(visibleBottomReservation(rect(390,754,200,90),viewport)).toBe(0);
  expect(visibleBottomReservation(rect(190,844,200,90),viewport)).toBe(0);
 });
 it('ignores upper overlays and adapts to the current viewport',()=>{
  expect(visibleBottomReservation(rect(190,60,200,90),viewport)).toBe(0);
  expect(visibleBottomReservation(rect(230,842,200,90),{width:430,height:932})).toBe(90);
 });
});
describe('mobile hosting footprint and Safari visual viewport',()=>{
 it('protects an external 48px pill floating 28px above the viewport on every height',()=>{
  for(const [width,height] of [[390,844],[430,932],[390,700],[430,780],[844,390]]){
   const viewport={width,height};
   expect(hudBottomReservation({viewport,layoutBottom:height,mobile:true})).toBe(76);
  }
 });
 it('uses actual badge bounds instead of unnecessarily retaining the fallback',()=>{
  for(const height of [700,844,932])for(const badgeHeight of [38,48])for(const bottom of [16,28]){
   const viewport={width:390,height};
   const measured=visibleBottomReservation(rect(180,height-bottom-badgeHeight,200,badgeHeight),viewport);
   expect(hudBottomReservation({viewport,layoutBottom:height,measured,mobile:true})).toBe(bottom+badgeHeight);
  }
 });
 it('accounts for a safe home area and never estimates a desktop or opted-out badge',()=>{
  expect(hudBottomReservation({viewport,layoutBottom:844,mobile:true,safeArea:34})).toBe(82);
  expect(hudBottomReservation({viewport,layoutBottom:844,mobile:false})).toBe(0);
  expect(hudBottomReservation({viewport,layoutBottom:844,mobile:true,netlify:false})).toBe(0);
 });
 it('converts visible badge bounds to layout coordinates as Safari controls change',()=>{
  const viewport={width:390,height:700,top:20,left:0};
  const measured=visibleBottomReservation(rect(180,640,200,48),viewport);
  expect(measured).toBe(80);
  expect(hudBottomReservation({viewport,layoutBottom:844,measured,mobile:true})).toBe(204);
  expect(hudBottomReservation({viewport,layoutBottom:680,measured,mobile:true})).toBe(40);
 });
 it('ignores a badge outside a horizontally offset visible viewport',()=>{
  expect(visibleBottomReservation(rect(0,754,80,48),{width:280,height:844,left:100})).toBe(0);
 });
});
describe('one global administration form',()=>{
 it('gives an honest backend-needed state without exposing any mock credentials',()=>{
  const html=renderToStaticMarkup(<AdminForm busy={false} configured={false} onSubmit={()=>{}}/>);
  expect(html).toContain('Global administration requires a connection to Supabase');
  expect(html).not.toContain('type="password"');
  expect(html).not.toMatch(/admin\s*\/\s*1234|Sign in locally|Local test admin/i);
 });
 it('lets Supabase decide whether an existing password is valid',()=>{
  const html=renderToStaticMarkup(<AdminForm busy={false} configured onSubmit={()=>{}}/>);
  expect(html).toContain('type="password"');
  expect(html).not.toMatch(/minlength/i);
  expect(html).toContain('current-password');
 });
 it('requires explicit acknowledgement before leaving an online seat',()=>{
  const html=renderToStaticMarkup(<AdminForm busy={false} configured onlineSeat onSubmit={()=>{}}/>);
  expect(html).toContain('type="checkbox"');
  expect(html).toContain('Leave my online team before signing in');
  expect(html).toContain('disabled=""');
  expect(html).toContain('Leave Team &amp; sign in');
 });
});
