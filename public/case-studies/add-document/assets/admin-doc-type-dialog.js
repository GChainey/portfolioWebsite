/* The Add / Edit document dialog for AI Document Review.

   Two columns: the name, description and rules on the left; a lo-fi sample of
   the document on the right (admin-doc-preview.js) that lights up whatever the
   focused rule checks. Rules sit in a compact table whose bottom row is always
   the add row, so the dialog keeps its size however many rules there are.

   Used by admin-app-document-review.js, and by doc-type-states/ to show each
   state. Styles are the "Split dialog" and "Document preview" blocks in admin.css. */
(() => {
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ruleFromText=(description,i,prev)=>{
      const text=String(description||'').trim();
      if(!text)return null;
      return {
        name:prev?.name||`rule${i+1}`,
        description:text,
        method:prev?.method||'Generate',
        type:prev?.type||'Boolean',
        active:prev?.active!==false,
        compliance:prev?.compliance!==false,
      };
  };
  function fieldWithHint(label,{name,value='',required=false,multiline=false,placeholder='',hint=''}){
      const control=multiline
        ? `<textarea name="${name}" rows="3" placeholder="${esc(placeholder)}" ${required?'required':''}>${esc(value)}</textarea>`
        : `<input name="${name}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required?'required':''}>`;
      return `<label class="af-field"><span>${label}</span>${control}${hint?`<span class="af-field-hint">${esc(hint)}</span>`:''}</label>`;
    }
    const TRASH='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>';
  /* opts: existing (a document to edit), taken (other documents' names),
     onSave(doc), and for the state machine: mount (render in place, not as a
     modal) and preset (see applyPreset). Returns the dialog. */
  window.adDocTypeDialog=(opts={})=>{
      const existing=opts.existing||null;
      const rules=(existing?.rules||[]).map(r=>r.description||'').filter(Boolean);
      const dp=window.adDocPreview;
      const dialog=document.createElement('dialog');dialog.className='dr-dialog dr-dialog--doc-type ai-setup-surface';
      // Two columns: the title, form and actions on the left; the close button
      // and the sample document on a full-height grey column on the right.
      dialog.className+=' dr-dialog--split';
      dialog.innerHTML=`<form class="dr-split">
        <div class="dr-split-main">
          <div class="dr-split-hd"><h3>${existing?'Edit':'Add'} document</h3></div>
          <div class="dr-split-body">
            ${fieldWithHint('Document name',{name:'name',value:existing?.name||'',placeholder:'e.g. Doctor’s note',hint:'What people call it when they upload it.'})}
            <div class="af-field dr-field-desc"><div class="dr-field-hd"><label for="dr-doc-desc">Description</label>${dp?'<button type="button" class="dr-inline-btn dr-gen-btn" data-generate><span>Generate</span></button>':''}</div><textarea id="dr-doc-desc" name="description" rows="3" placeholder="e.g. A note from a doctor supporting a sick leave request.">${esc(existing?.description||'')}</textarea><span class="af-field-hint">Helps AI recognize this document when it arrives, and tells reviewers what to expect.</span></div>
            <section class="dr-doc-rules"><div class="dr-doc-rules-hd"><label class="dr-doc-rules-title" for="dr-rule-new">Rules</label><div class="dr-suggest" data-suggest><button type="button" class="dr-suggest-btn" data-suggest-toggle aria-haspopup="menu" aria-expanded="false">Suggested rules<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button><div class="dr-suggest-menu" role="menu" data-suggest-menu hidden></div></div></div>
              <div class="dr-rule-table" data-rule-table><table><tbody data-rule-list></tbody><tfoot><tr class="dr-rule-new-row"><td class="dr-rule-n" aria-hidden="true">+</td><td><input id="dr-rule-new" data-rule-new aria-label="New rule" placeholder="Add a rule, e.g. Covers the dates of leave requested" autocomplete="off"></td><td class="dr-rule-x"><button type="button" class="dr-inline-btn" data-rule-add disabled>Add</button></td></tr></tfoot></table></div>
              <span class="af-field-hint dr-doc-rules-lead">Each rule is one check AI runs on every upload. Write it as something that should be true. If it isn’t, the document is flagged for a person to check.</span>
            </section>
            <p role="alert" data-error></p>
          </div>
        </div>
        <aside class="dr-split-side dr-doc-preview" aria-label="What AI looks at">
          <button type="button" class="dr-split-close" data-close aria-label="Close">✕</button>
          ${dp?`<div class="dr-doc-preview-hd" data-preview-hd></div><div class="dr-doc-preview-doc" data-preview-doc></div>`:''}
        </aside>
        <footer class="dr-split-ft"><button type="button" class="ad-btn" data-close>Cancel</button><button class="ad-btn dark" type="submit">${existing?'Save changes':'Add document'}</button></footer>
      </form>`;
      const list=dialog.querySelector('[data-rule-list]');
      const table=dialog.querySelector('[data-rule-table]');
      const newInput=dialog.querySelector('[data-rule-new]');
      const nameInput=dialog.querySelector('[name="name"]');
      nameInput.autofocus=true;
      // Generate (beside the Description label) drafts a description from the
      // name. Prototype: canned text per kind.
      const descInput=dialog.querySelector('[name="description"]');
      // focused: a rule's index, 'new' for the add field, or null.
      // recent: the rule just added, lit for a moment.
      let kind=null,focused=null,recent=null,recentTimer;
      function drawRules(){
        // The bottom row (tfoot) is always the add row, so only the rules redraw.
        list.innerHTML=rules.map((t,i)=>`<tr data-rule-row="${i}"><td class="dr-rule-n">${i+1}</td><td><textarea data-rule-text="${i}" rows="1" aria-label="Rule ${i+1}">${esc(t)}</textarea></td><td class="dr-rule-x"><button type="button" class="dr-rule-remove" data-rule-remove="${i}" aria-label="Remove rule ${i+1}">${TRASH}</button></td></tr>`).join('');
        fitAll();
      }
      // Rule cells wrap long rules: each grows to fit its text.
      const fit=el=>{el.style.height='auto';el.style.height=el.scrollHeight+'px';};
      const fitAll=()=>list.querySelectorAll('[data-rule-text]').forEach(fit);
      function drawPreview(){
        if(!dp)return;
        // Until there's a document name, the sample is a shimmering placeholder.
        const named=!!nameInput.value.trim();
        const next=dp.kindFor(nameInput.value);
        const docBox=dialog.querySelector('[data-preview-doc]');
        const show=named?next:'loading';
        if(docBox.dataset.show!==show){
          docBox.dataset.show=show;
          docBox.innerHTML=named?dp.html(next,nameInput.value.trim()):dp.skeleton();
        }
        else if(next==='other'&&named){const t=docBox.querySelector('.dp-page-title');if(t)t.textContent=nameInput.value.trim();}
        kind=next;
        dialog.querySelector('[data-preview-hd]').innerHTML='<b>What AI looks at</b>';
        // The focused rule's regions light up.
        const text=focused==='new'?newInput.value:focused!==null?rules[focused]||'':'';
        // A rule that was just added lights up too, for a moment, so you see
        // where it'll look as soon as it's in the table.
        const lit=[...(focused!==null?dp.regionsFor(kind,text):[]),...(recent!==null?dp.regionsFor(kind,rules[recent]||''):[])];
        docBox.querySelectorAll('[data-dp-region]').forEach(el=>{
          el.classList.toggle('is-lit',lit.includes(el.dataset.dpRegion));
        });
        drawFound(docBox,text);
        drawSuggest();
      }
      /* Rules that don't match any part of the sample (e.g. "Company matches
         our insurers") still get a place on it: a dashed field, labelled from
         the rule, that AI will find on the real document. */
      const subjectOf=t=>{
        const m=t.trim().match(/^(.+?)\s+(?:matches|match|is|isn’t|isn't|are|aren’t|was|were|has|hasn’t|hasn't|have|shows|show|covers|includes|lists|states|contains|equals|exceeds|must|should)(?![\w’'])/i);
        let sub=m&&m[1].split(/\s+/).length<=4?m[1]:'';
        // Verb first ("Covers general liability of at least $1 million"): use what follows it.
        // "Not a learner permit": what it mustn't be.
        if(!sub){const n=t.trim().match(/^not\s+(?:a|an|the)?\s*(.+)$/i);if(n&&n[1].split(/\s+/).length<=4)sub=n[1];}
        if(!sub){const v=t.trim().match(/^(?:covers|shows|lists|includes|has|states|contains|names)\s+(.+?)(?:\s+(?:of|at|for|from|by|with|in|on|to|is|are)\b|$)/i);if(v&&v[1].split(/\s+/).length<=4)sub=v[1];}
        sub=sub.replace(/^(?:the|a|an)\s+/i,'');
        return sub?sub.charAt(0).toUpperCase()+sub.slice(1):'';
      };
      function drawFound(docBox,text){
        const doc=docBox.querySelector('.dp-doc:not(.dp-skeleton)');
        docBox.querySelector('[data-found]')?.remove();
        if(!doc)return;
        const items=rules.map((t,i)=>({t,i})).filter(({t})=>t.trim()&&!dp.regionsFor(kind,t).length);
        // The rule being typed counts too, so it shows up before it's added.
        if(focused==='new'&&text.trim()&&!dp.regionsFor(kind,text).length)items.push({t:text,i:'new'});
        if(!items.length)return;
        const html=`<div class="dp-found" data-found>${items.map(({t,i})=>`<div class="dp-field dp-found-field${focused===i||recent===i?' is-lit':''}" title="${esc(t)}"><span>${esc(subjectOf(t)||(i==='new'?'New rule':`Rule ${i+1}`))}</span><i class="dp-found-val" aria-hidden="true"></i><small>AI finds this on the document</small></div>`).join('')}</div>`;
        const sign=doc.querySelector('.dp-sign');
        (sign?sign.parentElement:doc).insertBefore(document.createRange().createContextualFragment(html),sign||null);
      }
      /* Suggested rules: a dropdown of checkboxes. Rules for the parts of the
         document the description mentions come first, then the common ones for
         this kind of document. Ticked means it's in the table;
         ticking adds it, unticking takes it out. */
      const menu=dialog.querySelector('[data-suggest-menu]'),toggle=dialog.querySelector('[data-suggest-toggle]');
      const suggested=()=>[...new Set([...(descInput.value.trim()?dp.rulesFrom(kind,descInput.value):[]),...dp.suggestions(kind)])];
      function drawSuggest(){
        if(!dp||menu.hidden)return;
        const have=new Set(rules.map(t=>t.trim().toLowerCase()));
        const html=`<p class="dr-suggest-hd">For a ${esc(dp.noun(kind))}</p>${suggested().map(t=>`<label class="dr-suggest-item" role="menuitemcheckbox" aria-checked="${have.has(t.toLowerCase())}"><input type="checkbox" data-suggest-check="${esc(t)}" ${have.has(t.toLowerCase())?'checked':''}><span>${esc(t)}</span></label>`).join('')}`;
        // Only redraw when it changes, or the box under the pointer is swapped mid-click.
        if(menu.dataset.html!==html){menu.dataset.html=html;menu.innerHTML=html;}
      }
      function openMenu(open){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){menu.dataset.html='';drawSuggest();}}
      function addRule(text){
        const t=String(text||'').trim();
        if(!t)return;
        rules.push(t);
        recent=rules.length-1;clearTimeout(recentTimer);
        recentTimer=setTimeout(()=>{recent=null;drawPreview();},1400);
        drawRules();drawPreview();
        table.scrollTop=table.scrollHeight;
        const row=list.lastElementChild;row?.classList.add('is-new');
      }
      dialog.addEventListener('click',e=>{
        if(e.target.closest('[data-close]'))dialog.close();
        const gen=e.target.closest('[data-generate]');
        if(gen&&!gen.disabled){
          const error=dialog.querySelector('[data-error]');
          if(!nameInput.value.trim()){error.textContent='Add a name first, so AI knows what to describe.';nameInput.focus();return;}
          error.textContent='';
          const text=dp.describe(dp.kindFor(nameInput.value),nameInput.value);
          gen.disabled=true;gen.lastElementChild.textContent='Generating…';descInput.value='';
          let i=0;const tick=setInterval(()=>{i+=3;descInput.value=text.slice(0,i);if(i>=text.length){clearInterval(tick);gen.disabled=false;gen.lastElementChild.textContent='Generate';descInput.focus();}},16);
        }
        if(e.target.closest('[data-rule-add]')){addRule(newInput.value);newInput.value='';syncAdd();newInput.focus();}
        if(e.target.closest('[data-suggest-toggle]'))openMenu(menu.hidden);
        else if(!menu.hidden&&!e.target.closest('[data-suggest-menu]'))openMenu(false);
        const remove=e.target.closest('[data-rule-remove]');
        if(remove){rules.splice(Number(remove.dataset.ruleRemove),1);focused=null;recent=null;drawRules();drawPreview();}
      });
      // Add is only live when there's something to add.
      const addBtn=dialog.querySelector('[data-rule-add]');
      const syncAdd=()=>{addBtn.disabled=!newInput.value.trim();};
      newInput.addEventListener('input',syncAdd);
      // Enter in the add field adds the rule instead of submitting the form.
      newInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addRule(newInput.value);newInput.value='';syncAdd();drawPreview();}});
      menu.addEventListener('change',e=>{
        const t=e.target.dataset.suggestCheck;if(t===undefined)return;
        if(e.target.checked)addRule(t);
        else{const i=rules.findIndex(r=>r.trim().toLowerCase()===t.toLowerCase());if(i>=0){rules.splice(i,1);focused=null;recent=null;drawRules();drawPreview();}}
      });
      // Esc closes the menu first, not the whole dialog.
      dialog.addEventListener('cancel',e=>{if(!menu.hidden){e.preventDefault();openMenu(false);toggle.focus();}});
      dialog.addEventListener('focusin',e=>{
        if(e.target===newInput)focused='new';
        else if(e.target.dataset.ruleText!==undefined)focused=Number(e.target.dataset.ruleText);
        else if(!e.target.closest('[data-rule-table], [data-suggest]'))focused=null;
        drawPreview();
      });
      dialog.addEventListener('input',e=>{if(e.target.dataset.ruleText!==undefined){rules[Number(e.target.dataset.ruleText)]=e.target.value;fit(e.target);}drawPreview();});
      // A rule is one line of meaning: Enter doesn't add a line break.
      list.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.ruleText!==undefined)e.preventDefault();});
      dialog.addEventListener('close',()=>dialog.remove());
      dialog.querySelector('form').addEventListener('submit',e=>{
        e.preventDefault();
        const form=new FormData(e.target);
        const name=String(form.get('name')).trim();
        const description=String(form.get('description')).trim();
        const error=dialog.querySelector('[data-error]');
        // A rule still sitting in the add field counts.
        const descs=[...rules,newInput.value].map(t=>t.trim()).filter(Boolean);
        if(!name){error.textContent='Add a name, so AI knows what this document is.';nameInput.focus();return;}
        if(!description){error.textContent='Add a description, so AI can recognize this document. Generate can write one for you.';descInput.focus();return;}
        if(!descs.length){error.textContent='Add at least one rule, so AI knows what to check.';return;}
        if((opts.taken||[]).some(n=>String(n).toLowerCase()===name.toLowerCase())){error.textContent='There’s already a document with that name. Choose a different one.';return;}
        const ruleObjs=descs.map((text,i)=>ruleFromText(text,i,existing?.rules?.[i])).filter(Boolean);
        opts.onSave?.({name,description,rules:ruleObjs});
        dialog.close();
      });
      drawRules();drawPreview();
      if(opts.mount){dialog.classList.add('is-inline');opts.mount.append(dialog);dialog.show();}
      else{document.body.append(dialog);dialog.showModal();}
      fitAll();
      if(opts.preset)applyPreset(opts.preset);
      /* Put the dialog in a given state, for the state machine:
         { name, description, rules: [...], focus: <rule index> | 'new' | 'name',
           newText, menu: true, submit: true } */
      function applyPreset(p){
        if(p.name!==undefined)nameInput.value=p.name;
        if(p.description!==undefined)descInput.value=p.description;
        if(p.rules){rules.splice(0,rules.length,...p.rules);}
        if(p.newText!==undefined){newInput.value=p.newText;syncAdd();}
        drawRules();drawPreview();
        if(p.focus==='new')newInput.focus();
        else if(p.focus==='name')nameInput.focus();
        else if(typeof p.focus==='number')list.querySelector(`[data-rule-text="${p.focus}"]`)?.focus();
        if(p.menu)openMenu(true);
        if(p.scroll)table.scrollTop=table.scrollHeight;
        if(p.submit)dialog.querySelector('form').requestSubmit();
      }
      /* For the state machine: move this dialog to another state without
         remounting it, so only what differs (fields, rules, the lit part of the
         sample) changes. */
      dialog.adSetState=(p={})=>{
        if(dialog.contains(document.activeElement))document.activeElement.blur();
        openMenu(false);focused=null;recent=null;table.scrollTop=0;
        dialog.querySelector('[data-error]').textContent='';
        applyPreset({name:'',description:'',rules:[],newText:'',...p});
      };
      return dialog;
  };

})();
