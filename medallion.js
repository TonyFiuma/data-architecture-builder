const medallionRoles={
 bronze:"Bronze",
 silver:"Silver",
 gold:"Gold"
};

function simplerLayering(state,flow){
 const a=state.answers;
 if(flow.analytical&&flow.batchPath&&!flow.lake)return {
   title:phrase("Staging → data mart","Staging → data mart"),
   reason:phrase("Carica gli incrementi in staging, controlla chiavi e conteggi e pubblica il mart in ","Load increments into staging, validate keys and counts, and publish the mart in ")+flow.services.sql+
     phrase(". Mantieni l’eventuale archivio raw per il replay. Introduci un layer Silver persistente se le tabelle validate devono essere riusate da più mart o serve uno storico indipendente.",". Retain any raw archive for replay. Add a persistent Silver layer if several marts need the same validated tables or require independent history.")
 };
 if(!flow.batchPath&&a.consumer==="api")return {
   title:phrase("Pipeline diretta verso il serving operativo","Direct pipeline to operational serving"),
   reason:phrase("Valida i record durante l’elaborazione e aggiorna lo store o invia l’alert. Conserva un archivio separato solo se richiesto per replay, audit o ripristino.","Validate records during processing and update the store or send the alert. Keep a separate archive if required for replay, audit or recovery.")
 };
 return {
   title:phrase("Landing → dataset curato","Landing → curated dataset"),
   reason:phrase("Conserva gli originali nella landing se previsto e pubblica un dataset validato con la granularità richiesta. Se più prodotti condividono regole e dati validati, separa quel layer dalle tabelle di consumo.","Keep originals in the landing area when needed and publish a validated dataset at the required grain. If several products share rules and validated data, separate that layer from the serving tables.")
 };
}

function medallionPlan(state,flow){
 const {lake,separateWarehouse,analytical,batchPath,keepRaw,services,layout,processing,orchestrator,ingress,cdc,bi,stackId,model}=flow;
 const a=state.answers;
 const reusable=analytical||a.consumer==="ml";
 const reconciled=a.fresh==="hybrid"||a.quality==="scd"||a.scale==="backfill";
 const relevant=batchPath&&keepRaw&&reusable&&(lake||analytical&&reconciled);
 const alternative=simplerLayering(state,flow);
 if(!relevant)return {...alternative,layers:[]};
 const silver=lake?layout:services.sql;
 const gold=separateWarehouse||!lake?services.sql:layout;
 const bronzeLoad=cdc||ingress;
 const goldConsumer=bi.key==="none"?phrase("il consumatore previsto","the intended consumer"):bi.name;
 const validation={
   scd:phrase("Mantieni lo storico richiesto e usa la versione della dimensione valida al momento del fatto.","Keep the required history and use the dimension version valid at fact time."),
   late:phrase("Usa event time e una regola esplicita per correggere i dati oltre la soglia di ritardo.","Use event time and an explicit rule to correct records beyond the lateness threshold."),
   schema:phrase("Isola i record incompatibili in quarantena e registra il motivo dello scarto.","Quarantine incompatible records and record the rejection reason.")
 }[a.quality]||phrase("Riprocessa lo stesso input senza duplicare le chiavi.","Reprocess the same input without creating duplicate keys.");
 const layers=[
  {role:medallionRoles.bronze,store:services.obj,
   description:phrase("Originali con metadati di ingestione, pronti per audit e replay.","Original data with ingestion metadata, ready for audit and replay."),
   implementation:phrase("Usa ","Use ")+bronzeLoad+phrase(" per acquisire gli incrementi in un’area bronze. Conserva payload, sorgente, timestamp di ingestione e identificativo del file, batch o offset disponibile. Registra il checkpoint dopo la scrittura riuscita e applica la retention del piano storage."," to capture increments into a bronze area. Keep the payload, source, ingestion timestamp and available file, batch ID or offset. Commit progress after a successful write and apply the storage plan’s retention.")},
  {role:medallionRoles.silver,store:silver,
   description:phrase("Dati tipizzati, validati e deduplicati alla granularità della sorgente.","Typed, validated and deduplicated data at source grain."),
   implementation:phrase("Esegui con ","Use ")+processing+phrase(" un job incrementale Bronze → Silver. Applica schema e chiave, separa gli scarti e registra i conteggi. Per update e delete usa l’ordine della sorgente e un upsert o una cancellazione idempotente dove applicabile. "," for an incremental Bronze → Silver job. Apply schema and key rules, quarantine rejects and record counts. For updates and deletes, use source ordering and idempotent upserts or deletes where applicable. ")+validation},
  {role:medallionRoles.gold,store:gold,
   description:phrase("Dati pubblicati per ","Data published for ")+goldConsumer+phrase(" con il modello "," using ")+model.title+".",
   implementation:phrase("Parti da Silver e definisci granularità, chiave e regole di aggregazione del dataset Gold. Pubblica il modello consigliato in ","Start from Silver and define the Gold grain, key and aggregation rules. Publish the recommended model to ")+gold+phrase(" e verifica conteggi, metriche e freschezza prima del refresh."," and validate counts, metrics and freshness before refresh.")+
    (gold!==silver?phrase(" Registra la versione o finestra Silver pubblicata e riconcilia il caricamento tra i due store."," Record the published Silver version or window and reconcile the load across stores."):"")}
 ];
 const docs=dbStacks.includes(stackId)?"https://docs.databricks.com/aws/en/lakehouse/medallion":
   stackId==="azure"?"https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture":"";
 return {
   title:"Medallion · Bronze / Silver / Gold",
   reason:lake?phrase("Conserva gli originali per il replay, riusa l’output validato di Silver e pubblica in Gold il modello per il consumo previsto.","Retain originals for replay, reuse validated Silver data and publish the serving model in Gold."):
     phrase("Lo storico o la riconciliazione giustificano un layer Silver riutilizzabile prima della pubblicazione Gold nel warehouse.","History or reconciliation justifies a reusable Silver layer before Gold publication in the warehouse."),
   layers,docs,
   alternative:{...alternative,reason:phrase("Questa opzione diventa adatta se viene meno il requisito di riuso dei dati validati, di storico separato o di pubblicazione indipendente. ","Consider this option if reusable validated data, separate history or independent publication is no longer required. ")+alternative.reason},
   exercise:phrase("Configura le dipendenze con ","Set up dependencies in ")+orchestrator+phrase(". Carica tre righe: evento A con importo 10, una copia identica di A ed evento B con importo non valido. Attesi: tre righe in Bronze, una valida e uno scarto in Silver, totale 10 in un aggregato Gold di prova. Ripeti il batch e verifica che il totale sia ancora 10.",". Load three rows: event A with amount 10, an identical copy of A, and event B with an invalid amount. Expect three Bronze rows, one valid Silver row and one rejection, and a total of 10 in a test Gold aggregate. Rerun the batch and verify the total stays at 10.")
 };
}

function medallionWord(plan,heading,sub,paragraph,implementation=false){
 return [
   heading(phrase("Organizzazione dei dati","Data layering")),
   sub(plan.title),paragraph(plan.reason),
   ...plan.layers.flatMap(layer=>[sub(layer.role+" · "+layer.store),paragraph(layer.description),...(implementation?[paragraph(layer.implementation)]:[])]),
   ...(plan.alternative?[sub(phrase("Alternativa · ","Alternative · ")+plan.alternative.title),paragraph(plan.alternative.reason)]:[]),
   ...(implementation&&plan.exercise?[sub(phrase("Prova di accettazione Bronze → Silver → Gold","Bronze → Silver → Gold acceptance test")),paragraph(plan.exercise)]:[])
 ];
}
