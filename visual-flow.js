const azureArt={"Azure Data Factory":"azure-factory","Event Hubs":"azure-eventhubs","Azure Stream Analytics":"azure-stream","ADLS Gen2":"azure-adls","Azure Cosmos DB":"azure-cosmos","Microsoft Purview":"azure-purview","Microsoft Entra ID":"azure-entra","Azure Key Vault":"azure-keyvault","Azure Functions":"azure-functions","Azure SQL":"azure-sql","Power BI":"azure-powerbi","Azure DevOps":"azure-devops","Azure Monitor":"azure-monitor"};

function emblemArt(tech){
 const conventional=technologyIcons[azureArt[tech.name]||tech.icon]??technologyIcons[tech.icon];
 if(conventional)return conventional;
 return null;
}
function initials(text){
 const words=text.replace(/^(?:Amazon |AWS |Azure |Apache |Google Cloud |Informatica )/i,"").split(/[\s/-]+/).filter(Boolean);
 return (words.length===1?words[0].slice(0,3):words.map(w=>w[0]).slice(0,3).join("")).toUpperCase();
}
function drawEmblem(tech,x,y,index){
 const art=emblemArt(tech);
 if(!art)return '<rect x="'+x+'" y="'+y+'" width="29" height="29" rx="5" fill="#e4eee9" stroke="#bfd3cb"/><text x="'+(x+14.5)+'" y="'+(y+19)+'" text-anchor="middle" font-size="9" font-weight="700" fill="#21514a">'+esc(initials(tech.name))+'</text>';
 const [w,h,body]=art, prefix="t"+index+"-";
 const artwork=body.replace(/id="([^"]+)"/g,(_,k)=>'id="'+prefix+k+'"').replace(/url\(#([^)]+)\)/g,(_,k)=>"url(#"+prefix+k+")").replace(/(href|xlink:href)="#([^"]+)"/g,(_,p,k)=>p+'="#'+prefix+k+'"');
 return '<svg x="'+x+'" y="'+y+'" width="29" height="29" viewBox="0 0 '+w+' '+h+'" aria-hidden="true">'+artwork+'</svg>';
}
function visualDiagram(result,project){
 // Build a prefix tree so coincident first stages occur once, while independent flows stay separate.
 const root={children:new Map()};
 for(const path of result.streams){
   let parent=root;
   for(const node of path.nodes){
     const key=node.role+"\u0001"+node.tech;
     if(!parent.children.has(key))parent.children.set(key,{...node,children:new Map(),outcomes:[]});
     parent=parent.children.get(key);
   }
   parent.outcomes.push(path.label);
 }
 const branches=[...root.children.values()];
 const rows=[],edges=[];
 const col=243,widthBox=205;
 const boxLines=rowsNode=>Math.max(wrapWords(rowsNode.tech,27).length,1);
 let maxDepth=0, leaf=0;
 const put=(node,depth)=>{
   maxDepth=Math.max(maxDepth,depth);
   const children=[...node.children.values()];
   const levels=children.map(child=>put(child,depth+1));
   const position=levels.length?(levels[0]+levels.at(-1))/2:leaf++;
   const coord={node,depth,position};
   rows.push(coord);
   for(const child of children)edges.push([coord,child.coord]);
   node.coord=coord;
   return position;
 };
 branches.forEach(node=>put(node,0));
 const maxLines=Math.max(3,...rows.map(({node})=>boxLines(node)));
 const h=82+maxLines*15, row=h+29, top=114;
 const w=Math.max(1020,64+maxDepth*col+widthBox+205);
 const yFor=n=>top+n.position*row, xFor=n=>29+n.depth*col;
 const contentBottom=top+(leaf-1)*row+h;
 const cross=[["Governance",result.catalog],[t("Sicurezza"),result.security],[phrase("Orchestrazione","Orchestration"),result.orchestrator],["CI/CD",result.deployment.ci]];
 const crossWidth=(w-80)/cross.length;
 const crossMax=Math.max(...cross.map(([,value])=>wrapWords(value,Math.floor((crossWidth-24)/7)).length));
 const crossHeight=61+crossMax*15, height=contentBottom+35+crossHeight+55;
 const ink="#163331";
 const arrows=edges.map(([a,b])=>{
   const sx=xFor(a)+widthBox, ex=xFor(b)-5, sy=yFor(a)+h/2, ey=yFor(b)+h/2, mid=sx+18;
   return '<path d="M'+sx+' '+sy+' H'+mid+' V'+ey+' H'+ex+'" fill="none" stroke="#488575" stroke-width="2" marker-end="url(#flowArrow)"/>';
 }).join("");
 let serial=0;
 const textLines=(lines,x,y,step,font,color)=>lines.map((line,i)=>'<text x="'+x+'" y="'+(y+i*step)+'" font-size="'+font+'" fill="'+color+'">'+esc(line)+'</text>').join("");
 const badges=(value,x,y,fallback,limit)=>{
   const candidates=technologiesIn(value).slice(0,limit);
   return (candidates.length?candidates:[{name:fallback}]).map((tech,i)=>drawEmblem(tech,x+i*35,y,serial++)).join("");
 };
 const nodes=rows.map(pos=>{
   const {node}=pos,x=xFor(pos),y=yFor(pos);
   const lines=textLines(wrapWords(node.tech,27),x+11,y+73,15,13,ink);
   const status=node.outcomes.length?textLines(node.outcomes.flatMap(label=>wrapWords(label,26)),x+widthBox+12,y+h/2-10,15,11,"#466462"):"";
   // An end label beside a leaf preserves the identity of each output path.
   return '<g><title>'+esc(node.role+" · "+node.tech)+'</title><rect x="'+x+'" y="'+y+'" width="'+widthBox+'" height="'+h+'" rx="9" fill="#fff" stroke="#b3d0c3"/>'+badges(node.tech,x+11,y+9,node.role,5)+'<text x="'+(x+11)+'" y="'+(y+54)+'" font-size="13" font-weight="700" fill="#00705c">'+esc(node.role)+'</text>'+lines+(node.children.size?"":status)+'</g>';
 }).join("");
 const control=cross.map(([label,value],i)=>{
   const x=29+i*(crossWidth+10),y=contentBottom+39;
   return '<rect x="'+x+'" y="'+y+'" width="'+crossWidth+'" height="'+crossHeight+'" rx="8" fill="#eaf4ee" stroke="#bed6cb"/>'+badges(value,x+12,y+9,label,5)+'<text x="'+(x+12)+'" y="'+(y+54)+'" font-size="13" font-weight="700" fill="#006451">'+esc(label)+'</text>'+textLines(wrapWords(value,Math.floor((crossWidth-24)/7)),x+12,y+72,15,13,ink);
 }).join("");
 return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+w+'" height="'+height+'" viewBox="0 0 '+w+' '+height+'" role="img" aria-label="'+esc(phrase("Diagramma con icone delle tecnologie","Technology icon flow diagram"))+'" font-family="Arial, sans-serif"><defs><marker id="flowArrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#488575"/></marker></defs><rect width="100%" height="100%" fill="#f5faf7"/><text x="29" y="45" font-size="25" font-weight="700" fill="'+ink+'">'+esc((project.trim()||phrase("Architettura dati","Data architecture")).slice(0,100))+'</text><text x="29" y="72" font-size="15" fill="#466462">'+esc(result.stack)+'</text>'+arrows+nodes+control+'<text x="29" y="'+(height-15)+'" font-size="12" fill="#466462">'+esc(phrase("Le sigle nei riquadri identificano i passaggi senza logo disponibile.","Initials identify steps without available logo artwork."))+'</text></svg>';
}
