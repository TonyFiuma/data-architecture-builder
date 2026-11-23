const stacks = {
 gcp:{name:"Google Cloud",obj:"Cloud Storage",sql:"BigQuery",mart:"Looker o Power BI",spark:"Dataproc Serverless per Spark",batch:"BigQuery load jobs",job:"Cloud Run Jobs",connector:"Connettore gestito compatibile",broker:"Pub/Sub",kafka:"Managed Service for Apache Kafka",stream:"Dataflow (Apache Beam)",cdc:"Datastream",archive:"Cloud Storage",catalog:"Knowledge Catalog",meta:"BigLake metastore, se compatibile",rel:"Cloud SQL (PostgreSQL)",kv:"Bigtable, se compatibile con il modello di chiave",doc:"Firestore",event:"BigQuery con ingestione streaming",sqlOps:"Dataform",orches:"Cloud Composer o Workflows",ci:"Cloud Build",iam:"Cloud IAM e Workload Identity Federation",policy:"BigQuery row access policies e masking",vault:"Secret Manager e Cloud KMS",private:"Private Service Connect, dove supportato",hybrid:"Cloud VPN o Cloud Interconnect",monitor:"Cloud Monitoring",fmt:"Iceberg con un motore compatibile"},
 azure:{name:"Azure / Fabric",obj:"ADLS Gen2",sql:"Fabric Warehouse",mart:"Power BI",spark:"Fabric Spark",batch:"Azure Data Factory",job:"Azure Container Apps Jobs",connector:"Azure Data Factory",broker:"Event Hubs",kafka:"Event Hubs con endpoint Kafka dopo test di compatibilità",stream:"Azure Stream Analytics",cdc:"Connettore CDC compatibile o Debezium",archive:"ADLS Gen2",catalog:"Microsoft Purview",meta:"Metadati delle tabelle Fabric",rel:"Azure Database for PostgreSQL",kv:"Azure Cosmos DB con accesso per partition key e ID",doc:"Azure Cosmos DB for NoSQL",event:"Fabric Eventhouse",sqlOps:"Pipeline Fabric o job dbt",orches:"Azure Data Factory",ci:"Azure DevOps o GitHub Actions",iam:"Entra ID, Azure RBAC e identità gestite",policy:"Sicurezza Fabric / Power BI nella superficie di accesso effettiva",vault:"Azure Key Vault",private:"Azure Private Link, dove supportato",hybrid:"VPN Gateway o ExpressRoute con runtime compatibile",monitor:"Azure Monitor",fmt:"Delta Lake con Fabric Lakehouse"},
 aws:{name:"AWS",obj:"Amazon S3",sql:"Amazon Redshift",mart:"Dashboard BI",spark:"AWS Glue Spark o Amazon EMR",batch:"AWS Glue e Redshift COPY",job:"Amazon ECS task schedulati",connector:"AWS Glue con connettore compatibile",broker:"Kinesis Data Streams",kafka:"Amazon MSK",stream:"Managed Service for Apache Flink",cdc:"AWS DMS",archive:"Amazon S3",catalog:"Amazon DataZone",meta:"AWS Glue Data Catalog",rel:"Amazon RDS for PostgreSQL",kv:"Amazon DynamoDB",doc:"Amazon DocumentDB se compatibile con le API richieste",event:"Amazon OpenSearch Service per esplorazione di eventi indicizzati",sqlOps:"Job SQL o dbt",orches:"AWS Step Functions o Amazon MWAA",ci:"AWS CodePipeline o GitHub Actions",iam:"AWS IAM roles e STS",policy:"Lake Formation sul lake e policy native del motore SQL",vault:"AWS Secrets Manager e AWS KMS",private:"VPC endpoints, dove supportati",hybrid:"AWS Site-to-Site VPN o Direct Connect",monitor:"Amazon CloudWatch",fmt:"Apache Iceberg con AWS Glue Data Catalog"},
 databricks:{name:"Azure Databricks",obj:"ADLS Gen2",sql:"Databricks SQL",mart:"Power BI con Databricks SQL",spark:"Azure Databricks Jobs con PySpark",batch:"Auto Loader per file su ADLS",job:"Azure Container Apps Jobs",connector:"Lakeflow Connect dove supportato",broker:"Event Hubs con integrazione compatibile",kafka:"Kafka gestito o Event Hubs con endpoint compatibile",stream:"Spark Structured Streaming",cdc:"Lakeflow Connect se compatibile, oppure Debezium",archive:"ADLS Gen2",catalog:"Unity Catalog",meta:"Unity Catalog",rel:"Azure Database for PostgreSQL",kv:"Azure Cosmos DB con accesso per partition key e ID",doc:"Azure Cosmos DB for NoSQL",event:"Azure Data Explorer o Fabric Eventhouse",sqlOps:"Databricks SQL e Lakeflow Jobs",orches:"Lakeflow Jobs",ci:"Declarative Automation Bundles e CI/CD",iam:"Entra ID, service principal e identità gestite",policy:"Unity Catalog row filters e column masks, dove supportati",vault:"Azure Key Vault",private:"Azure Private Link, dove supportato",hybrid:"VPN Gateway o ExpressRoute con runtime compatibile",monitor:"Databricks system tables e Azure Monitor",fmt:"Delta Lake con Unity Catalog"}
};
const metrics = [
 ["daily","Ingresso medio","GB/giorno","200"],["days","Retention raw","giorni","90"],
 ["factor","Fattore fisico raw","GB fisici / GB logico","0,55"],["copies","Copie raw totali","incluso l’originale","1"],
 ["extra","Spazio extra","GB per altri layer, backup e checkpoint","0"],
 ["input","Input del job","GB per esecuzione","300"],["window","Finestra utile del job","minuti disponibili dopo setup","60"],
 ["peak","Picco eventi","eventi/s","50000"],["size","Dimensione evento","kB/evento","2"],
 ["ram","Picco RAM misurato","GB per macchina o worker, incluso runtime","6"],
 ["cpu","vCPU del benchmark","vCPU per macchina o worker","4"],
 ["workers","Worker del benchmark","Pandas: 1 macchina","2"],
 ["rate","Throughput del benchmark","MB/s end-to-end del gruppo di worker","50"],
 ["margin","Margine capacità","% facoltativa","30"]
];
const numeric = value => {
 const raw=String(value??"").trim().replace(",",".");
 const n=Number(raw);
 return /^\d+(?:\.\d+)?$/.test(raw)&&Number.isFinite(n)&&n>=0?n:null;
};
function sizing(state, batchEngine, continuous){
 const v=Object.fromEntries(metrics.map(([k])=>[k,numeric(state.metrics[k])]));
 const fraction=1+(v.margin??0)/100;
 const rows=[];
 const rawDefaults=["factor","copies"].filter(key=>String(state.metrics[key]??"").trim()==="");
 const storage={daily:v.daily,days:v.days,factor:rawDefaults.includes("factor")?1:v.factor,
   copies:rawDefaults.includes("copies")?1:v.copies,extra:v.extra,raw:null,rawPerCopy:null,rawDefaults};
 const count=(k)=>v[k]>0&&Number.isInteger(v[k]);
 const show=(n)=>new Intl.NumberFormat(language==="en"?"en-GB":"it-IT",{maximumSignificantDigits:6}).format(n);
 const add=(label,value,unit,reason)=> {if(Number.isFinite(value))rows.push({label:t(label),value:show(value)+" "+t(unit),reason:t(reason)});};
 if(v.daily!==null&&v.days>0){
   const raw=v.daily*v.days;
   add("Storage raw logico",raw,"GB","Volume medio giornaliero × giorni di retention. Basato su volume costante.");
   if(storage.factor>0){
     storage.rawPerCopy=raw*storage.factor;
     if(Number.isInteger(storage.copies)&&storage.copies>0)storage.raw=storage.rawPerCopy*storage.copies;
     if(storage.raw!==null&&v.extra!==null)
       add(phrase("Subtotale raw e spazio extra","Raw and extra storage subtotal"),storage.raw+v.extra,"GB",phrase("Raw logico × fattore fisico × copie raw + spazio extra. Le copie sono esplicite e non includono replica interna del provider.","Logical raw × physical factor × raw copies + extra space. Copies are explicit and exclude provider-managed internal redundancy."));
   }
 }
 const min=v.input>0&&v.window>0?v.input*1000/(v.window*60):null;
 const peak=v.peak!==null&&v.size>0?v.peak*v.size/1000:null;
 if(min!==null)add("Throughput batch richiesto",min,"MB/s","GB per esecuzione × 1.000 ÷ secondi della finestra utile. Unità decimali.");
 if(peak!==null)add("Picco sugli eventi",peak,"MB/s","Eventi/s × kB per evento ÷ 1.000, prima di overhead e replica.");
 const benchmark=state.answers.capacity==="benchmark";
 if(benchmark&&v.ram>0&&["spark","pandas"].includes(batchEngine))
   add(batchEngine==="spark"?"RAM indicativa per worker":"RAM indicativa per macchina",v.ram*fraction,"GB","Picco osservato con workload rappresentativo × margine dichiarato.");
 if(benchmark&&count("cpu")&&["spark","pandas"].includes(batchEngine))
   add("Profilo CPU misurato",v.cpu,"vCPU","Configurazione usata nel benchmark per macchina o worker.");
 if(benchmark&&batchEngine==="spark"&&min!==null&&count("workers")&&v.rate>0){
   const workers=Math.ceil(min*fraction*v.workers/v.rate);
   add("Worker Spark ipotetici",workers,"worker","Target batch con margine ÷ throughput per worker osservato. Extrapolazione lineare da verificare con shuffle, I/O, skew e driver separato.");
   if(count("cpu"))add("Compute worker ipotetico",workers*v.cpu,"vCPU","Numero stimato × vCPU per worker. Driver e altri workload esclusi.");
 }
 let action=benchmark?phrase("Riprova il profilo stimato con dataset e concorrenza rappresentativi. Misura I/O, picco RAM, CPU e tempi end-to-end.","Retest the estimated configuration with representative data and concurrency. Measure I/O, peak RAM, CPU and end-to-end times."):phrase("Misura throughput, picco RAM, CPU, spill e skew con carico rappresentativo prima di assegnare vCPU, RAM e worker.","Measure throughput, peak RAM, CPU, spill and skew at representative load before assigning vCPUs, RAM and workers.");
 if(batchEngine==="sql")action+=phrase(" Per SQL gestito prova capacità, query concorrenti e runtime con il modello del servizio."," For managed SQL, test capacity, query concurrency and runtime under the service’s compute model.");
 if(continuous)action+=phrase(" Dimensiona lo streaming separatamente sul picco, sullo stato e sul tempo di recupero dal backlog."," Size streaming separately for peak rates, state and backlog recovery time.");
 return {rows,storage,action:t(action),pandasSlow:benchmark&&batchEngine==="pandas"&&min!==null&&v.rate>0&&v.rate<min,invalid:metrics.some(([key])=>String(state.metrics[key]??"").trim()!==""&&v[key]===null)||["workers","cpu","copies"].some(key=>v[key]!==null&&!count(key))};
}
function design(state){
 const a=state.answers, platform=recommendPlatform(state), stackId=platform.chosen;
 const bi=chooseBi(state,stackId);
 const s=Object.fromEntries(Object.entries(platformStack(stackId,platform.placement)).map(([key,value])=>[key,t(value)]));
 s.mart=bi.key==="none"?phrase("Accesso ai dati pubblicati","Published data access"):bi.name;
 const immediate=["stream","hybrid"].includes(a.fresh), events=a.source==="events";
 const streaming=immediate||a.transform==="stateful";
 const logs=a.cdc==="logs", hasCdc=["append","update","logs","tomb"].includes(a.cdc);
 const lake=["lakehouse","multi"].includes(a.storage)||(dbStacks.includes(stackId)&&["warehouse","dual"].includes(a.storage)), hybrid=a.fresh==="hybrid";
 const ownsData=a.consumer!=="api"||["warehouse","dual","lakehouse","multi"].includes(a.storage);
 const analytic=hybrid||a.consumer==="bi"||a.consumer==="explore"||a.query==="dash"||a.database==="olap";
 const batchPath=!immediate||hybrid||(ownsData&&a.consumer!=="api");
 const toolChoices=selectedTools(state,streaming,batchPath||!streaming,stackId);
 const prefer=resolvePipelinePreferences(state,stackId,toolChoices);
 const tool=key=>toolChoices.find(item=>item.key===key&&item.applies)?.tech;
 if(tool("warehouse"))s.sql=tool("warehouse");
 const separateWarehouse=lake&&analytic&&(Boolean(tool("warehouse"))||snowStacks.includes(stackId));
 s.obj=prefer("raw",s.obj,!streaming||hybrid||lake||["archive","dual"].includes(a.storage)||["replay","dr"].includes(a.recovery)||a.broker==="replay");
 const batchOverride={sql:"sql",pyspark:"spark",pandas:"pandas"}[state.tools.transform];
 const batchEngine=(tool("transform")&&batchOverride)||(a.engine==="auto"?(a.transform==="rel"&&!["heavy","backfill"].includes(a.scale)?"sql":
   a.transform==="python"||["heavy","backfill"].includes(a.scale)?"spark":a.transform==="route"?"route":a.transform==="stateful"?"spark":"sql"):a.engine);
 const nativeProcessing={sql:lake?(stackId==="aws"?"SQL su Iceberg con motore compatibile":stackId==="azure"?"Spark SQL su Fabric Lakehouse":stackId==="gcp"?"BigQuery SQL su tabelle Iceberg compatibili":s.sql):s.sql,spark:s.spark,pandas:phrase("Job Python/Pandas su ","Python/pandas job on ")+s.job,route:s.job}[batchEngine];
 const processing=tool("transform")&&!batchOverride&&state.tools.transform!=="flink"?tool("transform")+(state.tools.transform==="dbt"?" + "+s.sql:""):nativeProcessing;
 const dbModel=a.database==="auto"?(a.query==="event"?"event":a.query==="point"||a.consumer==="api"?"rel":a.consumer==="ml"?"lake":"olap"):a.database;
 const sourceDatabase=prefer("sourceDb",phrase("Database relazionale da identificare","Relational database to identify"),a.source==="db"||hasCdc);
 const database=prefer("serving",{rel:s.rel,kv:s.kv,doc:s.doc,olap:s.sql,event:s.event,lake:s.fmt}[dbModel],
   a.consumer==="api"||a.database!=="auto"&&!["olap","event","lake"].includes(dbModel)||streaming&&a.query==="event",
   supported=>supported.includes(dbModel));
 const source={files:"File su object storage",sftp:"SFTP esterno",rest:"API REST",saas:"Applicazione SaaS",events:"Eventi o webhook",db:sourceDatabase}[a.source];
 const nativeIngress={files:s.batch,sftp:stackId==="aws"?"AWS Transfer Family o connettore SFTP":phrase("Connettore SFTP verso ","SFTP connector to ")+s.obj,rest:s.job,saas:s.connector,events:"Producer o endpoint di ingestione",db:s.connector}[a.source];
 const enterpriseBatch=Object.hasOwn(legacyEtl,state.tools.integration);
 const ingress=tool("integration")&&(!logs||enterpriseBatch)?tool("integration"):nativeIngress;
 const wantsBroker=a.broker!=="none"||events||streaming;
 const routeToBroker=events||!immediate&&a.transform==="stateful"||immediate;
 const useBroker=wantsBroker&&routeToBroker;
 const broker=prefer("broker",a.broker==="kafka"?s.kafka:s.broker,useBroker,
   (_,tech)=>a.broker!=="kafka"||/Kafka|MSK/.test(tech)||tech==="Event Hubs");
 const streamEngine=prefer("stream",tool("transform")&&state.tools.transform==="flink"?tool("transform"):a.transform==="route"?s.job:s.stream,streaming);
 const cdcTech=prefer("cdc",(!enterpriseBatch&&tool("integration"))||s.cdc,logs,
   (_,tech)=>!tech.startsWith("Informatica PowerExchange")||state.tools.sourceDb!=="mariadb");
 const keepRaw=!streaming||hybrid||lake||["archive","dual"].includes(a.storage)||["replay","dr"].includes(a.recovery)||a.broker==="replay";
 const catalog=tool("governance")?(a.catalog==="business"?tool("governance"):[tool("governance"),{meta:s.meta,uc:"Unity Catalog",policy:s.policy}[a.catalog]].join(" + ")):{business:s.catalog,meta:s.meta,uc:"Unity Catalog con workspace Databricks",policy:s.policy}[a.catalog];
 const orchestrator=tool("orchestration")??{sql:s.sqlOps,multi:s.orches,dbx:"Lakeflow Jobs",cicd:s.orches}[a.ops];
 const deployment={
   iac:prefer("iac",host[stackId]==="local"&&a.ops!=="cicd"?"":"Terraform"),
   ci:prefer("ci",({azure:"Azure DevOps (Azure Pipelines)",aws:"AWS CodePipeline",gcp:"Cloud Build"})[host[stackId]]||"GitHub Actions")
 };
 const security={people:s.iam,work:s.iam,rows:s.policy,keys:s.vault}[a.identity];
 const network={region:"Regione approvata per servizi, copie e log",onprem:s.hybrid,private:s.private,retention:"Lifecycle "+s.obj+phrase(" e rimozione coordinata delle copie"," and coordinated copy deletion")}[a.network];
 const recovery={retry:"Retry e finestre idempotenti",replay:s.obj+phrase(" con offset e checkpoint"," with offsets and checkpoints"),dr:"Backup e replica in regioni approvate",dq:s.monitor+phrase(" e ripubblicazione controllata"," and controlled republishing")}[a.recovery];
 const quality={dup:"Chiave univoca e MERGE idempotente",late:s.stream+phrase(" con event time e correzioni"," with event time and corrections"),scd:"SCD2 con date di validità",schema:phrase("Contratti, quarantena in ","Contracts, quarantine in ")+s.obj+phrase(" e riconciliazione"," and reconciliation")}[a.quality];
 const nativeLayout=a.storage==="multi"?phrase("Apache Iceberg e catalogo compatibile","Apache Iceberg and compatible catalog"):lake?s.fmt:{warehouse:s.sql,archive:s.obj,dual:s.obj+" + "+s.sql}[a.storage];
 const format=prefer("format",nativeLayout,lake,(_,tech)=>a.storage!=="multi"||tech==="Apache Iceberg");
 const layout=lake&&format!==nativeLayout?nativeLayout.includes(format)?nativeLayout:format:nativeLayout;
 const chain=(...stages)=>stages.map(([role,tech])=>({role,tech}));
 const dbSource=hasCdc?["Database sorgente",sourceDatabase]:null;
 const cdcStage=hasCdc?[phrase("Acquisizione modifiche","Capture changes"),logs?cdcTech:a.cdc==="tomb"?phrase("Change feed o confronto tra snapshot","Change feed or snapshot comparison"):"Estrazione incrementale"]:null;
 const layerPlan=medallionPlan(state,{lake,separateWarehouse,analytical:analytic,batchPath,keepRaw,services:s,layout,
   processing,orchestrator,ingress,cdc:a.source==="db"?cdcStage?.[1]:null,bi,stackId,model:modelRecommendation(state,analytic)});
 const layered=layerPlan.layers.length>0;
 const rawRole=layered?medallionRoles.bronze:"Raw / replay";
 const origin=[a.source==="db"?"Database sorgente":"Sorgente",source], ingest=["Ingestione",ingress], raw=[rawRole,s.obj];
 const streams=[];
 let separateServing="";
 if(streaming) {
   const streamingSink=a.consumer==="api"
     ?["API o alert",(a.database==="auto"&&!tool("serving"))||dbModel==="olap"?"Consumer operativo dedicato":database]
     :["Serving rapido",a.query==="event"?(tool("serving")||s.event):lake?layout:s.sql];
   if((lake||analytic||["warehouse","dual"].includes(a.storage))&&
      ![layout,s.sql].includes(streamingSink[1])&&a.consumer!=="api")separateServing=streamingSink[1];
   streams.push({label:"Percorso a bassa latenza",nodes:chain(events||!logs?origin:dbSource,logs&&!events?cdcStage:ingest,["Broker",broker],["Stream processing",streamEngine],streamingSink)});
 }
 if(batchPath||!streaming){
   const curated=["Tabelle curate",lake?layout:analytic||a.storage==="warehouse"||a.storage==="dual"?s.sql:s.obj];
   const serving=["Consumo",hybrid?s.mart:a.consumer==="api"?database:a.consumer==="ml"?"Data science su dati governati":a.consumer==="explore"?(bi.key==="none"?"Query SQL governate":bi.name):s.mart];
   const publication=layered?layerPlan.layers.slice(1).map(({role,store})=>[role,store]):
     [curated,...(separateWarehouse?[[phrase("Mart analitici","Analytical marts"),s.sql]]:[])];
   const start=hybrid&&useBroker?[events||!logs?origin:dbSource,logs&&!events?cdcStage:ingest,["Broker",broker]]:
     (useBroker&&(!logs||events))?[origin,ingest,["Broker",broker]]:
     a.source==="db"&&logs?[dbSource,cdcStage]:[origin,ingest];
   streams.push({label:streaming?(hybrid?"Percorso analitico e riconciliazione":phrase("Percorso analitico e rielaborazione","Analytics and reprocessing path")):useBroker?"Ingestione eventi e pubblicazione batch":"Percorso batch o microbatch",nodes:chain(...start,...(keepRaw?[raw]:[]),["Elaborazione",processing],...publication,serving)});
 } else if(keepRaw){
   streams.push({label:"Archivio eventi e replay",nodes:chain(events||!logs?origin:dbSource,logs&&!events?cdcStage:ingest,["Broker",broker],raw,["Ripristino","Replay, checksum e riconciliazione"])});
 }
 if(dbSource&&(a.source!=="db"?(events||!streaming||!logs):!logs&&a.cdc==="tomb"))streams.push({label:"Acquisizione cambi del database",nodes:chain(dbSource,cdcStage,...(keepRaw?[raw]:[]),["Applicazione cambi","Upsert, ordine per chiave e gestione delete"],[layered?medallionRoles.silver:"Destinazione",lake?layout:s.sql])});
 if(a.database!=="auto"&&!["olap","event"].includes(dbModel)&&a.consumer!=="api"){
   separateServing=separateServing&&separateServing!==database?separateServing+" + "+database:database;
   streams.push({label:"Serving operativo aggiuntivo",nodes:chain(["Dataset pubblicato",lake?layout:analytic||a.storage==="warehouse"||a.storage==="dual"?s.sql:s.obj],["Serving operativo",database])});
 }
 const capacity=envelope(state,tool("transform")&&!batchOverride&&state.tools.transform!=="flink"?"external":batchEngine,streaming);
 const nodes=streams.flatMap(path=>path.nodes);
 const usesWarehouse=nodes.some(({role,tech})=>tech===s.sql&&["Tabelle curate","Destinazione","Serving rapido","Consumo",medallionRoles.silver,medallionRoles.gold,phrase("Mart analitici","Analytical marts")].includes(role));
 const curatedObjectStore=nodes.some(({role,tech})=>role==="Tabelle curate"&&tech!==s.sql||lake&&tech===layout);
 const dedicatedStores=nodes.filter(({role,tech})=>tech!==s.sql&&tech!==layout&&(
   ["Serving rapido","Serving operativo"].includes(role)||
   (a.consumer==="api"&&tech===database&&["API o alert","Consumo"].includes(role))
 )).map(node=>node.tech);
 const storagePlan=planStorage(state,capacity,{
   raw:nodes.some(node=>node.role===rawRole)?s.obj:"",
   curated:curatedObjectStore?(lake?(layout.includes("Fabric Lakehouse")?"OneLake · "+layout:s.obj+" · "+layout):s.obj):"",
   warehouse:usesWarehouse?(s.sql==="Databricks SQL"?s.obj+phrase(" · tabelle Delta interrogate da Databricks SQL"," · Delta tables queried through Databricks SQL"):
     ["Trino","Apache Impala"].includes(s.sql)?s.obj+phrase(" · tabelle interrogate da "," · tables queried through ")+s.sql:s.sql):"",
   serving:[...new Set(dedicatedStores)].join(" + "),
   broker:useBroker?broker:"",
   checkpoint:streaming
 });
 const recommendations=architectureRecommendation(state,s,{lake,separateWarehouse,separateServing,analytical:analytic,streaming,batchEngine,layout});
 const fit={projectType:s.name,stackPreference:s.name,projectBudget:projectBudgetAmount(state)||phrase("Stima dei costi ricorrenti","Recurring cost estimate"),approved:s.name,team:stackName(a.team),placement:s.name,driver:s.name,biTool:bi.name,migration:stackName(platform.opportunity)||s.name,consumer:hybrid?s.mart:a.consumer==="api"?database:a.consumer==="ml"?s.fmt:a.consumer==="explore"?(bi.key==="none"?s.sql:bi.name):s.mart,
 fresh:streaming?streamEngine+(hybrid?" + "+orchestrator:""):orchestrator,source:ingress,cdc:cdcStage?.[1],scale:a.scale==="peaks"?broker:a.scale==="backfill"?s.spark+phrase(" con risorse isolate"," with isolated resources"):a.scale==="heavy"?s.spark:s.sql,
 storage:layout,transform:streaming?streamEngine:processing,engine:batchPath?processing:"Percorso batch da validare come supporto",broker:useBroker?broker:a.broker==="none"&&!streaming?"Landing e retry schedulati":broker+phrase(" da validare"," to be validated"),quality,query:a.query==="point"?database:a.query==="event"?(tool("serving")||s.event):a.query==="occasional"?(stackId==="aws"?"Amazon Athena":s.sql):s.sql,
 database,catalog,identity:security,network,ops:a.ops==="cicd"?[orchestrator,deployment.iac,deployment.ci].filter(Boolean).join(" + "):orchestrator,recovery,budget:a.budget==="exit"?"Parquet o Iceberg e Terraform, secondo compatibilità":a.budget==="fixed"?s.sql+" o "+s.spark:s.orches+phrase(" + servizi gestiti"," + managed services"),capacity:capacity.action};
 const flags=[];
 if(platform.conflict)flags.push({title:phrase("Requisito di collocazione","Hosting requirement"),detail:phrase("Conferma regione, vincoli di rete e piattaforma prima del rilascio.","Confirm region, network requirements and platform before rollout.")});
 if((platform.placement==="local"||stackId==="cloudera")&&["qlik","quicksight","looker"].includes(bi.key))flags.push({title:bi.name,detail:phrase("Verifica se il servizio BI può trasferire o conservare dati fuori dal data center.","Check whether the BI service can move or store data outside the data center.")});
 if(a.consumer==="bi"&&bi.key==="none")flags.push({title:phrase("Report e dashboard","Reports and dashboards"),detail:phrase("Le risposte richiedono dashboard ma non indicano uno strumento BI. Chiarisci come saranno pubblicate.","Answers require dashboards but no BI tool was selected. Clarify how they will be published.")});
 for(const option of toolChoices)if(!option.applies)flags.push({title:option.tech,detail:option.warning});
 if(tool("transform")&&state.tools.transform!=="flink"&&a.engine!=="auto")flags.push({title:tool("transform"),detail:phrase("La preferenza tecnologica prevale sul motore batch selezionato. Confronta i due percorsi nel benchmark.","The technology preference overrides the selected batch engine. Compare both paths in the benchmark.")});
 if(tool("warehouse")&&separateWarehouse)flags.push({title:s.sql+" + Lakehouse",detail:phrase("Conferma come pubblicare o replicare i mart tra Lakehouse e warehouse.","Confirm how marts are published or replicated between the lakehouse and warehouse.")});
 const check=(test,title,detail)=>{if(test)flags.push({title:t(title),detail:t(detail)});};
 check(immediate&&!events&&!logs,"Verificare la latenza della sorgente","Un file o un’API schedulata può impedire un end-to-end di pochi secondi. Conferma push, CDC continuo o rivedi il requisito.");
 check(streaming&&a.broker==="none","Streaming senza broker selezionato",phrase("Il disegno propone "+broker+" come componente da confermare. Verifica supporto e latenze di una sorgente diretta alternativa.","The design proposes "+broker+". Verify support and latency if you consider a direct-source alternative."));
 check(a.broker==="buffer"&&immediate,"Buffer di minuti e obiettivo in secondi","Applica il buffering al ramo di archivio. Verifica un percorso a bassa latenza separato.");
 check(wantsBroker&&!useBroker,"Broker fuori dal percorso principale","La sorgente selezionata non richiede un broker per il flusso batch proposto. Usalo solo per una sorgente eventi o un flusso parallelo.");
 check((a.catalog==="uc"||a.ops==="dbx")&&!dbStacks.includes(stackId),"Componente Databricks esplicito","Conferma la disponibilità di un workspace Databricks sul cloud scelto, oppure riallinea catalogo e deploy allo stack principale.");
 check(stackId==="open"||stackId==="cloudera",phrase("Responsabilità operative dello stack","Stack operations"),phrase("Conferma chi gestisce cluster, catalogo, broker, credenziali, backup e aggiornamenti. Verifica i componenti disponibili nell’edizione scelta.","Confirm who operates clusters, catalog, broker, credentials, backup and upgrades. Verify components available in the chosen edition."));
 check(snowStacks.includes(stackId)&&lake,phrase("Ruolo di Snowflake nel lakehouse","Snowflake’s role in the lakehouse"),phrase("Conferma come Snowflake legge o pubblica le tabelle Iceberg nelle regioni e con i cataloghi selezionati.","Confirm how Snowflake reads or publishes Iceberg tables in your chosen regions and catalogs."));
 check(a.cdc==="tomb","Delete da verificare senza log","Conferma tombstone, change feed o confronto snapshot. Un watermark di aggiornamento da solo non rileva cancellazioni fisiche.");
 check(capacity.pandasSlow,"Il benchmark Pandas supera la finestra","Il throughput misurato è inferiore al target batch. Riduci l’input per job, ottimizza o confronta PySpark.");
 check(capacity.invalid,"Alcuni valori numerici vanno corretti","Usa numeri non negativi e interi positivi per vCPU, worker e copie. I campi incompleti non producono stime.");
 check(a.query==="point"&&["olap","event"].includes(dbModel),"Serving puntuale da provare","Misura il p95 sul percorso reale. Un database operativo separato può essere necessario.");
 check(!batchPath&&a.engine!=="auto"&&a.engine!=="spark","Il motore batch non guida il ramo continuo","La scelta batch resta registrata come supporto per rielaborazioni o pipeline separate.");
 const decisions=groups.flatMap(([, ,items])=>items).filter(q=>activePlatformQuestion(q[0],state)).map(localQuestion).map(([id,question,en,options])=>{
   const chosen=options.find(option=>option[0]===a[id]);
   if(!chosen)return null;
   return {id,question,en,answer:chosen[1],pattern:chosen[2],reason:chosen[3]||({approved:platformExplanation(state,{platform,bi}).rows[0],stackPreference:platformExplanation(state,{platform,bi}).rows[0],team:phrase("Le competenze esistenti contano per tempi, formazione e gestione del servizio.","Existing skills affect delivery time, training and operations."),biTool:bi.reason})[id]||phrase("La proposta riflette le esigenze dichiarate per questo punto.","The proposal reflects the stated requirements for this decision."),technology:t(fit[id]||"Acquisizione secondo sorgente"),technologyReason:technologyReason(t(fit[id]||""),toolChoices),note:state.notes[id]||""};
 }).filter(Boolean);
 const technologies=preferenceReport({
   sourceDb:a.source==="db"||hasCdc?sourceDatabase:"",
   integration:a.source==="db"&&logs?cdcTech:logs&&tool("integration")===cdcTech?tool("integration"):ingress,cdc:cdcStage?.[1],raw:keepRaw?s.obj:"",broker:useBroker?broker:"",
   transform:batchPath?processing:"",stream:streaming?streamEngine:"",format:lake?format:"",
   warehouse:usesWarehouse?s.sql:"",serving:dedicatedStores.join(" + "),bi:bi.name,governance:catalog,orchestration:orchestrator,...deployment
 },toolChoices,bi,state);
 return {platform,bi,recommendations,storagePlan,layerPlan,technologies,deployment,stack:s.name,streams:streams.map(path=>({...path,label:t(path.label),nodes:path.nodes.map(node=>({role:t(node.role),tech:t(node.tech)}))})),catalog:t(catalog),orchestrator:t(orchestrator),security:t(security),capacity,flags,decisions,toolChoices};
}
