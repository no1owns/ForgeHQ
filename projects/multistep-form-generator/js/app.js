/* ── Field type definitions ── */
const FIELD_TYPES = {
  text:      { label: 'Short Text',      icon: 'Aa',  hasPlaceholder: true  },
  textarea:  { label: 'Long Text',       icon: '¶',   hasPlaceholder: true  },
  email:     { label: 'Email',           icon: '@',   hasPlaceholder: true  },
  phone:     { label: 'Phone',           icon: '☎',   hasPlaceholder: true  },
  number:    { label: 'Number',          icon: '#',   hasPlaceholder: true  },
  url:       { label: 'URL',             icon: '⌘',   hasPlaceholder: true  },
  date:      { label: 'Date',            icon: '▦',   hasPlaceholder: false },
  file:      { label: 'File Upload',     icon: '↑',   hasPlaceholder: false },
  select:    { label: 'Dropdown',        icon: '▾',   hasPlaceholder: true,  hasOptions: true },
  radio:     { label: 'Multiple Choice', icon: '◉',   hasPlaceholder: false, hasOptions: true },
  checkbox:  { label: 'Checkboxes',      icon: '☑',   hasPlaceholder: false, hasOptions: true },
  yesno:     { label: 'Yes / No',        icon: 'Y/N', hasPlaceholder: false, hasOptions: true },
  rating:    { label: 'Rating',          icon: '★',   hasPlaceholder: false },
  scale:     { label: 'Opinion Scale',   icon: '↔',   hasPlaceholder: false },
  statement: { label: 'Statement',       icon: '✦',   hasPlaceholder: false, isContent: true },
};

const FIELD_DEFAULTS = {
  select:   { options: ['Option 1', 'Option 2', 'Option 3'] },
  radio:    { options: ['Option 1', 'Option 2', 'Option 3'] },
  checkbox: { options: ['Option 1', 'Option 2'] },
  yesno:    { options: ['Yes', 'No'] },
  rating:   { options: ['5'] },
  scale:    { options: ['1', '10', '', ''] },
};

/* ── State ── */
const state = {
  steps: [],
  nextStepId: 1,
  nextFieldId: 1,
  previewStep: 0,
};

/* ── DOM refs ── */
const stepsList           = document.getElementById('stepsList');
const addStepBtn          = document.getElementById('addStepBtn');
const nextLabelInput      = document.getElementById('nextLabel');
const backLabelInput      = document.getElementById('backLabel');
const submitLabelInput    = document.getElementById('submitLabel');
const previewContainer    = document.getElementById('previewContainer');
const copyHtmlBtn         = document.getElementById('copyHtmlBtn');
const resetBtn            = document.getElementById('resetBtn');
const statusLabel         = document.getElementById('statusLabel');
const fieldTypeModal      = document.getElementById('fieldTypeModal');
const modalBackdrop       = document.getElementById('modalBackdrop');
const modalClose          = document.getElementById('modalClose');
const fieldEditor         = document.getElementById('fieldEditor');
const fieldEditorBackdrop = document.getElementById('fieldEditorBackdrop');
const fieldEditorDone     = document.getElementById('fieldEditorDone');
const fieldEditorBody     = document.getElementById('fieldEditorBody');
const editorTypeIcon      = document.getElementById('editorTypeIcon');
const editorTypeName      = document.getElementById('editorTypeName');

let pendingAddFieldStepId = null;
let statusTimeout = null;
let editingStepId = null;
let editingFieldId = null;

/* ── Helpers ── */
function uid() { return state.nextFieldId++; }
function stepUid() { return state.nextStepId++; }
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function typeDef(type) {
  return FIELD_TYPES[type] || { label: type, icon: '?', hasPlaceholder: true };
}

/* ── Step operations ── */
function addStep() {
  const id = stepUid();
  state.steps.push({ id, name: `Step ${state.steps.length + 1}`, collapsed: false, fields: [] });
  renderBuilder();
  renderPreview();
}

function deleteStep(stepId) {
  state.steps = state.steps.filter(s => s.id !== stepId);
  if (state.previewStep >= state.steps.length) {
    state.previewStep = Math.max(0, state.steps.length - 1);
  }
  renderBuilder();
  renderPreview();
}

function renameStep(stepId, name) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.name = name;
  renderPreview();
}

function toggleCollapse(stepId) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.collapsed = !step.collapsed;
  renderBuilder();
}

/* ── Field operations ── */
function getField(stepId, fieldId) {
  const step = state.steps.find(s => s.id === stepId);
  return step ? step.fields.find(f => f.id === fieldId) : null;
}

function addField(stepId, type) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const defaults = FIELD_DEFAULTS[type] || {};
  const field = {
    id: uid(),
    type,
    label: '',
    placeholder: '',
    required: false,
    options: defaults.options ? [...defaults.options] : [],
  };
  step.fields.push(field);
  renderBuilder();
  renderPreview();
  openFieldEditor(stepId, field.id);
}

function deleteField(stepId, fieldId) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.fields = step.fields.filter(f => f.id !== fieldId);
  if (editingFieldId === fieldId) closeFieldEditor();
  renderBuilder();
  renderPreview();
}

function addOption(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  if (field) {
    field.options.push(`Option ${field.options.length + 1}`);
    renderEditorOptions(stepId, fieldId);
    renderPreview();
  }
}

function removeOption(stepId, fieldId, idx) {
  const field = getField(stepId, fieldId);
  if (field && field.options.length > 1) {
    field.options.splice(idx, 1);
    renderEditorOptions(stepId, fieldId);
    renderPreview();
  }
}

function updateOption(stepId, fieldId, idx, value) {
  const field = getField(stepId, fieldId);
  if (field) {
    field.options[idx] = value;
    renderPreview();
  }
}

/* ── Field type picker modal ── */
function openModal(stepId) {
  pendingAddFieldStepId = stepId;
  fieldTypeModal.classList.remove('hidden');
  fieldTypeModal.querySelector('.field-type-btn').focus();
}

function closeModal() {
  fieldTypeModal.classList.add('hidden');
  pendingAddFieldStepId = null;
}

modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeFieldEditor(); }
});

fieldTypeModal.querySelectorAll('.field-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    if (pendingAddFieldStepId !== null) addField(pendingAddFieldStepId, type);
    closeModal();
  });
});

/* ── Field editor sheet ── */
function openFieldEditor(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  if (!field) return;
  editingStepId = stepId;
  editingFieldId = fieldId;
  const def = typeDef(field.type);
  editorTypeIcon.textContent = def.icon;
  editorTypeName.textContent = def.label;
  renderEditorBody(stepId, fieldId);
  fieldEditor.classList.remove('hidden');
}

function closeFieldEditor() {
  fieldEditor.classList.add('hidden');
  editingStepId = null;
  editingFieldId = null;
}

fieldEditorBackdrop.addEventListener('click', closeFieldEditor);
fieldEditorDone.addEventListener('click', closeFieldEditor);

function renderEditorBody(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  if (!field) return;
  const def = typeDef(field.type);
  fieldEditorBody.innerHTML = '';

  /* Label / content */
  fieldEditorBody.appendChild(makeEditorText(
    def.isContent ? 'Content' : 'Label',
    field.label,
    def.isContent ? 'Write your statement text…' : 'Enter a label',
    val => { field.label = val; renderPreview(); renderBuilder(); }
  ));

  /* Placeholder */
  if (def.hasPlaceholder) {
    fieldEditorBody.appendChild(makeEditorText(
      'Placeholder',
      field.placeholder,
      'Hint text shown inside the field',
      val => { field.placeholder = val; renderPreview(); }
    ));
  }

  /* Required toggle — not for statements */
  if (!def.isContent) {
    fieldEditorBody.appendChild(makeEditorToggle(
      'Required',
      field.required,
      val => { field.required = val; renderPreview(); renderBuilder(); }
    ));
  }

  /* Options list */
  if (def.hasOptions) {
    const sec = document.createElement('div');
    sec.id = 'editorOptionsSection';
    fieldEditorBody.appendChild(sec);
    renderEditorOptions(stepId, fieldId);
  }

  /* Rating — star count */
  if (field.type === 'rating') {
    fieldEditorBody.appendChild(makeEditorSelect(
      'Stars',
      ['3', '4', '5', '7', '10'],
      opt => `${opt} stars`,
      field.options[0] || '5',
      val => { field.options[0] = val; renderPreview(); }
    ));
  }

  /* Scale config */
  if (field.type === 'scale') {
    fieldEditorBody.appendChild(makeEditorText('Min value',  field.options[0] || '1',  '1',
      val => { field.options[0] = val; renderPreview(); }));
    fieldEditorBody.appendChild(makeEditorText('Max value',  field.options[1] || '10', '10',
      val => { field.options[1] = val; renderPreview(); }));
    fieldEditorBody.appendChild(makeEditorText('Min label (optional)', field.options[2] || '', 'e.g. Not at all',
      val => { field.options[2] = val; renderPreview(); }));
    fieldEditorBody.appendChild(makeEditorText('Max label (optional)', field.options[3] || '', 'e.g. Extremely',
      val => { field.options[3] = val; renderPreview(); }));
  }
}

function renderEditorOptions(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  const sec = document.getElementById('editorOptionsSection');
  if (!field || !sec) return;
  sec.innerHTML = '';

  const lbl = document.createElement('div');
  lbl.className = 'editor-group-label';
  lbl.textContent = 'Options';
  sec.appendChild(lbl);

  field.options.forEach((opt, idx) => {
    const row = document.createElement('div');
    row.className = 'editor-option-row';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'input';
    inp.value = opt;
    inp.placeholder = `Option ${idx + 1}`;
    inp.addEventListener('input', e => updateOption(stepId, fieldId, idx, e.target.value));

    const rm = document.createElement('button');
    rm.className = 'remove-option-btn';
    rm.textContent = '✕';
    rm.addEventListener('click', () => removeOption(stepId, fieldId, idx));

    row.appendChild(inp);
    row.appendChild(rm);
    sec.appendChild(row);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-option-btn';
  addBtn.textContent = '+ Add Option';
  addBtn.addEventListener('click', () => addOption(stepId, fieldId));
  sec.appendChild(addBtn);
}

function makeEditorText(labelText, currentValue, placeholder, onChange) {
  const group = document.createElement('div');
  group.className = 'editor-group';

  const lbl = document.createElement('div');
  lbl.className = 'editor-group-label';
  lbl.textContent = labelText;

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'input';
  inp.value = currentValue;
  inp.placeholder = placeholder;
  inp.addEventListener('input', e => onChange(e.target.value));

  group.appendChild(lbl);
  group.appendChild(inp);
  return group;
}

function makeEditorToggle(labelText, currentValue, onChange) {
  const group = document.createElement('div');
  group.className = 'editor-group editor-toggle-row';

  const id = `etoggle-${Date.now()}`;
  const lbl = document.createElement('label');
  lbl.className = 'editor-group-label';
  lbl.textContent = labelText;
  lbl.htmlFor = id;

  const inp = document.createElement('input');
  inp.type = 'checkbox';
  inp.className = 'toggle-checkbox';
  inp.id = id;
  inp.checked = currentValue;
  inp.addEventListener('change', e => onChange(e.target.checked));

  group.appendChild(lbl);
  group.appendChild(inp);
  return group;
}

function makeEditorSelect(labelText, options, labelFn, currentValue, onChange) {
  const group = document.createElement('div');
  group.className = 'editor-group';

  const lbl = document.createElement('div');
  lbl.className = 'editor-group-label';
  lbl.textContent = labelText;

  const sel = document.createElement('select');
  sel.className = 'input';
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = labelFn(opt);
    o.selected = opt === currentValue;
    sel.appendChild(o);
  });
  sel.addEventListener('change', e => onChange(e.target.value));

  group.appendChild(lbl);
  group.appendChild(sel);
  return group;
}

/* ── Drag and drop (steps) ── */
let dragSrcStep = null;

function onStepDragStart(e, stepId) {
  dragSrcStep = stepId;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}

function onStepDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.step-card').forEach(el => el.classList.remove('drag-over'));
}

function onStepDragOver(e, stepId) {
  if (dragSrcStep === stepId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.step-card').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.closest('.step-card').classList.add('drag-over');
}

function onStepDrop(e, targetStepId) {
  e.preventDefault();
  if (dragSrcStep === targetStepId) return;
  const fromIdx = state.steps.findIndex(s => s.id === dragSrcStep);
  const toIdx   = state.steps.findIndex(s => s.id === targetStepId);
  if (fromIdx < 0 || toIdx < 0) return;
  const [moved] = state.steps.splice(fromIdx, 1);
  state.steps.splice(toIdx, 0, moved);
  if (state.previewStep === fromIdx) state.previewStep = toIdx;
  else if (fromIdx < toIdx && state.previewStep > fromIdx && state.previewStep <= toIdx) state.previewStep--;
  else if (fromIdx > toIdx && state.previewStep >= toIdx && state.previewStep < fromIdx) state.previewStep++;
  renderBuilder();
  renderPreview();
}

/* ── Drag and drop (fields) ── */
let dragSrcField = null;
let dragSrcFieldStep = null;

function onFieldDragStart(e, stepId, fieldId) {
  dragSrcField = fieldId;
  dragSrcFieldStep = stepId;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
  e.stopPropagation();
}

function onFieldDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.field-card').forEach(el => el.classList.remove('drag-over'));
}

function onFieldDragOver(e, stepId, fieldId) {
  if (dragSrcField === fieldId) return;
  e.preventDefault();
  e.stopPropagation();
  document.querySelectorAll('.field-card').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.closest('.field-card').classList.add('drag-over');
}

function onFieldDrop(e, stepId, targetFieldId) {
  e.preventDefault();
  e.stopPropagation();
  if (dragSrcField === targetFieldId || dragSrcFieldStep !== stepId) return;
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const fromIdx = step.fields.findIndex(f => f.id === dragSrcField);
  const toIdx   = step.fields.findIndex(f => f.id === targetFieldId);
  if (fromIdx < 0 || toIdx < 0) return;
  const [moved] = step.fields.splice(fromIdx, 1);
  step.fields.splice(toIdx, 0, moved);
  renderBuilder();
  renderPreview();
}

/* ── Builder render ── */
function renderBuilder() {
  stepsList.innerHTML = '';

  if (state.steps.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;color:#666;padding:40px 20px;font-size:13px;';
    empty.textContent = 'No steps yet — click "Add Step" to get started.';
    stepsList.appendChild(empty);
    return;
  }

  state.steps.forEach(step => {
    const card = document.createElement('div');
    card.className = 'step-card' + (step.collapsed ? ' collapsed' : '');
    card.dataset.stepId = step.id;
    card.draggable = true;

    card.addEventListener('dragstart', e => onStepDragStart(e, step.id));
    card.addEventListener('dragend',   e => onStepDragEnd(e));
    card.addEventListener('dragover',  e => onStepDragOver(e, step.id));
    card.addEventListener('drop',      e => onStepDrop(e, step.id));

    /* Header */
    const header = document.createElement('div');
    header.className = 'step-card-header';

    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '⠿';
    handle.title = 'Drag to reorder';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'step-name-input';
    nameInput.value = step.name;
    nameInput.placeholder = 'Step name';
    nameInput.addEventListener('input', e => renameStep(step.id, e.target.value));
    nameInput.addEventListener('mousedown', e => e.stopPropagation());

    const actions = document.createElement('div');
    actions.className = 'step-card-actions';

    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.title = step.collapsed ? 'Expand' : 'Collapse';
    collapseBtn.textContent = step.collapsed ? '▸' : '▾';
    collapseBtn.addEventListener('click', () => toggleCollapse(step.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-step-btn';
    deleteBtn.title = 'Delete step';
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => {
      if (state.steps.length === 1 || confirm(`Delete "${step.name}"?`)) deleteStep(step.id);
    });

    actions.appendChild(collapseBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(handle);
    header.appendChild(nameInput);
    header.appendChild(actions);
    card.appendChild(header);

    /* Body */
    const body = document.createElement('div');
    body.className = 'step-card-body';

    const fieldsList = document.createElement('div');
    fieldsList.className = 'fields-list';

    if (step.fields.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-fields-msg';
      emptyMsg.textContent = 'No fields yet — click Add Field to get started';
      fieldsList.appendChild(emptyMsg);
    } else {
      step.fields.forEach(field => fieldsList.appendChild(buildFieldCard(step.id, field)));
    }

    const addFieldRow = document.createElement('div');
    addFieldRow.className = 'add-field-row';
    const addFieldBtn = document.createElement('button');
    addFieldBtn.className = 'btn btn-ghost btn-sm';
    addFieldBtn.textContent = '+ Add Field';
    addFieldBtn.addEventListener('click', () => openModal(step.id));
    addFieldRow.appendChild(addFieldBtn);

    body.appendChild(fieldsList);
    body.appendChild(addFieldRow);
    card.appendChild(body);
    stepsList.appendChild(card);
  });
}

function buildFieldCard(stepId, field) {
  const def = typeDef(field.type);
  const card = document.createElement('div');
  card.className = 'field-card';
  card.dataset.fieldId = field.id;
  card.draggable = true;

  card.addEventListener('dragstart', e => onFieldDragStart(e, stepId, field.id));
  card.addEventListener('dragend',   e => onFieldDragEnd(e));
  card.addEventListener('dragover',  e => onFieldDragOver(e, stepId, field.id));
  card.addEventListener('drop',      e => onFieldDrop(e, stepId, field.id));

  const dragHandle = document.createElement('span');
  dragHandle.className = 'field-drag-handle';
  dragHandle.textContent = '⠿';

  const pill = document.createElement('span');
  pill.className = 'field-type-pill';
  pill.textContent = def.icon;
  pill.title = def.label;

  const labelEl = document.createElement('span');
  labelEl.className = 'field-card-label';
  labelEl.textContent = field.label || `Untitled ${def.label}`;
  if (field.required) {
    const star = document.createElement('span');
    star.className = 'field-card-req';
    star.textContent = ' *';
    labelEl.appendChild(star);
  }

  const editBtn = document.createElement('button');
  editBtn.className = 'field-edit-btn';
  editBtn.title = 'Edit field';
  editBtn.textContent = '✏';
  editBtn.addEventListener('click', e => { e.stopPropagation(); openFieldEditor(stepId, field.id); });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-field-btn';
  deleteBtn.title = 'Delete field';
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', e => { e.stopPropagation(); deleteField(stepId, field.id); });

  card.appendChild(dragHandle);
  card.appendChild(pill);
  card.appendChild(labelEl);
  card.appendChild(editBtn);
  card.appendChild(deleteBtn);

  card.addEventListener('click', e => {
    if (e.target === deleteBtn || e.target === dragHandle) return;
    openFieldEditor(stepId, field.id);
  });

  return card;
}

/* ── Preview render ── */
function renderPreview() {
  previewContainer.innerHTML = '';

  if (state.steps.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'preview-empty-state';
    empty.innerHTML = '<p>Add a step in the builder to see a preview here.</p>';
    previewContainer.appendChild(empty);
    return;
  }

  const nextLabel   = nextLabelInput.value || 'Next';
  const backLabel   = backLabelInput.value || 'Back';
  const submitLabel = submitLabelInput.value || 'Submit';

  const wrap = document.createElement('div');
  wrap.className = 'preview-form-wrap';

  const indicator = document.createElement('div');
  indicator.className = 'preview-step-indicator';
  indicator.id = 'previewIndicator';
  indicator.textContent = `Step ${state.previewStep + 1} of ${state.steps.length}`;
  wrap.appendChild(indicator);

  state.steps.forEach((step, idx) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'preview-step' + (idx === state.previewStep ? ' active' : '');
    stepDiv.dataset.idx = idx;

    step.fields.forEach(field => {
      const def = typeDef(field.type);

      if (def.isContent) {
        stepDiv.appendChild(buildPreviewField(field));
        return;
      }

      const group = document.createElement('div');
      group.className = 'preview-field-group';

      const labelEl = document.createElement('label');
      labelEl.className = 'preview-field-label';
      labelEl.textContent = field.label || `Unlabeled ${def.label}`;
      if (field.required) {
        const star = document.createElement('span');
        star.className = 'required-star';
        star.textContent = '*';
        labelEl.appendChild(star);
      }
      group.appendChild(labelEl);
      group.appendChild(buildPreviewField(field));
      stepDiv.appendChild(group);
    });

    if (step.fields.length === 0) {
      const msg = document.createElement('p');
      msg.style.cssText = 'color:#555;font-size:13px;font-style:italic;padding:12px 0;';
      msg.textContent = 'No fields in this step yet.';
      stepDiv.appendChild(msg);
    }

    const nav = document.createElement('div');
    nav.className = 'preview-nav';

    if (idx > 0) {
      const backBtn = document.createElement('button');
      backBtn.className = 'preview-btn-back';
      backBtn.textContent = backLabel;
      backBtn.addEventListener('click', () => goPreviewStep(idx - 1));
      nav.appendChild(backBtn);
    }

    if (idx < state.steps.length - 1) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'preview-btn-next';
      nextBtn.textContent = nextLabel;
      nextBtn.addEventListener('click', () => goPreviewStep(idx + 1));
      nav.appendChild(nextBtn);
    } else {
      const submitBtn = document.createElement('button');
      submitBtn.className = 'preview-btn-submit';
      submitBtn.textContent = submitLabel;
      submitBtn.addEventListener('click', () => showPreviewSuccess(wrap));
      nav.appendChild(submitBtn);
    }

    stepDiv.appendChild(nav);
    wrap.appendChild(stepDiv);
  });

  previewContainer.appendChild(wrap);
}

function buildPreviewField(field) {
  if (field.type === 'textarea') {
    const el = document.createElement('textarea');
    el.className = 'preview-input';
    el.placeholder = field.placeholder || '';
    return el;
  }

  if (field.type === 'select') {
    const el = document.createElement('select');
    el.className = 'preview-input';
    const def = document.createElement('option');
    def.value = ''; def.disabled = true; def.selected = true;
    def.textContent = field.placeholder || 'Select an option';
    el.appendChild(def);
    (field.options || []).forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      el.appendChild(o);
    });
    return el;
  }

  if (field.type === 'radio') {
    const wrap = document.createElement('div');
    wrap.className = 'preview-radio-group';
    const name = `preview-radio-${field.id}`;
    (field.options || []).forEach((opt, i) => {
      const item = document.createElement('label');
      item.className = 'preview-radio-item';
      const inp = document.createElement('input');
      inp.type = 'radio'; inp.name = name; inp.value = opt;
      item.appendChild(inp);
      item.appendChild(document.createTextNode(opt || `Option ${i + 1}`));
      wrap.appendChild(item);
    });
    return wrap;
  }

  if (field.type === 'checkbox') {
    const wrap = document.createElement('div');
    wrap.className = 'preview-checkbox-group';
    (field.options || []).forEach((opt, i) => {
      const item = document.createElement('label');
      item.className = 'preview-checkbox-item';
      const inp = document.createElement('input');
      inp.type = 'checkbox'; inp.value = opt;
      item.appendChild(inp);
      item.appendChild(document.createTextNode(opt || `Option ${i + 1}`));
      wrap.appendChild(item);
    });
    return wrap;
  }

  if (field.type === 'yesno') {
    const wrap = document.createElement('div');
    wrap.className = 'preview-yesno';
    (field.options.length >= 2 ? field.options.slice(0, 2) : ['Yes', 'No']).forEach(label => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preview-yesno-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.preview-yesno-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  if (field.type === 'rating') {
    const maxStars = parseInt(field.options[0] || '5', 10);
    const wrap = document.createElement('div');
    wrap.className = 'preview-rating';
    for (let i = 1; i <= maxStars; i++) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'preview-star';
      star.dataset.value = i;
      star.textContent = '★';
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value, 10);
        wrap.querySelectorAll('.preview-star').forEach((s, idx) => {
          s.classList.toggle('active', idx < val);
        });
      });
      wrap.appendChild(star);
    }
    return wrap;
  }

  if (field.type === 'scale') {
    const min = parseInt(field.options[0] || '1', 10);
    const max = parseInt(field.options[1] || '10', 10);
    const minLabel = field.options[2] || '';
    const maxLabel = field.options[3] || '';

    const wrap = document.createElement('div');
    wrap.className = 'preview-scale';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'preview-scale-slider';
    slider.min = min; slider.max = max;
    slider.value = Math.round((min + max) / 2);
    wrap.appendChild(slider);

    const nums = document.createElement('div');
    nums.className = 'preview-scale-numbers';
    for (let i = min; i <= max; i++) {
      const n = document.createElement('span');
      n.textContent = i;
      nums.appendChild(n);
    }
    wrap.appendChild(nums);

    if (minLabel || maxLabel) {
      const labels = document.createElement('div');
      labels.className = 'preview-scale-labels';
      const lMin = document.createElement('span'); lMin.textContent = minLabel;
      const lMax = document.createElement('span'); lMax.textContent = maxLabel;
      labels.appendChild(lMin); labels.appendChild(lMax);
      wrap.appendChild(labels);
    }
    return wrap;
  }

  if (field.type === 'statement') {
    const el = document.createElement('div');
    el.className = 'preview-statement';
    el.textContent = field.label || 'Add your statement text in the field editor.';
    return el;
  }

  /* text, email, phone, url, number, date, file */
  const el = document.createElement('input');
  el.type = field.type === 'phone' ? 'tel' : field.type;
  el.className = 'preview-input';
  if (field.placeholder) el.placeholder = field.placeholder;
  return el;
}

function goPreviewStep(idx) {
  state.previewStep = idx;
  previewContainer.querySelectorAll('.preview-step').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  const ind = previewContainer.querySelector('#previewIndicator');
  if (ind) ind.textContent = `Step ${idx + 1} of ${state.steps.length}`;
}

function showPreviewSuccess(wrap) {
  wrap.innerHTML = `
    <div class="preview-success">
      <div class="preview-success-icon">✓</div>
      <h2>Form submitted!</h2>
      <p>This is a preview — no data was sent anywhere.</p>
    </div>`;
  const btn = document.createElement('button');
  btn.className = 'btn btn-ghost btn-sm';
  btn.textContent = '↺ Restart preview';
  btn.style.cssText = 'margin:16px auto;display:block;';
  btn.addEventListener('click', () => { state.previewStep = 0; renderPreview(); });
  wrap.querySelector('.preview-success').appendChild(btn);
}

/* ── Copy HTML ── */
function buildHtmlOutput() {
  const nextLabel   = escHtml(nextLabelInput.value || 'Next');
  const backLabel   = escHtml(backLabelInput.value || 'Back');
  const submitLabel = escHtml(submitLabelInput.value || 'Submit');

  const stepsHtml = state.steps.map((step, idx) => {
    const fieldsHtml = step.fields.map(f => buildFieldHtml(f)).join('\n');
    return `  <div class="mfg-step" data-step="${idx}">
    <div class="mfg-fields">
${fieldsHtml}
    </div>
    <div class="mfg-nav">
${idx > 0 ? `      <button type="button" class="mfg-btn mfg-btn-back" onclick="mfgPrev()">${backLabel}</button>` : ''}
${idx < state.steps.length - 1
      ? `      <button type="button" class="mfg-btn mfg-btn-next" onclick="mfgNext(${idx})">${nextLabel}</button>`
      : `      <button type="submit" class="mfg-btn mfg-btn-submit">${submitLabel}</button>`}
    </div>
  </div>`;
  }).join('\n');

  const dots = state.steps.map((_, i) =>
    `    <span class="mfg-dot${i === 0 ? ' active' : ''}"></span>`
  ).join('\n');

  return `<style>
  .mfg-wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15px;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px 0}
  .mfg-progress{display:flex;gap:6px;margin-bottom:28px}
  .mfg-dot{width:8px;height:8px;border-radius:50%;background:#d0d0d0;transition:background .2s}
  .mfg-dot.active{background:#333}
  .mfg-step{display:none}
  .mfg-step.active{display:block}
  .mfg-field-group{margin-bottom:20px}
  .mfg-label{display:block;font-size:14px;font-weight:600;margin-bottom:8px;color:#111}
  .mfg-req{color:#c0392b;margin-left:3px}
  .mfg-input{display:block;width:100%;padding:10px 13px;border:1.5px solid #ddd;border-radius:8px;font-size:15px;font-family:inherit;color:#1a1a1a;background:#fff;transition:border-color .15s;box-sizing:border-box}
  .mfg-input:focus{outline:none;border-color:#333}
  textarea.mfg-input{resize:vertical;min-height:90px}
  select.mfg-input{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
  .mfg-choice-group{display:flex;flex-direction:column;gap:10px}
  .mfg-choice-item{display:flex;align-items:center;gap:10px;font-size:15px;cursor:pointer}
  .mfg-choice-item input{accent-color:#333;width:16px;height:16px;cursor:pointer}
  .mfg-yesno{display:flex;gap:12px}
  .mfg-yesno-btn{flex:1;padding:14px;border:2px solid #ddd;border-radius:8px;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;background:#fff;color:#333;transition:all .15s}
  .mfg-yesno-btn:hover,.mfg-yesno-btn.selected{border-color:#333;background:#333;color:#fff}
  .mfg-rating{display:flex;gap:4px}
  .mfg-star{font-size:28px;color:#ddd;cursor:pointer;background:none;border:none;padding:0;line-height:1;transition:color .1s}
  .mfg-star.on{color:#f5a623}
  .mfg-scale-slider{width:100%;accent-color:#333;margin-bottom:6px}
  .mfg-scale-nums{display:flex;justify-content:space-between}
  .mfg-scale-nums span{font-size:12px;color:#666}
  .mfg-scale-lbls{display:flex;justify-content:space-between;margin-top:4px}
  .mfg-scale-lbls span{font-size:12px;color:#999;font-style:italic}
  .mfg-statement{padding:4px 0 16px}
  .mfg-statement p{font-size:16px;color:#444;line-height:1.6}
  .mfg-nav{display:flex;gap:10px;margin-top:28px}
  .mfg-btn{padding:11px 24px;border-radius:8px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:opacity .15s}
  .mfg-btn-next,.mfg-btn-submit{background:#1a1a1a;color:#fff;border:none}
  .mfg-btn-next:hover,.mfg-btn-submit:hover{opacity:.85}
  .mfg-btn-back{background:transparent;color:#333;border:1.5px solid #ddd}
  .mfg-btn-back:hover{background:#f5f5f5}
  .mfg-err{border-color:#c0392b!important}
  .mfg-err-msg{font-size:12px;color:#c0392b;margin-top:5px}
  .mfg-success{text-align:center;padding:48px 0}
  .mfg-success h2{font-size:24px;font-weight:700;margin-bottom:10px}
  .mfg-success p{color:#666;font-size:15px}
</style>

<div class="mfg-wrap">
  <div class="mfg-progress">
${dots}
  </div>
  <form id="mfgForm" onsubmit="mfgSubmit(event)" novalidate>
${stepsHtml}
  </form>
</div>

<script>
(function(){
  var cur=0;
  function show(n){
    document.querySelectorAll('.mfg-step').forEach(function(s,i){s.classList.toggle('active',i===n);});
    document.querySelectorAll('.mfg-dot').forEach(function(d,i){d.classList.toggle('active',i===n);});
    cur=n; window.scrollTo(0,0);
  }
  function validate(n){
    var step=document.querySelectorAll('.mfg-step')[n];
    if(!step)return true;
    var ok=true;
    step.querySelectorAll('.mfg-err-msg').forEach(function(el){el.remove();});
    step.querySelectorAll('.mfg-input').forEach(function(el){el.classList.remove('mfg-err');});
    step.querySelectorAll('[data-req]').forEach(function(el){
      if(el.type==='radio'||el.type==='checkbox')return;
      if(!el.value.trim()){
        el.classList.add('mfg-err');
        var m=document.createElement('div');
        m.className='mfg-err-msg';m.textContent='This field is required.';
        el.parentNode.insertBefore(m,el.nextSibling);ok=false;
      }
    });
    return ok;
  }
  window.mfgNext=function(n){if(validate(n))show(n+1);};
  window.mfgPrev=function(){show(cur-1);};
  window.mfgYesNo=function(btn){
    btn.parentNode.querySelectorAll('.mfg-yesno-btn').forEach(function(b){b.classList.remove('selected');});
    btn.classList.add('selected');
    var h=btn.parentNode.querySelector('input[type=hidden]');if(h)h.value=btn.textContent;
  };
  window.mfgRate=function(star,val,gid){
    document.querySelectorAll('#'+gid+' .mfg-star').forEach(function(s,i){s.classList.toggle('on',i<val);});
    var h=document.querySelector('#'+gid+'-val');if(h)h.value=val;
  };
  window.mfgSubmit=function(e){
    e.preventDefault();
    if(!validate(cur))return;
    document.getElementById('mfgForm').parentNode.innerHTML='<div class="mfg-success"><h2>Thank you!</h2><p>Your response has been received.</p></div>';
  };
  show(0);
})();
<\/script>`;
}

function buildFieldHtml(field) {
  const def = typeDef(field.type);
  const label = escHtml(field.label || `Unlabeled ${def.label}`);
  const ph    = escHtml(field.placeholder || '');
  const req   = field.required ? ' data-req required' : '';
  const star  = field.required ? '<span class="mfg-req">*</span>' : '';
  const fid   = `f${field.id}`;

  if (field.type === 'statement') {
    return `      <div class="mfg-statement"><p>${label}</p></div>`;
  }

  if (field.type === 'textarea') {
    return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <textarea id="${fid}" class="mfg-input" placeholder="${ph}"${req}></textarea>
      </div>`;
  }

  if (field.type === 'select') {
    const opts = (field.options || []).map(o =>
      `          <option value="${escHtml(o)}">${escHtml(o)}</option>`).join('\n');
    return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <select id="${fid}" class="mfg-input"${req}>
          <option value="" disabled selected>${ph || 'Select an option'}</option>
${opts}
        </select>
      </div>`;
  }

  if (field.type === 'radio') {
    const name = `r${field.id}`;
    const items = (field.options || []).map((o, i) =>
      `          <label class="mfg-choice-item"><input type="radio" name="${name}" value="${escHtml(o)}"${field.required ? ' required' : ''}> ${escHtml(o)}</label>`
    ).join('\n');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${label}${star}</div>
        <div class="mfg-choice-group">
${items}
        </div>
      </div>`;
  }

  if (field.type === 'checkbox') {
    const items = (field.options || []).map((o, i) =>
      `          <label class="mfg-choice-item"><input type="checkbox" name="${fid}-${i}" value="${escHtml(o)}"> ${escHtml(o)}</label>`
    ).join('\n');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${label}${star}</div>
        <div class="mfg-choice-group">
${items}
        </div>
      </div>`;
  }

  if (field.type === 'yesno') {
    const yes = escHtml(field.options[0] || 'Yes');
    const no  = escHtml(field.options[1] || 'No');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${label}${star}</div>
        <div class="mfg-yesno">
          <button type="button" class="mfg-yesno-btn" onclick="mfgYesNo(this)">${yes}</button>
          <button type="button" class="mfg-yesno-btn" onclick="mfgYesNo(this)">${no}</button>
          <input type="hidden" name="${fid}" id="${fid}-val"${req}>
        </div>
      </div>`;
  }

  if (field.type === 'rating') {
    const max = parseInt(field.options[0] || '5', 10);
    const stars = Array.from({ length: max }, (_, i) =>
      `          <button type="button" class="mfg-star" onclick="mfgRate(this,${i + 1},'${fid}')">★</button>`
    ).join('\n');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${label}${star}</div>
        <div class="mfg-rating" id="${fid}">
${stars}
          <input type="hidden" name="${fid}" id="${fid}-val"${req}>
        </div>
      </div>`;
  }

  if (field.type === 'scale') {
    const min    = escHtml(field.options[0] || '1');
    const max    = escHtml(field.options[1] || '10');
    const minLbl = escHtml(field.options[2] || '');
    const maxLbl = escHtml(field.options[3] || '');
    const mid    = Math.round((parseInt(min, 10) + parseInt(max, 10)) / 2);
    const nums   = [];
    for (let i = parseInt(min, 10); i <= parseInt(max, 10); i++) nums.push(`<span>${i}</span>`);
    const lblsHtml = (minLbl || maxLbl)
      ? `<div class="mfg-scale-lbls"><span>${minLbl}</span><span>${maxLbl}</span></div>` : '';
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${label}${star}</div>
        <div>
          <input type="range" id="${fid}" class="mfg-scale-slider" min="${min}" max="${max}" value="${mid}" name="${fid}"${req}>
          <div class="mfg-scale-nums">${nums.join('')}</div>
          ${lblsHtml}
        </div>
      </div>`;
  }

  /* text, email, phone, url, number, date, file */
  const inputType = field.type === 'phone' ? 'tel' : field.type;
  return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <input type="${inputType}" id="${fid}" class="mfg-input" placeholder="${ph}"${req}>
      </div>`;
}

function showStatus(msg) {
  statusLabel.textContent = msg;
  statusLabel.classList.add('visible');
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => statusLabel.classList.remove('visible'), 2000);
}

/* ── Event listeners ── */
addStepBtn.addEventListener('click', addStep);

copyHtmlBtn.addEventListener('click', () => {
  if (state.steps.length === 0) { showStatus('Add at least one step first.'); return; }
  const html = buildHtmlOutput();
  navigator.clipboard.writeText(html).then(() => {
    showStatus('Copied to clipboard!');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = html;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showStatus('Copied to clipboard!');
  });
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reset everything? This will clear all steps and fields.')) {
    state.steps = [];
    state.previewStep = 0;
    state.nextStepId = 1;
    state.nextFieldId = 1;
    nextLabelInput.value = 'Next';
    backLabelInput.value = 'Back';
    submitLabelInput.value = 'Submit';
    addStep();
  }
});

[nextLabelInput, backLabelInput, submitLabelInput].forEach(el => {
  el.addEventListener('input', renderPreview);
});

/* ── Mobile tabs ── */
const mobileTabs = document.querySelectorAll('.mobile-tab');

function setMobileTab(tab) {
  mobileTabs.forEach(t => t.classList.toggle('active', t.dataset.target === tab));
  document.body.dataset.mobileTab = tab;
  document.getElementById('builderPanel').classList.toggle('mobile-active', tab !== 'preview');
  document.getElementById('previewPanel').classList.toggle('mobile-active', tab === 'preview');
}

mobileTabs.forEach(tab => {
  tab.addEventListener('click', () => setMobileTab(tab.dataset.target));
});

/* ── Init ── */
setMobileTab('builder');
addStep();
