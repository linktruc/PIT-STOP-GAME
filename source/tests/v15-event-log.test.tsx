import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventLogWorkflow } from '../src/ReplayEventLog';
import { createTasks } from '../src/engine';
import { ROLES, type Player, type Round } from '../src/types';

const players:Player[] = ROLES.map((role, index) => ({id:`p${index}`,nickname:`Crew ${index+1}`,role,ready:true,joinedAt:index}));
const round:Round = {id:'test',status:'RUNNING',goAt:1000,finishedAt:null,elapsedMs:null,tasks:createTasks(players),samples:[],events:[]};

describe('V15 universal Event Log includes detailed workflow', () => {
  it('shows all seven grouped phases and all 21 individual jobs with owners', () => {
    const html=renderToStaticMarkup(<EventLogWorkflow round={round} players={players}/>);
    expect(html.match(/class="event-workflow-group"/g)).toHaveLength(7);
    expect(html.match(/class="event-workflow-task locked"/g)).toHaveLength(21);
    expect(html).toContain('Lift car');
    expect(html).toContain('Tighten wheel nuts');
    expect(html).toContain('Crew 1');
  });
  it('renders historical replay task status from its cursor rather than current room status', () => {
    const copy=structuredClone(round);
    copy.tasks[0].status='DONE';copy.tasks[0].enabledAt=1000;copy.tasks[0].completedAt=1500;
    expect(renderToStaticMarkup(<EventLogWorkflow round={copy} players={players} cursor={1200}/>)).not.toContain('class="event-workflow-task done"');
    expect(renderToStaticMarkup(<EventLogWorkflow round={copy} players={players} cursor={1700}/>)).toContain('class="event-workflow-task done"');
  });
});
