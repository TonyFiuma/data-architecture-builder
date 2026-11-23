function modelRecommendation(state, analytical){
 const a=state.answers;
 const noMart=!analytical&&a.consumer==="api";
 const shape=a.modelShape;
 if(noMart&&a.query!=="event")return {
   title:phrase("Modello operativo per accesso per chiave o transazioni","Operational model for keyed access or transactions"),
   reason:phrase("Definisci la chiave e le entità in funzione delle chiamate API. Verifica latenza p95, vincoli e consistenza sullo store operativo proposto.","Define keys and entities from the API access patterns. Validate p95 latency, constraints and consistency on the proposed operational store.")
 };
 if(shape==="hierarchy")return {
   title:phrase("Snowflake schema","Snowflake schema"),
   reason:phrase("Normalizza le gerarchie condivise nelle dimensioni. Per esempio, collega il fatto a DimProdotto e DimProdotto a DimCategoria. Governa i livelli una sola volta, definisci la granularità del fatto e misura il costo dei join. Esponi una vista appiattita al BI se semplifica il modello semantico.","Normalize shared dimension hierarchies. For example, join the fact to DimProduct and DimProduct to DimCategory. Govern each level once, define the fact grain and measure join cost. Expose a flattened BI view if it simplifies the semantic model.")
 };
 if(shape!=="single"&&(a.consumer==="bi"||a.query==="dash"||a.fresh==="hybrid"||a.quality==="scd"))return {
   title:"Star schema",
   reason:phrase("Separa fatti e dimensioni per riusare metriche e filtri nei report. Definisci prima la granularità, ad esempio una riga per prenotazione o evento, poi usa dimensioni come data, cliente e prodotto. ","Separate facts and dimensions to reuse metrics and filters across reports. Define the grain first, such as one row per booking or event, then use dimensions such as date, customer and product. ")+(a.quality==="scd"?phrase("Collega ogni fatto alla versione SCD2 valida alla data dell’evento.","Link each fact to the SCD2 version valid at event time."):phrase("Verifica che i join rispettino la granularità e che le aggregazioni non contino due volte gli stessi fatti.","Check that joins preserve the grain and aggregations count each fact once."))
 };
 return {
   title:phrase("Tabella unica denormalizzata (tabellone)","Single denormalized wide table"),
   reason:phrase("Pubblica un dataset a granularità unica, ad esempio una riga per evento o per entità e data per il ML. Raggruppa nella stessa vista o tabella gli attributi usati insieme per semplificare il consumo. Verifica duplicazione, costo delle scansioni e aggiornamento degli attributi.","Publish a dataset at a single grain, such as one row per event or per entity and date for ML. Group attributes used together in one view or table to simplify consumption. Check duplication, scan cost and attribute updates.")
 };
}

function architectureRecommendation(state, services, flow){
 const a=state.answers;
 const {lake, separateWarehouse, separateServing, analytical, streaming, batchEngine, layout}=flow;
 const cadence={batch:phrase("Batch incrementale","Incremental batch"),micro:phrase("Microbatch","Microbatch"),stream:phrase("Streaming continuo","Continuous streaming"),hybrid:"Lambda"}[a.fresh];
 const processing=a.fresh==="hybrid"?{
   title:cadence,
   reason:phrase("Il ramo streaming pubblica risultati rapidi o alert. Il ramo batch rilegge i dati raw, applica le correzioni e pubblica i risultati certificati. Usa lo stesso identificativo e l’event time nei due rami e riconcilia in modo idempotente alla pubblicazione.","The stream publishes fast results or alerts. The batch path re-reads raw data, applies corrections and publishes certified results. Use the same event ID and event time on both paths and reconcile idempotently when publishing.")
 }:{title:streaming&&a.fresh!=="stream"?cadence+phrase(" con elaborazione continua"," with continuous processing"):cadence,reason:a.fresh==="stream"
   ?phrase("Elabora gli eventi all’arrivo per rispettare la latenza prevista. Verifica il ritardo end-to-end, inclusi sorgente e serving.","Process events as they arrive to meet the required latency. Measure end-to-end lag including source and serving.")
   :phrase("Pubblica incrementi alla cadenza richiesta. Dimensiona avvio, elaborazione e pubblicazione entro la finestra concordata.","Publish increments at the required cadence. Size startup, processing and publication within the agreed window.")};
 let title, reason;
 if(lake){
   title="Lakehouse";
   reason=phrase("Conserva gli originali in ","Keep originals in ")+services.obj+phrase(" e usa "," and use ")+layout+phrase(" per tabelle curate con aggiornamenti e letture governate. "," for curated tables with governed updates and reads. ");
   reason+=a.storage==="multi"?phrase("Verifica lettura e scrittura dello stesso formato e catalogo con ogni motore.","Verify that each engine can read and write through the same format and catalog."):phrase("Condividi le tabelle curate fra elaborazione e consumo compatibile.","Share the curated tables across processing and compatible consumers.");
   if(separateWarehouse){
     title=phrase("Ibrida · Lakehouse + data warehouse","Hybrid · Lakehouse + data warehouse");
     reason+=phrase(" Mantieni lo storico curato nel lakehouse e pubblica i mart BI in "," Keep curated history in the lakehouse and publish BI marts to ")+services.sql+phrase(". Definisci frequenza di pubblicazione, checkpoint e riconciliazione tra i due store.",". Define publication cadence, checkpoints and reconciliation across the two stores.");
   }
 }else if(analytical||["warehouse","dual"].includes(a.storage)){
   title="Data warehouse";
   reason=phrase("Consolida i dati strutturati in ","Consolidate structured data in ")+services.sql+phrase(", dove SQL e i mart servono le query analitiche.",", where SQL and marts serve analytical queries.");
   if(a.storage==="dual"){
     title=phrase("Ibrida · Object storage + data warehouse","Hybrid · Object storage + data warehouse");
     reason=services.obj+phrase(" conserva i dati raw a lungo e alimenta replay e backfill. Pubblica solo tabelle curate e mart in "," retains raw data and supports replay and backfills. Publish curated tables and marts to ")+services.sql+phrase(" per isolare il carico BI. Controlla freschezza e riconciliazione dopo ogni caricamento."," to isolate BI workloads. Check freshness and reconcile after each load.");
   }else if(batchEngine==="sql"){
     reason+=phrase(" Esegui join e aggregazioni nel motore SQL del warehouse."," Run joins and aggregations in the warehouse SQL engine.");
   }
 }else{
   title=a.consumer==="api"?phrase("Serving operativo","Operational serving"):phrase("Data lake su object storage","Object-storage data lake");
   reason=a.consumer==="api"?phrase("Dimensiona il percorso sulle chiamate API o sugli alert. Scegli la destinazione in base ad accesso per chiave, transazioni o query di eventi.","Size the path for API requests or alerts. Choose a target based on keyed access, transactions or event queries."):phrase("Usa l’object storage per conservare e rileggere i dati. Pubblica dataset dedicati quando emerge un requisito di consumo.","Use object storage to retain and replay data. Publish dedicated datasets when a consumption requirement emerges.");
 }
 if(separateServing){
   if(!title.startsWith(phrase("Ibrida","Hybrid")))title=phrase("Ibrida · ","Hybrid · ")+title;
   title+=phrase(" + serving dedicato"," + dedicated serving");
   reason+=phrase(" Destina le query di consumo rapido a "," Route low-latency consumption to ")+separateServing+phrase(" e sincronizza il serving con chiavi stabili e con una cadenza misurabile."," and synchronize it using stable keys and a measurable delivery cadence.");
 }
 return {architecture:{title,reason},processing,model:modelRecommendation(state,analytical)};
}

const platformReasons={
 azure:["Azure/Fabric abbina Data Factory per l’integrazione, OneLake per gli asset Fabric e Power BI per i modelli semantici. Il vantaggio cresce se identità, licenze e competenze Microsoft sono già disponibili.","Azure/Fabric combines Data Factory for integration, OneLake for Fabric assets and Power BI for semantic models. This is most valuable when Microsoft identity, licenses and skills are already in place."],
 aws:["AWS è adatto quando storage, connettività e operatività sono già su S3, IAM e VPC. Permette di dimensionare separatamente ingestione eventi, elaborazione e serving SQL.","AWS fits when storage, connectivity and operations already use S3, IAM and VPC. Event ingestion, processing and SQL serving can be sized independently."],
 gcp:["Google Cloud è adatto a un flusso SQL gestito con BigQuery come serving e Cloud Storage come landing. Confronta costi di scansione, SLA e competenze del team.","Google Cloud fits a managed SQL workflow with BigQuery for serving and Cloud Storage for landing. Compare scan costs, SLAs and team skills."],
 cloudera:["Cloudera è adatto a workload vicini alle sorgenti nel data center e a team che possono gestire cluster, autorizzazioni e aggiornamenti.","Cloudera suits workloads close to data-center sources and teams that can operate clusters, authorization and upgrades."],
 open:["Uno stack aperto è adatto quando il team deve condividere formati e catalogo fra più motori e può gestire compatibilità, aggiornamenti e disponibilità.","An open stack suits teams that need shared formats and catalog interoperability across engines and can operate compatibility, upgrades and availability."]
};
function stackFit(id){
 if(dbStacks.includes(id))return phrase("Databricks è adatto quando PySpark, streaming e SQL devono condividere tabelle Delta governate da Unity Catalog sul cloud indicato.","Databricks fits when PySpark, streaming and SQL must share Delta tables governed by Unity Catalog on the selected cloud.");
 if(snowStacks.includes(id))return phrase("Snowflake è adatto quando servono trasformazioni SQL e workload analitici con compute separato sulla stessa piattaforma. Valida traffico, crediti e disponibilità nella regione scelta.","Snowflake fits SQL transformations and analytical workloads with separate compute within one platform. Validate network traffic, credits and availability in the selected region.");
 return phrase(...platformReasons[id]);
}

const serviceReasons=[
 [/Amazon Redshift/i,"Usa Redshift per join e aggregazioni SQL sui mart e per servire più query BI. Carica gli incrementi da S3 con COPY quando il flusso lo prevede. Misura latenza e costo alla concorrenza prevista.","Use Redshift for SQL joins and aggregates on marts and to serve concurrent BI queries. Load increments from S3 with COPY where the flow calls for it. Measure latency and cost at expected concurrency."],
 [/BigQuery/i,"BigQuery esegue load e trasformazioni SQL vicino alle tabelle analitiche con compute gestito. Verifica partizionamento, byte letti e concorrenza delle dashboard.","BigQuery runs loads and SQL transformations close to analytical tables with managed compute. Check partitioning, bytes scanned and dashboard concurrency."],
 [/Fabric Warehouse/i,"Fabric Warehouse pubblica mart relazionali via T-SQL e si integra con i modelli semantici Power BI. Verifica capacità Fabric e modalità di connessione BI.","Fabric Warehouse publishes relational marts through T-SQL and integrates with Power BI semantic models. Validate Fabric capacity and BI connectivity mode."],
 [/Databricks SQL/i,"Databricks SQL interroga le tabelle curate del lakehouse con compute SQL dedicato alle query analitiche. Dimensiona la capacità per latenza e concorrenza BI.","Databricks SQL serves analytical queries on curated lakehouse tables using dedicated SQL compute. Size capacity for BI latency and concurrency."],
 [/Snowflake(?! (?:schema|su|on))/i,"Snowflake permette di dedicare virtual warehouse distinti a ingestione, trasformazioni e BI. Misura concorrenza, crediti e costi di eventuali copie o trasferimenti.","Snowflake lets ingestion, transformations and BI use separate virtual warehouses. Measure concurrency, credits and the cost of any copies or transfers."],
 [/Fabric Lakehouse|Delta Lake/i,"Delta Lake aggiunge transazioni e aggiornamenti alle tabelle su object storage, utili per MERGE, deduplica e refresh incrementali. Verifica la compatibilità dei writer.","Delta Lake adds transactions and updates to object-storage tables, useful for MERGE, deduplication and incremental refresh. Check writer compatibility."],
 [/Iceberg/i,"Iceberg offre snapshot e metadati tabellari su object storage. Verifica che catalogo, motori e operazioni di scrittura siano compatibili con le funzionalità abilitate.","Iceberg provides snapshots and table metadata on object storage. Verify catalog, engine and write compatibility with the features enabled."],
 [/Amazon S3|Cloud Storage|ADLS Gen2|HDFS|Object storage/i,"Conserva i payload originali per audit, replay e backfill. Pianifica retention, partizionamento fisico e permessi per separare i file raw dalle tabelle pubblicate.","Keep original payloads for audit, replay and backfills. Plan retention, physical layout and access so raw files are separate from published tables."],
 [/Cloud Run Jobs|Container Apps Jobs|ECS task/i,"Esegui il codice di acquisizione in un job isolato con timeout, ritentativi e progresso persistente. Verifica rate limit e frequenza della sorgente.","Run acquisition code in an isolated job with timeouts, retries and persistent progress. Check source rate limits and cadence."],
 [/Data Factory/i,"Data Factory coordina connettori e copie schedulate con dipendenze e retry. Verifica il runtime per le sorgenti private e il supporto del connettore.","Data Factory coordinates scheduled connector-based copies with dependencies and retries. Check the runtime for private sources and connector support."],
 [/Auto Loader/i,"Auto Loader rileva nuovi file e conserva il progresso tramite checkpoint per l’ingestione incrementale. Valida schema e gestione dei file inattesi.","Auto Loader discovers new files and keeps progress in a checkpoint for incremental ingestion. Validate schema and unexpected-file handling."],
 [/Kinesis Data Streams|Pub\/Sub|Event Hubs|Apache Kafka|Amazon MSK/i,"Il broker rende indipendenti produttori e consumer, assorbe i picchi e consente riletture entro la retention. Dimensiona partizioni e throughput con il picco dichiarato.","The broker decouples producers and consumers, absorbs spikes and allows replay within retention. Size partitions and throughput for the stated peak."],
 [/Structured Streaming|Dataflow|Flink|Stream Analytics/i,"Il motore continuo pubblica dati senza attendere il prossimo batch. Per finestre e stato, configura event time, checkpoint e gestione dei ritardi e misura il recupero dei backlog.","The continuous engine publishes without waiting for the next batch. For windows and state, configure event time, checkpoints and late arrivals, and measure backlog recovery."],
 [/PySpark|Spark|AWS Glue|Amazon EMR/i,"Il compute distribuito parallelizza parsing, scansioni e join pesanti. Conferma il vantaggio sul job reale misurando shuffle, skew e tempi di avvio.","Distributed compute parallelizes parsing, scans and heavy joins. Confirm the benefit on the actual job by measuring shuffle, skew and startup."],
 [/Pandas/i,"Pandas limita l’overhead di esecuzione su volumi che entrano nella RAM della macchina con margine. Verifica memoria di picco e runtime end-to-end.","Pandas keeps execution overhead low when the workload fits on one machine with memory headroom. Check peak RAM and end-to-end runtime."],
 [/Datastream|AWS DMS|Debezium|Lakeflow Connect/i,"Usa un connettore compatibile per catturare cambi o ridurre codice di integrazione. Prova snapshot iniziale, ripartenza, ordine per chiave e propagazione delle cancellazioni per la CDC.","Use a compatible connector to capture changes or reduce integration code. For CDC, test initial snapshots, restarts, per-key ordering and deletion propagation."],
 [/PowerExchange/i,"Usa il connettore CDC compatibile con motore e versione della sorgente. Verifica abilitazione dei log, snapshot iniziale, posizione di ripartenza e propagazione delle cancellazioni.","Use a CDC connector compatible with the source engine and version. Verify logging, initial snapshots, restart positions and delete propagation."],
 [/PowerCenter Workflow Manager|Talend Administration Center|DataStage.*(?:sequenze|sequences)/i,"Coordina dipendenze e riesecuzioni sullo scheduler disponibile nella versione installata. Configura monitoraggio, parametri per ambiente e permessi del runtime.","Coordinate dependencies and retries using the scheduler available in the installed version. Configure monitoring, environment parameters and runtime permissions."],
 [/PowerCenter|Talend|DataStage/i,"Riutilizza mapping, job e connettori sul runtime aziendale. Verifica edizione, compatibilità sorgente/destinazione, connettività e finestra batch.","Reuse mappings, jobs and connectors on the enterprise runtime. Verify edition, source and target compatibility, connectivity and the batch window."],
 [/Dataform|dbt|Snowflake Tasks/i,"Gestisci dipendenze, rilasci e refresh delle trasformazioni SQL sul motore analitico scelto. Verifica test e costi delle riesecuzioni.","Manage dependencies, releases and refreshes for SQL transformations on the chosen analytics engine. Verify tests and rerun costs."],
 [/Unity Catalog|Purview|DataZone|Knowledge Catalog|OpenMetadata|Apache Atlas/i,"Centralizza i metadati e la governance nel livello scelto. Verifica il perimetro effettivo di lineage e permessi dal catalogo fino a tabelle e BI.","Centralize metadata and governance at the chosen layer. Verify actual lineage and access coverage from catalog to tables and BI."],
 [/Cloud SQL|Oracle Database|MySQL|MariaDB|SQL Server|IBM Db2|PostgreSQL|RDS/i,"Usa un database relazionale per vincoli, indici, transazioni e accessi puntuali. Prova chiavi e p95 con le query operative reali.","Use a relational database for constraints, indexes, transactions and keyed lookups. Validate keys and p95 with actual operational queries."],
 [/DynamoDB|Bigtable|Cosmos DB|Cassandra/i,"Distribuisci le letture puntuali attorno alla chiave di accesso. Testa distribuzione delle richieste, hot partition e latenza a picco.","Distribute keyed lookups around the access key. Test request distribution, hot partitions and peak latency."],
 [/Firestore|DocumentDB|MongoDB/i,"Modella il documento come unità di lettura e aggiornamento dell’applicazione. Verifica indici e dimensioni dei documenti sui casi reali.","Model a document as the application’s unit of reading and updating. Check indexes and document sizes on actual use cases."],
 [/Eventhouse|OpenSearch|Azure Data Explorer/i,"Progetta il serving per query interattive sugli eventi con filtri temporali. Verifica cardinalità, costo di ingestione e retention.","Design serving for interactive event queries with time filters. Validate cardinality, ingestion cost and retention."],
 [/Trino|Impala|Athena/i,"Usa un motore SQL per leggere le tabelle compatibili dal catalogo. Verifica pruning, concorrenza e prestazioni sui formati effettivi.","Use a SQL engine to read compatible catalog tables. Check pruning, concurrency and performance on the actual formats."],
 [/Composer|Workflows|Airflow|Step Functions|Amazon MWAA|Lakeflow Jobs/i,"Coordina dipendenze, retry e backfill della pipeline. Verifica che un rilancio riparta dal punto corretto senza duplicare il publish.","Coordinate pipeline dependencies, retries and backfills. Verify reruns resume at the right point without duplicating publication."],
 [/Power BI|Looker|QuickSight|Tableau|Qlik|Superset|Metabase/i,"Pubblica soltanto tabelle e metriche curate. Valida connettore, propagazione dei permessi, refresh e latenza delle dashboard.","Expose curated tables and metrics. Validate connectors, permission propagation, refresh and dashboard latency."],
 [/Key Vault|Secret Manager|AWS KMS|Vault/i,"Centralizza segreti e chiavi con accessi limitati e rotazione, usando identità separate per deploy e runtime.","Centralize secrets and keys with restricted access and rotation, using separate deploy and runtime identities."],
 [/Entra|Cloud IAM|AWS IAM|RBAC|Lake Formation/i,"Applica il minimo privilegio alle identità di pipeline e utenti. Verifica le autorizzazioni sullo store e anche sul percorso BI o API.","Apply least privilege to pipeline and user identities. Verify permissions both on the store and on the BI or API access path."],
 [/Private Link|Private Service Connect|VPC endpoints|VPN|Interconnect|ExpressRoute|Direct Connect/i,"Usa connettività privata dove richiesta. Prova rotte, DNS, autenticazione e throughput dal runtime che esegue la pipeline.","Use private connectivity where required. Test routing, DNS, authentication and throughput from the pipeline runtime."]
];

function technologyReason(value, toolChoices=[]){
 const selected=toolChoices.find(item=>item.applies&&value===item.tech);
 if(selected)return selected.reason;
 const parts=value.split(/ \+ /);
 const reasons=parts.flatMap(part=>{
   const match=serviceReasons.find(([pattern])=>pattern.test(part));
   return match? [phrase(match[1],match[2])]:[];
 });
 return [...new Set(reasons)].join(" ");
}

function recommendationEntries(result){
 const {architecture,processing,model}=result.recommendations;
 return [
   [phrase("Architettura della piattaforma","Platform architecture"),architecture],
   [phrase("Pattern di elaborazione","Processing pattern"),processing],
   [phrase("Modello dati di consumo","Serving data model"),model]
 ];
}

function modelShapeInput(state){
 const shapes=[
   ["",phrase("Decidi dalle risposte","Infer from answers")],
   ["hierarchy",phrase("Gerarchie dimensionali condivise da governare separatamente","Shared dimension hierarchies that need separate governance")],
   ["single",phrase("Un solo dataset di consumo a granularità fissa","One serving dataset at a fixed grain")]
 ];
 return '<div class="metrics"><label>'+esc(phrase("Struttura del modello analitico (facoltativa)","Analytical model structure (optional)"))+
   '<select id="modelShape">'+shapes.map(([value,label])=>'<option value="'+value+'"'+((state.answers.modelShape||"")===value?" selected":"")+'>'+esc(label)+'</option>').join("")+'</select></label></div>';
}
