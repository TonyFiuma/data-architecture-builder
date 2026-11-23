function storagePlanTitle(){
 return phrase("Piano di dimensionamento storage","Storage sizing plan");
}

function planStorage(state,capacity,targets){
 const figures=capacity.storage;
 const rows=[];
 const sized=[];
 const format=new Intl.NumberFormat(language==="en"?"en-GB":"it-IT",{maximumSignificantDigits:7,useGrouping:"always"});
 const size=gb=>format.format(gb)+" GB"+(gb>=1000?" ("+format.format(gb/1000)+" TB)":"");
 const missing=phrase("Da dimensionare","Sizing pending");
 const add=(label,target,gb,reason,pending)=>{
   sized.push(gb);
   rows.push({label,target,value:gb===null?missing:size(gb),reason:reason+(gb===null?" "+pending:"")});
 };

 if(targets.raw){
   const basis=capacity.eventBasedDaily?phrase("Volume derivato dagli eventi al giorno × dimensione media.","Volume derived from daily event count × average event size."):phrase("Volume giornaliero inserito nel calcolatore.","Daily volume entered in the calculator.");
   const formula=figures.raw===null?"":format.format(figures.daily)+phrase(" GB/giorno"," GB/day")+" × "+format.format(figures.days)+phrase(" giorni"," days")+" × "+format.format(figures.factor)+" × "+format.format(figures.copies)+phrase(" copie."," copies.");
   const assumed=figures.rawDefaults.map(key=>key==="factor"?phrase("fattore fisico 1","physical factor of 1"):phrase("una copia","one copy"));
   const assumption=assumed.length?" "+phrase("Ipotesi per i campi vuoti: ","Assumptions for blank fields: ")+assumed.join(phrase(" e "," and "))+".":"";
   const primary=figures.rawPerCopy!==null&&figures.copies>1&&figures.raw!==null?phrase(" Per copia: "," Per copy: ")+size(figures.rawPerCopy)+".":"";
   add(phrase("Landing, archivio raw e replay","Landing, raw archive and replay"),targets.raw,figures.raw,
     phrase("Conserva file ed eventi originali per replay, backfill e verifica delle consegne. Predisponi un’area raw con permessi e retention dedicati.","Retain original files and events for replay, backfills and delivery checks. Set up a raw area with its own permissions and retention.")+(formula?" "+formula+primary+" "+basis+assumption:""),
     phrase("Inserisci volume giornaliero o dati evento e retention raw. Controlla anche fattore fisico e copie esplicite.","Enter daily volume or event inputs and raw retention. Check the physical factor and explicit copies as well."));
 }

 const extra=figures.extra;
 const layers=[
   [targets.curated,"curatedGb",phrase("Tabelle curate","Curated tables"),
    phrase("Materializza dati validati e storico delle tabelle. Stima i GB di uno snapshot rappresentativo più le versioni o partizioni mantenute.","Materialize validated data and table history. Estimate GB from a representative snapshot plus retained versions or partitions.")],
   [targets.warehouse,"warehouseGb",phrase("Warehouse e data mart","Warehouse and data marts"),
    phrase("Conserva tabelle pubblicate, mart e aggregati per SQL e BI. Misura lo spazio nel motore scelto in base alla retention dei mart e al suo criterio di misura.","Store published tables, marts and aggregates for SQL and BI. Measure space in the selected engine using mart retention and its storage accounting rules.")],
   [targets.serving,"servingGb",phrase("Serving dedicato","Dedicated serving"),
    phrase("Conserva i dati e le strutture necessarie alle query operative o per eventi. Misura il dataset, gli indici e le copie esplicite, se previsti.","Store data and structures needed for operational or event queries. Measure the dataset, indexes and any explicit copies in scope.")]
 ];
 for(const [target,key,label,reason] of layers){
   if(target)add(label,target,numeric(state.metrics[key]),reason,phrase("Inserisci una stima dedicata nel calcolatore.","Enter a dedicated estimate in the calculator."));
 }
 if(targets.checkpoint||extra>0){
   add(phrase("Spazio tecnico e copie di servizio","Technical storage and service copies"),
     phrase("Storage dei job, staging o destinazione backup","Job storage, staging or backup target"),extra,
     phrase("Prevedi spazio separato per stato, checkpoint, file temporanei e backup, secondo i componenti previsti. Conta qui solo lo spazio che non hai già incluso nelle altre voci.","Allow separate space for state, checkpoints, temporary files and backups for the applicable components. Count only space not already included in other rows."),
     phrase("Misura lo stato e i file temporanei dei job e inserisci lo spazio extra nel calcolatore.","Measure job state and temporary files and enter extras in the calculator."));
 }
 if(targets.broker){
   rows.push({label:phrase("Buffer eventi","Event buffer"),target:targets.broker,
     value:capacity.backlogGb===null?missing:phrase("Backlog di picco: ","Peak backlog: ")+size(capacity.backlogGb),
     reason:phrase("Il backlog stima quanto si accumula durante il picco. Per configurare il broker usa anche volume in ingresso, retention di replay, throughput, quote e replica prevista dal servizio. Il buffer si dimensiona separatamente dallo storage persistente.","Backlog estimates what builds up during the peak. Configure the broker using incoming volume, replay retention, throughput, quotas and service replication. Size the buffer separately from persistent storage.")});
 }

 const known=sized.filter(value=>value!==null);
 const total=known.reduce((sum,value)=>sum+value,0);
 const summary=known.length?(known.length===sized.length?
     phrase("Totale stimato dello storage persistente previsto: ","Estimated persistent storage in scope: "):
     phrase("Subtotale delle voci dimensionate: ","Subtotal of sized items: "))+size(total)+".":
   phrase("Compila i dati storage del calcolatore per ottenere una capacità stimata.","Enter storage inputs in the calculator to estimate capacity.");
 let scope=phrase("Le stime sommano i GB dichiarati per ciascuna copia o layer. Verifica separatamente le unità di fatturazione e le quote del servizio; storage e capacità di calcolo vanno dimensionati separatamente.","Estimates add up the GB entered for each copy or layer. Verify service billing units and quotas separately. Storage and compute capacity are sized independently.");
 if(targets.raw==="HDFS"||targets.curated.includes("HDFS"))scope+=" "+phrase("Su HDFS usa il volume stimato per calcolare anche i dischi necessari in base a replica o erasure coding e margine operativo del cluster.","For HDFS, size disks from the estimate using cluster replication or erasure coding and operating headroom.");
 return {rows,summary,scope};
}

function storagePlanHtml(plan){
 return '<p class="caption">'+esc(plan.summary)+'</p><div class="stats">'+plan.rows.map(row=>
   '<div class="stat"><span class="stat-label">'+esc(row.label)+'</span><strong>'+esc(row.value)+'</strong><span>'+esc(row.target)+'</span><small>'+esc(row.reason)+'</small></div>'
 ).join("")+'</div><p class="caption">'+esc(plan.scope)+'</p>';
}

function storagePlanWord(plan,heading,sub,paragraph){
 return [heading(storagePlanTitle()),paragraph(plan.summary),
   ...plan.rows.flatMap(row=>[sub(row.label+" · "+row.target),paragraph(row.value),paragraph(row.reason)]),
   paragraph(plan.scope)];
}
