const examples={
 hotel:{name:"Prenotazioni alberghiere",cloud:"gcp",options:"bi micro rest none sql dual rel sql none dup dash olap business rows region sql replay team estimate",metrics:{daily:"30",days:"365",input:"2",window:"15"},notes:{fresh:"Reporting orario. Confermare il target di freschezza end-to-end e la latenza del refresh Power BI.",identity:"Le figure commerciali vedono gli hotel assegnati. Finance vede i prezzi."}},
 erp:{name:"Replica ERP e BI",cloud:"databricks",options:"bi micro files logs heavy lakehouse python spark none scd dash auto uc rows onprem dbx replay existing estimate",metrics:{daily:"200",days:"1095",input:"300",window:"60"},notes:{fresh:"Obiettivo operativo p95 di 15 minuti. BI certificato ogni mattina.",cdc:"Verificare accessi ai log, supporto del connettore e impatto dello snapshot iniziale."}},
 iot:{name:"Telemetria e alert",cloud:"aws",options:"api hybrid events none peaks dual stateful auto native late event auto meta work region multi replay fixed estimate",metrics:{daily:"1728",days:"7",peak:"50000",size:"2"},notes:{fresh:"Alert p95 entro 5 secondi e BI orario.",scale:"Media di 10.000 eventi/s. La retention di 7 giorni è un’ipotesi dimostrativa."}}
};
installPlatformQuestions();
const by=id=>document.getElementById(id);
const e=value=>esc(value);
const et=value=>e(t(value));
const key="data-architecture-builder-v1";
const blank=()=>({project:"",cloud:"",bi:"",index:0,answers:{},notes:{},metrics:{},migration:{},budgetAmount:"",tools:{},language:"it",view:"form"});
let state=blank();
let restored=false;
try {
 const saved=JSON.parse(localStorage.getItem(key));
 if(saved&&(saved.cloud===""||Object.hasOwn(platformNames,saved.cloud))&&Number.isInteger(saved.index)){
   restored=true;
   state={...state,...saved,index:Math.min(questions.length-1,Math.max(0,saved.index))};
 }
}catch{}
language=state.language==="en"?"en":"it";
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
const answered=([id,,,options])=>options.some(([value])=>state.answers[id]===value);
const activeQuestions=()=>groups.flatMap(([, ,items])=>items).filter(q=>activePlatformQuestion(q[0],state));
const count=()=>activeQuestions().filter(answered).length;
const complete=()=>count()===activeQuestions().length;
function renderReferenceSelectors(){
 const option=(id,label)=>'<option value="'+e(id)+'">'+e(label)+'</option>';
 by("cloud").innerHTML=option("",phrase("Da decidere nel questionario","Decide in the questionnaire"))+Object.keys(platformNames).map(id=>option(id,stackName(id))).join("");
 by("biReference").innerHTML=option("",phrase("Da decidere nel questionario","Decide in the questionnaire"))+Object.keys(biNames).map(id=>option(id,makeBiName(id))).join("");
 by("biLabel").textContent=phrase("Strumento BI di riferimento","Reference BI tool");
 setInputs();
}
function notice(message){
 by("notice").hidden=!message;
 by("notice").textContent=message||"";
}
function setView(view){
 state.view=view;
 save();
 notice("");
 by("workspace").hidden=view!=="form";
 by("result").hidden=view!=="result";
 by("calculator").hidden=view!=="calculator";
 by("questionTab").setAttribute("aria-pressed",String(view!=="calculator"));
 by("calculatorTab").setAttribute("aria-pressed",String(view==="calculator"));
}
function setInputs(){
 by("project").value=state.project;
 by("cloud").value=state.cloud;
 by("cloud").closest("label").hidden=state.answers.projectType!=="existing";
 by("biReference").value=state.bi;
 by("language").value=language;
}
function localChrome(){
 document.documentElement.lang=language;
 for(const selector of [".intro h1",".intro p","#exampleButton",".progress-line strong",".local-note","#prev"]){
   const node=document.querySelector(selector);
   node.dataset.it??=node.textContent;
   node.textContent=t(node.dataset.it);
 }
 for(const node of document.querySelectorAll("#setup label:not(:has(#biReference)),#example option")){
   const text=node.firstChild;
   node.dataset.it??=text.textContent.trim();
   text.textContent=t(node.dataset.it)+(node.tagName==="LABEL"?" ":"");
 }
 by("project").placeholder=phrase("Es. Piattaforma prenotazioni","E.g. Booking platform");
 by("resetAll").textContent=phrase("Reset completo","Reset all");
 by("languageLabel").textContent=phrase("Lingua","Language");
 by("questionTab").textContent=phrase("Questionario e risultato","Questionnaire and result");
 by("calculatorTab").textContent=phrase("Calcolatore di capacità","Sizing calculator");
 for(const [id,labels] of Object.entries({setup:["Configurazione","Setup"],sections:["Sezioni del questionario","Questionnaire sections"],editor:["Questionario","Questionnaire"]})){
   by(id).setAttribute("aria-label",phrase(...labels));
 }
 technologyForm();
 renderReferenceSelectors();
}
function updateProgress(){
 by("cloud").closest("label").hidden=state.answers.projectType!=="existing";
 const currentQuestions=activeQuestions(), progress=by("progress");
 progress.max=currentQuestions.length;
 progress.value=count();
 progress.setAttribute("aria-label",t("Risposte completate"));
 by("progressText").textContent=count()+" / "+currentQuestions.length;
 const expanded=new Set([...by("sections").querySelectorAll("details[open]")].map(node=>node.dataset.group));
 by("sections").innerHTML=groups.map(([name,id,items])=>{
   const group=items.filter(q=>currentQuestions.includes(q));
   if(!group.length)return "";
   const current=group.includes(questions[state.index]);
   return '<details data-group="'+id+'"'+(current||expanded.has(id)?" open":"")+'><summary>'+e(id==='platform'?phrase('Scelta della piattaforma','Platform selection'):t(name))+' <span>'+group.filter(answered).length+'/'+group.length+'</span></summary>'+group.map(q=>{
     const index=questions.indexOf(q);
     const active=index===state.index;
     return '<button class="question-link'+(active?" active":"")+'" type="button" data-index="'+index+'" '+(active?'aria-current="step" ':"")+'><span class="status-mark" aria-hidden="true">'+(answered(q)?"✓":"○")+'</span>'+e(localQuestion(q)[1])+'</button>';
   }).join("")+'</details>';
 }).join("");
 const step=currentQuestions.indexOf(questions[state.index]);
 by("prev").disabled=step<=0;
 by("next").textContent=t(step===currentQuestions.length-1?"Genera architettura":"Avanti");
 by("next").disabled=!answered(questions[state.index]);
}
function showQuestion(focus=false){
 setView("form");
 const visible=activeQuestions();
 if(!visible.includes(questions[state.index]))state.index=questions.indexOf(visible.find(q=>!answered(q))||visible[0]);
 const q=questions[state.index], [id,title,ref,options]=localQuestion(q);
 const group=groups.find(([, ,items])=>items.includes(q));
 const sizingLink=id==="capacity"?'<button id="openCalculator" type="button" class="secondary">'+e(phrase("Apri il calcolatore","Open the calculator"))+'</button>':"";
 const optionsHtml=options.map(([value,answer,pattern])=>'<label class="option"><input type="radio" name="answer" value="'+value+'"'+(state.answers[id]===value?" checked":"")+'><span><strong>'+e(answer)+'</strong><small>'+e(pattern)+'</small></span></label>').join("");
 by("question").innerHTML='<p class="q-meta">'+e(group[1]==="platform"?phrase("Scelta della piattaforma","Platform selection"):t(group[0]))+' · '+(visible.indexOf(q)+1)+phrase(" di "," of ")+visible.length+'</p><h2 tabindex="-1" id="qTitle" class="question-title">'+e(title)+'</h2><p class="question-sub" lang="en">'+e(ref)+'</p><fieldset class="options" aria-labelledby="qTitle">'+optionsHtml+'</fieldset><label class="note-label">'+et("Nota del cliente (facoltativa)")+'<textarea id="questionNote" rows="2" maxlength="1500" placeholder="'+et("Dettagli, ipotesi o vincoli da riportare nel Word")+'">'+e(state.notes[id]||"")+'</textarea></label>'+sizingLink+(id==="migration"?migrationInputs(state):"")+(id==="projectBudget"?projectBudgetInput(state):"")+(id==="query"?modelShapeInput(state):"");
 referenceSlide(id,title,options);
 questionResources(id,title);
 updateProgress();
 if(focus)by("qTitle").focus({preventScroll:true});
}
function showCalculator(focus=false){
 if(state.view!=="calculator")state.previousView=state.view;
 setView("calculator");
 renderCalculator();
 if(focus)by("calculatorTitle").focus({preventScroll:true});
}
function showResult(focus=false){
 if(!complete()){showQuestion();return;}
 setView("result");
 const output=design(state), svg=diagram(output);
 const title=state.project.trim()||t("Proposta di architettura");
 const controls=[["Governance",output.catalog],["Sicurezza",output.security],[phrase("Orchestrazione","Orchestration"),output.orchestrator]].map(([k,v])=>'<div><strong>'+et(k)+'</strong>'+e(v)+'</div>').join("");

 const flags=output.flags.map(item=>'<div class="flag"><strong>'+e(item.title)+'</strong><p>'+e(item.detail)+'</p></div>').join("");
 const decisions=output.decisions.map((d,i)=>'<details class="decision"><summary>'+(i+1)+'. '+e(d.question)+'</summary><div class="detail">'+[["Risposta",d.answer],["Pattern",d.pattern],["Tecnologia o controllo",d.technology],["Motivazione",d.reason],[phrase("Perché questa tecnologia","Why this technology"),d.technologyReason],["Nota",d.note]].filter(([,value])=>value).map(([label,value])=>'<p><strong>'+et(label)+'</strong> · '+e(value)+'</p>').join("")+'</div></details>').join("");
 const selection=platformExplanation(state,output);
 const rationale='<h4>'+e(selection.title)+'</h4>'+selection.rows.map(line=>'<p>'+e(line)+'</p>').join("")+'<h4>'+e(phrase("Strumento BI","BI tool"))+' · '+e(output.bi.name)+'</h4><p>'+e(output.bi.reason)+'</p>';
 const section=(title,body,extra="")=>'<div class="result-card '+extra+'"><h3>'+e(title)+'</h3>'+body+'</div>';
 by("result").innerHTML='<div class="result-card"><div class="result-header"><div><h2 id="resultTitle" tabindex="-1">'+e(title)+'</h2><p>'+e(output.stack)+' · '+output.decisions.length+phrase(" decisioni motivate"," documented decisions")+'</p></div><div class="actions"><button type="button" class="secondary" id="editAnswers">'+et("Modifica risposte")+'</button><button type="button" class="secondary" id="downloadDiagram">'+et("Scarica diagramma")+'</button><button type="button" class="secondary" id="downloadIconFlow">'+e(phrase("Diagramma con loghi","Diagram with logos"))+'</button><button type="button" class="secondary" id="downloadImplementation">'+e(phrase("Guida all’implementazione","Implementation guide"))+'</button><button type="button" class="primary" id="downloadWord">'+et("Scarica Word")+'</button></div></div><div class="diagram-scroll" tabindex="0" aria-label="'+e(phrase("Diagramma scorrevole","Scrollable diagram"))+'">'+svg+'</div><div class="result-meta">'+controls+'</div></div>'+
 section(phrase("Architettura e modello dati consigliati","Recommended architecture and data model"),recommendationEntries(output).map(([label,decision])=>'<h4>'+e(label)+' · '+e(decision.title)+'</h4><p>'+e(decision.reason)+'</p>').join(""))+
 section(phrase("Perché questa piattaforma","Why this platform"),rationale)+
 section(phrase("Organizzazione dei dati","Data layering"),'<h4>'+e(output.layerPlan.title)+'</h4><p>'+e(output.layerPlan.reason)+'</p>'+
   output.layerPlan.layers.map(layer=>'<h4>'+e(layer.role+" · "+layer.store)+'</h4><p>'+e(layer.description)+'</p>').join("")+
   (output.layerPlan.alternative?'<h4>'+e(phrase("Alternativa · ","Alternative · ")+output.layerPlan.alternative.title)+'</h4><p>'+e(output.layerPlan.alternative.reason)+'</p>':""))+
 section(storagePlanTitle(),storagePlanHtml(output.storagePlan))+
 section(t("Dimensionamento"),capacityHtml(output.capacity))+
 section(preferenceTitle(),'<div class="diagram-scroll"><table class="technology-results"><thead><tr><th>'+e(phrase("Fase","Stage"))+'</th><th>'+e(phrase("Tecnologia","Technology"))+'</th><th>'+e(phrase("Scelta e motivazione","Selection and rationale"))+'</th></tr></thead><tbody>'+
   output.technologies.map(row=>'<tr><th scope="row">'+e(row.role)+'</th><td>'+e(row.tech)+'</td><td>'+e([row.status,row.detail].filter(Boolean).join(" · "))+'</td></tr>').join("")+'</tbody></table></div>')+
 (flags?section(t("Punti da verificare"),flags,"flags"):"")+
 section(t("Motivazioni delle scelte"),decisions);
 by("editAnswers").onclick=()=>showQuestion(true);
 by("downloadDiagram").onclick=()=>download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),filename(state.project)+".svg");
 by("downloadIconFlow").onclick=()=>{
   const artwork=visualDiagram(output,state.project);
   download(new Blob([artwork],{type:"image/svg+xml;charset=utf-8"}),filename(state.project)+phrase("_con_loghi.svg","_with_logos.svg"));
 };
 by("downloadImplementation").onclick=async(event)=>{
   const button=event.currentTarget;
   const label=button.textContent;
   const filenameSuffix=phrase("_guida_implementazione.docx","_implementation_guide.docx");
   button.disabled=true;
   button.textContent=phrase("Esportazione…","Exporting…");
   try{
     const document=await implementationGuide(state,output);
     download(document,filename(state.project)+filenameSuffix);
   }catch{
     notice(phrase("Non è stato possibile scaricare la guida. Riprova tra poco.","The guide could not be downloaded. Please try again."));
   }finally{
     button.disabled=false;
     button.textContent=label;
   }
 };
 by("downloadWord").onclick=async(event)=>{
   const button=event.currentTarget;
   button.disabled=true;
   button.textContent=phrase("Esportazione…","Exporting…");
   try{await exportWord(state,output);}
   catch{notice(phrase("Impossibile generare il Word. Riprova o scarica il diagramma separatamente.","Word export failed. Try again or download the diagram separately."));}
   finally{button.disabled=false;button.textContent=t("Scarica Word");}
 };
 if(focus){by("resultTitle").focus({preventScroll:true});by("result").scrollIntoView({block:"start"});}
}
function redraw(){
 if(state.view==="result")showResult();
 else if(state.view==="calculator")showCalculator();
 else showQuestion();
}
function go(index){
 state.index=index;
 showQuestion(true);
 if(window.innerWidth<701)by("editor").scrollIntoView({block:"start"});
}
by("question").addEventListener("change",event=>{
 if(event.target.id==="modelShape"){state.answers.modelShape=event.target.value;save();return;}
 if(event.target.id==="candidateStack"){state.answers.candidate=event.target.value;save();return;}
 if(event.target.name!=="answer")return;
 state.answers[questions[state.index][0]]=event.target.value;
 save();notice("");
 if(["migration","projectBudget"].includes(questions[state.index][0])){
   showQuestion();by("question").querySelector("input:checked")?.focus();
 }else updateProgress();
});
by("question").addEventListener("input",event=>{
 if(event.target.dataset.migration){state.migration[event.target.dataset.migration]=event.target.value;save();return;}
 if(event.target.id==="projectBudgetAmount"){state.budgetAmount=event.target.value;save();return;}
 if(event.target.id!=="questionNote")return;
 state.notes[questions[state.index][0]]=event.target.value;
 save();
});
by("question").addEventListener("click",event=>{if(event.target.id==="openCalculator")showCalculator(true);});
by("sections").addEventListener("click",event=>{
 const button=event.target.closest("[data-index]");
 if(button)go(Number(button.dataset.index));
});
by("prev").onclick=()=>{
 const active=activeQuestions(), i=active.indexOf(questions[state.index]);
 if(i>0)go(questions.indexOf(active[i-1]));
};
by("next").onclick=()=>{
 if(!answered(questions[state.index]))return;
 const active=activeQuestions(), i=active.indexOf(questions[state.index]);
 if(i<active.length-1){go(questions.indexOf(active[i+1]));return;}
 if(complete())showResult(true);
 else{go(questions.indexOf(active.find(q=>!answered(q))));notice(t("Completa le domande rimanenti per generare l’architettura."));}
};
by("project").oninput=event=>{state.project=event.target.value;save();if(state.view==="result")showResult();};
by("cloud").onchange=event=>{state.cloud=event.target.value;save();redraw();};
by("biReference").onchange=event=>{state.bi=event.target.value;save();redraw();};
by("exampleButton").onclick=()=>{
 const selected=by("example").value, sample=examples[selected];
 if(!sample){notice(t("Seleziona uno scenario da caricare."));return;}
 if(count()&&!confirm(t("Sostituire le risposte della bozza con questo esempio?")))return;
 const titles={hotel:"Hotel bookings",erp:"ERP replication and BI",iot:"Telemetry and alerts"};
 const enNotes={hotel:{fresh:"Hourly reporting. Confirm the end-to-end freshness target and Power BI refresh latency.",identity:"Sales staff see assigned hotels. Finance can see prices."},erp:{fresh:"15-minute operational P95. Certified BI every morning.",cdc:"Verify log access, connector support and initial snapshot impact."},iot:{fresh:"5-second P95 alerts and hourly BI.",scale:"Average 10,000 events/s. Seven-day retention is an example assumption."}};
 state={...blank(),language,tools:{...state.tools},project:phrase(sample.name,titles[selected]),cloud:sample.cloud,notes:{...phrase(sample.notes,enNotes[selected])},metrics:{...sample.metrics}};
 if(selected==="iot")Object.assign(state.metrics,{eventsDay:"864000000",hours:"24",daily:"",peakMinutes:"15",streamRate:"60"});
 const values=sample.options.split(" ");
 state.answers=Object.fromEntries(questions.slice(0,values.length).map(([id],i)=>[id,values[i]]));
 const isExisting=selected==="erp";
 Object.assign(state.answers,{projectType:isExisting?"existing":"new",stackPreference:isExisting?"":sample.cloud,team:"none",projectBudget:"unknown",placement:"any",driver:{hotel:"sql",erp:"spark",iot:"stream"}[selected],biTool:selected==="hotel"?"powerbi":"auto"});
 if(!isExisting)state.cloud="";
 state.index=questions.indexOf(activeQuestions()[0]);
 setInputs();technologyForm();showQuestion(true);
 notice(phrase("Esempio caricato. Puoi modificare le risposte o generare il risultato.","Example loaded. You can edit the answers or generate the architecture."));
 if(complete()){
   const button=document.createElement("button");
   button.className="secondary example-generate";
   button.textContent=t("Genera risultato dell’esempio");
   button.onclick=()=>showResult(true);
   by("notice").append(" ",button);
 }
};
by("resetAll").onclick=()=>{
 const confirmed=confirm(phrase(
   "Azzerare progetto, stack, risposte, note, tecnologie e calcoli salvati in questo browser?",
   "Reset the project, stack, answers, notes, technologies and calculations saved in this browser?"
 ));
 if(!confirmed)return;
 state={...blank(),language};
 state.index=questions.indexOf(activeQuestions()[0]);
 by("example").value="";
 by("technology").open=false;
 by("sections").innerHTML="";
 by("result").replaceChildren();
 by("calculator").replaceChildren();
 setInputs();
 technologyForm();
 showQuestion(true);
 notice(phrase("Reset completato. Puoi iniziare dalla prima domanda.","Reset complete. You can start from the first question."));
};
by("technology").onchange=event=>{
 const layer=event.target.dataset.tool;
 if(!layer)return;
 state.tools[layer]=event.target.value;save();
 if(state.view==="result")showResult();
 else if(state.view==="calculator")updateCalculator();
};
by("calculator").oninput=event=>{
 const metric=event.target.dataset.metric;
 if(!metric)return;
 state.metrics[metric]=event.target.value;save();updateCalculator();
};
by("questionTab").onclick=()=>{
 if(state.view!=="calculator")return;
 if(state.previousView==="result"&&complete())showResult();
 else showQuestion();
};
by("calculatorTab").onclick=()=>showCalculator(true);
by("language").onchange=event=>{
 language=event.target.value;state.language=language;save();
 localChrome();redraw();
};
if(!restored||!answered(activeQuestions()[0]))state.index=questions.indexOf(activeQuestions()[0]);
setupQuestionHelp();
setupCalculatorHelp();
setInputs();
localChrome();
redraw();
