import { z } from 'zod';
export const types = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'] as const;
export const applicantSchema = z.object({ name: z.string().min(1).max(200), score: z.string().min(1).max(100), rank: z.string().min(1).max(100), assessment: z.string().min(1).max(20000), evidence: z.string().min(1).max(2000) });
export const resumeSchema = z.object({ applicants: z.array(applicantSchema).min(1).max(500) });
export const personalitySchema = z.object({ name: z.string().max(200), type: z.enum(types).nullable(), variant: z.enum(['A','T']).nullable(), evidence: z.string().max(2000) });
export type Applicant = z.infer<typeof applicantSchema> & { id: string };
export type Personality = { id: string; filename: string; image: string; name: string; type: string; variant: string; evidence: string; applicantId: string; confirmed: boolean; error?: string };
export type Project = { sourceName: string; sourcePdf: string; applicants: Applicant[]; personalities: Personality[] };
export const emptyProject: Project = { sourceName:'', sourcePdf:'', applicants:[], personalities:[] };
export function confirmedResult(project: Project, id: string) { return project.personalities.find(p => p.confirmed && p.applicantId === id && types.includes(p.type as typeof types[number])); }
export function confirmMatch(project: Project, result: Personality): Personality {
 if (!project.applicants.some(a => a.id === result.applicantId)) throw new Error('Select an applicant before confirming.');
 if (!types.includes(result.type as typeof types[number])) throw new Error('Select a valid personality type.');
 if (project.personalities.some(p => p.id !== result.id && p.confirmed && p.applicantId === result.applicantId)) throw new Error('This applicant already has a confirmed result. Unconfirm it first.');
 return { ...result, confirmed:true };
}
export function suggestedApplicant(applicants: Applicant[], name: string) { const normalized = name.trim().toLocaleLowerCase(); const matches = applicants.filter(a => a.name.trim().toLocaleLowerCase() === normalized); return normalized && matches.length === 1 ? matches[0].id : ''; }
