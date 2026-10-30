import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { confirmedResult, type Project } from './model';
export async function generateReport(project: Project, applicantId?: string) {
 const doc = await PDFDocument.create();
 const font = await doc.embedFont(StandardFonts.Helvetica);
 const bold = await doc.embedFont(StandardFonts.HelveticaBold);
 let page = doc.addPage(); let y = 790;
 const safe = (s:string) => [...s].map(c=>{try{font.encodeText(c);return c;}catch{return '?';}}).join('');
 function line(text:string, size=11, strong=false) {
  const activeFont = strong?bold:font;
  for (const paragraph of text.split('\n')) {
   let current='';
   for (const word of safe(paragraph).split(/\s+/)) {
    // Split long tokens too, so source identifiers cannot overflow the page.
    for (const piece of word.match(/.{1,65}/g) || ['']) {
     const next=current?current+' '+piece:piece;
     if(activeFont.widthOfTextAtSize(next,size)>490 && current){draw(current);current=piece;}else current=next;
    }
   }
   draw(current);
  }
  function draw(value:string){if(y<55){page=doc.addPage();y=790;}page.drawText(value,{x:50,y,size,font:activeFont,color:rgb(.12,.17,.22)});y-=size+7;}
 }
 line('APPLICANT ATLAS',12,true);line('Integrated assessment report',23,true);
 line(`Source: ${project.sourceName}`);line(`Generated: ${new Date().toISOString().slice(0,10)}`);
 line('Original scores and rankings are transcribed, never recalculated.');
 line('Personality results are self-reported context and do not determine hiring decisions.');
 line('The complete original screening PDF follows these integration pages.');y-=15;
 const selected=applicantId?project.applicants.filter(a=>a.id===applicantId):project.applicants;
 if(!selected.length || !project.sourcePdf) throw new Error('Import and confirm the screening PDF first.');
 for(const a of selected){line(a.name,17,true);line(`Original rank: ${a.rank} | Original score: ${a.score}`,11,true);line(a.assessment);line(`Source evidence: ${a.evidence}`);const result=confirmedResult(project,a.id);line(result?`Confirmed personality: ${result.type}${result.variant?'-'+result.variant:''}`:'Personality: pending manual confirmation',12,true);if(result){line(`Screenshot: ${result.filename}`);line(`Visible evidence: ${result.evidence || 'Manually transcribed'}`);}y-=20;}
 const source=await PDFDocument.load(project.sourcePdf.split(',')[1]);
 const pages=await doc.copyPages(source,source.getPageIndices());pages.forEach(p=>doc.addPage(p));
 return doc.save();
}
