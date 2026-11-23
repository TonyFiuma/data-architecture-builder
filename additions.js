const slideNumbers={consumer:2,fresh:3,source:4,cdc:5,scale:6,storage:7,transform:8,broker:9,quality:10,query:11,catalog:12,identity:13,network:14,ops:15,recovery:16,budget:17};
const legacyEtl={
 powercenter:{
   name:"Informatica PowerCenter",
   orchestration:"Informatica PowerCenter Workflow Manager",
   batch:["Riutilizza mapping e sessioni sull’Integration Service. Verifica connettori, licenze, accesso alla destinazione e finestra batch.","Reuse mappings and sessions on the Integration Service. Check connectors, licenses, target access and the batch window."],
   schedule:["Pianifica workflow e dipendenze delle sessioni sull’Integration Service. Per task esterni verifica il trigger o lo scheduler aziendale.","Schedule workflows and session dependencies on the Integration Service. For external tasks, validate the trigger or enterprise scheduler."]
 },
 talend:{
   name:"Qlik Talend (Talend Studio)",
   orchestration:"Talend Administration Center",
   batch:["Usa job Talend con componenti e connessioni riutilizzabili. Verifica componenti, runtime e versione disponibili.","Use Talend jobs with reusable components and connections. Check the available components, runtime and version."],
   schedule:["Pianifica i job con Job Conductor dove disponibile nell’edizione installata. Configura il JobServer e verifica retry e dipendenze.","Schedule jobs with Job Conductor where available in the installed edition. Configure the JobServer and verify retries and dependencies."]
 },
 datastage:{
   name:"IBM DataStage",
   orchestration:"IBM DataStage (sequenze di job)",
   batch:["Usa job DataStage per connettere ed elaborare i dati. Valida runtime, connettori e parallelismo con il carico reale.","Use DataStage jobs to connect and process data. Validate the runtime, connectors and parallelism on the actual workload."],
   schedule:["Coordina le dipendenze dei job con le sequenze supportate dalla versione DataStage in uso e prova restart e monitoraggio.","Coordinate job dependencies using the sequences supported by the DataStage version in use and test restarts and monitoring."]
 }
};
const legacyBatchOptions=Object.entries(legacyEtl).map(([id,tool])=>[id,tool.name,tool.name]);
const legacyScheduleOptions=Object.entries(legacyEtl).map(([id,tool])=>[id,tool.orchestration,
 id==="datastage"?"IBM DataStage (job sequences)":tool.orchestration]);
const alternatives={
 integration:["Integrazione e replica","Integration and replication",[
  ["native","Servizi dello stack","Stack-native services"],
  ["idmc","Informatica IDMC · CDI / CDIR","Informatica IDMC · CDI / CDIR"],
  ["adf","Azure Data Factory","Azure Data Factory"],["python","Job Python","Python job"],["fivetran","Fivetran","Fivetran"],["airbyte","Airbyte","Airbyte"],["debezium","Debezium / Kafka Connect","Debezium / Kafka Connect"],...legacyBatchOptions]],
 transform:["Trasformazione e qualità","Transformation and quality",[
  ["native","Motore scelto nel questionario","Engine selected in the questionnaire"],
  ["cdi","Informatica Cloud Data Integration (CDI)","Informatica Cloud Data Integration (CDI)"],
  ["dbt","dbt Core / dbt Cloud","dbt Core / dbt Cloud"],["sql","SQL nel motore dati","SQL in the data engine"],["pyspark","PySpark","PySpark"],["pandas","Python / Pandas","Python / pandas"],["duckdb","DuckDB · singolo nodo","DuckDB · single node"],...legacyBatchOptions]],
 warehouse:["Warehouse analitico","Analytical warehouse",[
  ["native","Warehouse dello stack","Stack-native warehouse"],["snowflake","Snowflake","Snowflake"],["bigquery","BigQuery","BigQuery"],
  ["redshift","Amazon Redshift","Amazon Redshift"],["fabric","Fabric Warehouse","Fabric Warehouse"]]],
 governance:["Catalogo aziendale","Business catalog",[
  ["native","Catalogo dello stack","Stack-native catalog"],
  ["cdgc","Informatica Cloud Data Governance and Catalog (CDGC)","Informatica Cloud Data Governance and Catalog (CDGC)"],
  ["openmetadata","OpenMetadata","OpenMetadata"],["collibra","Collibra Data Catalog","Collibra Data Catalog"]]],
 orchestration:["Orchestrazione","Orchestration",[
  ["native","Orchestrazione dello stack","Stack-native orchestration"],["airflow","Apache Airflow","Apache Airflow"],["adf","Azure Data Factory","Azure Data Factory"],["lakeflow","Lakeflow Jobs","Lakeflow Jobs"],["idmc","Informatica IDMC taskflows","Informatica IDMC taskflows"],...legacyScheduleOptions]]
};
const calculatorGroups=[
 ["Eventi e traffico","Events and traffic",[
  ["eventsDay","Eventi al giorno","Events per day","events/day","864000000"],
  ["size","Dimensione media evento","Average event size","kB/event","2"],
  ["hours","Ore attive al giorno","Active hours per day","h","24"],
  ["peak","Eventi al secondo al picco","Peak events per second","events/s","50000"],
  ["peakMinutes","Durata del picco","Peak duration","min","15"],
  ["streamRate","Velocità di elaborazione misurata","Measured consumer capacity","MB/s","60"]]],
 ["Storage","Storage",[
  ["daily","Volume giornaliero in ingresso","Known daily input","GB/day","200"],
  ["days","Conservazione dei dati originali","Raw retention","days","90"],
  ["factor","Rapporto tra spazio occupato e volume originale","Physical raw factor","physical GB / logical GB","0,55"],
  ["copies","Copie raw totali","Total raw copies","copies","1"],
  ["curatedGb","Tabelle curate nel data lake o lakehouse","Curated tables in the data lake or lakehouse","GB","500"],
  ["warehouseGb","Tabelle e mart nel warehouse","Warehouse tables and marts","GB","300"],
  ["servingGb","Store di serving dedicati, totale","Dedicated serving stores, total","GB","100"],
  ["extra","Spazio extra per staging, checkpoint o backup","Extra space for staging, checkpoints or backups","GB","0"]]],
 ["Batch e benchmark","Batch and benchmark",[
  ["input","Dati per esecuzione","Data per run","GB","300"],
  ["window","Finestra utile dopo il setup","Usable window after startup","min","60"],
  ["ram","RAM massima usata per macchina o worker","Peak RAM per machine or worker","GB","6"],
  ["cpu","vCPU per macchina o worker","vCPU per machine or worker","vCPU","4"],
  ["workers","Worker nel benchmark Spark","Workers in Spark benchmark","workers","2"],
  ["rate","Throughput end-to-end misurato","Measured end-to-end throughput","MB/s","50"],
  ["margin","Margine sulle risorse","Capacity headroom","%","30"]]]
];
function envelope(state,engine,streaming){
 const input={...state.metrics}, rows=[];
 const get=key=>numeric(input[key]);
 const format=value=>new Intl.NumberFormat(language==="en"?"en-GB":"it-IT",{maximumSignificantDigits:7}).format(value);
 const add=(label,value,unit,reason)=>{if(Number.isFinite(value))rows.push({label,value:format(value)+" "+unit,reason});};
 const f=(it,en)=>phrase(it,en);
 const events=get("eventsDay"), size=get("size"), hours=get("hours")??24;
 const hoursValid=hours>0&&hours<=24;
 const avg=events!==null&&hoursValid?events/(hours*3600):null;
 const avgRate=avg!==null&&size>0?avg*size/1000:null;
 const eventVolume=events!==null&&size>0?events*size/1000000:null;
 const peak=get("peak"), peakRate=peak!==null&&size>0?peak*size/1000:null;
 const peakMinutes=get("peakMinutes"), consumer=get("streamRate");
 const backlogGb=peakRate!==null&&peakMinutes>0&&consumer!==null?Math.max(0,peakRate-consumer)*peakMinutes*60/1000:null;
 if(avg!==null)add(f("Eventi medi al secondo","Average events per second"),avg,"events/s",f("Eventi al giorno ÷ secondi delle ore attive. Il valore predefinito è 24 ore.","Daily events ÷ seconds in active hours. Defaults to 24 hours."));
 if(eventVolume!==null){
   add(f("Volume giornaliero degli eventi","Daily event volume"),eventVolume,"GB/day",f("Eventi al giorno × kB/evento ÷ 1.000.000.","Daily events × kB/event ÷ 1,000,000."));
   if(String(input.daily??"").trim()==="")input.daily=eventVolume.toLocaleString("en-US",{useGrouping:false,maximumFractionDigits:15});
 }
 if(avgRate!==null)add(f("Throughput medio","Average throughput"),avgRate,"MB/s",f("Eventi medi/s × kB/evento ÷ 1.000.","Average events/s × kB/event ÷ 1,000."));
 if(backlogGb!==null){
   add(f("Backlog accumulato al picco","Backlog accumulated during peak"),backlogGb,"GB",f("Differenza tra picco e capacità consumer × durata del picco.","Peak less consumer capacity × peak duration."));
   if(backlogGb>0&&avgRate!==null&&consumer>avgRate)add(f("Tempo per recuperare il backlog","Backlog recovery time"),backlogGb*1000/(consumer-avgRate)/60,"min",f("Ipotesi di ritorno al tasso medio dopo il picco.","Assumes traffic returns to the average rate after the peak."));
 }
 const calculated=sizing({...state,metrics:input},engine,streaming);
 const notes=[];
 if(calculated.storage.raw!==null&&calculated.storage.rawDefaults.length)
   notes.push(f("Per i campi raw lasciati vuoti si assume fattore fisico 1 o una sola copia, secondo il campo mancante.","Blank raw fields default to a physical factor of 1 or a single copy, depending on the missing field."));
 if(!hoursValid)notes.push(f("Le ore attive devono essere maggiori di zero e al massimo 24.","Active hours must be above zero and at most 24."));
 if(peak!==null&&avg!==null&&peak<avg)notes.push(f("Il picco indicato è inferiore alla media nelle ore attive.","The entered peak is lower than the active-hours average."));
 if(peakRate!==null&&peakMinutes>0&&consumer!==null&&peakRate>consumer&&avgRate!==null&&consumer<=avgRate)notes.push(f("Il consumer non recupera il backlog al tasso medio indicato.","The consumer cannot clear the backlog at the entered average rate."));
 if(eventVolume!==null&&get("daily")!==null)notes.push(f("Lo storage usa il GB/giorno dichiarato. Il volume eventi è mostrato a parte.","Storage uses the entered GB/day. The event-derived volume is shown separately."));
 if(calculated.invalid)notes.push(f("Controlla i valori numerici. Copie, vCPU e worker richiedono interi positivi.","Check the numeric inputs. Copies, vCPUs and workers require positive integers."));
 return {...calculated,backlogGb,eventBasedDaily:eventVolume!==null&&String(state.metrics.daily??"").trim()==="",rows:[...rows,...calculated.rows],notes};
}
const vendorNames={
 idmc:"Informatica IDMC",cdi:"Informatica Cloud Data Integration (CDI)",cdgc:"Informatica Cloud Data Governance and Catalog (CDGC)",fivetran:"Fivetran",airbyte:"Airbyte",debezium:"Debezium / Kafka Connect",dbt:"dbt",flink:"Apache Flink",duckdb:"DuckDB",snowflake:"Snowflake",openmetadata:"OpenMetadata",collibra:"Collibra Data Catalog",airflow:"Apache Airflow"
};
function selectedTools(state,streaming,batch,stackId){
 const a=state.answers,x=state.tools??{}, choices=[];
 const azure=host[stackId]==="azure"||(stackId==="open"&&a.placement==="azure");
 const record=(key,label,tech,it,en,applies=true,warning)=>{choices.push({key,role:label,tech,reason:phrase(it,en),applies,warning});};
 if(x.integration&&x.integration!=="native"){
   const isDbCdc=a.cdc==="logs";
   const isPush=a.source==="events";
   const tool=x.integration;
   const legacy=legacyEtl[tool];
   const name=legacy?.name||(tool==="idmc"?(isDbCdc?"Informatica Cloud Data Ingestion and Replication (CDIR)":"Informatica Cloud Data Integration (CDI)"):({adf:"Azure Data Factory",python:phrase("Job Python","Python job")}[tool]||vendorNames[tool]));
   const applies=legacy?!isPush&&batch&&!(isDbCdc&&a.source==="db"):tool==="debezium"?isDbCdc:
     tool==="adf"?azure&&!isPush&&!isDbCdc:tool==="python"?!isPush&&!isDbCdc:!isPush||isDbCdc;
   record("integration",phrase("Integrazione e replica","Integration and replication"),name,...(legacy?.batch??["Valuta il connettore, il runtime, la frequenza, il contratto di schema e il supporto di sorgente e destinazione. Per CDC verifica log, delete e snapshot.","Verify the connector, runtime, sync cadence, schema contract, and source and destination support. For CDC, verify logs, deletes and snapshots."]),applies,legacy&&isDbCdc&&a.source==="db"?
     phrase("L’ingestione dalla sorgente usa i log. Imposta il connettore nella voce CDC da log. Puoi usare questo strumento per la trasformazione batch.","Source ingestion reads the logs. Choose a connector in Log-based CDC. This tool can still handle batch transformation."):
     phrase("Il flusso selezionato non usa questo connettore come ingresso principale.","The selected flow does not use this connector as its primary ingress."));
 }
 if(x.transform&&x.transform!=="native"){
   const tool=x.transform, applies=tool==="flink"?streaming:batch;
   const legacy=legacyEtl[tool];
   const tech=legacy?.name||{sql:"SQL",pyspark:"PySpark",pandas:phrase("Python / Pandas","Python / pandas")}[tool]||vendorNames[tool];
   const explanations={
     cdi:["Le mapping e i task CDI possono gestire integrazione e trasformazioni supportate. Verifica connettore, runtime e finestra.","CDI mappings and tasks can handle supported integrations and transformations. Check the connector, runtime and window."],
     dbt:["dbt esegue trasformazioni e test nel motore SQL tramite un adapter compatibile.","dbt runs transformations and tests in the SQL engine via a compatible adapter."],
     flink:["Flink gestisce finestre, stato e checkpoint su stream. Verifica sink, ritardi e ripartenze.","Flink handles streaming windows, state and checkpoints. Verify sinks, lateness and recovery."],
     sql:["Esegui join, filtraggio e aggregazioni nel motore dati.","Run joins, filters and aggregates in the data engine."],
     pyspark:["Distribuisce elaborazione e join. Misura shuffle e skew.","Distribute processing and joins. Measure shuffle and skew."],
     pandas:["Verifica che dati e intermedi entrino in memoria entro la finestra.","Check that data and intermediate results fit into memory within the processing window."],
     duckdb:["DuckDB usa SQL in-process su una singola macchina. Verifica RAM, disco di spill e parallelismo.","DuckDB runs in-process SQL on one machine. Check RAM, spill disk and parallelism."]
   };
   record("transform",phrase("Trasformazione","Transformation"),tech,...(legacy?.batch??explanations[tool]),applies,phrase("La fase batch o streaming richiesta da questo strumento non è attiva.","The batch or streaming stage required by this tool is not active."));
 }
 if(x.warehouse&&x.warehouse!=="native"){
   const options={snowflake:["Snowflake",!["local","portable"].includes(host[stackId])],
     bigquery:["BigQuery",host[stackId]==="gcp"],redshift:["Amazon Redshift",host[stackId]==="aws"],fabric:["Fabric Warehouse",azure]};
   const [name,compatible]=options[x.warehouse];
   const analytics=a.consumer==="bi"||a.consumer==="explore"||a.query==="dash"||a.database==="olap"||a.storage==="warehouse"||a.storage==="dual"||a.fresh==="hybrid";
   record("warehouse",phrase("Warehouse analitico","Analytical warehouse"),name,"Il warehouse separa serving analitico e compute per i carichi SQL. Verifica regione, formato delle tabelle e integrazioni di caricamento.","The warehouse provides analytical serving and compute for SQL workloads. Check region, table format and load integrations.",analytics&&compatible,phrase("Il warehouse richiesto non è adatto allo stack o al percorso analitico. Il risultato usa la selezione automatica.","The requested warehouse does not fit the selected stack or analytical path. The result uses the automatic selection."));
 }
 if(x.governance&&x.governance!=="native")record("governance",phrase("Catalogo aziendale","Business catalog"),vendorNames[x.governance],"Aggiunge discovery, classificazione e lineage dove i connettori lo supportano. I permessi effettivi restano nel motore o nello storage.","Adds discovery, classification and lineage where connectors support them. Enforce actual access in the engine or storage.");
 if(x.orchestration&&x.orchestration!=="native"){
   const options={
     idmc:["Informatica IDMC taskflows",true,"Coordina i task Informatica e le dipendenze supportate.","Coordinate Informatica tasks and supported dependencies."],
     airflow:["Apache Airflow",true,"Modella dipendenze, retry e backfill in un DAG.","Model dependencies, retries and backfills in a DAG."],
     adf:["Azure Data Factory",azure,"Pianifica e monitora le dipendenze delle pipeline Data Factory.","Schedule and monitor Data Factory pipeline dependencies."],
     lakeflow:["Lakeflow Jobs",dbStacks.includes(stackId),"Coordina task e dipendenze nel workspace Databricks.","Coordinate tasks and dependencies in the Databricks workspace."]
   };
   const legacy=legacyEtl[x.orchestration];
   const [name,applies,it,en]=legacy?[phrase(legacy.orchestration,x.orchestration==="datastage"?"IBM DataStage (job sequences)":legacy.orchestration),true,...legacy.schedule]:options[x.orchestration];
   record("orchestration",phrase("Orchestrazione","Orchestration"),name,it,en,applies,
     phrase("L’orchestratore scelto richiede un ambiente compatibile. Il risultato usa lo stack automatico.","This orchestrator requires a compatible environment. The result uses the automatic stack."));
 }
 return choices;
}
function referenceSlide(id,title,options){
 const slide=slideNumbers[id];
 const caption=phrase("Slide di riferimento","Reference slide");
 const expanded=phrase("Ingrandisci la slide","Enlarge slide");
 const summary=options.map(([,answer,pattern,reason])=>{
   const details=[...new Set([pattern,reason].filter(Boolean))].map(text=>/[.!?]$/.test(text)?text:text+".").join(" ");
   return '<li><strong>'+esc(answer)+'</strong>'+(details?'<div>'+esc(details)+'</div>':'')+'</li>';
 }).join("");
 const visual=slide?'<a href="slides/slide-'+slide+'.png" target="_blank" rel="noopener" aria-label="'+esc(expanded)+'"><img src="slides/slide-'+slide+'.png" alt="'+esc(title)+'" width="1024" height="576"></a><p class="caption">'+esc(phrase("Slide originale in inglese. Selezionala per ingrandirla.","Select the original slide to enlarge it."))+'</p>':'<div class="mini-slide"><h3>'+esc(title)+'</h3><ul>'+summary+'</ul></div>';
 by("reference").innerHTML='<section class="reference-card" aria-label="'+esc(caption)+'"><h3>'+esc(slide?caption:phrase("Slide di approfondimento","Supplementary slide"))+'</h3>'+visual+(slide?'<details><summary>'+esc(phrase("Leggi la spiegazione in italiano","Read the decision guide"))+'</summary><ul>'+summary+'</ul></details>':"")+'</section>';
}
function technologyForm(){
 const root=by("technology"), open=root.open;
 const entries={...alternatives,...Object.fromEntries(Object.entries(pipelinePreferences).map(([key,[it,en,options]])=>[key,[it,en,
   [["native","Automatico","Automatic"],...Object.entries(options).map(([id,[name]])=>[id,name,name])]
 ]]))};
 const order=Object.keys(preferenceLabels).filter(key=>key!=="bi");
 root.innerHTML='<summary>'+esc(phrase("Preferenze tecnologiche per fase","Technology preferences by stage"))+'</summary>'+
   '<p class="caption">'+esc(phrase("Scegli le tecnologie che vuoi usare. Le voci su Automatico seguono lo stack e le risposte del progetto. Lo strumento BI si sceglie sopra.","Choose the technologies you want to use. Automatic selections follow the project stack and questionnaire answers. Choose the BI tool above."))+'</p>'+
   '<div class="technology-grid">'+order.map(key=>{
     const [it,en,options]=entries[key];
     return '<label>'+esc(phrase(it,en))+'<select data-tool="'+key+'">'+options.map(([value,it,en])=>
       '<option value="'+value+'"'+((state.tools[key]??"native")===value?" selected":"")+'>'+esc(value==="native"?phrase("Automatico","Automatic"):phrase(it,en))+'</option>'
     ).join("")+'</select></label>';
   }).join("")+'</div>';
 root.open=open;
}
function renderCalculator(){
 const root=by("calculator");
 root.innerHTML='<div class="result-header"><div><h2 tabindex="-1" id="calculatorTitle">'+esc(phrase("Calcoli di dimensionamento","Back-of-the-envelope calculator"))+'</h2><p>'+esc(phrase("Compila i dati noti. I risultati si aggiornano subito e confluiscono nell’architettura e nel Word.","Enter the values you know. Results update immediately and carry over into the architecture and Word report."))+'</p></div></div><div class="calculator-fields">'+calculatorGroups.map(([it,en,items])=>'<fieldset><legend>'+esc(phrase(it,en))+'</legend><div class="metrics">'+items.map(([key,it,en,unit,example])=>{
   const label=phrase(it,en), id="capacity-"+key;
   const help=capacityInfoButton("data-metric-info",key,label);
   return '<div class="metric-field"><div class="metric-label"><label for="'+id+'">'+esc(label)+'</label>'+help+'</div><small id="'+id+'-unit">'+esc(unit)+'</small><input id="'+id+'" aria-describedby="'+id+'-unit" inputmode="decimal" maxlength="24" data-metric="'+key+'" placeholder="'+esc(phrase("Es. ","E.g. ")+(language==="en"?example.replace(",","."):example))+'" value="'+esc(state.metrics[key]??"")+'"></div>';
 }).join("")+'</div></fieldset>').join("")+'</div><p class="caption">'+esc(phrase("Per stimare RAM, vCPU e worker, seleziona «Benchmark» nella domanda sul dimensionamento e inserisci le misure ottenute con il motore batch da valutare.","For RAM, vCPU and worker estimates, choose “Representative benchmark” in the sizing question and enter measurements from the batch engine you plan to use."))+'</p><div id="calculated" aria-live="polite"></div>'+calculatorGlossary();
 updateCalculator();
}
function capacityHtml(result,showHelp=false){
 const rows=result.rows.length?'<div class="stats">'+result.rows.map(row=>'<div class="stat"><div class="metric-label"><span class="stat-label">'+esc(row.label)+'</span>'+(showHelp?capacityInfoButton("data-result-info","",row.label):"")+'</div><strong>'+esc(row.value)+'</strong><small>'+esc(row.reason)+'</small></div>').join("")+'</div>':'<p class="caption">'+esc(phrase("Inserisci dati numerici per vedere le stime.","Enter numerical inputs to see sizing estimates."))+'</p>';
 return rows+(result.notes??[]).map(note=>'<p class="caption">'+esc(note)+'</p>').join("")+'<p class="caption">'+esc(result.action)+'</p>';
}
function updateCalculator(){
 const available=complete()?design(state).capacity:envelope(state,state.answers.engine,state.answers.fresh==="stream"||state.answers.fresh==="hybrid");
 by("calculated").innerHTML=capacityHtml(available,true);
}
