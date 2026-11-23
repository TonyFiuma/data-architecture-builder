/* name | aliases | official documentation | hands-on example | emblem | video | course */
const bigQueryCourse="https://www.udemy.com/course/data-engineering-cloud-google-bigquery-data-studio/";
const snowflakeDbtCourse="https://www.udemy.com/course/snowflake-dbt-a-hands-on-guide/";
const informaticaCourse="https://www.udemy.com/course/informatica-cloud-iics-the-complete-guide-2023-edition/";
const factoryCourse="https://www.udemy.com/course/learn-azure-data-factory-from-scratch/";
const learningCatalog=`
BigQuery||https://cloud.google.com/bigquery/docs|https://cloud.google.com/bigquery/docs/quickstarts/query-public-dataset-console|googlebigquery|CFw4peH2UwU|${bigQueryCourse}
Cloud Storage|GCS|https://cloud.google.com/storage/docs|https://cloud.google.com/storage/docs/uploading-objects|googlecloudstorage
Cloud Run Jobs|Cloud Run|https://cloud.google.com/run/docs|https://cloud.google.com/run/docs/quickstarts/jobs/create-execute|google-cloud-run
Pub/Sub||https://cloud.google.com/pubsub/docs|https://cloud.google.com/pubsub/docs/publish-receive-messages-console|googlepubsub
Dataflow||https://cloud.google.com/dataflow/docs|https://cloud.google.com/dataflow/docs/quickstarts/create-pipeline-java|googledataflow
Apache Beam|Beam|https://beam.apache.org/documentation/|https://beam.apache.org/get-started/quickstart-py/
Dataproc|Dataproc Serverless|https://cloud.google.com/dataproc/docs|https://cloud.google.com/dataproc-serverless/docs/quickstarts/spark-batch|googledataproc
Datastream||https://cloud.google.com/datastream/docs|https://cloud.google.com/datastream/docs/create-a-stream
Dataform||https://cloud.google.com/dataform/docs|https://cloud.google.com/dataform/docs/quickstart-create-workflow
Cloud Composer||https://cloud.google.com/composer/docs|https://cloud.google.com/composer/docs/composer-3/run-apache-airflow-dag|googlecloudcomposer
Cloud Workflows|Workflows|https://cloud.google.com/workflows/docs|https://cloud.google.com/workflows/docs/create-workflow-console
Cloud Build||https://cloud.google.com/build/docs|https://cloud.google.com/build/docs/quickstart-build
Cloud SQL||https://cloud.google.com/sql/docs/postgres|https://cloud.google.com/sql/docs/postgres/quickstart
Bigtable||https://cloud.google.com/bigtable/docs|https://cloud.google.com/bigtable/docs/quickstart-console
Firestore||https://firebase.google.com/docs/firestore|https://firebase.google.com/docs/firestore/quickstart|firebase
Looker||https://cloud.google.com/looker/docs|https://cloud.google.com/looker/docs/exploring-data|looker
BigLake||https://cloud.google.com/biglake/docs||
Knowledge Catalog||https://cloud.google.com/dataplex/docs||
Cloud IAM|Google Cloud IAM|https://cloud.google.com/iam/docs||
Workload Identity Federation||https://cloud.google.com/iam/docs/workload-identity-federation||
Secret Manager||https://cloud.google.com/secret-manager/docs|https://cloud.google.com/secret-manager/docs/create-secret-quickstart
Cloud KMS||https://cloud.google.com/kms/docs||
Cloud Monitoring||https://cloud.google.com/monitoring/docs||
Private Service Connect||https://cloud.google.com/vpc/docs/private-service-connect||
Cloud VPN||https://cloud.google.com/network-connectivity/docs/vpn||
Cloud Interconnect||https://cloud.google.com/network-connectivity/docs/interconnect||
Managed Service for Apache Kafka||https://cloud.google.com/managed-service-for-apache-kafka/docs||apachekafka
ADLS Gen2|ADLS;Azure Data Lake Storage|https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-introduction|https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-directory-file-acl-python
Azure Data Factory|ADF|https://learn.microsoft.com/azure/data-factory/|https://learn.microsoft.com/azure/data-factory/quickstart-create-data-factory-copy-data-tool|||${factoryCourse}
Fabric Warehouse||https://learn.microsoft.com/fabric/data-warehouse/|https://learn.microsoft.com/fabric/data-warehouse/tutorial-introduction
Fabric Lakehouse||https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview|https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction
Fabric Spark|Microsoft Fabric;Fabric|https://learn.microsoft.com/fabric/data-engineering/|https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction
Fabric Eventhouse||https://learn.microsoft.com/fabric/real-time-intelligence/eventhouse|https://learn.microsoft.com/fabric/real-time-intelligence/tutorial-introduction
Fabric Data Factory|Fabric pipeline;Pipeline Fabric|https://learn.microsoft.com/fabric/data-factory/|https://learn.microsoft.com/fabric/data-factory/tutorial-end-to-end-introduction
Power BI||https://learn.microsoft.com/power-bi/|https://learn.microsoft.com/power-bi/create-reports/desktop-excel-stunning-report|powerbi
Azure Functions||https://learn.microsoft.com/azure/azure-functions/|https://learn.microsoft.com/azure/azure-functions/create-first-function-vs-code-python
Azure Container Apps Jobs|Container Apps Jobs|https://learn.microsoft.com/azure/container-apps/jobs|https://learn.microsoft.com/azure/container-apps/tutorial-event-driven-jobs
Event Hubs||https://learn.microsoft.com/azure/event-hubs/|https://learn.microsoft.com/azure/event-hubs/event-hubs-dotnet-standard-getstarted-send
Azure Stream Analytics|Stream Analytics|https://learn.microsoft.com/azure/stream-analytics/|https://learn.microsoft.com/azure/stream-analytics/stream-analytics-quick-create-portal
Azure Data Explorer||https://learn.microsoft.com/azure/data-explorer/|https://learn.microsoft.com/azure/data-explorer/ingest-data-overview
Azure Database for PostgreSQL||https://learn.microsoft.com/azure/postgresql/|https://learn.microsoft.com/azure/postgresql/flexible-server/quickstart-create-server-portal|postgresql
Azure SQL||https://learn.microsoft.com/azure/azure-sql/||
Azure Cosmos DB|Cosmos DB|https://learn.microsoft.com/azure/cosmos-db/|https://learn.microsoft.com/azure/cosmos-db/nosql/quickstart-python
Microsoft Purview||https://learn.microsoft.com/purview/||
Microsoft Entra ID|Entra ID|https://learn.microsoft.com/entra/identity/||
Azure RBAC||https://learn.microsoft.com/azure/role-based-access-control/||
Azure Key Vault||https://learn.microsoft.com/azure/key-vault/|https://learn.microsoft.com/azure/key-vault/secrets/quick-create-portal
Azure Private Link||https://learn.microsoft.com/azure/private-link/||
Azure VPN Gateway|VPN Gateway|https://learn.microsoft.com/azure/vpn-gateway/||
ExpressRoute||https://learn.microsoft.com/azure/expressroute/||
Azure Monitor||https://learn.microsoft.com/azure/azure-monitor/||
Azure DevOps||https://learn.microsoft.com/azure/devops/|https://learn.microsoft.com/azure/devops/pipelines/create-first-pipeline
Amazon S3|S3|https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html|https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html|aws-s3
Amazon Redshift|Redshift|https://docs.aws.amazon.com/redshift/|https://docs.aws.amazon.com/redshift/latest/gsg/getting-started.html|aws-redshift||https://www.udemy.com/course/aws-data-engineer/
AWS Glue Data Catalog||https://docs.aws.amazon.com/glue/latest/dg/catalog-and-crawler.html||aws-glue
AWS Glue||https://docs.aws.amazon.com/glue/|https://docs.aws.amazon.com/glue/latest/dg/getting-started.html|aws-glue|wbVk3lhovT0|https://www.udemy.com/course/aws-data-engineer/
Amazon EMR|EMR|https://docs.aws.amazon.com/emr/|https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-gs.html
Amazon ECS|ECS|https://docs.aws.amazon.com/ecs/|https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html|aws-ecs
Kinesis Data Streams|Kinesis|https://docs.aws.amazon.com/streams/latest/dev/introduction.html|https://docs.aws.amazon.com/streams/latest/dev/learning-kinesis-module-one-create-stream.html|aws-kinesis|1I1DcJvmd4w|https://www.udemy.com/course/aws-data-engineer/
Amazon MSK|MSK|https://docs.aws.amazon.com/msk/|https://docs.aws.amazon.com/msk/latest/developerguide/getting-started.html|aws-msk
Managed Service for Apache Flink||https://docs.aws.amazon.com/managed-flink/|https://docs.aws.amazon.com/managed-flink/latest/java/getting-started.html|apache-flink-icon
AWS DMS||https://docs.aws.amazon.com/dms/|https://docs.aws.amazon.com/dms/latest/userguide/CHAP_GettingStarted.html
Amazon RDS|RDS|https://docs.aws.amazon.com/rds/|https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.CreatingConnecting.PostgreSQL.html|aws-rds
Amazon DynamoDB|DynamoDB|https://docs.aws.amazon.com/dynamodb/|https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStartedDynamoDB.html|aws-dynamodb
Amazon DocumentDB|DocumentDB|https://docs.aws.amazon.com/documentdb/||aws-documentdb
Amazon Athena|Athena|https://docs.aws.amazon.com/athena/|https://docs.aws.amazon.com/athena/latest/ug/getting-started.html|aws-athena
Amazon OpenSearch Service|OpenSearch|https://docs.aws.amazon.com/opensearch-service/||aws-open-search
Amazon DataZone|DataZone|https://docs.aws.amazon.com/datazone/||
Lake Formation||https://docs.aws.amazon.com/lake-formation/||aws-lake-formation
AWS Transfer Family||https://docs.aws.amazon.com/transfer/||
AWS IAM||https://docs.aws.amazon.com/iam/||aws-iam
AWS STS|STS|https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html||
AWS Secrets Manager||https://docs.aws.amazon.com/secretsmanager/||aws-secrets-manager
AWS KMS||https://docs.aws.amazon.com/kms/||aws-kms
AWS Step Functions|Step Functions|https://docs.aws.amazon.com/step-functions/||aws-step-functions
Amazon MWAA|MWAA|https://docs.aws.amazon.com/mwaa/||apacheairflow
AWS CodePipeline|CodePipeline|https://docs.aws.amazon.com/codepipeline/||aws-codepipeline
Amazon CloudWatch|CloudWatch|https://docs.aws.amazon.com/cloudwatch/||aws-cloudwatch
AWS Site-to-Site VPN||https://docs.aws.amazon.com/vpn/||
AWS Direct Connect|Direct Connect|https://docs.aws.amazon.com/directconnect/||
AWS VPC endpoints|VPC endpoint;VPC endpoints|https://docs.aws.amazon.com/vpc/||aws-vpc
Snowflake||https://docs.snowflake.com/|https://quickstarts.snowflake.com/|snowflake-icon||${snowflakeDbtCourse}
Databricks SQL||https://learn.microsoft.com/azure/databricks/sql/|https://learn.microsoft.com/azure/databricks/sql/get-started/|databricks-icon
Databricks|Azure Databricks|https://learn.microsoft.com/azure/databricks/|https://learn.microsoft.com/azure/databricks/getting-started/|databricks-icon
Lakeflow Jobs|Databricks Jobs|https://learn.microsoft.com/azure/databricks/jobs/||databricks-icon
Auto Loader||https://learn.microsoft.com/azure/databricks/ingestion/cloud-object-storage/auto-loader/|https://learn.microsoft.com/en-us/azure/databricks/getting-started/etl-quick-start|databricks-icon||https://www.udemy.com/course/azure-databricks-spark-core-for-data-engineers/
Lakeflow Connect||https://learn.microsoft.com/azure/databricks/ingestion/||databricks-icon
Unity Catalog||https://learn.microsoft.com/azure/databricks/data-governance/unity-catalog/|https://learn.microsoft.com/azure/databricks/data-governance/unity-catalog/get-started|databricks-icon
Declarative Automation Bundles||https://learn.microsoft.com/azure/databricks/dev-tools/bundles/||databricks-icon
Delta Lake||https://docs.delta.io/|https://docs.delta.io/quick-start/|databricks-icon
Apache Iceberg|Iceberg|https://iceberg.apache.org/docs/latest/|https://iceberg.apache.org/spark-quickstart/|apacheiceberg
Apache Spark|Spark;PySpark;Spark Structured Streaming|https://spark.apache.org/docs/latest/api/python/|https://spark.apache.org/docs/latest/api/python/getting_started/quickstart_df.html|apache-spark||https://www.udemy.com/course/azure-databricks-spark-core-for-data-engineers/
pandas||https://pandas.pydata.org/docs/|https://pandas.pydata.org/docs/user_guide/10min.html|pandas-icon
Apache Flink|Flink|https://flink.apache.org/what-is-flink/|https://flink.apache.org/getting-started/|apache-flink-icon
Apache Kafka|Kafka;Kafka Connect|https://kafka.apache.org/documentation/|https://kafka.apache.org/quickstart|apachekafka
Debezium||https://debezium.io/documentation/|https://debezium.io/documentation/reference/stable/tutorial.html
DuckDB||https://duckdb.org/docs/stable/|https://duckdb.org/docs/stable/data/csv/overview|duckdb
dbt||https://docs.getdbt.com/|https://docs.getdbt.com/guides|dbt-icon||${snowflakeDbtCourse}
Airbyte||https://docs.airbyte.com/|https://docs.airbyte.com/using-airbyte/getting-started|airbyte-icon
Fivetran||https://fivetran.com/docs|https://fivetran.com/docs/getting-started|fivetran
Informatica CDI|Cloud Data Integration;CDI|https://docs.informatica.com/integration-cloud/data-integration/current-version.html|||4Wb5RLQL3zI|${informaticaCourse}
Informatica CDIR|Cloud Data Ingestion and Replication;CDIR|https://docs.informatica.com/integration-cloud/data-ingestion-and-replication/current-version.html||informatica
Informatica CDGC|Cloud Data Governance and Catalog;CDGC|https://docs.informatica.com/data-governance-and-quality-cloud/cloud-data-governance-and-catalog/current-version.html||informatica
Informatica IDMC taskflows|IDMC taskflows;Taskflows|https://docs.informatica.com/integration-cloud/data-integration/current-version/taskflows.html||informatica
Informatica IDMC|IDMC|https://docs.informatica.com/||informatica||${informaticaCourse}
OpenMetadata||https://docs.open-metadata.org/|https://docs.open-metadata.org/latest/quick-start|openmetadata
Collibra Data Catalog|Collibra|https://productresources.collibra.com/docs/collibra/latest/Content/Catalog/to_catalog.htm||
Apache Airflow|Airflow|https://airflow.apache.org/docs/apache-airflow/stable/|https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html|apacheairflow
Terraform||https://developer.hashicorp.com/terraform/docs|https://developer.hashicorp.com/terraform/tutorials|terraform-icon
GitHub Actions||https://docs.github.com/actions|https://docs.github.com/actions/writing-workflows/quickstart|githubactions
GitLab CI||https://docs.gitlab.com/ci/||gitlab
PostgreSQL||https://www.postgresql.org/docs/|https://www.postgresql.org/docs/current/tutorial.html|postgresql
Oracle Database|Oracle|https://docs.oracle.com/en/database/oracle/oracle-database/
MySQL||https://dev.mysql.com/doc/
MariaDB||https://mariadb.com/docs/
Microsoft SQL Server|SQL Server|https://learn.microsoft.com/en-us/sql/sql-server/
IBM Db2|Db2|https://www.ibm.com/docs/en/db2
Informatica PowerCenter|PowerCenter;PowerCenter Workflow Manager|https://docs.informatica.com/data-integration/powercenter/10-5-7/getting-started/product-overview/introduction.html||informatica
Informatica PowerExchange|PowerExchange|https://docs.informatica.com/data-integration/powerexchange-for-cdc-and-mainframe/10-5-9/cdc-guide-for-linux--unix--and-windows/part-4--change-data-extraction/extracting-change-data/task-flow-for-extracting-change-data.html||informatica
Qlik Talend|Talend;Talend Studio;Talend Administration Center|https://help.qlik.com/talend/
IBM DataStage|DataStage|https://www.ibm.com/products/datastage
Parquet||https://parquet.apache.org/docs/||
Qlik Cloud Analytics|Qlik|https://help.qlik.com/en-US/cloud-services/|https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Introduction.htm
Tableau||https://help.tableau.com/|https://help.tableau.com/current/pro/desktop/en-us/getstarted_overview.htm
Amazon QuickSight|QuickSight|https://docs.aws.amazon.com/quicksight/|https://docs.aws.amazon.com/quicksight/latest/user/getting-started.html
Apache Superset|Superset|https://superset.apache.org/docs/intro/|https://superset.apache.org/docs/quickstart/
Metabase||https://www.metabase.com/docs/latest/|https://www.metabase.com/docs/latest/getting-started/start
Trino||https://trino.io/docs/current/|https://trino.io/docs/current/connector/iceberg.html
Cloudera||https://docs.cloudera.com/cdp-private-cloud-base/latest/index.html
Apache Impala|Impala|https://impala.apache.org/docs/build/html/
Apache Ranger|Ranger|https://ranger.apache.org/
Apache Atlas|Atlas|https://atlas.apache.org/
Hive Metastore||https://hive.apache.org/
HDFS||https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html
Apache Cassandra|Cassandra|https://cassandra.apache.org/doc/latest/
Snowflake Tasks||https://docs.snowflake.com/en/user-guide/tasks-intro
`.trim().split("\n").map(line=>{
 const [name,aliases,docs,example,icon,video,course]=line.split("|");
 return {name,aliases:[name,...(aliases?aliases.split(";"):[])],docs,example,icon:name==="Informatica CDI"?"informatica":icon,video,course};
});
const technologyAliases=learningCatalog.flatMap(item=>item.aliases.map(alias=>({item,alias:alias.toLowerCase()}))).sort((a,b)=>b.alias.length-a.alias.length);
function technologiesIn(value){
 const matches=new Set();
 let remaining=value.toLowerCase();
 for(const {item,alias} of technologyAliases){
   const escaped=alias.replace(/[.*+?^${}$()|[\]\\]/g,"\\$&");
   const pattern=new RegExp("(?<![a-z0-9])"+escaped+"(?![a-z0-9])","g");
   if(remaining.search(pattern)>=0){
     matches.add(item);
     remaining=remaining.replace(pattern,match=>" ".repeat(match.length));
   }
 }
 return [...matches];
}
const stagePractice={
 source:["Prepara un campione sintetico con tre record. Dai a ogni record un ID e una data. Includi una riga non valida e verifica come il sistema sorgente la consegna.","Create three synthetic records with an ID and timestamp. Include one invalid row and verify how the source delivers it."],
 intake:["Configura una connessione di prova e carica due file o pagine. Interrompi dopo la prima scrittura, riavvia e controlla che il conteggio finale sia corretto.","Configure a test connection and load two files or pages. Stop after the first write, restart and verify the final count."],
 cdc:["Crea una tabella di prova, inserisci due righe, modifica la prima e cancella la seconda. Esegui snapshot e replica. Verifica che a destinazione resti solo la riga aggiornata.","Create a test table, insert two rows, update the first and delete the second. Run snapshot and replication. Verify only the updated row remains at the target."],
 stream:["Invia tre eventi con una chiave e un orario, di cui uno fuori ordine. Arresta e riavvia l’elaborazione. Controlla risultati, stato e duplicati.","Send three keyed events with timestamps, one out of order. Stop and restart processing. Check results, state and duplicates."],
 raw:["Salva il campione in un’area isolata con un percorso per data. Configura la conservazione e verifica la rilettura di una singola giornata.","Store the sample in an isolated area under a date-based path. Configure retention and verify that one day can be replayed."],
 batch:["Carica il campione, filtra le righe non valide e aggrega per chiave. Ripeti l’esecuzione sullo stesso input e confronta conteggi, risultati e tempi.","Load a sample, filter invalid rows and aggregate by key. Rerun with the same input and compare counts, results and timings."],
 curated:["Definisci schema, chiave e strategia di pubblicazione. Scrivi un piccolo set di dati e verifica lettura, conteggi e comportamento in caso di modifica.","Define the schema, key and publication strategy. Write a small dataset and verify reads, counts and behavior when data changes."],
 serve:["Collega un consumatore di prova. Prova un accesso autorizzato e uno negato. Misura la latenza di una query o richiesta rappresentativa.","Connect a test consumer. Check one authorized and one denied request. Measure a representative query or request’s latency."],
 controls:["Prova il controllo su un ambiente isolato. Registra owner e permessi, poi simula un errore o un accesso negato per verificare monitoraggio e audit.","Try the control in an isolated environment. Record ownership and permissions, then simulate a failure or a denied request to verify monitoring and audit."],
};
function practiceFor(role){
 const key=role.toLowerCase();
 const byType=[
   [/sorgente|^source$|source database/,"source"],[/ingestion|ingestione/,"intake"],
   [/modifich|change|cambi/,"cdc"],[/broker|stream/,"stream"],
   [/replay|raw|ripristino|recovery|originali|bronze/,"raw"],[/processing|elaborazione|trasformazione|transformation/,"batch"],
   [/tabelle|table|destinazione|destination|dataset|publish|silver|gold/,"curated"],
   [/utilizzo|consumo|serving|accesso a bassa|alert|consumption/,"serve"]
 ];
 return byType.find(([pattern])=>pattern.test(key))?.[1]??"controls";
}
async function implementationGuide(state,result){
 const picture=await convertDiagram(visualDiagram(result,state.project));
 const h=(title,level="Heading1")=>p(title,level);
 const p=(value,style)=>'<w:p>'+(style?'<w:pPr><w:pStyle w:val="'+style+'"/></w:pPr>':"")+'<w:r><w:t xml:space="preserve">'+xml(value)+'</w:t></w:r></w:p>';
 const links=[], examples=[];
 const link=(label,url,anchor)=>{
   const attrs=url?'r:id="rIdLink'+links.push(url)+'"':'w:anchor="'+anchor+'"';
   return '<w:hyperlink '+attrs+'><w:r><w:rPr><w:color w:val="006451"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">'+xml(label)+'</w:t></w:r></w:hyperlink>';
 };
 const line=(items)=>'<w:p>'+items.join('<w:r><w:t xml:space="preserve">   ·   </w:t></w:r>')+'</w:p>';
 const videoSearch=(name,role)=>"https://www.youtube.com/results?search_query="+encodeURIComponent(name+" "+role+" quickstart under 10 minutes");
 const courseSearch=(name,role)=>"https://www.udemy.com/courses/search/?q="+encodeURIComponent(name+" "+role+" hands on");
 const fallbackDocs="https://learn.microsoft.com/azure/architecture/data-guide/technology-choices/data-storage";
 const allPaths=[...result.streams,{label:t("Controlli trasversali"),nodes:[
   {role:"Governance",tech:result.catalog},{role:t("Sicurezza"),tech:result.security},{role:phrase("Orchestrazione","Orchestration"),tech:result.orchestrator},
   ...(result.deployment.iac?[{role:"Infrastructure as Code",tech:result.deployment.iac}]:[]),{role:"CI/CD",tech:result.deployment.ci}
 ]}];
 const operations=result.decisions.filter(item=>["quality","network","recovery"].includes(item.id));
 if(operations.length)allPaths.push({label:phrase("Configurazione e gestione","Configuration and operations"),nodes:operations.map(item=>({role:{quality:phrase("Qualità dei dati","Data quality"),network:phrase("Rete e accessi","Network and access"),recovery:t("Ripristino")}[item.id],tech:item.technology}))});
 const options=result.toolChoices.filter(item=>!item.applies);
 if(options.length)allPaths.push({label:phrase("Alternative da verificare","Alternatives to verify"),nodes:options.map(({role,tech})=>({role,tech}))});
 const details=allPaths.flatMap(({label,nodes},pathIndex)=>[h(label),...nodes.flatMap(({role,tech},i)=>{
   const description=(pathIndex+1)+"."+(i+1)+" "+role+" · "+tech;
   const anchor="example_"+examples.length;
   const exerciseType=practiceFor(role);
   const task=phrase(...stagePractice[exerciseType]);
   const resources=technologiesIn(tech);
   examples.push({anchor,title:description,task,tech,role,exerciseType,resources});
   const official=phrase("Documentazione ufficiale","Official documentation");
   const example=phrase("Esempio pratico","Hands-on example");
   const localExample=phrase("Esempio nel documento","Example in this document");
   const shortVideo=phrase("Video su YouTube","YouTube video");
   const searchVideo=phrase("Cerca un video breve su YouTube","Find a short YouTube video");
   const course=phrase("Corso su Udemy","Udemy course");
   const searchCourse=phrase("Cerca un corso pratico su Udemy","Find a hands-on Udemy course");
   const rationale=technologyReason(tech,result.toolChoices);
   return [h(description,"Heading2"),...(rationale?[p(rationale)]:[]),...((resources.length?resources:[{name:role,search:tech}]).flatMap(entry=>
     [p(entry.name),line([
       link(entry.docs?official:phrase("Guida ufficiale al pattern","Official pattern guide"),entry.docs||fallbackDocs),
       link(entry.example?example:localExample,entry.example,anchor),
       link(entry.video?shortVideo:searchVideo,entry.video?"https://www.youtube.com/watch?v="+entry.video:videoSearch(entry.search||entry.name,role)),
       link(entry.course?course:searchCourse,entry.course||courseSearch(entry.search||entry.name,role))
     ])])),...((i<nodes.length-1)?[p(phrase("Passaggio successivo: ","Next step: ")+nodes[i+1].role)]:[])];
 })]);
 const body=[
   h(phrase("Guida all’implementazione","Implementation guide"),"Title"),
   p(state.project.trim()||t("Progetto di architettura dati")),
   p(t("Stack di riferimento")+" · "+result.stack),
   h(phrase("Diagramma dell’architettura","Architecture diagram")),wordDiagram(picture),
   h(phrase("Architettura e modello dati consigliati","Recommended architecture and data model")),
   ...recommendationEntries(result).flatMap(([label,decision])=>[h(label+" · "+decision.title,"Heading2"),p(decision.reason)]),
   ...medallionWord(result.layerPlan,h,label=>h(label,"Heading2"),p,true),
   ...preferenceWord(result.technologies,h,label=>h(label,"Heading2"),p),
   h(phrase("Rilascio delle pipeline","Pipeline deployment")),
   p(phrase("Configura ","Configure ")+result.deployment.ci+phrase(" per eseguire test sulle pull request e promuovere gli artefatti approvati tra gli ambienti. Dopo il rilascio verifica una prima esecuzione su dati di prova con "," to run pull request checks and promote approved artifacts across environments. After deployment use ")+result.orchestrator+phrase("."," to verify a smoke run on sample data.")),
   ...(result.deployment.iac?[p(phrase("Con ","With ")+result.deployment.iac+phrase(" versiona la configurazione dell’infrastruttura. Esegui un’anteprima delle modifiche nella pipeline e promuovi il rilascio dopo revisione, usando identità distinte per ambiente."," version infrastructure configuration. Preview changes in the pipeline and promote the release after review using separate identities for each environment."))]:[]),
   ...(result.layerPlan.docs?[line([link(phrase("Documentazione Medallion","Medallion documentation"),result.layerPlan.docs)])]:[]),
   ...storagePlanWord(result.storagePlan,h,label=>h(label,"Heading2"),p),
   ...(dbStacks.includes(result.platform.chosen)?[p(phrase("Per i job Databricks, valuta Declarative Automation Bundles per versionare e distribuire le definizioni dei job nei diversi workspace.","For Databricks jobs, consider Declarative Automation Bundles to version and deploy job definitions across workspaces."))]:[]),
   h(phrase("Scelta di piattaforma e BI","Platform and BI selection")),...platformExplanation(state,result).rows.map(line=>p(line)),p(result.bi.name+" · "+result.bi.reason),
   p(phrase("I passaggi seguono l’ordine dei flussi nel diagramma. Quando manca una risorsa diretta, il documento indica un esempio interno o una ricerca mirata su YouTube o Udemy. I corsi possono coprire più componenti del flusso.","Steps follow the flow order in the diagram. When a direct resource is unavailable, the document provides an internal example or a focused YouTube or Udemy search. Courses may cover more than one part of the flow.")),
   ...details,
   h(phrase("Esempi da provare","Exercises to try")),
   p(phrase("Gli esempi usano risorse e dati fittizi. Sostituisci i nomi con quelli dell’ambiente di prova. Le schede di configurazione mostrano i valori da impostare e il test da eseguire.","Examples use sample resources and data. Substitute names from your test environment. Configuration worksheets show settings and the test to run.")),
   ...examples.flatMap(({anchor,title,task,tech,role,exerciseType,resources},index)=>[
     '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:bookmarkStart w:id="'+(index+1)+'" w:name="'+anchor+'"/><w:r><w:t>'+xml(title)+'</w:t></w:r><w:bookmarkEnd w:id="'+(index+1)+'"/></w:p>',
     p(phrase("Tecnologia o pattern scelto","Selected technology or pattern")+" · "+tech),p(task),
     ...(resources.length?resources:[{name:""}]).flatMap(({name})=>{
       const [format,lines]=implementationExample(name,role,tech,exerciseType);
       return [p(name?name+" · "+format:format),wordCodeBlock(lines)];
     })
   ])
 ].join("");
 return wordPackage(body,{picture,links});
}
