const esc = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const xml = value => esc(String(value??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,"")).replaceAll("&#39;","&apos;");
function wrapWords(value, max){
 const lines=[];
 for(const word of value.split(/\s+/)){
   const last=lines.at(-1);
   if(last&&last.length+word.length+1<=max)lines[lines.length-1]+=" "+word;
   else lines.push(word);
 }
 return lines;
}
function diagram(result){
 const width=1192;
 const maxLines=Math.max(3,...result.streams.flatMap(path=>path.nodes.map(node=>wrapWords(node.tech,22).length)));
 const boxHeight=47+maxLines*14, lane=boxHeight+50, height=result.streams.length*lane+13;
 const stages=result.streams.map(({label,nodes},i)=>{
   const y=24+i*lane, boxY=y+30, dx=nodes.length>1?Math.min(200,Math.floor((width-46-171)/(nodes.length-1))):190;
   const blocks=nodes.map(({role,tech},j)=>{
     const x=23+j*dx;
     const arrow=j?'<path d="M '+(x-dx+171)+' '+(boxY+41)+' H '+(x-8)+'" stroke="#2e7c69" stroke-width="2" fill="none" marker-end="url(#arrow)"/>':"";
     const lines=wrapWords(tech,22);
     return arrow+'<rect x="'+x+'" y="'+boxY+'" width="171" height="'+boxHeight+'" rx="8" fill="#ffffff" stroke="#b2d2c6"/>'+
      '<text x="'+(x+11)+'" y="'+(boxY+22)+'" font-size="12.5" fill="#006452" font-weight="700">'+esc(role)+'</text>'+
      lines.map((line,k)=>'<text x="'+(x+11)+'" y="'+(boxY+42+k*14)+'" font-size="12.8" fill="#172a39">'+esc(line)+'</text>').join("");
   }).join("");
   return '<text x="23" y="'+(y+13)+'" font-size="17" fill="#142b35" font-weight="700">'+esc(label)+'</text>'+blocks;
 }).join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(phrase("Diagramma dei percorsi dati","Data flow diagram"))+'" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" font-family="Arial, sans-serif"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#2e7c69"/></marker></defs><rect width="100%" height="100%" fill="#f5faf7"/>'+stages+'</svg>';
}
function download(blob, name){
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=name;
 a.click();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
const filename = value => (value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,70)||"Architettura_dati");
function convertDiagram(svg){
 return new Promise((resolve,reject)=>{
   const image=new Image();
   const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
   image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Immagine non disponibile"));};
   image.onload=()=>{
     try{
       const canvas=document.createElement("canvas");
       canvas.width=image.width*2;
       canvas.height=image.height*2;
       canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
       canvas.toBlob(async blob=>{
         if(!blob){reject(new Error("Immagine non disponibile"));return;}
         try{resolve({data:new Uint8Array(await blob.arrayBuffer()),width:image.width,height:image.height});}
         catch(e){reject(e);}
       },"image/png");
     }catch(e){reject(e);}
     finally{URL.revokeObjectURL(url);}
   };
   image.src=url;
 });
}
const enc=new TextEncoder();
const crcTable=Uint32Array.from({length:256},(_,i)=>{
 for(let k=0;k<8;k++)i=(i&1)?(0xedb88320^(i>>>1)):(i>>>1);
 return i>>>0;
});
function zip(files){
 const sections=[], directory=[];
 let offset=0, directorySize=0;
 const header=(size,items)=>{
   const bytes=new Uint8Array(size), view=new DataView(bytes.buffer);
   for(const [pos,val,type] of items)view[type===4?"setUint32":"setUint16"](pos,val,true);
   return bytes;
 };
 for(const [path,value] of Object.entries(files)){
   const name=enc.encode(path), data=typeof value==="string"?enc.encode(value):value;
   let crc=0xffffffff;
   for(const n of data)crc=crcTable[(crc^n)&255]^(crc>>>8);
   crc=(crc^0xffffffff)>>>0;
   const local=header(30,[[0,0x04034b50,4],[4,20],[12,33],[14,crc,4],[18,data.length,4],[22,data.length,4],[26,name.length]]);
   sections.push(local,name,data);
   const entry=header(46,[[0,0x02014b50,4],[4,20],[6,20],[14,33],[16,crc,4],[20,data.length,4],[24,data.length,4],[28,name.length],[42,offset,4]]);
   directory.push(entry,name);
   offset+=local.length+name.length+data.length;
   directorySize+=entry.length+name.length;
 }
 const count=Object.keys(files).length;
 const end=header(22,[[0,0x06054b50,4],[8,count],[10,count],[12,directorySize,4],[16,offset,4]]);
 return new Blob([...sections,...directory,end],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
async function exportWord(state,result){
 const svg=diagram(result);
 const picture=await convertDiagram(svg);
 const holder=(text,style)=>'<w:p>'+(style?'<w:pPr><w:pStyle w:val="'+style+'"/></w:pPr>':'')+'<w:r><w:t xml:space="preserve">'+xml(text)+'</w:t></w:r></w:p>';
 const heading=t=>holder(t,"Heading1");
 const sub=t=>holder(t,"Heading2");
 const drawing=wordDiagram(picture);
 const body=[
   holder(state.project.trim()||t("Progetto di architettura dati"),"Title"),
   holder(t("Stack di riferimento")+": "+result.stack),
   holder(phrase("Proposta generata dalle risposte del questionario. Dimensionamento e integrazioni si validano con i carichi e i servizi del progetto.","Proposal generated from the questionnaire. Validate capacity and integrations on the project’s actual workloads and services.")),
   heading(t("Architettura proposta")),
   ...recommendationEntries(result).flatMap(([label,decision])=>[sub(label+" · "+decision.title),holder(decision.reason)]),
   drawing,
   heading(phrase("Scelta di piattaforma e BI","Platform and BI selection")),...platformExplanation(state,result).rows.map(line=>holder(line)),holder(result.bi.name+" · "+result.bi.reason),
   ...result.streams.flatMap(path=>[sub(path.label),...path.nodes.flatMap(node=>{
     const reason=technologyReason(node.tech,result.toolChoices);
     return [holder(node.role+" — "+node.tech),...(reason?[holder(reason)]:[])];
   })]),
   heading(t("Controlli trasversali")),holder("Governance: "+result.catalog),holder(t("Sicurezza")+": "+result.security),holder(phrase("Orchestrazione","Orchestration")+" · "+result.orchestrator),
   ...medallionWord(result.layerPlan,heading,sub,holder),
   ...preferenceWord(result.technologies,heading,sub,holder),
   ...storagePlanWord(result.storagePlan,heading,sub,holder),
   heading(t("Dimensionamento")),...result.capacity.rows.flatMap(row=>[sub(row.label+" · "+row.value),holder(row.reason)]),...result.capacity.notes.map(note=>holder(note)),holder(result.capacity.action),
   ...(result.toolChoices.length?[heading(phrase("Tecnologie aggiuntive","Additional technologies")),...result.toolChoices.flatMap(item=>[sub(item.role+" · "+item.tech),holder(item.applies?item.reason:item.warning)])]:[]),
   ...(result.flags.length?[heading(t("Punti da verificare")),...result.flags.flatMap(flag=>[sub(flag.title),holder(flag.detail)])]:[]),
   heading(t("Motivazioni delle scelte")),
   ...result.decisions.flatMap((d,i)=>[sub((i+1)+". "+d.question),holder(t("Risposta")+": "+d.answer),holder("Pattern: "+d.pattern),holder(t("Tecnologia o controllo")+": "+d.technology),holder(t("Motivazione")+": "+d.reason),...(d.technologyReason?[holder(phrase("Perché questa tecnologia","Why this technology")+": "+d.technologyReason)]:[]),...(d.note?[holder(t("Nota del progetto")+": "+d.note)]:[])]),
   heading(t("Riferimenti")),
   holder("Pandas · https://pandas.pydata.org/docs/user_guide/scale.html"),
   holder("Apache Spark · https://spark.apache.org/docs/latest/tuning.html"),
   holder(phrase("Scelta del data store","Data store selection")+" · https://learn.microsoft.com/en-us/azure/architecture/data-guide/technology-choices/data-storage"),
   ...(result.toolChoices.some(item=>item.tech.startsWith("Informatica"))?[holder("Informatica IDMC · https://www.informatica.com/platform.html"),holder("Informatica CDIR · https://www.informatica.com/products/cloud-integration/ingestion-at-scale.html")]:[])
 ].join("");
 download(wordPackage(body,{picture}),filename(state.project)+".docx");
}
function wordCodeBlock(lines){
 const spans=lines.join("\n").split("\n").map(line=>'<w:t xml:space="preserve">'+xml(line)+'</w:t>').join('<w:br/>');
 return '<w:p><w:pPr><w:keepLines/><w:shd w:fill="EFF4F1"/><w:spacing w:before="60" w:after="140" w:line="255" w:lineRule="auto"/><w:ind w:left="140" w:right="140"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="173A3A"/><w:sz w:val="19"/></w:rPr>'+spans+'</w:r></w:p>';
}
function wordDiagram(picture){
 const cx=Math.min(5950000,Math.round(5000000*picture.width/picture.height));
 const cy=Math.round(cx*picture.height/picture.width);
 return '<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="1" name="Architecture" descr="'+xml(phrase("Percorsi di ingestione, elaborazione e serving","Ingestion, processing and serving paths"))+'"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="architecture.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImage"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
}
function wordPackage(body,{picture,links=[]}={}){
 const w="http://schemas.openxmlformats.org/wordprocessingml/2006/main";
 const o="http://schemas.openxmlformats.org/officeDocument/2006/relationships";
 const rels=(inner)=>'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+inner+'</Relationships>';
 const doc='<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="'+w+'" xmlns:r="'+o+'" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="960" w:right="960" w:bottom="960" w:left="960"/></w:sectPr></w:body></w:document>';
 const styles='<w:styles xmlns:w="'+w+'"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:lang w:val="'+phrase("it-IT","en-GB")+'"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="100"/></w:pPr></w:pPrDefault></w:docDefaults>'+[["Title",52,0],["Heading1",34,0],["Heading2",25,1]].map(([id,size,level])=>'<w:style w:type="paragraph" w:styleId="'+id+'"><w:name w:val="'+id+'"/><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="100"/><w:outlineLvl w:val="'+level+'"/></w:pPr><w:rPr><w:b/><w:color w:val="173A3A"/><w:sz w:val="'+size+'"/></w:rPr></w:style>').join("")+'</w:styles>';
 const relationships=links.map((url,index)=>'<Relationship Id="rIdLink'+(index+1)+'" Type="'+o+'/hyperlink" Target="'+xml(url)+'" TargetMode="External"/>').join("");
 return zip({
   "[Content_Types].xml":'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
   "_rels/.rels":rels('<Relationship Id="rId1" Type="'+o+'/officeDocument" Target="word/document.xml"/>'),
   "word/_rels/document.xml.rels":rels('<Relationship Id="rIdStyles" Type="'+o+'/styles" Target="styles.xml"/>'+(picture?'<Relationship Id="rIdImage" Type="'+o+'/image" Target="media/architecture.png"/>':"")+relationships),
   "word/document.xml":doc,"word/styles.xml":styles,...(picture?{"word/media/architecture.png":picture.data}:{})
 });
}
