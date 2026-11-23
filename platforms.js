const platformNames={
 gcp:"Google Cloud",azure:"Azure / Fabric",databricks:"Azure Databricks",aws:"AWS",
 dbaws:"Databricks su AWS",dbgcp:"Databricks su Google Cloud",
 snaws:"Snowflake su AWS",snazure:"Snowflake su Azure",sngcp:"Snowflake su Google Cloud",
 cloudera:"Cloudera on-premises",open:"Spark + Iceberg + Trino"
};
const biNames={powerbi:"Power BI",qlik:"Qlik Cloud Analytics",tableau:"Tableau",looker:"Looker",quicksight:"Amazon QuickSight",superset:"Apache Superset",metabase:"Metabase",none:""};
const stackName=id=>language==="en"?platformNames[id]?.replace(" su "," on "):platformNames[id];
const makeBiName=id=>biNames[id]||phrase("Nessuno strumento BI previsto","No BI tool required");
const platformOption=(key,it,en,reasonIt="",reasonEn="")=>[key,it,reasonIt,reasonIt,en,reasonEn,reasonEn];
function platformQuestions(){
 const catalog=Object.keys(platformNames).map(id=>platformOption(id,platformNames[id],platformNames[id].replace(" su "," on ")));
 return [
  ["projectType","È un progetto nuovo o stai intervenendo su una piattaforma esistente?","Is this a new project or are you changing an existing platform?",[
   platformOption("new","Nuovo progetto, senza uno stack già in uso per questo lavoro","New project with no stack already in use for this work","Parti dai requisiti e indica una preferenza, se c’è.","Start from the requirements and indicate a preference if you have one."),
   platformOption("existing","Progetto già avviato o intervento su una piattaforma esistente","Existing project or change to an existing platform","Verifica cosa si può riutilizzare e quali costi comporterebbe un cambio.","Check what can be reused and what a change would cost.")]],
  ["stackPreference","Hai una preferenza per lo stack del nuovo progetto?","Do you have a preferred stack for the new project?",[
   platformOption("auto","Lascia che Data Architecture Builder proponga lo stack","Let Data Architecture Builder recommend the stack","L’app confronta le opzioni in base a vincoli, competenze e requisiti.","The app compares options using constraints, skills and requirements."),
   ...catalog]],
  ["projectBudget","Che budget mensile hai per la piattaforma dati in produzione?","What is the monthly budget for the production data platform?",[
   platformOption("cap","Abbiamo un tetto di spesa da rispettare","We have a spending cap","Verifica il costo della configurazione rispetto al tetto prima di approvarla.","Validate the configuration cost against the cap before approving it."),
   platformOption("target","Abbiamo un budget indicativo","We have a target budget","Usa la cifra come riferimento per confrontare le configurazioni.","Use the figure as a baseline for comparing configurations."),
   platformOption("lean","Vogliamo contenere i costi, ma la cifra è da definire","We want to keep costs down, with the figure still to be set","Confronta costi a consumo, licenze e tempo di gestione.","Compare usage charges, licenses and operational effort."),
   platformOption("unknown","Il budget è ancora da definire","The budget is still to be set","Concorda un riferimento economico prima di scegliere la configurazione definitiva.","Agree on a budget before choosing the final configuration.")]],
  ["approved","Il cliente usa già uno stack dati approvato? Se sì, quale?","Does the customer already have an approved data stack? If so, which one?",[
   platformOption("none","La scelta è aperta","The choice is open"),...catalog,
   platformOption("other","Sì, uno stack diverso da quelli elencati","Yes, a stack outside this list","Indicalo nella nota: il risultato sarà una proposta da confrontare, non una migrazione già decisa.","Name it in the note. The result will be a proposal to compare, not an agreed migration.")]],
  ["team","Con quali tecnologie il team lavora già in produzione?","Which technologies does the team already operate in production?",[
   platformOption("none","Nessuna preferenza o competenza prevalente","No dominant skills or preference"),...catalog,
   platformOption("other","Un altro stack","Another stack","Indicalo nella nota per tenerne conto nel piano di adozione.","Name it in the note to inform the adoption plan.")]],
  ["placement","Dove possono risiedere dati ed elaborazioni?","Where can data and compute run?",[
   platformOption("any","Il cloud è ammesso e il provider è da scegliere","Cloud is allowed and the provider is open","Confronta servizi, regione, costi e gestione.","Compare services, region, costs and operations."),
   platformOption("local","Dati ed elaborazioni devono restare on-premises","Data and compute must stay on-premises","Valuta piattaforme gestite nel data center e verifica anche dove risiede il BI.","Evaluate platforms run in the data center and verify where BI runs."),
   ...[["gcp","Google Cloud"],["azure","Azure"],["aws","AWS"]].map(([id,name])=>platformOption(id,"Solo "+name,name+" only","Vincolo di collocazione dichiarato dal cliente.","Customer-mandated hosting constraint."))]],
  ["driver","Quale requisito deve pesare di più nella scelta dello stack?","Which requirement should weigh most in choosing the stack?",[
   platformOption("sql","Warehouse SQL gestito e poca infrastruttura da amministrare","Managed SQL warehouse with minimal infrastructure to run","Valuta BigQuery o Snowflake. Verifica costo e concorrenza delle query.","Evaluate BigQuery or Snowflake. Validate query cost and concurrency."),
   platformOption("microsoft","Integrazione con Power BI, Fabric e servizi Microsoft","Integration with Power BI, Fabric and Microsoft services","Verifica quanto contano OneLake, identità e costi di capacità.","Check how important OneLake, identity and capacity costs are."),
   platformOption("spark","PySpark, lakehouse Delta e governance condivisa","PySpark, Delta lakehouse and shared governance","Valuta Databricks sul cloud compatibile con i vincoli.","Evaluate Databricks on a cloud that fits the constraints."),
   platformOption("stream","Streaming con servizi AWS già integrati o approvati","Streaming with AWS services already integrated or approved","Confronta Kinesis e Flink con alternative sullo stesso requisito di latenza.","Compare Kinesis and Flink with alternatives at the same latency target."),
   platformOption("open","Formati aperti, portabilità e controllo del runtime","Open formats, portability and control over the runtime","Valuta Spark, Iceberg e Trino; quantifica chi li gestirà.","Evaluate Spark, Iceberg and Trino; quantify who will operate them."),
   platformOption("private","Piattaforma dati gestita nel data center","Data platform operated in the data center","Valuta Cloudera o componenti aperti gestiti dal team.","Evaluate Cloudera or open components operated by the team."),
   platformOption("neutral","Nessuna priorità prevalente","No dominant priority","Valuta le altre risposte e chiedi una verifica prima di decidere.","Use the other answers and validate before choosing.")]],
  ["biTool","Quale strumento userete per report e dashboard?","Which tool will you use for reporting and dashboards?",[
   platformOption("auto","Lascia che l’app proponga uno strumento","Let the app recommend a tool","Valuta licenze, competenze, connettori e modalità di pubblicazione.","Consider licenses, skills, connectors and deployment."),
   ...Object.keys(biNames).filter(x=>x!=="none").map(id=>platformOption(id,biNames[id],biNames[id],"Verifica connettore, licenze, permessi e refresh.","Check the connector, licenses, permissions and refresh.")),
   platformOption("none","Non servono report o dashboard","No reports or dashboards are needed")]],
  ["migration","Ci sono dati economici per valutare un cambio di stack?","Is there financial evidence for changing stacks?",[
   platformOption("unknown","Non ancora: manteniamo la base esistente quando possibile","Not yet: retain the existing base where possible","Prima di raccomandare un cambio, quantifica migrazione, costi e benefici.","Quantify migration, costs and benefits before recommending a change."),
   platformOption("estimate","Sì, possiamo stimare costi e benefici","Yes, we can estimate costs and benefits","Usa la stessa valuta e includi trasferimenti, nuove licenze, formazione e rischio operativo.","Use the same currency and include transfers, new licenses, training and operational risk.")]]
 ];
}
function installPlatformQuestions(){
 const additions=platformQuestions();
 const order=["projectType","approved","stackPreference","team","placement","driver","projectBudget","biTool","migration"];
 const newIds=["projectType","stackPreference","projectBudget"];
 questions.push(...additions.filter(([id])=>!newIds.includes(id)),...additions.filter(([id])=>newIds.includes(id)));
 groups.unshift(["Scelta della piattaforma","platform",order.map(id=>additions.find(q=>q[0]===id))]);
 for(const [id,it,en,options] of additions){
   enQuestions[id]=[en,...options.map(row=>[row[4],row[5],row[6]].join("|"))];
   questionHelp[id]=[it,options.find(row=>row[2])?.[2]||it,en,options.find(row=>row[5])?.[5]||en,id==="biTool"?"BI|Power BI|Looker|Qlik|Tableau|QuickSight|Apache Superset|Metabase":"GCP|AWS|Microsoft Fabric|Databricks|Snowflake|Cloudera|Apache Spark|Apache Iceberg|Trino"];
 }
 const platformTerms=questionHelp.stackPreference[4];
 questionHelp.projectType=[questionHelp.projectType[0],"La risposta stabilisce se partire dai requisiti del nuovo progetto o verificare cosa si può riutilizzare della piattaforma attuale.",questionHelp.projectType[2],"This determines whether to start from the new project's requirements or assess what can be reused from the current platform.","Stack"];
 questionHelp.stackPreference=[questionHelp.stackPreference[0],"Se indichi uno stack, l’app lo propone se è compatibile con il vincolo di collocazione. Con la scelta automatica confronta gli stack in base alle risposte.",questionHelp.stackPreference[2],"If you specify a stack, the app proposes it when it meets the hosting constraint. Automatic selection compares stacks based on your answers.",platformTerms];
 questionHelp.projectBudget=[questionHelp.projectBudget[0],"Indica il budget ricorrente di produzione. Chiedi a chi lo approva se comprende storage, elaborazione, rete, licenze BI e gestione. I costi una tantum di migrazione si valutano a parte.",questionHelp.projectBudget[2],"Enter the recurring production budget. Ask the budget owner whether it covers storage, compute, networking, BI licenses and operations. One-time migration costs are assessed separately.","Budget|TCO"];
 Object.assign(glossary,{
  Stack:{it:"Insieme di servizi e tecnologie usati per costruire e gestire una piattaforma dati.",en:"The set of services and technologies used to build and run a data platform."},
  Budget:{it:"Somma che il cliente prevede o autorizza per il progetto. Qui si considera la spesa ricorrente mensile di produzione.",en:"The amount the customer plans or authorizes. Here it means recurring monthly production spend."},
  TCO:{it:"Total Cost of Ownership, il costo totale di utilizzo e gestione su un periodo, incluse licenze, infrastruttura e lavoro operativo.",en:"Total cost of ownership over a period, including licenses, infrastructure and operational effort."},
  Qlik:{it:"Piattaforma per dashboard e analisi associativa. Verifica modalità cloud, licenze e connettore.",en:"A reporting and associative analytics platform. Verify deployment, licenses and connectors."},
  Tableau:{it:"Strumento BI per esplorazione visuale e dashboard, con diverse modalità di distribuzione.",en:"A BI tool for visual exploration and dashboards, with several deployment options."},
  QuickSight:{it:"Servizio BI gestito su AWS, da verificare per sorgenti e capacità richieste.",en:"Managed AWS BI service. Verify source support and capacity."},
  "Apache Superset":{it:"Strumento BI open source per creare grafici e dashboard sopra motori SQL.",en:"Open-source BI for charts and dashboards over SQL engines."},
  Metabase:{it:"Strumento BI per consultazione e report, disponibile in diverse modalità di gestione.",en:"BI for exploration and reports with different deployment options."},
  Cloudera:{it:"Piattaforma dati utilizzabile nel data center del cliente; i servizi disponibili dipendono dall’edizione.",en:"A data platform deployable in a customer data center. Available services depend on the edition."},
  Trino:{it:"Motore SQL distribuito che interroga varie sorgenti, incluse tabelle Iceberg tramite connettori.",en:"A distributed SQL engine that queries different sources, including Iceberg tables through connectors."}
 });
}
const host={gcp:"gcp",aws:"aws",azure:"azure",databricks:"azure",dbaws:"aws",dbgcp:"gcp",snaws:"aws",snazure:"azure",sngcp:"gcp",cloudera:"local",open:"portable"};
const dbStacks=["databricks","dbaws","dbgcp"];
const snowStacks=["snaws","snazure","sngcp"];
function recommendPlatform(state){
 const a=state.answers;
 const isNew=a.projectType==="new";
 const fixed=isNew?"":state.cloud;
 const existing=a.projectType==="existing"&&!fixed&&Object.hasOwn(platformNames,a.approved)?a.approved:"";
 const preferred=isNew&&Object.hasOwn(platformNames,a.stackPreference)?a.stackPreference:"";
 const placement=a.placement||"any";
 const allowed=id=>placement==="any"||host[id]===placement||(id==="open"&&placement);
 const scores=Object.fromEntries(Object.keys(platformNames).map(k=>[k,0]));
 const details=Object.fromEntries(Object.keys(platformNames).map(k=>[k,[]]));
 const boost=(ids,weight,it,en)=>ids.forEach(k=>{scores[k]+=weight;details[k].push(phrase(it,en));});
 if(!fixed&&Object.hasOwn(scores,a.team)) {
   boost([a.team],4,"Il team sa già gestire questo stack in produzione.","The team already operates this stack in production.");
   if(["aws","azure","gcp"].includes(host[a.team]))boost(Object.keys(host).filter(k=>k!==a.team&&host[k]===host[a.team]),1,"Riutilizza competenze sullo stesso cloud.","Reuses skills on the same cloud.");
 }
 const drivers={
  sql:[["gcp",...snowStacks],"Warehouse SQL gestito coerente con il carico analitico.","Managed SQL warehouse fits the analytical workload."],
  microsoft:[["azure"],"L’integrazione Microsoft e OneLake è una priorità dichiarata.","Microsoft and OneLake integration is a stated priority."],
  spark:[dbStacks,"PySpark, Delta Lake e Unity Catalog sono il requisito prevalente.","PySpark, Delta Lake and Unity Catalog are the dominant requirement."],
  stream:[["aws","dbaws"],"I servizi AWS per i flussi di eventi sono già integrati o approvati.","AWS streaming services are already integrated or approved."],
  open:[["open"],"Spark, Iceberg e Trino rispondono al requisito di portabilità.","Spark, Iceberg and Trino fit the portability requirement."],
  private:[["cloudera","open"],"La piattaforma può essere gestita nel data center.","The platform can be operated in the data center."]
 };
 if(drivers[a.driver]){const [ids,it,en]=drivers[a.driver];boost(ids,6,it,en);}
 if(a.engine==="spark"||a.storage==="lakehouse")boost([...dbStacks,"open","cloudera"],2,"Le risposte indicano elaborazione distribuita o lakehouse.","Answers indicate distributed processing or a lakehouse.");
 if(a.storage==="multi"||a.budget==="exit")boost(["open","cloudera"],2,"La portabilità o la lettura da più motori ha valore.","Portability or multi-engine access matters.");
 if(a.engine==="sql"||a.transform==="rel")boost(["gcp","azure","aws",...snowStacks],1,"Le trasformazioni SQL sono centrali.","SQL transformations are central.");
 if(a.fresh==="stream"||a.fresh==="hybrid"||a.source==="events")boost(["aws","gcp","azure",...dbStacks,"open","cloudera"],2,"Il progetto richiede un percorso per gli eventi.","The project requires an event path.");
 if(a.catalog==="uc"||a.ops==="dbx")boost(dbStacks,3,"Unity Catalog o Lakeflow è richiesto nelle risposte.","Unity Catalog or Lakeflow is requested in the answers.");
 if((state.bi||a.biTool)==="powerbi")boost(["azure","databricks"],1,"Power BI è già indicato: restano da verificare connettore e licenze.","Power BI is specified: verify connector and licensing.");
 if(a.projectBudget==="lean"||a.projectBudget==="cap")boost(["gcp","azure","aws",...dbStacks,...snowStacks],1,
  "Con l’attenzione ai costi, la valutazione favorisce leggermente i servizi gestiti per lo sforzo operativo. Il costo complessivo va verificato sul carico reale.",
  "With cost control in focus, scoring gives managed services a small advantage for operational effort. Verify total cost on the actual workload.");
 const order=Object.keys(scores).sort((x,y)=>scores[y]-scores[x]);
 const eligible=order.filter(allowed);
 const best=eligible[0]||"gcp";
 const topTies=eligible.filter(id=>scores[id]===scores[best]);
 const metrics=state.migration??{};
 const value=key=>numeric(metrics[key]);
 const baseline=value("baseline"),future=value("future"),cost=value("cost"),years=value("years");
 const quantified=Boolean(existing&&a.migration==="estimate"&&baseline!==null&&future!==null&&cost!==null&&years>0&&eligible.includes(a.candidate)&&a.candidate!==existing);
 const gain=quantified?(baseline-future)*years-cost:null;
 const payback=quantified&&baseline>future?cost/(baseline-future):null;
 const justified=quantified&&gain>0;
 const opportunity=justified?a.candidate:"";
 const continuity=existing||preferred;
 const chosen=fixed||(continuity&&allowed(continuity)?continuity:best);
 const rival=(opportunity!==chosen?opportunity:"")||eligible.find(x=>x!==chosen)||order.find(x=>x!==chosen);
 const conflict=Boolean((fixed||continuity)&&!allowed(fixed||continuity));
 const mode=fixed?"fixed":existing&&chosen===existing?"reuse":existing?"constraint":preferred&&chosen===preferred?"preferred":preferred?"preferenceConflict":"recommend";
 return {chosen,rival,eligible,scores,details,existing,preferred,mode,conflict,gain,payback,opportunity,quantified,tied:topTies.length>1&&!fixed&&(!continuity||!allowed(continuity)),unknownExisting:a.projectType==="existing"&&!fixed&&a.approved==="other",placement};
}
function platformExplanation(state,result){
 const p=result.platform,current=stackName(p.chosen),alt=stackName(p.rival),chosenReasons=p.details[p.chosen];
 const text={
  fixed:phrase("Hai indicato esplicitamente lo stack di riferimento. Il disegno parte da questa scelta.","You explicitly set the reference stack. The design starts from this choice."),
  reuse:phrase("La priorità è riutilizzare lo stack già adottato dal cliente. Questo conserva integrazioni e competenze e riduce lo sforzo di migrazione.","The customer’s existing stack takes priority. This preserves integrations and skills and reduces migration effort."),
  constraint:phrase("Il vincolo di collocazione esclude lo stack esistente dal disegno proposto. Verifica il vincolo con il cliente prima di pianificare una migrazione.","The hosting constraint rules out the existing stack for this design. Confirm the constraint before planning migration."),
  preferred:phrase("Lo stack preferito per il nuovo progetto è compatibile con la collocazione richiesta e guida il disegno.","The preferred stack for the new project meets the hosting requirement and drives the design."),
  preferenceConflict:phrase("La preferenza per "+stackName(p.preferred)+" è incompatibile con la collocazione richiesta. Il disegno propone la prima alternativa ammessa in base alle risposte.","The preference for "+stackName(p.preferred)+" conflicts with the hosting requirement. The design proposes the top eligible alternative based on your answers."),
  recommend:phrase("Stack proposto in base ai vincoli e alle risposte, da validare con un confronto tecnico ed economico.","Proposed from constraints and answers, subject to technical and financial validation.")
 };
 const rows=[text[p.mode],stackFit(p.chosen)];
 if(p.conflict&&p.mode!=="preferenceConflict")rows.push(phrase("C’è un conflitto tra la collocazione richiesta e lo stack esistente o selezionato. Chiariscilo prima di implementare il disegno.","The requested location conflicts with the existing or selected stack. Resolve this before implementation."));
 if(p.unknownExisting)rows.push(phrase("Lo stack esistente è fuori catalogo: confronta la proposta con quello indicato nella nota prima di considerare un cambio.","The existing stack is outside the catalog. Compare the proposal with the stack recorded in the note before considering a change."));
 if(p.tied)rows.push(phrase("Più stack hanno una valutazione simile. Il primo è un’ipotesi di lavoro, da verificare con una prova comparativa.","Multiple stacks rate similarly. The first is a working assumption to validate with a comparison."));
 if(chosenReasons.length)rows.push(...chosenReasons);
 if(alt){
   const different=p.details[p.rival].filter(reason=>!chosenReasons.includes(reason));
   const alternativeReason=different.join(" ")||phrase("Nessun vantaggio specifico emerge dalle risposte. Confronta latenza, connettori e costi sui carichi reali.","No distinct advantage emerges from the answers. Compare latency, connectors and cost on real workloads.");
   rows.push(phrase("Alternativa considerata · ","Alternative considered · ")+alt+". "+alternativeReason);
 }
 const comparesAwsAzure=["aws","azure"].includes(p.chosen)||["aws","azure"].includes(p.rival);
 if(comparesAwsAzure){
   const other=p.chosen==="aws"?"azure":p.chosen==="azure"?"aws":"";
   if(other){
     const rule=p.mode==="fixed"?phrase("Piattaforma indicata dall’utente.","Platform selected by the user."):p.mode==="reuse"?phrase("Continuità con lo stack esistente.","Continuity with the existing platform."):(p.mode==="constraint"||p.mode==="preferenceConflict")?phrase("Prevale il vincolo di collocazione.","The hosting requirement takes priority."):p.mode==="preferred"?phrase("È lo stack preferito per il nuovo progetto.","It is the preferred stack for the new project."):!p.eligible.includes(other)?phrase("L’alternativa è fuori dal vincolo di collocazione.","The alternative fails the hosting requirement."):p.scores[p.chosen]===p.scores[other]?phrase("Le risposte non danno un vantaggio decisivo. Serve un confronto.","Answers show no decisive advantage. Benchmark both."):(p.details[p.chosen].join(" ")||phrase("Valuta i requisiti del progetto sopra.","Review the project requirements above."));
     rows.push(current+" vs "+stackName(other)+" · "+rule);
   }
   rows.push(phrase("AWS e Azure/Fabric · AWS combina S3, Kinesis, Flink e motori analitici secondo il disegno. Azure/Fabric privilegia l’integrazione con Power BI, OneLake e servizi Microsoft. Nel tuo caso il confronto va letto insieme ai vincoli e alle priorità indicati sopra.","AWS and Azure/Fabric · AWS composes S3, Kinesis, Flink and analytics engines as needed. Azure/Fabric emphasizes integration with Power BI, OneLake and Microsoft services. Read this trade-off alongside your constraints and priorities above."));
 }
 const budget=projectBudgetExplanation(state);
 if(budget)rows.push(budget);
 if(p.opportunity){
   const number=new Intl.NumberFormat(language==="en"?"en-GB":"it-IT",{maximumFractionDigits:2});
   rows.push(phrase("Cambio da valutare · ","Migration worth evaluating · ")+stackName(p.opportunity)+phrase(". Beneficio netto stimato ",". Estimated net benefit ")+number.format(p.gain)+phrase(" nella valuta inserita. Rientro stimato in "," in the input currency. Estimated payback ")+number.format(p.payback)+phrase(" anni. Prima di approvare la migrazione, confronta latenza, connettori, sicurezza e costi su dati rappresentativi, e verifica il ripristino."," years. Before approving a migration, compare latency, connectors, security and costs on representative data, and verify recovery."));
   if(p.chosen===p.existing)rows.push(phrase("Il diagramma mantiene lo stack esistente mentre valuti l’alternativa.","The diagram retains the existing stack while you evaluate the alternative."));
 }else if(p.existing)rows.push(p.quantified?phrase("La stima non mostra un beneficio netto positivo nell’orizzonte indicato.","The estimate shows no positive net benefit over the selected horizon."):phrase("Mancano prove economiche sufficienti per suggerire di cambiare uno stack compatibile.","There is insufficient financial evidence to suggest changing a compatible stack."));
 return {title:current,rows};
}
function platformStack(id,placement){
 const platform=host[id], base=stacks[["gcp","aws","azure"].includes(platform)?platform:"gcp"];
 if(Object.hasOwn(stacks,id))return {...stacks[id],name:stackName(id)};
 const shared={...base,name:stackName(id)};
 if(dbStacks.includes(id)){
   return {...shared,sql:"Databricks SQL",spark:"Lakeflow Jobs · PySpark",batch:"Databricks Auto Loader",connector:"Lakeflow Connect",stream:"Spark Structured Streaming",cdc:base.cdc,
     catalog:"Unity Catalog",meta:"Unity Catalog",fmt:"Delta Lake",sqlOps:"Databricks SQL + Lakeflow Jobs",orches:"Lakeflow Jobs",ci:"Declarative Automation Bundles",policy:"Unity Catalog",mart:id==="dbaws"?"Amazon QuickSight":id==="dbgcp"?"Looker":"Power BI"};
 }
 if(snowStacks.includes(id))return {...shared,sql:"Snowflake",sqlOps:"Snowflake Tasks",stream:base.stream,fmt:"Apache Iceberg + Snowflake (compatibilità da verificare)",mart:platform==="azure"?"Power BI":platform==="aws"?"Amazon QuickSight":"Looker"};
 const cloudStorage={gcp:"Cloud Storage",azure:"ADLS Gen2",aws:"Amazon S3"};
 const local=placement==="local"||id==="cloudera";
 const obj=id==="cloudera"?"HDFS":cloudStorage[placement]||"Object storage compatibile S3";
 const fmt=local&&id==="cloudera"?"Apache Iceberg + Hive Metastore (versione da verificare)":"Apache Iceberg + REST Catalog";
 const sql=id==="cloudera"?"Apache Impala":"Trino";
 return {
   name:stackName(id),obj,archive:obj,sql,mart:"Apache Superset",fmt,
   spark:id==="cloudera"?"Cloudera Spark / PySpark":"Apache Spark / PySpark",
   job:"Python su runtime gestito dal team",connector:"Airbyte o connettore da validare",batch:"Apache Spark",broker:"Apache Kafka",kafka:"Apache Kafka",
   stream:"Spark Structured Streaming",cdc:"Debezium / Kafka Connect",catalog:id==="cloudera"?"Apache Atlas":"OpenMetadata",meta:id==="cloudera"?"Hive Metastore":"Iceberg REST Catalog",rel:"PostgreSQL",
   kv:"Apache Cassandra (modello per chiave)",doc:"MongoDB",event:sql,sqlOps:"Apache Airflow + "+sql,orches:"Apache Airflow",ci:"GitLab CI o GitHub Actions",
   iam:phrase("Identità aziendale + ruoli di servizio","Enterprise identity + service roles"),policy:id==="cloudera"?"Apache Ranger":phrase("Controlli di accesso Trino e permessi dello storage","Trino access control and storage permissions"),
   vault:"Vault",private:phrase("Rete privata e TLS","Private networking and TLS"),hybrid:phrase("VPN e percorsi di rete privati","VPN and private network paths"),monitor:"Prometheus + Grafana"
 };
}
function chooseBi(state,id){
 const fixed=state.bi;
 const selected=fixed||state.answers.biTool;
 const defaults={gcp:"looker",azure:"powerbi",databricks:"powerbi",aws:"quicksight",dbaws:"quicksight",dbgcp:"looker",snaws:"tableau",snazure:"powerbi",sngcp:"tableau",cloudera:"superset",open:"superset"};
 const needs=Boolean(fixed&&fixed!=="none")||["bi","explore"].includes(state.answers.consumer)||state.answers.fresh==="hybrid"||state.answers.query==="dash"||(selected&&selected!=="auto"&&selected!=="none");
 const key=selected==="none"||!needs?"none":selected&&selected!=="auto"?selected:defaults[id];
 const specific={
  powerbi:["Verifica connettore e modalità Import o DirectQuery, tempi di refresh, identità e licenze.","Check connector and Import or DirectQuery mode, refresh times, identity and licenses."],
  qlik:["Verifica connettore Qlik, ricarica, permessi e residenza del servizio.","Check Qlik connector, reload schedule, permissions and service residency."],
  tableau:["Verifica connessione live o estratti, licenze e governance.","Check live connections or extracts, licenses and governance."],
  looker:["Verifica connettore, modello LookML, identità e costi delle query.","Check connector, LookML model, identity and query costs."],
  quicksight:["Verifica sorgente supportata, scelta tra SPICE e query diretta e aggiornamenti.","Check supported source, SPICE versus direct query and refresh."],
  superset:["Verifica driver SQL, identità, ruoli e capacità del team di gestire l’applicazione.","Verify SQL driver, identity, roles and the team's ability to operate it."],
  metabase:["Verifica driver SQL, permessi e piano di gestione.","Check SQL driver, permissions and operations plan."]
 };
 const reason=key==="none"?phrase("Il progetto non ha un requisito BI esplicito; i dati restano accessibili attraverso il percorso previsto.","The project has no explicit BI requirement; data remains available through the selected delivery path."):
 (fixed?phrase("Strumento indicato in configurazione. ","Tool set in project setup. "):
 selected&&selected!=="auto"?phrase("Strumento indicato nelle risposte. ","Tool selected in the questionnaire. "):
 phrase("Proposta coerente con la piattaforma; confrontala con strumenti già in uso. ","A platform-aligned proposal; compare it with tools already in use. "))+phrase(...specific[key]);
 return {key,name:makeBiName(key),reason};
}
function activePlatformQuestion(id,state){
 const type=state.answers.projectType;
 if(id==="approved")return type==="existing"&&!state.cloud;
 if(id==="stackPreference")return type==="new";
 if(id==="team")return type==="new"||(type==="existing"&&!state.cloud);
 if(id==="biTool"&&state.bi)return false;
 if(id==="migration")return type==="existing"&&!state.cloud&&Object.hasOwn(platformNames,state.answers.approved);
 return true;
}
function migrationInputs(state){
 if(state.answers.migration!=="estimate")return "";
 const values=[["baseline","Costo annuo attuale","Current annual cost"],["future","Costo annuo alternativo","Alternative annual cost"],["cost","Costo una tantum della migrazione","One-time migration cost"],["years","Anni considerati","Years considered"]];
 return '<div class="metrics migration-inputs"><label>'+esc(phrase("Stack alternativo da confrontare","Alternative stack to compare"))+'<select id="candidateStack"><option value="">'+esc(phrase("Seleziona l’alternativa","Choose alternative"))+'</option>'+Object.keys(platformNames).filter(id=>id!==state.answers.approved).map(id=>'<option value="'+id+'"'+(state.answers.candidate===id?" selected":"")+'>'+esc(stackName(id))+'</option>').join("")+'</select></label>'+values.map(([id,it,en])=>'<label>'+esc(phrase(it,en))+'<input inputmode="decimal" data-migration="'+id+'" value="'+esc(state.migration?.[id]??"")+'"></label>').join("")+'</div>';
}

function projectBudgetAmount(state){
 if(!["cap","target"].includes(state.answers.projectBudget))return "";
 const amount=numeric(state.budgetAmount);
 return amount===null?"":new Intl.NumberFormat(language==="en"?"en-GB":"it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(amount)+phrase(" al mese"," per month");
}
function projectBudgetExplanation(state){
 const amount=projectBudgetAmount(state);
 const validate=phrase(" Stima storage, compute, traffico, licenze BI e gestione prima di confermare la configurazione."," Estimate storage, compute, network traffic, BI licenses and operations before confirming the configuration.");
 switch(state.answers.projectBudget){
  case "cap": return (amount?phrase("Tetto di spesa dichiarato · ","Stated spending cap · ")+amount+".":phrase("È previsto un tetto di spesa. Chiedi al cliente di confermare l’importo.","A spending cap applies. Ask the customer to confirm the amount."))+validate;
  case "target": return (amount?phrase("Budget indicativo · ","Target budget · ")+amount+".":phrase("Il budget è indicativo. Chiedi al cliente di confermare l’importo.","The budget is indicative. Ask the customer to confirm the amount."))+validate;
  case "lean": return phrase("La priorità è contenere i costi. Confronta tariffe a consumo e costo operativo complessivo prima di scegliere il dimensionamento.","Cost control is a priority. Compare usage-based charges and total operating cost before choosing capacity.");
  case "unknown": return phrase("Il budget è da definire. Concorda il perimetro di spesa e confronta i costi delle configurazioni candidate.","The budget is still open. Agree on what it covers and compare the costs of candidate configurations.");
  default: return "";
 }
}
function projectBudgetInput(state){
 if(!["cap","target"].includes(state.answers.projectBudget))return "";
 return '<div class="metrics"><label>'+esc(phrase("Importo mensile in euro (facoltativo)","Monthly amount in euros (optional)"))+
  '<input id="projectBudgetAmount" type="number" min="0" step="0.01" inputmode="decimal" value="'+esc(state.budgetAmount??"")+'"></label></div>';
}
