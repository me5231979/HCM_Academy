const fs=require('fs');
const {CheckBox,Table,TableRow,TableCell,WidthType,ShadingType,VerticalAlign,Document,Packer,Paragraph,TextRun,HeadingLevel,AlignmentType,LevelFormat,BorderStyle,Footer,PageNumber}=require('docx');
// Reads the questions from assets/assessments.js (the same file the landing page uses).
const path=require('path'), vm=require('vm'), root=path.join(__dirname,'..');
const ctx={window:{}}; vm.runInNewContext(fs.readFileSync(path.join(root,'assets/assessments.js'),'utf8'),ctx);
const A=ctx.window.HCM_ASSESS;
const TOPICS=[['start','00 Start Here'],['recruiting','01 Positions, Recruitment & Hiring'],['payroll','02 Payroll & Timecards'],['positions','03 Assignments'],['leave','04 Leave'],['costing','05 Costing'],['students','06 Student & Faculty'],['records','07 Document Records & Reporting']];
const group=list=>TOPICS.map(([id,name])=>[name,list.filter(x=>x.topic===id).map(x=>[x.draft?1:0,x.q,x.o,x.a,x.why])]).filter(g=>g[1].length);
const PRE=group(A.pre), FIN=group(A.final);
const NPASS=Math.ceil(A.final.length*A.pass);
const F='Calibri', GOLD='946E24', GREEN='2E7D32';
const P=(t,o={})=>new Paragraph({...o,children:[new TextRun({text:t,font:F,...(o.run||{})})]});
const out=[];
function section(title,sub,data){
  out.push(new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:out.length>0,children:[new TextRun({text:title})]}));
  out.push(P(sub,{spacing:{after:200},run:{italics:true,color:'555555'}}));
  let n=0;
  for(const [topic,qs] of data){
    out.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:topic})]}));
    for(const [draft,q,opts,a,why] of qs){
      n++;
      const kids=[new TextRun({text:`${n}. `,bold:true,font:F}),new TextRun({text:q,bold:true,font:F})];
      if(draft) kids.push(new TextRun({text:'  DRAFT: confirm with SME',bold:true,color:'B26A00',size:18,font:F}));
      out.push(new Paragraph({keepNext:true,spacing:{before:160,after:60},children:kids}));
      opts.forEach((o,i)=>{
        const ok=i===a;
        out.push(new Paragraph({keepNext:true,indent:{left:360},spacing:{after:40},children:[
          new TextRun({text:`${'ABC'[i]})  `,font:F,bold:ok}),
          new TextRun({text:o,font:F,bold:ok,color:ok?GREEN:undefined}),
          ...(ok?[new TextRun({text:'   ✓ Correct',font:F,bold:true,color:GREEN,size:18})]:[])]}));
      });
      if(why) out.push(new Paragraph({indent:{left:360},spacing:{after:60},children:[new TextRun({text:'Feedback: ',italics:true,bold:true,font:F,color:'555555'}),new TextRun({text:why,italics:true,font:F,color:'555555'})]}));
      const cb=(l)=>[new CheckBox({checked:false,checkedState:{value:'2612',font:'Segoe UI Symbol'},uncheckedState:{value:'2610',font:'Segoe UI Symbol'}}),new TextRun({text:' '+l+'   ',font:F,size:20})];
      const bd={style:BorderStyle.SINGLE,size:4,color:'BBBBBB'};
      const borders={top:bd,bottom:bd,left:bd,right:bd};
      out.push(new Table({width:{size:9480,type:WidthType.DXA},columnWidths:[3700,5780],indent:{size:360,type:WidthType.DXA},rows:[new TableRow({cantSplit:true,children:[
        new TableCell({width:{size:3700,type:WidthType.DXA},borders,shading:{type:ShadingType.CLEAR,fill:'F5F3EF',color:'auto'},margins:{top:80,bottom:80,left:120,right:120},verticalAlign:VerticalAlign.TOP,children:[
          new Paragraph({spacing:{after:40},children:[new TextRun({text:'Reviewer decision',font:F,size:18,bold:true,color:'555555'})]}),
          new Paragraph({children:[...cb('Approve'),...cb('Edit'),...cb('Remove')]})]}),
        new TableCell({width:{size:5780,type:WidthType.DXA},borders,margins:{top:80,bottom:80,left:120,right:120},children:[
          new Paragraph({spacing:{after:40},children:[new TextRun({text:'Notes (click below to type)',font:F,size:18,bold:true,color:'555555'})]}),
          new Paragraph({children:[new TextRun({text:'',font:F,size:20})]})]})]})]}));
      out.push(new Paragraph({spacing:{after:80},children:[]}));
    }
  }
}
out.push(new Paragraph({heading:HeadingLevel.TITLE,children:[new TextRun({text:'HCM Academy Assessments'})]}));
out.push(P('Pre-assessment and final assessment questions. Draft for review, October 2026.',{run:{color:'555555'}}));
out.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:'How to review'})]}));
['Each question shows the correct answer in green with a check mark.',
 'Questions marked DRAFT cover topics whose courses are not built yet. The subject matter expert (SME) should confirm them before they are used.',
 'The other questions come from the 17 finished courses. None repeat a course knowledge check word for word.',
 'Under each question, click a box to mark Approve, Edit, or Remove, and click in the Notes box to type. Return the file to pcb@vanderbilt.edu.'].forEach(t=>out.push(new Paragraph({numbering:{reference:'b',level:0},children:[new TextRun({text:t,font:F})]})));
out.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:'Decisions needed'})]}));
['Draft questions (Leave, Student & Faculty, and the non-worker question): keep as placeholders, or have the SMEs write them once those courses are built?',
 `Final length: ${A.final.length} questions means ${A.final.length-NPASS} miss${A.final.length-NPASS===1?'':'es'} still pass${A.final.length-NPASS===1?'es':''}. Increase the bank to allow more?`,
 'Retakes: show the same questions, or draw from a larger pool so retakes can\'t be memorized?'].forEach(t=>out.push(new Paragraph({numbering:{reference:'n',level:0},children:[new TextRun({text:t,font:F})]})));
section('Pre-assessment',`${A.pre.length} questions, not graded.`+' Two per topic. Missing either question in a topic recommends that topic to the learner.',PRE);
section('Final assessment',`${A.final.length} questions. ${NPASS} correct (${Math.round(A.pass*100)}%) is required to pass.`,FIN);
const doc=new Document({
  styles:{default:{document:{run:{font:F,size:22}}},
    paragraphStyles:[
      {id:'Title',name:'Title',basedOn:'Normal',run:{font:'Georgia',size:48,color:'1C1C1C'},paragraph:{spacing:{after:120}}},
      {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Georgia',size:36,color:'1C1C1C'},paragraph:{spacing:{before:0,after:80},outlineLevel:0,border:{bottom:{style:BorderStyle.SINGLE,size:12,color:'CFAE70',space:4}}}},
      {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:F,size:26,bold:true,color:GOLD},paragraph:{spacing:{before:280,after:60},outlineLevel:1,keepNext:true}}]},
  numbering:{config:[
    {reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:260}}}}]},
    {reference:'n',levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:260}}}}]}]},
  sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,bottom:1080,left:1200,right:1200}}},
    footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'HCM Academy Assessments, draft   Page ',size:16,color:'777777',font:F}),new TextRun({children:[PageNumber.CURRENT],size:16,color:'777777',font:F})]})]})},
    children:out}]});
Packer.toBuffer(doc).then(b=>{fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.writeFileSync(path.join(root,'docs/HCM_Academy_Assessments_Draft.docx'),b);console.log('ok')});
