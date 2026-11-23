const capacityHelp={
 eventsDay:[
  "Quanti eventi deve ricevere la piattaforma in una giornata. Conta i singoli eventi, anche quando arrivano raggruppati in file o messaggi.",
  "Somma i contatori delle sorgenti o del broker per una giornata rappresentativa, evitando di contare due volte lo stesso flusso. Se il sistema è nuovo, moltiplica il numero di dispositivi o utenti attivi per gli eventi che ciascuno genera al giorno.",
  "The number of events the platform receives in one day. Count individual events even when they arrive in a file or message batch.",
  "Sum source or broker counters for a representative day without counting the same stream twice. For a new system, multiply active devices or users by events generated per device or user per day."
 ],
 size:[
  "Il peso medio di un evento in kilobyte. Scegli se misurare il contenuto originale o quello trasmesso e usa la stessa base per tutte le stime di traffico.",
  "Prendi un campione rappresentativo e dividi i byte totali per il numero di eventi, poi per 1.000. Ad esempio, 2.000.000 byte per 1.000 eventi equivalgono a 2 kB per evento.",
  "The average size of one event in kilobytes. Choose whether you are measuring original or transmitted payloads and use that basis consistently for traffic estimates.",
  "Divide the total bytes in a representative sample by the event count and then by 1,000. For example, 2,000,000 bytes across 1,000 events is 2 kB per event."
 ],
 hours:[
  "Le ore della giornata in cui arrivano gli eventi. Il calcolatore distribuisce il volume giornaliero su queste ore per stimare il tasso medio.",
  "Guarda i conteggi orari delle sorgenti o del broker. Se gli eventi arrivano dalle 08:00 alle 20:00, inserisci 12. Lascia vuoto per usare 24 ore. Misura i picchi a parte.",
  "The hours of the day during which events arrive. The calculator spreads the daily count across these hours to estimate the average rate.",
  "Check hourly source or broker counts. If events arrive from 08:00 to 20:00, enter 12. Leave blank to use 24 hours. Measure peaks separately."
 ],
 peak:[
  "Il tasso di arrivo durante un picco, in eventi al secondo. Serve a stimare il traffico che il sistema deve reggere nei momenti più intensi.",
  "Usa i contatori delle sorgenti o del broker durante il periodo più intenso. Se hai un conteggio al minuto, dividilo per 60 e annota la finestra di misura. Se mancano dati, costruisci uno scenario di picco a partire dalle sorgenti attive nello stesso momento.",
  "The arrival rate during a peak, in events per second. It indicates the traffic the system must handle during its busiest periods.",
  "Use source or broker counters from a busy period. If you have a per-minute count, divide it by 60 and note the sampling window. With no data, build a peak scenario based on sources active at the same time."
 ],
 peakMinutes:[
  "Per quanti minuti si mantiene il tasso di picco inserito. A parità di velocità, un picco più lungo può accumulare più arretrato.",
  "Individua sulla serie temporale un intervallo continuo in cui il tasso resta vicino al picco scelto. Usa la durata di quell’intervallo, ad esempio 15 minuti durante l’apertura del servizio.",
  "How many minutes the entered peak rate lasts. At the same rate, a longer peak can build a larger backlog.",
  "Find a continuous interval in the traffic chart where arrivals stay near the chosen peak. Use that interval’s duration, such as 15 minutes around service opening."
 ],
 streamRate:[
  "Quanti MB al secondo il sistema di elaborazione riesce a completare in modo sostenuto. L’arrivo dei dati al broker, da solo, non misura la capacità effettiva di elaborazione.",
  "Esegui una prova con una coda già popolata e una destinazione realistica. Dividi i byte degli eventi completati con successo per i secondi della prova e poi per 1.000.000. Usa la stessa definizione di byte applicata agli eventi in ingresso.",
  "How many MB per second the consumer can sustainably process to completion. Incoming broker traffic alone does not measure processing capacity.",
  "Test with a populated queue and a representative destination. Divide payload bytes successfully processed by test seconds and then by 1,000,000. Use the same byte basis as for incoming events."
 ],
 daily:[
  "Il volume dei dati originali che arrivano in una giornata, in GB. Se lo inserisci, il calcolatore usa questo valore per stimare lo spazio necessario.",
  "Somma i byte giornalieri delle sorgenti sulla stessa base, prima di applicare il fattore di occupazione. Dividi per 1.000.000.000. Se hai solo numero e peso medio degli eventi, lascia vuoto il campo per ricavare il volume da quei due valori.",
  "The daily volume of original incoming data, in GB. If entered, this value is used to estimate storage.",
  "Sum daily source bytes on a consistent basis before applying the storage factor. Divide by 1,000,000,000. If you know only event count and average size, leave this field blank to derive volume from them."
 ],
 days:[
  "Quanti giorni conservare i dati originali per rilettura, verifiche o ripristino. Indica la durata del solo livello dati che stai dimensionando.",
  "Concorda il periodo con chi gestisce i dati e confrontalo con le regole di conservazione applicate allo storage. Ad esempio, se la piattaforma deve poter rielaborare gli ultimi tre mesi, verifica se 90 giorni coprono il requisito.",
  "How many days to retain original data for replay, checks or recovery. Use the retention of the layer you are sizing.",
  "Agree the window with the data owner and check the storage lifecycle policy. For example, if the platform must replay the previous three months, verify whether 90 days meets the requirement."
 ],
 factor:[
  "Il rapporto tra lo spazio occupato da una copia dei dati e il volume originale. Il valore riflette il formato, la compressione e gli eventuali metadati inclusi nella misura.",
  "Scrivi un campione nel formato di destinazione e dividi i GB effettivamente occupati per i GB originali. Se 10 GB diventano 5,5 GB, inserisci 0,55. Usa un campione con tipi e contenuti simili a quelli reali.",
  "The ratio of storage used by one copy to original data volume. It reflects the format, compression and any metadata included in the measurement.",
  "Write a sample in the target format and divide stored GB by original GB. If 10 GB become 5.5 GB, enter 0.55. Use representative data types and content."
 ],
 copies:[
  "Il numero di copie complete dei dati originali che vuoi conteggiare, compresa quella principale.",
  "Elenca le copie previste dal progetto, ad esempio una principale e una esplicita in un’altra regione. Inserisci 2 in quel caso. Escludi la ridondanza interna gestita dal fornitore e aggiungi eventuali copie parziali allo spazio extra.",
  "The number of complete raw copies to include, counting the primary copy.",
  "List the project’s explicit copies, such as the primary and an explicit copy in another region. Enter 2 in that case. Exclude provider-managed internal redundancy and account for partial copies as extra space."
 ],
 curatedGb:[
  "Spazio occupato dalle tabelle curate su data lake o lakehouse.",
  "Misura uno snapshot rappresentativo, poi aggiungi le versioni e le partizioni mantenute secondo la retention del layer.",
  "Space used by curated data lake or lakehouse tables.",
  "Measure a representative snapshot and add versions and partitions retained by the layer."
 ],
 warehouseGb:[
  "Spazio occupato da tabelle, data mart e aggregati nel warehouse.",
  "Stima l’ingombro sul motore scelto in base ai dati pubblicati e allo storico richiesto.",
  "Space used by tables, marts and aggregates in the warehouse.",
  "Estimate space on the selected engine based on published data and retained history."
 ],
 servingGb:[
  "Somma dello spazio degli store operativi o di analisi eventi dedicati.",
  "Misura dataset, indici e repliche esplicite applicabili. Usa questo campo solo quando il risultato prevede uno store dedicato.",
  "Total space of dedicated operational or event query stores.",
  "Measure datasets, indexes and applicable explicit replicas. Use this field when the result calls for a dedicated store."
 ],
 extra:[
  "I GB da aggiungere per staging, checkpoint, copie parziali o backup già esclusi dagli altri campi.",
  "Misura o stima ogni elemento per il suo periodo di conservazione, poi somma i valori. Evita di ricontare i backup già inclusi tra le copie. Inserisci 0 se non prevedi spazio aggiuntivo.",
  "GB to add for staging, checkpoints, partial copies or backups not already counted in other fields.",
  "Measure or estimate each item over its own retention window, then sum the values. Avoid counting backups already included as copies. Enter 0 if no additional space is required."
 ],
 input:[
  "I GB che una singola esecuzione batch deve leggere o ricevere. Un aggiornamento giornaliero può leggere anche dati storici per join, verifiche o rielaborazioni.",
  "Controlla i byte letti nelle metriche del job o somma i file e le partizioni che l’esecuzione deve leggere. Usa la stessa base in byte del benchmark, ad esempio sempre i byte fisici letti.",
  "The GB a single batch run must read or receive. A daily run may also read historical data for joins, checks or reprocessing.",
  "Check bytes read in job metrics or total the files and partitions the run must read. Use the same byte basis as the benchmark, such as physical bytes read."
 ],
 window:[
  "I minuti effettivamente disponibili per elaborare i dati, dopo l’avvio e le attese escluse dal benchmark. Serve a stimare la velocità minima richiesta.",
  "Parti dalla scadenza e sottrai i tempi che il benchmark non include, ad esempio avvio dell’ambiente o attesa della sorgente. Se hai 75 minuti complessivi e 15 sono di attesa, inserisci 60.",
  "The minutes available to process data after startup or waits excluded from the benchmark. It determines the minimum required processing rate.",
  "Start from the deadline and subtract time the benchmark excludes, such as environment startup or waiting for upstream data. If you have 75 minutes in total and spend 15 waiting, enter 60."
 ],
 ram:[
  "La memoria massima usata contemporaneamente da una macchina o da un worker durante una prova. È un valore osservato, distinto dalla RAM assegnata alla macchina.",
  "Controlla le metriche di memoria dei nodi o dei container durante join, ordinamenti e aggregazioni. Usa il picco del worker più carico. Misura a parte il driver Spark e ripeti la prova con dati e concorrenza realistici.",
  "Peak memory used at one time by one machine or worker during a test. This is observed usage, distinct from configured RAM.",
  "Inspect node or container memory during joins, sorts and aggregations. Use the busiest worker’s peak. Measure the Spark driver separately and repeat with realistic input and concurrency."
 ],
 cpu:[
  "Le CPU virtuali assegnate a ogni macchina o worker nella prova. Il valore descrive la configurazione misurata, non la percentuale di CPU usata.",
  "Leggi le specifiche dell’istanza o del nodo usato dal job. Se tutti i worker di prova avevano 4 vCPU, inserisci 4. Evita di mediare tra macchine di tipo diverso.",
  "The virtual CPUs assigned to each benchmark machine or worker. It describes the tested configuration, not CPU utilization.",
  "Check the instance or node specification used by the job. If each test worker had 4 vCPUs, enter 4. Avoid averaging across different machine types."
 ],
 workers:[
  "Quanti nodi worker Spark hanno elaborato i dati nella prova. Il valore serve a stimare la velocità media per worker senza includere il driver.",
  "Controlla il numero di nodi effettivamente attivi durante la fase misurata. Se il cluster aumenta o riduce i nodi automaticamente, ripeti la prova a capacità fissa o usa un tratto stabile.",
  "The number of Spark worker nodes that processed the benchmark data. It is used to estimate average throughput per worker and excludes the driver.",
  "Check the worker nodes actually active during the measured phase. If the cluster scales automatically, rerun at fixed size or measure a stable interval."
 ],
 rate:[
  "I MB di input elaborati al secondo dall’insieme delle macchine usate nella prova, dall’inizio della lettura alla fine della scrittura.",
  "Dividi i byte di input per il tempo impiegato in secondi e poi per 1.000.000. Ad esempio, 30 GB in 600 secondi equivalgono a 50 MB/s. Usa lo stesso criterio della finestra batch per includere o escludere l’avvio.",
  "Input MB processed per second by the whole benchmark setup, from the start of reading to the end of writing.",
  "Divide input bytes by elapsed seconds and then by 1,000,000. For example, 30 GB in 600 seconds is 50 MB/s. Use the same convention for startup time as the batch window."
 ],
 margin:[
  "La percentuale che aggiungi alla stima di memoria e, per i worker Spark, alla capacità necessaria per rispettare la finestra.",
  "Confronta più prove, includendo giorni di picco, distribuzioni più sbilanciate e crescita attesa. Scegli un margine motivato da queste differenze. Con il 30%, un picco di 6 GB diventa 7,8 GB. Lascia vuoto per usare 0%.",
  "The percentage added to estimated memory and, for Spark workers, to the required throughput.",
  "Compare several runs covering peak days, more uneven inputs and expected growth. Choose headroom based on those differences. With 30%, a 6 GB peak becomes 7.8 GB. Leave blank to use 0%."
 ]
};

function capacityInfoButton(attribute,value,label){
 return '<button class="metric-info" type="button" '+attribute+'="'+esc(value)+'" aria-haspopup="dialog" aria-controls="questionHelpDialog" aria-label="'+esc(phrase("Informazioni su ","About ")+label)+'">i</button>';
}

function setupCalculatorHelp(){
 const calculator=by("calculator");
 calculator.addEventListener("click",event=>{
   const termLink=event.target.closest("a[data-capacity-term]");
   if(termLink){
     event.preventDefault();
     const term=termLink.dataset.capacityTerm;
     const local=capacityTerms[term];
     const definition=local?phrase(local[0],local[1]):glossary[term][language];
     openReferenceHelp(termLink,capacityTermTitle(term),"<p>"+esc(definition)+"</p>");
     return;
   }
   const button=event.target.closest("[data-metric-info],[data-result-info]");
   if(!button)return;
   const metric=button.dataset.metricInfo;
   const describe=(title,text)=>'<h3>'+esc(title)+'</h3><p>'+esc(text)+'</p>';
   if(metric){
     const [,itLabel,enLabel]=calculatorGroups.flatMap(group=>group[2]).find(([key])=>key===metric);
     const [itMeaning,itObtain,enMeaning,enObtain]=capacityHelp[metric];
     openReferenceHelp(button,phrase(itLabel,enLabel),
       describe(phrase("Che cosa indica","What it means"),phrase(itMeaning,enMeaning))+
       describe(phrase("Come trovare il valore","How to get the value"),phrase(itObtain,enObtain)));
   }else{
     const card=button.closest(".stat");
     const label=card.querySelector(".stat-label").textContent;
     const value=card.querySelector("strong").textContent;
     const method=card.querySelector("small").textContent;
     openReferenceHelp(button,label,
       describe(phrase("Valore calcolato","Calculated value"),value)+
       describe(phrase("Come si ottiene","How it is calculated"),method));
   }
 });
}

const capacityTerms={
 "Evento":["Un’unità di informazione prodotta quando succede qualcosa, per esempio una lettura del sensore o un ordine inserito.","A unit of information recorded when something happens, such as a sensor reading or a new order.","Event"],
 "Producer":["L’applicazione o il dispositivo che invia gli eventi al broker.","The application or device that sends events to the broker."],
 "Consumer":["L’applicazione che legge gli eventi e li elabora o li scrive nella destinazione.","The application that reads events and processes or writes them to a destination."],
 "Dati originali (raw)":["I dati così come arrivano dalla sorgente, prima delle trasformazioni. Si possono conservare per controlli e rielaborazioni.","Data as it arrives from the source, before transformations. It can be retained for checks and reprocessing.","Raw data"],
 "Amazon Kinesis Data Streams":["Servizio AWS che riceve flussi di eventi e li rende disponibili a più applicazioni che li elaborano.","An AWS service that receives event streams and makes them available to applications that process them."],
 "Apache Spark":["Motore di calcolo che può distribuire l’elaborazione dei dati su più macchine.","A compute engine that can distribute data processing across multiple machines."]
};
function capacityTermTitle(term){
 const local=capacityTerms[term];
 return local?phrase(term,local[2]??term):termTitle(term);
}
function calculatorGlossary(){
 const terms=["Evento","Producer","Broker","Consumer","Throughput","Backlog","Batch","Dati originali (raw)","Retention","Benchmark","RAM","vCPU","Worker","Shuffle","Spill","Skew","kB","GB","MB/s","Apache Spark","Apache Kafka","Pub/Sub","Event Hubs","Amazon Kinesis Data Streams"];
 const links=terms.map(term=>'<a href="#questionHelpDialog" data-capacity-term="'+esc(term)+'" aria-haspopup="dialog" aria-controls="questionHelpDialog">'+esc(capacityTermTitle(term))+'</a>').join("");
 return '<section class="capacity-glossary" aria-labelledby="capacityGlossaryTitle"><h3 id="capacityGlossaryTitle">'+esc(phrase("Glossario del calcolatore","Calculator glossary"))+'</h3><div class="glossary-links">'+links+'</div></section>';
}
