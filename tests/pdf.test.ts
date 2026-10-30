import { it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateReport } from '../lib/pdf';
import type { Project } from '../lib/model';
it('generates individual and consolidated reports with original PDF pages appended',async()=>{
 const original=await PDFDocument.create();const page=original.addPage();const font=await original.embedFont(StandardFonts.Helvetica);page.drawText('Unchanged source scores: 087 / 100',{font});
 const project:Project={sourceName:'original.pdf',sourcePdf:'data:application/pdf;base64,'+Buffer.from(await original.save()).toString('base64'),applicants:[{id:'a',name:'Alex',score:'087 / 100',rank:'#02',assessment:'Exact assessment.',evidence:'Exact quote.'}],personalities:[]};
 for(const id of [undefined,'a']){const bytes=await generateReport(project,id);const report=await PDFDocument.load(bytes);expect(report.getPageCount()).toBe(2);expect(report.getPage(1).getSize()).toEqual(page.getSize());}
 expect(project.applicants[0].score).toBe('087 / 100');
 await expect(generateReport(project,'missing')).rejects.toThrow('Import and confirm');
});
