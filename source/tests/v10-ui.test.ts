import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import ActionControl, { pendingDependency } from '../src/ActionControl';
import RoleCard from '../src/RoleCard';
import { HowToPlay, AdminForm } from '../src/GamePanels';
import type { Room } from '../src/types';
const player={id:'you',nickname:'You',role:'FRONT_JACK' as const,ready:true,joinedAt:0};
const makeRoom=():Room=>({id:'r',teamId:'t',name:'Team',color:'#f00',code:'T',hostId:'you',status:'RUNNING',players:[player],round:createRound([player],1000,'round'),updatedAt:1000});
const action=(room:Room,now=1000)=>renderToStaticMarkup(createElement(ActionControl,{room,playerId:'you',now,busy:'',onAction:async()=>{}}));
describe('V10 action and compact role presentation',()=>{
 it('uses the same bright action style before and after unlock and disables only after all own jobs',()=>{
  const r=makeRoom();r.status='COUNTDOWN';
  const locked=action(r,500);expect(locked).toContain('action-button gold');expect(locked).toContain('Wait for GO signal');expect(locked).not.toContain('disabled=""');
  r.status='RUNNING';r.round!.tasks[0].status='AVAILABLE';
  expect(action(r)).toContain('action-button gold');
  r.round!.tasks[0].status='DONE';
  const next=action(r);expect(next).toContain('LOWER FRONT');expect(next).not.toContain('action-button secondary complete');
  r.round!.tasks.filter(t=>t.ownerId==='you').forEach(t=>t.status='DONE');
  const done=action(r);expect(done).toContain('action-button secondary complete');expect(done).toContain('disabled=""');
 });
 it('shows red nonstacking lockout time to tenths and a permanent concise reminder',()=>{
  const r=makeRoom();r.round!.penalties={you:{at:1200,until:3200}};
  expect(action(r,1200)).toContain('Too early — 2.0s lockout');
  expect(action(r,1650)).toContain('Too early — 1.6s lockout');
  expect(action(r,1650)).toContain('penalized');expect(action(r,1650)).toContain('Early press = 2s lockout.');
  expect(action(r,3200)).not.toContain('class="game-button action-button gold penalized');
 });
 it('names actual wheel/jack dependencies in plain English',()=>{
  const r=makeRoom();const get=(id:string)=>r.round!.tasks.find(t=>t.id===id)!;
  expect(pendingDependency(r,get('FL_WHEEL_ON'),false)).toBe('Wait for crew to remove the front-left wheel');
  expect(pendingDependency(r,get('RR_GUN_TIGHTEN'),false)).toBe('Wait for crew to fit the new rear-right wheel');
  expect(pendingDependency(r,get('FRONT_LOWER'),false)).toBe('Wait for both front wheels to be secured');
  expect(pendingDependency(r,get('GREEN_RELEASE'),false)).toContain('both jacks');
 });
 it('adds YOUR ROLE above a precise role name without default detailed instructions',()=>{
  const html=renderToStaticMarkup(createElement(RoleCard,{room:makeRoom(),playerId:'you',onExpand:()=>{}}));
  expect(html.indexOf('YOUR ROLE:')).toBeLessThan(html.indexOf('<h2>Front jack operator'));
  expect(html).toContain('Tap for more details');expect(html).not.toContain('role-summary');
 });
 it('keeps beginner help short and preserves only real global admin entry',()=>{
  const help=renderToStaticMarkup(createElement(HowToPlay));expect((help.match(/<li>/g)??[])).toHaveLength(7);expect(help).toContain('2s personal lockout');
  const offline=renderToStaticMarkup(createElement(AdminForm,{busy:false,configured:false,onSubmit:()=>{}}));expect(offline).toContain('requires a connection to Supabase');expect(offline).not.toContain('type="password"');
  const online=renderToStaticMarkup(createElement(AdminForm,{busy:false,configured:true,onSubmit:()=>{}}));expect(online).not.toMatch(/minlength/i);expect(online).not.toContain('admin / 1234');
 });
});
