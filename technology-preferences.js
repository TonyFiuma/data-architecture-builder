const relationalDatabases={
 oracle:"Oracle Database",mysql:"MySQL",sqlserver:"Microsoft SQL Server",postgres:"PostgreSQL",db2:"IBM Db2",mariadb:"MariaDB"
};
const sourceDatabases=Object.fromEntries(Object.entries(relationalDatabases).map(([id,name])=>[id,[name]]));
const servingDatabases=Object.fromEntries(Object.entries(relationalDatabases).map(([id,name])=>[id,[name,null,"rel"]]));

const pipelinePreferences={
 sourceDb:["Database sorgente","Source database",sourceDatabases],
 cdc:["CDC da log","Log-based CDC",{
   debezium:["Debezium / Kafka Connect"],dms:["AWS DMS","aws"],datastream:["Datastream","gcp"],
   lakeflow:["Lakeflow Connect","databricks"],powerexchange:["Informatica PowerExchange (CDC)"]
 }],
 raw:["Storage raw e replay","Raw and replay storage",{
   adls:["ADLS Gen2","azure"],s3:["Amazon S3","aws"],gcs:["Cloud Storage","gcp"],hdfs:["HDFS","local"]
 }],
 broker:["Broker di eventi","Event broker",{
   kafka:["Apache Kafka"],kinesis:["Kinesis Data Streams","aws"],eventhubs:["Event Hubs","azure"],pubsub:["Pub/Sub","gcp"],msk:["Amazon MSK","aws"]
 }],
 stream:["Elaborazione streaming","Stream processing",{
   spark:["Spark Structured Streaming"],flink:["Apache Flink"],dataflow:["Dataflow (Apache Beam)","gcp"],asa:["Azure Stream Analytics","azure"]
 }],
 format:["Formato tabelle Lakehouse","Lakehouse table format",{
   delta:["Delta Lake","delta"],iceberg:["Apache Iceberg","iceberg"]
 }],
 serving:["Database di serving operativo","Operational serving database",{
   ...servingDatabases,mongodb:["MongoDB",null,"doc"],dynamo:["Amazon DynamoDB","aws","kv"],cosmos:["Azure Cosmos DB for NoSQL","azure","kv","doc"],
   firestore:["Firestore","gcp","doc"],opensearch:["Amazon OpenSearch Service","aws","event"],eventhouse:["Fabric Eventhouse","azure","event"]
 }],
 iac:["Infrastructure as Code (IaC)","Infrastructure as Code (IaC)",{
   terraform:["Terraform"],bicep:["Bicep","azure"],cloudformation:["AWS CloudFormation","aws"],opentofu:["OpenTofu"]
 }],
 ci:["Pipeline CI/CD","CI/CD pipeline",{
   github:["GitHub Actions"],azuredevops:["Azure DevOps (Azure Pipelines)"],gitlab:["GitLab CI/CD"],
   cloudbuild:["Cloud Build","gcp"],codepipeline:["AWS CodePipeline","aws"]
 }]
};

function resolvePipelinePreferences(state,stackId,choices){
 const a=state.answers;
 const cloud=host[stackId]??a.placement;
 const warehouseStack=dbStacks.includes(stackId);
 const available={
   local:cloud==="local"||stackId==="open"&&a.placement==="local",
   databricks:warehouseStack,
   delta:warehouseStack||stackId==="azure",
   iceberg:!warehouseStack&&stackId!=="azure"
 };
 const engineType=cloud==="portable"?a.placement:cloud;
 return (key,fallback,active=true,compatible=()=>true)=>{
   const entry=pipelinePreferences[key];
   const option=Object.hasOwn(entry[2],state.tools?.[key])?entry[2][state.tools[key]]:null;
   if(!option)return fallback;
   const [tech,constraint,...supported]=option;
   const applies=active&&(!constraint||(Object.hasOwn(available,constraint)?available[constraint]:constraint===engineType))&&compatible(supported,tech);
   const warning=!active?phrase("Questa fase non è prevista per i requisiti selezionati.","This stage is outside the selected design."):
     phrase("La preferenza non è compatibile con lo stack o con il requisito della fase. Il risultato usa la selezione automatica.","This preference conflicts with the selected stack or stage requirements. The result uses the automatic selection.");
   choices.push({key,role:phrase(entry[0],entry[1]),tech,applies,warning,reason:phrase("Verifica disponibilità e integrazione nell’ambiente di destinazione.","Verify availability and integration in the target environment.")});
   return applies?tech:fallback;
 };
}

const preferenceLabels={
 sourceDb:pipelinePreferences.sourceDb,integration:["Ingestione","Ingestion"],cdc:pipelinePreferences.cdc,raw:pipelinePreferences.raw,broker:pipelinePreferences.broker,
 transform:["Trasformazione batch","Batch transformation"],stream:pipelinePreferences.stream,format:pipelinePreferences.format,
 warehouse:["Warehouse analitico","Analytical warehouse"],serving:pipelinePreferences.serving,
 bi:["Business Intelligence","Business Intelligence"],governance:["Governance e catalogo","Governance and catalog"],
 orchestration:["Orchestrazione dei dati","Data orchestration"],iac:pipelinePreferences.iac,ci:pipelinePreferences.ci
};

function preferenceReport(technologies,choices,bi,state){
 return Object.entries(preferenceLabels).map(([key,[it,en]])=>{
   const choice=choices.find(item=>item.key===key&&item.applies&&(technologies[key]?.includes(item.tech)||(key==="transform"&&["sql","pyspark","pandas"].includes(state.tools[key]))));
   const streamChoice=key==="stream"&&choices.find(item=>item.key==="transform"&&item.tech===technologies[key]&&item.applies);
   const selected=choice||streamChoice||(key==="bi"&&!!state.bi&&state.bi===bi.key);
   const requested=choices.find(item=>item.key===key&&!item.applies);
   return {
     role:phrase(it,en),tech:technologies[key]||phrase("Fase non prevista","Stage not required"),
     status:selected?phrase("Preferenza applicata","Preference applied"):technologies[key]?phrase("Scelta automatica","Automatic selection"):"",
     detail:requested?requested.tech+" · "+requested.warning:
       key==="bi"?bi.reason:
       technologies[key]?(key==="sourceDb"?phrase("Conferma versione, driver, reachability e permessi di lettura dal runtime ETL. Per il CDC verifica anche i prerequisiti dei log.","Check the database version, driver, connectivity and read permissions from the ETL runtime. For CDC also verify logging prerequisites."):technologyReason(technologies[key]))||deploymentRationale[key]?.()||choice?.reason||"":""

   };
 });
}

const deploymentRationale={
 iac:()=>phrase("Versiona rete, storage e permessi supportati e rivedi le modifiche prima del rilascio.","Version supported network, storage and permission resources and review changes before deployment."),
 ci:()=>phrase("Esegui i test sulle modifiche e promuovi lo stesso artefatto tra gli ambienti. Convalida repository e credenziali di deploy.","Test changes and promote the same artifact across environments. Validate repository and deployment credentials.")
};

function preferenceTitle(){return phrase("Tecnologie per fase","Technologies by stage");}

function preferenceWord(rows,heading,sub,p){
 return [heading(preferenceTitle()),...rows.flatMap(row=>[sub(row.role+" · "+row.tech),...(row.status?[p(row.status)]:[]),...(row.detail?[p(row.detail)]:[])])];
}
