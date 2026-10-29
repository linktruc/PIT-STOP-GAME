import {describe,it,expect} from 'vitest';
import {gunnerHandoff} from '../src/scene/crew';
describe('Gunner completion transition',()=>{
 it('holds the same stowed endpoint before and after a delayed DONE',()=>{
  expect(gunnerHandoff(1,true,1,false)).toBe(1);
  expect(gunnerHandoff(1,true,1,true)).toBe(1);
  expect(gunnerHandoff(1,true,null,true)).toBe(1);
 });
 it('returns to work then withdraws continuously in the final tighten phase',()=>{
  expect(gunnerHandoff(1,true,0,false)).toBe(1);
  expect(gunnerHandoff(1,true,.22,false)).toBe(0);
  expect(gunnerHandoff(1,true,.65,false)).toBe(0);
  let previous=gunnerHandoff(1,true,0,false);
  for(let i=1;i<=1000;i++){
   const value=gunnerHandoff(1,true,i/1000,false);
   expect(Math.abs(value-previous)).toBeLessThan(.008);previous=value;
  }
  expect(previous).toBe(1);
 });
});
