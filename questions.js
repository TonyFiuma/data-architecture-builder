/* Options follow the decision slides. The final three cover the sizing follow-up. */
const groups = [
  ["Requisiti e sorgenti", "01", [
    ["consumer","Chi userà i dati e a che scopo?","Consumer and serving",[
      ["bi","Dashboard ricorrenti","Mart con fatti, dimensioni e modello semantico","Una vista curata rende ripetibili metriche, permessi e aggiornamenti."],
      ["explore","Analisi ad hoc","SQL su dati curati","Gli analisti possono interrogare tabelle con schema e accessi governati."],
      ["api","API operativa o alert","Serving a bassa latenza","Il percorso operativo deve rispettare il tempo di risposta o di intervento."],
      ["ml","Data science o ML","Storico con accessi controllati e letture distribuite","Esperimenti e training richiedono dati storici riproducibili."]]],
    ["fresh","Entro quanto tempo devono essere disponibili i dati?","Freshness and delivery",[
      ["batch","Entro qualche ora o per la mattina successiva","Batch incrementale schedulato","Una finestra di elaborazione permette di raccogliere e processare i dati insieme."],
      ["micro","Entro pochi minuti, con arrivi regolari","Microbatch","Piccoli lotti rendono frequente la pubblicazione se avvio e ritardi rientrano nello SLO."],
      ["stream","Entro pochi secondi, per attivare un’azione","Streaming continuo","Un percorso continuo riduce l’attesa tra evento e azione."],
      ["hybrid","Alert rapidi e report certificati","Percorso streaming e riconciliazione batch","I due consumatori hanno requisiti di latenza e correttezza diversi."]]],
    ["source","Come riceviamo i nuovi dati dalla sorgente?","File and API ingestion",[
      ["files","File su object storage","Individuazione dei nuovi file tramite manifest o checkpoint","Un marker o un checkpoint consente di individuare i file già processati."],
      ["sftp","File da un server SFTP","Trasferimento gestito e landing","La landing separa le consegne esterne dalle elaborazioni."],
      ["rest","API REST che restituisce i risultati a pagine","Estrazione con cursore, retry e rate limit","Un cursore persistente rende gestibili ripartenze e paginazione."],
      ["saas","SaaS con connettore gestito","Connettore gestito","La copertura del connettore può ridurre manutenzione e codice custom."],
      ["events","Eventi push o webhook","Buffer durevole prima del consumo","Un buffer separa il produttore dal ritmo del consumer."],
      ["db","Database relazionale (Oracle, MySQL, SQL Server o simili)","Estrazione incrementale tramite connettore o CDC","Scegli come acquisire le modifiche in base a permessi, frequenza e impatto sul sorgente."]]],
    ["cdc","Come arrivano aggiornamenti e cancellazioni?","Database change capture",[
      ["none","Sorgente senza cambi di database","Acquisizione di file, API o eventi","Le modalità di consegna della sorgente determinano come rilevare e applicare le modifiche."],
      ["append","Solo insert o append","Estrazione incrementale per chiave o cursore","Basta ripartire da un progresso affidabile se i record precedenti restano immutati."],
      ["update","Aggiornamenti con data e ora di modifica","Watermark, sovrapposizione e MERGE","La sovrapposizione recupera aggiornamenti tardivi. Una chiave stabile protegge dai duplicati."],
      ["logs","Update e delete con accesso ai log","Snapshot iniziale e CDC da log","I log consentono di propagare i cambi e le cancellazioni dopo il caricamento iniziale."],
      ["tomb","Cancellazioni da rilevare senza accesso ai log","Change feed, tombstone o riconciliazione","Serve una fonte esplicita per individuare le eliminazioni e rispettare lo SLO."]]],
    ["scale","Quanti dati arrivano e come varia il carico?","Volume, peaks, and backfill",[
      ["sql","Carico ordinario con trasformazioni SQL","Carico gestito e SQL nel warehouse","Il motore esegue le trasformazioni relazionali vicino ai dati."],
      ["heavy","Molti dati da interpretare o unire","Benchmark di compute distribuito","Parallelismo e partizioni possono ridurre la finestra di lavoro."],
      ["peaks","Picchi brevi e intensi","Buffer e consumer dimensionati sul picco","Il backlog dipende dalla differenza tra ingresso e capacità di elaborazione."],
      ["backfill","Molti dati storici da caricare o rielaborare","Risorse dedicate al caricamento dello storico","L’isolamento protegge i flussi giornalieri mentre si carica lo storico."]]],
  ]],
  ["Storage ed elaborazione", "02", [
    ["storage","Quali dati vanno conservati, aggiornati o condivisi?","Storage and table format",[
      ["warehouse","Dati strutturati per analisi SQL","Warehouse gestito","Tabelle curate e compute SQL supportano la pubblicazione dei mart."],
      ["archive","Dati originali da conservare o archivio a basso costo","Object storage con lifecycle","I file originali permettono replay e retention a livelli diversi."],
      ["lakehouse","Aggiornamenti su object storage","Tabelle lakehouse transazionali","Un formato tabellare aggiunge semantiche di modifica e metadati sui file."],
      ["multi","Più motori sulle stesse tabelle","Formato e catalogo condivisi","Reader e writer devono essere compatibili con le stesse funzionalità abilitate."],
      ["dual","Rilettura dei dati originali e molti utenti BI in contemporanea","Object storage e mart separati","Le query frequenti leggono un serving ottimizzato mentre lo storico rimane disponibile."]]],
    ["transform","Quali operazioni deve svolgere l’elaborazione?","Transformation engine",[
      ["rel","Join e aggregazioni relazionali","Trasformazione SQL dove risiedono i dati (ELT)","Riduce la necessità di spostare dati quando il motore analitico soddisfa la finestra."],
      ["python","Parsing distribuito o logica Python","Elaborazione dati con Python","La scelta tra macchina singola e distribuzione dipende da picco RAM, tempi e parallelismo."],
      ["route","Routing o validazione senza stato","Consumer stateless","Una funzione o un container può bastare quando l’elaborazione è breve e indipendente per evento."],
      ["stateful","Finestre, stato ed event time","Motore streaming con checkpoint","Lo stato e le finestre richiedono gestione di ritardi, recovery e dimensionamento dedicato."]]],
    ["engine","Quale strumento usare per elaborare i dati in batch?","Pandas, PySpark or SQL",[
      ["auto","Decidere in base al carico","Scelta guidata dal workload","Si parte da SQL per trasformazioni relazionali e da un benchmark Python per parsing, memoria e tempi."],
      ["pandas","Pandas su macchina singola","Processo Python in memoria","Pandas è adatto se input decompresso e intermedi entrano nella RAM con margine, entro la finestra."],
      ["spark","PySpark su compute distribuito","Job Spark con partizionamento","PySpark distribuisce scansioni e trasformazioni. Shuffle, skew e avvio vanno misurati."],
      ["sql","SQL nel motore dati","ELT SQL gestito","Query e trasformazioni rimangono nel motore che ospita i dati."]]],
    ["broker","Che cosa deve garantire il sistema di messaggistica?","Streaming broker",[
      ["none","Non serve un broker","Ingestione diretta o per file","In un flusso schedulato la landing e i retry possono bastare."],
      ["native","Distribuzione degli stessi eventi a più destinatari sul cloud scelto","Broker cloud-native","Un servizio gestito riduce la gestione dell’infrastruttura del broker."],
      ["kafka","Client o contratti Kafka esistenti","Kafka gestito o endpoint compatibile","Conserva la compatibilità richiesta dopo prove con client, autenticazione e API effettive."],
      ["buffer","Gli eventi possono attendere qualche minuto prima della consegna","Consegna a lotti verso destinazione durevole","Raggruppare le scritture riduce operazioni e file piccoli quando la latenza lo consente."],
      ["replay","Replay oltre la retention del broker","Broker e archivio raw","Offset e dati raw permettono replay oltre la finestra del broker."]]],
    ["quality","Quale problema di qualità dei dati va gestito per primo?","Data quality and history",[
      ["dup","Nuovi tentativi di elaborazione e dati duplicati","Identificativo stabile e scritture idempotenti","Un retry non deve pubblicare una seconda copia dello stesso record."],
      ["late","Eventi fuori ordine","Event time, watermark e correzioni","Le finestre devono gestire i ritardi e le correzioni oltre la soglia."],
      ["scd","Storico degli attributi per entità","SCD2 con date di validità","Le versioni rendono riproducibile lo stato valido in una data passata."],
      ["schema","Schema incompatibile o dati invalidi","Contratti, quarantena e riconciliazione","I record invalidi possono essere separati e recuperati dopo correzione."]]],
  ]],
  ["Serving e sicurezza", "03", [
    ["query","Come verranno consultati i dati?","Query latency and concurrency",[
      ["occasional","Query saltuarie sullo storico","Motore SQL compatibile con il lake","Le scansioni saltuarie possono conciliare storico economico e accesso on demand."],
      ["dash","Picchi BI prevedibili","Preaggregazioni e compute BI isolato","I picchi delle dashboard non devono rallentare ingestione e trasformazioni."],
      ["event","Analisi di eventi con molti valori distinti","Serving per analisi di eventi","Il modello deve rendere efficienti filtri temporali e aggregazioni interattive."],
      ["point","Lettura di singoli record in pochi millisecondi","Database operativo o cache","Chiavi e indici contano più del volume totale per le letture puntuali."]]],
    ["database","Quale tipo di database è adatto alle letture e alle scritture previste?","Relational, NoSQL or analytical database",[
      ["auto","Scegliere in base all’accesso","Database guidato dal consumo","Si distinguono query analitiche, transazioni, eventi e letture per chiave."],
      ["rel","SQL relazionale con join e transazioni","Database relazionale","Vincoli, relazioni e transazioni tra entità sono requisiti centrali."],
      ["kv","NoSQL chiave-valore","Store orientato a chiave","Accessi puntuali ripetibili e una chiave ben distribuita guidano il modello."],
      ["doc","NoSQL a documenti","Document database","Si legge o si aggiorna spesso un documento come unità. La chiave di partizione va provata."],
      ["olap","Scansioni, reporting e aggregazioni","Warehouse analitico","Il motore privilegia query estese, aggregazioni e concorrenza dei report."],
      ["event","Query interattive sulla telemetria","Database per eventi","Filtri temporali e aggregazioni veloci su eventi sono l’accesso predominante."]]],
    ["catalog","Quali dati devono essere reperibili e chi ne gestisce l’accesso?","Catalog and governance",[
      ["business","Ricerca dei dati tra reparti, responsabili e tracciabilità","Catalogo aziendale","Il catalogo rende consultabili definizioni e responsabilità dei dataset."],
      ["meta","Registrazione delle tabelle per i motori","Catalogo tecnico o metastore","I motori devono condividere la posizione e i metadati delle tabelle."],
      ["uc","Controllo degli asset Databricks","Unity Catalog","Controlli di accesso a tabelle e storage si gestiscono nello stack Databricks."],
      ["policy","Accesso a dati analitici condivisi","Policy nel motore e protezione dei file","Verificare anche il percorso BI e i permessi di accesso diretto ai file."]]],
    ["identity","Quale controllo di sicurezza è prioritario?","Identity and sensitive data",[
      ["people","Accesso per ruolo degli utenti","Gruppi e minimo privilegio","I permessi per gruppo rendono più semplice approvazione, revoca e audit."],
      ["work","Identità di applicazioni, pipeline e processi di rilascio","Identità dedicate e credenziali brevi","I ruoli di deploy e runtime hanno scopi differenti."],
      ["rows","Righe o colonne riservate","Filtri, masking o viste curate","Il controllo va applicato sulla superficie che serve effettivamente i dati."],
      ["keys","Segreti e chiavi gestiti","Vault e chiavi gestite","Segreti e cifratura richiedono accessi limitati e procedure di rotazione."]]],
    ["network","Dove possono essere conservati e transitare i dati?","Network and residency",[
      ["region","Regione o area geografica approvata","Storage e compute in località compatibili","Verifica che repliche, log, staging e backup rientrino nello stesso vincolo."],
      ["onprem","Sorgenti on-premise su percorso privato","Connettività ibrida e runtime compatibile","Verifica rotte, autenticazione e throughput dal data center."],
      ["private","Accesso privato nel cloud","Endpoint privati e DNS","Testa la risoluzione DNS e la raggiungibilità di tutte le dipendenze."],
      ["retention","Retention e cancellazione regolamentate","Lifecycle e cancellazione delle copie","Raw, tabelle, cache e backup possono avere finestre differenti."]]],
  ]],
  ["Esercizio e capacità", "04", [
    ["ops","Come coordineremo le pipeline e rilasceremo le modifiche?","Orchestration and deployment",[
      ["sql","Dipendenze principalmente SQL","Schedulazione nativa SQL o dbt","Le dipendenze sono più facili da gestire nel progetto di trasformazione."],
      ["multi","Workflow su più sistemi","Orchestratore gestito o DAG","Un workflow coordina servizi, retry e dipendenze eterogenee."],
      ["dbx","Carico principalmente in Databricks","Lakeflow Jobs e deploy dichiarativo","I job e gli ambienti possono essere gestiti con configurazione versionata."],
      ["cicd","Ambienti separati e rilasci ripetibili","Terraform e CI/CD","La promozione di artefatti testati riduce divergenze tra ambienti."]]],
    ["recovery","Entro quanto deve ripartire il servizio dopo un guasto?","Recovery and ownership",[
      ["retry","Si può recuperare al prossimo batch","Retry e riesecuzione idempotente","Salvare lo stato per finestra rende il rilancio verificabile."],
      ["replay","Replay entro una finestra precisa","Archiviare raw, offset e checkpoint","Si possono ricostruire le tabelle senza rileggere la sorgente oltre la sua retention."],
      ["dr","Tolleranza ridotta alla perdita di dati e ai tempi di fermo","Backup, replica e test di failover","RPO e RTO vanno misurati con prove reali a capacità rappresentativa."],
      ["dq","Ripristino dopo dati incoerenti","Sospensione, riconciliazione e ripubblicazione","L’owner deve poter fermare il publish, correggere e riprocessare."]]],
    ["budget","Qual è il vincolo operativo principale?","Budget and operating constraints",[
      ["team","Team piccolo e carico variabile","Servizi gestiti e carichi semplici","La manutenzione viene considerata insieme a costo e latenza."],
      ["fixed","Carico elevato ma prevedibile","Benchmark costo per capacità e consumo","Il profilo stabile permette di confrontare un carico misurato con più modelli di costo."],
      ["existing","Stack o standard già approvati","Riutilizzo dei servizi esistenti","Integrazione, competenze e governance esistenti riducono l’effort di adozione."],
      ["exit","Portabilità o requisito di uscita","Formati e tooling portabili dove utili","Interoperabilità e costi di trasferimento devono essere testati sui carichi reali."]]],
    ["capacity","Quali dati abbiamo per stimare le risorse necessarie?","Storage, RAM and compute",[
      ["estimate","Conosciamo il volume, il periodo di conservazione e il tempo per elaborare i dati","Stima di capacità con ipotesi esplicite","Volume e retention stimano lo storage. La finestra impone il throughput minimo."],
      ["benchmark","Abbiamo misure ottenute con un carico realistico","Stima a partire da memoria e throughput misurati","Si possono proporre RAM e worker iniziali quando misure e configurazione sono note."],
      ["unknown","Dobbiamo ancora misurare il carico","Piano di benchmark","Misura bytes letti e scritti, picco RAM, CPU, spill, skew e durata prima di fissare la capacità."]]],
  ]],
];
const questions = groups.flatMap(group => group[2]);
