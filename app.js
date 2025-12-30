/* Roles Board — Vanilla JS, no build step. */
(function(){
  const CATEGORIES = ["Past","Present","Future","TBD"];
  /** @type {{id:string, name:string, category:string, checked:boolean}[]} */
  let roles = [];

  // --- Storage ---
  const STORAGE_KEY = 'roles_board_v1';
  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){ roles = JSON.parse(raw); }
      else {
        // Seed with examples on first load
        roles = [
          { id:id(), name:'Team Lead', category:'Present', checked:false },
          { id:id(), name:'Product Owner', category:'Past', checked:true },
          { id:id(), name:'AI Strategist', category:'Future', checked:false },
          { id:id(), name:'Security Reviewer', category:'TBD', checked:false },
        ];
        save();
      }
    }catch(e){ console.warn('Failed to load state', e); roles = []; }
  }
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }

  // --- Helpers ---
  function id(){ return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function q(sel,root=document){ return root.querySelector(sel); }
  function qa(sel,root=document){ return Array.from(root.querySelectorAll(sel)); }

  // --- Rendering ---
  function render(){
    // Clear columns
    CATEGORIES.forEach(cat => { q('#col-'+cat).innerHTML=''; });
    // Group by category to keep order stable per render
    const byCat = Object.fromEntries(CATEGORIES.map(c=>[c,[]]));
    roles.forEach(r => { if(byCat[r.category]) byCat[r.category].push(r); });
    // Render cards
    CATEGORIES.forEach(cat => {
      const col = q('#col-'+cat);
      byCat[cat].forEach(role => col.appendChild(cardEl(role)));
    });
  }

  function cardEl(role){
    const el = document.createElement('article');
    el.className = 'card' + (role.checked ? ' checked' : '');
    el.draggable = true;
    el.setAttribute('data-id', role.id);
    el.setAttribute('aria-grabbed','false');

    // Drag events
    el.addEventListener('dragstart', e => {
      el.classList.add('dragging');
      e.dataTransfer.setData('text/plain', role.id);
      e.dataTransfer.effectAllowed = 'move';
      el.setAttribute('aria-grabbed','true');
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      el.setAttribute('aria-grabbed','false');
    });

    // Checkbox
    const cbWrap = document.createElement('label');
    cbWrap.className = 'checkbox';
    cbWrap.title = 'Mark role';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = role.checked;
    const mark = document.createElement('span'); mark.className = 'mark';
    cb.addEventListener('input', () => {
      role.checked = cb.checked; save(); render();
    });
    cbWrap.appendChild(cb); cbWrap.appendChild(mark);

    // Title (editable)
    const title = document.createElement('div');
    title.className = 'title'; title.textContent = role.name;
    title.contentEditable = 'false';
    title.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){ e.preventDefault(); title.blur(); }
    });
    title.addEventListener('blur', ()=>{
      const val = title.textContent.trim();
      if(val && val !== role.name){ role.name = val; save(); render(); }
      title.contentEditable = 'false';
    });

    // Meta (category select, edit, delete)
    const meta = document.createElement('div'); meta.className = 'meta';

    const sel = document.createElement('select');
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option'); opt.value = c; opt.textContent = c; if(c===role.category) opt.selected = true; sel.appendChild(opt);
    });
    sel.addEventListener('change', ()=>{ role.category = sel.value; save(); render(); });

    const edit = document.createElement('button');
    edit.className = 'btn'; edit.textContent = 'Edit';
    edit.addEventListener('click', ()=>{
      title.contentEditable = 'true'; title.focus();
      // place caret at end
      document.getSelection().selectAllChildren(title);
      document.getSelection().collapseToEnd();
    });

    const del = document.createElement('button'); del.className = 'delete'; del.title = 'Delete role'; del.textContent = '🗑';
    del.addEventListener('click', ()=>{
      if(confirm('Delete role "'+role.name+'"?')){
        roles = roles.filter(r => r.id !== role.id); save(); render();
      }
    });

    const handle = document.createElement('span'); handle.className = 'handle'; handle.textContent = '⋮⋮'; handle.title = 'Drag to move';

    meta.appendChild(sel); meta.appendChild(edit); meta.appendChild(del); meta.appendChild(handle);

    el.appendChild(cbWrap); el.appendChild(title); el.appendChild(meta);
    return el;
  }

  // --- DnD columns ---
  function wireDnD(){
    qa('.droptarget').forEach(area => {
      area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('over'); e.dataTransfer.dropEffect = 'move'; });
      area.addEventListener('dragleave', () => area.classList.remove('over'));
      area.addEventListener('drop', e => {
        e.preventDefault(); area.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const role = roles.find(r => r.id === id);
        if(role){
          const cat = area.id.replace('col-','');
          role.category = cat; save(); render();
        }
      });
    });
  }

  // --- Form add ---
  function wireAdd(){
    const form = q('#add-form');
    const input = q('#role-input');
    const catSel = q('#category-select');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = (input.value || '').trim();
      const category = catSel.value;
      if(!name){ input.focus(); return; }
      roles.unshift({ id:id(), name, category, checked:false });
      input.value=''; save(); render();
    });
  }

  // --- Export / Import ---
  function wireIO(){
    const exportBtn = q('#export-btn');
    const fileInput = q('#import-file');

    exportBtn.addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(roles, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'roles-board.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 500);
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]; if(!file) return;
      try{
        const text = await file.text();
        const data = JSON.parse(text);
        if(Array.isArray(data) && data.every(d => 'id' in d && 'name' in d && 'category' in d)){
          roles = data.map(d => ({ id: d.id || id(), name: String(d.name), category: CATEGORIES.includes(d.category)? d.category : 'TBD', checked: !!d.checked }));
          save(); render();
        } else {
          alert('Invalid JSON format.');
        }
      }catch(err){ alert('Failed to import file.'); console.error(err); }
      finally{ e.target.value = ''; }
    });
  }

  // --- Init ---
  function init(){
    load();
    wireDnD();
    wireAdd();
    wireIO();
    render();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
