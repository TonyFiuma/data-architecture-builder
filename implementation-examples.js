/* Short examples use sample names and assume a sandbox with the required resources. */
const implementationSnippets={
 "Amazon S3":["AWS CLI",[
  'aws s3 cp ./events.jsonl \u005c',
  '  s3://example-raw/events/date=2026-01-01/events.jsonl',
  'aws s3 ls s3://example-raw/events/date=2026-01-01/'
 ]],
 "Cloud Storage":["Google Cloud CLI",[
  'gcloud storage cp ./events.jsonl \u005c',
  '  gs://example-raw/events/date=2026-01-01/events.jsonl',
  'gcloud storage ls gs://example-raw/events/date=2026-01-01/'
 ]],
 "ADLS Gen2":["Azure CLI",[
  'az storage fs file upload --auth-mode login \u005c',
  '  --account-name exampleraw --file-system raw \u005c',
  '  --source ./events.jsonl --path events/2026-01-01/events.jsonl'
 ]],
 "Kinesis Data Streams":["AWS CLI",[
  'aws kinesis put-record --stream-name demo-events \u005c',
  '  --partition-key sensor-01 --cli-binary-format raw-in-base64-out \u005c',
  '  --data \'{"event_id":"e-001","sensor_id":"sensor-01"}\''
 ]],
 "Pub/Sub":["Google Cloud CLI",[
  'gcloud pubsub topics publish demo-events \u005c',
  '  --message=\'{"event_id":"e-001","reading":21.5}\''
 ]],
 "Apache Kafka":["Kafka CLI",[
  'printf \'%s\\n\' \'{"event_id":"e-001","reading":21.5}\' | \u005c',
  '  bin/kafka-console-producer.sh \u005c',
  '    --bootstrap-server localhost:9092 --topic demo-events'
 ]],
 "Event Hubs":["Python · azure-eventhub",[
  'from azure.eventhub import EventData, EventHubProducerClient',
  'from azure.identity import DefaultAzureCredential',
  '',
  'with EventHubProducerClient(',
  '    fully_qualified_namespace="example.servicebus.windows.net",',
  '    eventhub_name="demo-events", credential=DefaultAzureCredential()',
  ') as producer:',
  '    batch = producer.create_batch(partition_key="sensor-01")',
  '    batch.add(EventData(\'{"event_id":"e-001"}\'))',
  '    producer.send_batch(batch)'
 ]],
 "BigQuery":["GoogleSQL",[
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM `demo-project.analytics.events`',
  'WHERE event_id IS NOT NULL',
  'GROUP BY sensor_id;'
 ]],
 "Fabric Warehouse":["T-SQL",[
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM dbo.events WHERE event_id IS NOT NULL',
  'GROUP BY sensor_id;'
 ]],
 "Amazon Redshift":["SQL",[
  'COPY staging.events FROM \'s3://example-raw/events/\'',
  'IAM_ROLE \'arn:aws:iam::123456789012:role/example-copy-role\'',
  'FORMAT AS JSON \'auto\';',
  'SELECT COUNT(*) FROM staging.events;'
 ]],
 "Snowflake":["Snowflake SQL",[
  'COPY INTO demo.analytics.events',
  'FROM @demo.analytics.raw_stage/events/',
  'FILE_FORMAT = (TYPE = JSON);',
  'SELECT COUNT(*) FROM demo.analytics.events;'
 ]],
 "Auto Loader":["PySpark · Databricks",[
  'raw = (spark.readStream.format("cloudFiles")',
  '       .option("cloudFiles.format", "json")',
  '       .option("cloudFiles.schemaLocation", "/Volumes/demo/raw/events/schema")',
  '       .load("/Volumes/demo/raw/events/incoming"))',
  '(raw.writeStream.format("delta")',
  '    .option("checkpointLocation", "/Volumes/demo/raw/events/checkpoint")',
  '    .trigger(availableNow=True).toTable("demo.raw.sensor_events"))'
 ]],
 "Apache Spark":["PySpark",[
  'from pyspark.sql import functions as F',
  'events = spark.read.parquet("path/to/events")',
  'totals = (events.filter(F.col("event_id").isNotNull())',
  '          .groupBy("sensor_id").count())',
  'totals.write.mode("overwrite").parquet("path/to/sandbox/totals")'
 ]],
 "pandas":["Python · pandas",[
  'import pandas as pd',
  'events = pd.read_json("events.jsonl", lines=True)',
  'valid = events.dropna(subset=["event_id", "sensor_id"])',
  'counts = valid.groupby("sensor_id").size().rename("event_count")',
  'counts.to_csv("counts.csv")'
 ]],
 "DuckDB":["DuckDB SQL",[
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM read_json_auto(\'events.jsonl\')',
  'WHERE event_id IS NOT NULL GROUP BY sensor_id;'
 ]],
 "dbt":["SQL · models/event_counts.sql",[
  '{{ config(materialized="table") }}',
  'select sensor_id, count(*) as event_count',
  "from {{ source('staging', 'events') }}",
  'where event_id is not null',
  'group by sensor_id'
 ]],
 "Dataform":["SQLX · definitions/event_counts.sqlx",[
  'config { type: "table" }',
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM ${ref("events")}',
  'WHERE event_id IS NOT NULL GROUP BY sensor_id'
 ]],
 "Delta Lake":["Delta SQL",[
  'MERGE INTO demo.analytics.events AS target',
  'USING demo.staging.events_deduplicated AS source',
  'ON target.event_id = source.event_id',
  'WHEN MATCHED THEN UPDATE SET *',
  'WHEN NOT MATCHED THEN INSERT *;'
 ]],
 "Unity Catalog":["Databricks SQL",[
  'GRANT USE CATALOG ON CATALOG demo TO `demo_readers`;',
  'GRANT USE SCHEMA ON SCHEMA demo.analytics TO `demo_readers`;',
  'GRANT SELECT ON TABLE demo.analytics.events TO `demo_readers`;'
 ]],
 "Databricks SQL":["Databricks SQL",[
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM demo.analytics.events',
  'WHERE event_id IS NOT NULL GROUP BY sensor_id;'
 ]],
 "AWS Glue":["PySpark · AWS Glue",[
  'from awsglue.context import GlueContext',
  'from pyspark.context import SparkContext',
  'glue = GlueContext(SparkContext.getOrCreate())',
  'events = glue.create_dynamic_frame.from_catalog(',
  '    database="demo_raw", table_name="events"',
  ').toDF()',
  'events.groupBy("sensor_id").count().show()'
 ]],
 "AWS Glue Data Catalog":["AWS CLI",[
  'aws glue get-table --database-name demo_raw --name events \u005c',
  '  --query Table.StorageDescriptor.Location'
 ]],
 "Apache Flink":["Flink SQL",[
  'SELECT sensor_id, COUNT(*) AS event_count',
  'FROM TABLE(TUMBLE(',
  '  TABLE events, DESCRIPTOR(event_time), INTERVAL \'1\' MINUTE',
  '))',
  'GROUP BY sensor_id, window_start, window_end;'
 ]],
 "Managed Service for Apache Flink":["Flink SQL",[
  'SELECT sensor_id, window_start, COUNT(*) AS event_count',
  'FROM TABLE(TUMBLE(',
  '  TABLE events, DESCRIPTOR(event_time), INTERVAL \'1\' MINUTE',
  '))',
  'GROUP BY sensor_id, window_start, window_end;'
 ]],
 "Apache Airflow":["Python · Airflow 3",[
  'from airflow.sdk import dag, task',
  'from pendulum import datetime',
  '',
  '@dag(schedule="@daily", start_date=datetime(2026, 1, 1), catchup=False)',
  'def events_pipeline():',
  '    @task',
  '    def check_events():',
  '        assert len([{"event_id": "e-001"}]) == 1',
  '    check_events()',
  '',
  'events_pipeline()'
 ]],
 "Terraform":["HCL · Terraform",[
  'variable "bucket_name" { type = string }',
  '',
  'resource "aws_s3_bucket" "raw" {',
  '  bucket = var.bucket_name',
  '}'
 ]],
 "PostgreSQL":["PostgreSQL SQL",[
  'CREATE TEMP TABLE demo_events (event_id text PRIMARY KEY);',
  "INSERT INTO demo_events VALUES ('e-001') ON CONFLICT DO NOTHING;",
  'SELECT COUNT(*) FROM demo_events;'
 ]]
};

const consoleExamples={
 "Azure Data Factory":[
  ["Activity","Copy data"],["Source dataset","raw_events (JSON)"],["Sink dataset","staging_events (Parquet)"],["Test","Copy two sample files and check rows written"]
 ],
 "Informatica CDI":[
  ["Object","Mapping task"],["Source transformation","demo_events"],["Target transformation","staging_events"],["Test","Run with synthetic records and review session results"]
 ],
 "Informatica CDIR":[
  ["Object","Database ingestion and replication task"],["Source","Supported demo database"],["Tables","demo_events"],["Load mode","Initial and incremental, if supported"],["Test","Compare inserts, updates and deletes"]
 ],
 "Informatica CDGC":[
  ["Object","Catalog source"],["Connection","Sandbox data platform"],["Scan scope","demo.analytics"],["Test","Run the scan and verify that the test asset is discoverable"]
 ],
 "Lakeflow Connect":[
  ["Object","Managed ingestion pipeline"],["Source","Supported database demo connection"],["Destination","demo.raw"],["Test","Compare snapshot counts and check change propagation"]
 ],
 "Power BI":[
  ["Panel","Get data"],["Connector","Choose the architecture’s serving engine"],["Table","demo.analytics.event_counts"],["Visual","Event count by sensor"],["Test","Compare report totals against the source query"]
 ],
 "Microsoft Purview":[
  ["Area","Data Map"],["Source","Sandbox storage account"],["Scan scope","Raw demo container"],["Test","Confirm the test asset appears in the catalog"]
 ],
 "Lake Formation":[
  ["Action","Grant data permissions"],["Principal","demo-readers"],["Resource","demo_raw.events"],["Permission","SELECT"],["Test","Verify using the intended query engine and identity"]
 ],
 "Datastream":[
  ["Object","Stream"],["Source profile","Demo database with change logs enabled"],["Destination profile","Sandbox target"],["Test","Validate connectivity and check a sample update"]
 ],
 "Debezium":[
  ["Object","PostgreSQL connector"],["connector.class","io.debezium.connector.postgresql.PostgresConnector"],["topic.prefix","demo"],["table.include.list","public.demo_events"]
 ],
 "AWS DMS":[
  ["Object","Database migration task"],["Migration type","Full load and ongoing replication"],["Source and target","Sandbox endpoints"],["Table selection","demo.events"]
 ],
 "Cloud Run Jobs":[
  ["Object","Cloud Run job"],["Container","Published event-loader image"],["Arguments","--date=2026-01-01"],["Task count","1 for the initial test"]
 ],
 "AWS Step Functions":[
  ["Workflow type","Standard"],["State","Run the batch task"],["On failure","Retry transient errors and record the failed run"]
 ],
 "Declarative Automation Bundles":[
  ["File","databricks.yml"],["Development target","dev"],["Job resource","demo_events"],["Validation","databricks bundle validate -t dev"]
 ]
};
function sampleConfiguration(technology,role,selection,fields=[]){
 const labels=language==="en"?["Step","Selected component","Environment"]:["Passaggio","Componente scelto","Ambiente"];
 const rows=[[labels[0],role],[labels[1],technology||selection],[labels[2],"sandbox"],...fields];
 return [phrase("YAML · configurazione illustrativa","YAML · illustrative configuration"),[
   phrase("# Promemoria dei campi da compilare nell’interfaccia.","# Worksheet for filling in fields in the interface."),
   "configuration:",
   ...rows.map(([key,value])=>"  "+JSON.stringify(key)+": "+JSON.stringify(value))
 ]];
}
function implementationExample(technology,role,selection,exerciseType){
 const enterpriseFields={
   "Informatica PowerCenter":[["Mapping","m_orders_source_to_stage"],["Session","s_orders_incremental"],["Workflow","wf_orders"],["Restart test","Rerun the same watermark interval and verify row counts."]],
   "Informatica PowerExchange":[["Source key","order_id"],["Capture","Initial snapshot and recorded change position"],["Smoke test","Insert, update and delete one row, then restart from saved progress."]],
   "Qlik Talend":[["Job","orders_to_staging"],["Connections","Source and target defined in the installed Talend Studio project"],["Reject flow","Route invalid records separately and compare read, written and rejected counts."]],
   "IBM DataStage":[["Job","orders_to_staging"],["Run parameters","Source connection, staging target and watermark"],["Sequence test","Run the publish job only after load and validation succeed."]]
 }[technology];
 if(enterpriseFields)return sampleConfiguration(technology,role,selection,enterpriseFields);
 const snippet=implementationSnippets[technology];
 if(snippet&&!(technology==="Terraform"&&!selection.includes("AWS")&&!selection.includes("S3")))return snippet;
 const fields=consoleExamples[technology];
 if(fields)return sampleConfiguration(technology,role,selection,fields);
 const generic={
   source:[["Sample","events.jsonl"],["Required fields","event_id, sensor_id, event_time"]],
   intake:[["Input","events.jsonl"],["Target","staging/events"],["Retry test","Resume after the first upload"]],
   cdc:[["Source table","demo.events"],["Key","event_id"],["Validation","Check one insert, update and delete"]],
   stream:[["Topic or stream","demo-events"],["Key","sensor_id"],["Event time field","event_time"]],
   raw:[["Sample path","raw/events/date=2026-01-01/"],["Verification","Read one day after writing"]],
   batch:[["Read","staging.events"],["Group by","sensor_id"],["Write","analytics.event_counts"]],
   curated:[["Target","analytics.events"],["Key","event_id"],["Check","Unique, non-null events"]],
   serve:[["Dataset","analytics.event_counts"],["Authorized identity","demo-readers"]],
   controls:[["Resource","demo.events"],["Test","Allow one test identity and deny another"]]
 };
 return sampleConfiguration(technology,role,selection,generic[exerciseType]);
}
