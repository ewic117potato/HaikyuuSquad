/* Optional Supabase anonymous-auth browser cloud save.
   Supabase is NOT required for GitHub+Render multiplayer to work.
   Only a publishable key is transferred to the browser. */
(() => {
  const statusEl = document.getElementById('cloudStatus');
  let client, user, ready = false, writing = false, queued = false, timer;
  function status(message, color) {
    if(statusEl) {statusEl.textContent = message; if(color) statusEl.style.color=color;}
  }
  async function write() {
    if(!ready || !client || !user) return;
    if(writing) { queued=true; return; }
    writing=true;
    const snapshot=JSON.parse(JSON.stringify(state));
    const {error}=await client.from('volleyball_saves').upsert({user_id:user.id,payload:snapshot,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    writing=false;
    if(error) status('● CLOUD ERROR — LOCAL SAVE SAFE','#ff8d8d');
    else status('● SUPABASE CLOUD SAVE ENABLED','#65dca7');
    if(queued) {queued=false; await write();}
  }
  window.queueCloudSave=()=>{if(ready){clearTimeout(timer);timer=setTimeout(write,950);}};
  async function init() {
    try {
      const response=await fetch('/api/public-config',{cache:'no-store'});
      if(!response.ok) return;
      const conf=await response.json();
      if(!conf.supabaseUrl||!conf.supabasePublishableKey) return;
      if(!window.supabase?.createClient){status('● SUPABASE LIBRARY BLOCKED · SAVING LOCALLY','#ffca6c');return;}
      status('● CONNECTING CLOUD SAVE…','#ffca6c');
      client=window.supabase.createClient(conf.supabaseUrl,conf.supabasePublishableKey);
      let {data:{session},error:sessErr}=await client.auth.getSession();
      if(sessErr) throw sessErr;
      if(!session) {
        const {data,error}=await client.auth.signInAnonymously();
        if(error) throw error;
        session=data.session;
      }
      user=session?.user;
      if(!user) throw Error('No Supabase user session');
      const {data:row,error}=await client.from('volleyball_saves').select('payload,updated_at').eq('user_id',user.id).maybeSingle();
      if(error) throw error;
      const localDate=Number(state.savedAt)||0;
      const remoteDate=row?Date.parse(row.updated_at)||0:0;
      if(row?.payload && remoteDate>localDate) {
        state=Object.assign(DEFAULT(),row.payload);
        state.v3=Object.assign(DEFAULT().v3,state.v3||{});
        // V11: a cloud save created by an earlier game version might not have the Nationals record.
        state.v3.nationals=Object.assign({runs:0,bestWins:0,history:[],active:null,day:new Date().toISOString().slice(0,10),dailyEntries:0},state.v3.nationals||{});
        migrateUniqueInventory(state);
        if(!Array.isArray(state.bench))state.bench=[null,null,null,null];
        if(!Array.isArray(state.coaches))state.coaches=[];
        if(!Array.isArray(state.savedTeams))state.savedTeams=[null,null,null,null,null];
        localStorage.setItem('spike-legends-save-v1',JSON.stringify(state));
        render();
      }
      ready=true;
      status('● SUPABASE CLOUD SAVE ENABLED','#65dca7');
      if(!row || localDate>remoteDate) await write();
      // Reconnect can happen after the tab has been idle.
      window.addEventListener('online',()=>window.queueCloudSave());
    } catch(e) {
      console.warn('Cloud save unavailable (game still works locally):',e);
      status('● CLOUD UNAVAILABLE · SAVING LOCALLY','#ffca6c');
    }
  }
  init();
})();
