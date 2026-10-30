import { describe, it, expect } from 'vitest';
import { confirmMatch, confirmedResult, resumeSchema, suggestedApplicant, type Project, type Personality } from '../lib/model';
const applicant={id:'a',name:'Alex Chen',score:'087 / 100',rank:'#02 (tie)',assessment:'Original assessment.',evidence:'Alex Chen — 087 / 100'};
const result:Personality={id:'p',filename:'result.png',image:'',name:'Alex Chen',type:'INTJ',variant:'A',evidence:'Architect INTJ-A',applicantId:'a',confirmed:false};
const project:Project={sourceName:'screening.pdf',sourcePdf:'',applicants:[applicant],personalities:[result]};
describe('source assessment integrity',()=>{
 it('preserves scores and ranks as literal strings',()=>{const parsed=resumeSchema.parse({applicants:[applicant]});expect(parsed.applicants[0].score).toBe('087 / 100');expect(parsed.applicants[0].rank).toBe('#02 (tie)');});
 it('never promotes suggestions into confirmed results',()=>{expect(suggestedApplicant(project.applicants,' alex chen ')).toBe('a');expect(confirmedResult(project,'a')).toBeUndefined();});
 it('does not guess ambiguous or partial names',()=>{expect(suggestedApplicant(project.applicants,'Alex')).toBe('');expect(suggestedApplicant([applicant,{...applicant,id:'b'}],'Alex Chen')).toBe('');});
 it('requires a real applicant and a valid type',()=>{expect(()=>confirmMatch(project,{...result,applicantId:''})).toThrow();expect(()=>confirmMatch(project,{...result,type:'UNKNOWN'})).toThrow();});
 it('rejects duplicate confirmed results',()=>{expect(()=>confirmMatch({...project,personalities:[{...result,id:'other',confirmed:true}]},result)).toThrow('already');});
 it('confirmation leaves all original assessment fields unchanged',()=>{const before=JSON.stringify(project.applicants);const confirmed=confirmMatch(project,result);expect(confirmed.confirmed).toBe(true);expect(JSON.stringify(project.applicants)).toBe(before);});
});
