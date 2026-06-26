/* ── State ── */
const state = {
  steps: [],
  nextStepId: 1,
  nextFieldId: 1,
  previewStep: 0,
};

/* ── DOM refs ── */
const stepsList      = document.getElementById('stepsList');
const addStepBtn     = document.getElementById('addStepBtn');
const nextLabelInput = document.getElementById('nextLabel');
const backLabelInput = document.getElementById('backLabel');
const submitLabelInput = document.getElementById('submitLabel');
const previewContainer = document.getElementById('previewContainer');
const copyHtmlBtn    = document.getElementById('copyHtmlBtn');
const resetBtn       = document.getElementById('resetBtn');
const statusLabel    = document.getElementById('statusLabel');
const fieldTypeModal = document.getElementById('fieldTypeModal');
const modalBackdrop  = document.getElementById('modalBackdrop');
const modalClose     = document.getElementById('modalClose');

let pendingAddFieldStepId = null;
let statusTimeout = null;

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

/* ── Step operations ── */
function addStep() {
  const id = stepUid();
  state.steps.push({
    id,
    name: `Step ${state.steps.length + 1}`,
    collapsed: false,
    fields: [],
  });
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
function addField(stepId, type) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const field = {
    id: uid(),
    type,
    label: '',
    placeholder: '',
    required: false,
    options: ['Option 1'],
  };
  step.fields.push(field);
  renderBuilder();
  renderPreview();
}

function deleteField(stepId, fieldId) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.fields = step.fields.filter(f => f.id !== fieldId);
  renderBuilder();
  renderPreview();
}

function updateField(stepId, fieldId, key, value) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const field = step.fields.find(f => f.id === fieldId);
  if (field) field[key] = value;
  renderPreview();
}

function addOption(stepId, fieldId) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const field = step.fields.find(f => f.id === fieldId);
  if (field) {
    field.options.push(`Option ${field.options.length + 1}`);
    renderBuilder();
    renderPreview();
  }
}

function removeOption(stepId, fieldId, idx) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const field = step.fields.find(f => f.id === fieldId);
  if (field && field.options.length > 1) {
    field.options.splice(idx, 1);
    renderBuilder();
    renderPreview();
  }
}

function updateOption(stepId, fieldId, idx, value) {
  const step = state.steps.find(s => s.id === stepId);
  if (!step) return;
  const field = step.fields.find(f => f.id === fieldId);
  if (field) {
    field.options[idx] = value;
    renderPreview();
  }
}

/* ── Modal ── */
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
  if (e.key === 'Escape') closeModal();
});

fieldTypeModal.querySelectorAll('.field-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.type;
    if (pendingAddFieldStepId !== null) {
      addField(pendingAddFieldStepId, type);
    }
    closeModal();
  });
});

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
  if (state.previewStep === fromIdx) {
    state.previewStep = toIdx;
  } else if (fromIdx < toIdx && state.previewStep > fromIdx && state.previewStep <= toIdx) {
    state.previewStep--;
  } else if (fromIdx > toIdx && state.previewStep >= toIdx && state.previewStep < fromIdx) {
    state.previewStep++;
  }
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
  document.querySelectorAll('.field-row').forEach(el => el.classList.remove('drag-over'));
}

function onFieldDragOver(e, stepId, fieldId) {
  if (dragSrcField === fieldId) return;
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.field-row').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.closest('.field-row').classList.add('drag-over');
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
      if (state.steps.length === 1 || confirm(`Delete "${step.name}"?`)) {
        deleteStep(step.id);
      }
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
      step.fields.forEach(field => {
        fieldsList.appendChild(buildFieldRow(step.id, field));
      });
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

function buildFieldRow(stepId, field) {
  const row = document.createElement('div');
  row.className = 'field-row';
  row.dataset.fieldId = field.id;
  row.draggable = true;

  row.addEventListener('dragstart', e => onFieldDragStart(e, stepId, field.id));
  row.addEventListener('dragend',   e => onFieldDragEnd(e));
  row.addEventListener('dragover',  e => onFieldDragOver(e, stepId, field.id));
  row.addEventListener('drop',      e => onFieldDrop(e, stepId, field.id));

  /* Top row */
  const top = document.createElement('div');
  top.className = 'field-row-top';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'field-drag-handle';
  dragHandle.textContent = '⠿';

  const typeBadge = document.createElement('span');
  typeBadge.className = 'field-type-badge';
  typeBadge.textContent = field.type;

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'field-label-input';
  labelInput.value = field.label;
  labelInput.placeholder = 'Label';
  labelInput.addEventListener('input', e => updateField(stepId, field.id, 'label', e.target.value));

  const placeholderInput = document.createElement('input');
  placeholderInput.type = 'text';
  placeholderInput.className = 'field-placeholder-input';
  placeholderInput.value = field.placeholder;
  placeholderInput.placeholder = 'Placeholder';
  placeholderInput.addEventListener('input', e => updateField(stepId, field.id, 'placeholder', e.target.value));

  /* Hide placeholder for types that don't use it */
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    placeholderInput.style.display = 'none';
  }

  const reqWrap = document.createElement('div');
  reqWrap.className = 'required-toggle-wrap';
  const reqLabel = document.createElement('label');
  reqLabel.textContent = 'Req';
  const reqId = `req-${stepId}-${field.id}`;
  reqLabel.htmlFor = reqId;
  const reqToggle = document.createElement('input');
  reqToggle.type = 'checkbox';
  reqToggle.className = 'toggle-checkbox';
  reqToggle.id = reqId;
  reqToggle.checked = field.required;
  reqToggle.addEventListener('change', e => updateField(stepId, field.id, 'required', e.target.checked));
  reqWrap.appendChild(reqLabel);
  reqWrap.appendChild(reqToggle);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-field-btn';
  deleteBtn.title = 'Delete field';
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', () => deleteField(stepId, field.id));

  top.appendChild(dragHandle);
  top.appendChild(typeBadge);
  top.appendChild(labelInput);
  top.appendChild(placeholderInput);
  top.appendChild(reqWrap);
  top.appendChild(deleteBtn);
  row.appendChild(top);

  /* Options editor for select/radio/checkbox */
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    const optEditor = buildOptionsEditor(stepId, field);
    row.appendChild(optEditor);
  }

  return row;
}

function buildOptionsEditor(stepId, field) {
  const wrap = document.createElement('div');
  wrap.className = 'options-editor';

  const lbl = document.createElement('div');
  lbl.className = 'options-editor-label';
  lbl.textContent = 'Options';
  wrap.appendChild(lbl);

  const itemsContainer = document.createElement('div');
  itemsContainer.className = 'option-items';

  field.options.forEach((opt, idx) => {
    const item = document.createElement('div');
    item.className = 'option-item';

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = opt;
    inp.placeholder = `Option ${idx + 1}`;
    inp.addEventListener('input', e => updateOption(stepId, field.id, idx, e.target.value));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-option-btn';
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove option';
    removeBtn.addEventListener('click', () => removeOption(stepId, field.id, idx));

    item.appendChild(inp);
    item.appendChild(removeBtn);
    itemsContainer.appendChild(item);
  });

  wrap.appendChild(itemsContainer);

  const addOptBtn = document.createElement('button');
  addOptBtn.className = 'add-option-btn';
  addOptBtn.textContent = '+ Add Option';
  addOptBtn.addEventListener('click', () => addOption(stepId, field.id));
  wrap.appendChild(addOptBtn);

  return wrap;
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
      const group = document.createElement('div');
      group.className = 'preview-field-group';

      const labelEl = document.createElement('label');
      labelEl.className = 'preview-field-label';
      labelEl.textContent = field.label || `Unlabeled ${field.type}`;
      if (field.required) {
        const star = document.createElement('span');
        star.className = 'required-star';
        star.textContent = '*';
        labelEl.appendChild(star);
      }
      group.appendChild(labelEl);

      const fieldEl = buildPreviewField(field);
      group.appendChild(fieldEl);
      stepDiv.appendChild(group);
    });

    if (step.fields.length === 0) {
      const msg = document.createElement('p');
      msg.style.cssText = 'color:#555;font-size:13px;font-style:italic;padding:12px 0;';
      msg.textContent = 'No fields in this step yet.';
      stepDiv.appendChild(msg);
    }

    /* Nav buttons */
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
    def.value = '';
    def.textContent = field.placeholder || 'Select an option';
    def.disabled = true;
    def.selected = true;
    el.appendChild(def);
    (field.options || []).forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.textContent = opt;
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
      inp.type = 'radio';
      inp.name = name;
      inp.value = opt;
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
      inp.type = 'checkbox';
      inp.value = opt;
      item.appendChild(inp);
      item.appendChild(document.createTextNode(opt || `Option ${i + 1}`));
      wrap.appendChild(item);
    });
    return wrap;
  }

  /* text, email, number */
  const el = document.createElement('input');
  el.type = field.type;
  el.className = 'preview-input';
  el.placeholder = field.placeholder || '';
  return el;
}

function goPreviewStep(idx) {
  state.previewStep = idx;
  const steps = previewContainer.querySelectorAll('.preview-step');
  steps.forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  const indicator = previewContainer.querySelector('#previewIndicator');
  if (indicator) {
    indicator.textContent = `Step ${idx + 1} of ${state.steps.length}`;
  }
}

function showPreviewSuccess(wrap) {
  wrap.innerHTML = `
    <div class="preview-success">
      <div class="preview-success-icon">✓</div>
      <h2>Form submitted!</h2>
      <p>This is a preview — no data was sent anywhere.</p>
    </div>
  `;
  /* Allow re-preview after a moment */
  const replayBtn = document.createElement('button');
  replayBtn.className = 'btn btn-ghost btn-sm';
  replayBtn.textContent = '↺ Restart preview';
  replayBtn.style.cssText = 'margin: 16px auto; display:block;';
  replayBtn.addEventListener('click', () => {
    state.previewStep = 0;
    renderPreview();
  });
  wrap.querySelector('.preview-success').appendChild(replayBtn);
}

/* ── Copy HTML ── */
function buildHtmlOutput() {
  const nextLabel   = escHtml(nextLabelInput.value || 'Next');
  const backLabel   = escHtml(backLabelInput.value || 'Back');
  const submitLabel = escHtml(submitLabelInput.value || 'Submit');

  const stepsHtml = state.steps.map((step, idx) => {
    const fieldsHtml = step.fields.map(field => buildFieldHtml(field)).join('\n');
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

  const stepIndicators = state.steps.map((_, i) =>
    `    <span class="mfg-dot${i === 0 ? ' active' : ''}"></span>`
  ).join('\n');

  return `<style>
  .mfg-form-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 15px; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 24px 0; }
  .mfg-progress { display: flex; gap: 6px; margin-bottom: 28px; }
  .mfg-dot { width: 8px; height: 8px; border-radius: 50%; background: #d0d0d0; transition: background 0.2s; }
  .mfg-dot.active { background: #333; }
  .mfg-step { display: none; }
  .mfg-step.active { display: block; }
  .mfg-field-group { margin-bottom: 18px; }
  .mfg-label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #222; }
  .mfg-required { color: #c0392b; margin-left: 3px; }
  .mfg-input { display: block; width: 100%; padding: 9px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; font-family: inherit; color: #1a1a1a; background: #fff; transition: border-color 0.15s; box-sizing: border-box; }
  .mfg-input:focus { outline: none; border-color: #555; }
  textarea.mfg-input { resize: vertical; min-height: 80px; }
  select.mfg-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }
  .mfg-option-group { display: flex; flex-direction: column; gap: 8px; }
  .mfg-option-item { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
  .mfg-nav { display: flex; gap: 10px; margin-top: 24px; }
  .mfg-btn { padding: 10px 22px; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: opacity 0.15s; }
  .mfg-btn-next, .mfg-btn-submit { background: #1a1a1a; color: #fff; border: none; }
  .mfg-btn-next:hover, .mfg-btn-submit:hover { opacity: 0.85; }
  .mfg-btn-back { background: transparent; color: #333; border: 1px solid #ccc; }
  .mfg-btn-back:hover { background: #f5f5f5; }
  .mfg-error { border-color: #c0392b !important; }
  .mfg-error-msg { font-size: 12px; color: #c0392b; margin-top: 4px; }
  .mfg-success { text-align: center; padding: 40px 0; }
  .mfg-success h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .mfg-success p { color: #666; }
</style>

<div class="mfg-form-wrap">
  <div class="mfg-progress">
${stepIndicators}
  </div>
  <form id="mfgForm" onsubmit="mfgSubmit(event)" novalidate>
${stepsHtml}
  </form>
</div>

<script>
(function() {
  var currentStep = 0;
  var totalSteps = ${state.steps.length};

  function showStep(n) {
    var steps = document.querySelectorAll('.mfg-step');
    var dots  = document.querySelectorAll('.mfg-dot');
    steps.forEach(function(s, i) { s.classList.toggle('active', i === n); });
    dots.forEach(function(d, i)  { d.classList.toggle('active', i === n); });
    currentStep = n;
  }

  function validateStep(n) {
    var step = document.querySelectorAll('.mfg-step')[n];
    if (!step) return true;
    var valid = true;
    step.querySelectorAll('.mfg-error-msg').forEach(function(el) { el.remove(); });
    step.querySelectorAll('.mfg-input').forEach(function(el) {
      el.classList.remove('mfg-error');
    });
    step.querySelectorAll('[data-required="true"]').forEach(function(el) {
      var val = el.value.trim();
      if (el.type === 'radio' || el.type === 'checkbox') return;
      if (!val) {
        el.classList.add('mfg-error');
        var msg = document.createElement('div');
        msg.className = 'mfg-error-msg';
        msg.textContent = 'This field is required.';
        el.parentNode.appendChild(msg);
        valid = false;
      }
    });
    step.querySelectorAll('[data-required-radio]').forEach(function(groupName) {
      var checked = step.querySelector('input[name="' + groupName.dataset.requiredRadio + '"]:checked');
      if (!checked) {
        var group = step.querySelector('[data-radio-group="' + groupName.dataset.requiredRadio + '"]');
        if (group) {
          var msg = document.createElement('div');
          msg.className = 'mfg-error-msg';
          msg.textContent = 'Please select an option.';
          group.appendChild(msg);
          valid = false;
        }
      }
    });
    return valid;
  }

  window.mfgNext = function(stepIdx) {
    if (!validateStep(stepIdx)) return;
    showStep(stepIdx + 1);
    window.scrollTo(0, 0);
  };

  window.mfgPrev = function() {
    showStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  window.mfgSubmit = function(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    document.getElementById('mfgForm').parentNode.innerHTML =
      '<div class="mfg-success"><h2>Thank you!</h2><p>Your response has been received.</p></div>';
  };

  showStep(0);
})();
<\/script>`;
}

function buildFieldHtml(field) {
  const labelText = escHtml(field.label || `Unlabeled ${field.type}`);
  const placeholder = escHtml(field.placeholder || '');
  const required = field.required ? ' data-required="true" required' : '';
  const reqStar = field.required ? '<span class="mfg-required">*</span>' : '';
  const fid = `field-${field.id}`;

  if (field.type === 'textarea') {
    return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${labelText}${reqStar}</label>
        <textarea id="${fid}" class="mfg-input" placeholder="${placeholder}"${required}></textarea>
      </div>`;
  }

  if (field.type === 'select') {
    const options = (field.options || []).map(o =>
      `          <option value="${escHtml(o)}">${escHtml(o)}</option>`
    ).join('\n');
    return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${labelText}${reqStar}</label>
        <select id="${fid}" class="mfg-input"${required}>
          <option value="" disabled selected>${placeholder || 'Select an option'}</option>
${options}
        </select>
      </div>`;
  }

  if (field.type === 'radio') {
    const radioName = `radio-${field.id}`;
    const items = (field.options || []).map((opt, i) => {
      const rid = `${fid}-${i}`;
      return `          <label class="mfg-option-item"><input type="radio" id="${rid}" name="${radioName}" value="${escHtml(opt)}"${field.required ? ' required' : ''}> ${escHtml(opt)}</label>`;
    }).join('\n');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${labelText}${reqStar}</div>
        <div class="mfg-option-group"${field.required ? ` data-required-radio="${radioName}"` : ''}>
${items}
        </div>
      </div>`;
  }

  if (field.type === 'checkbox') {
    const items = (field.options || []).map((opt, i) => {
      const cid = `${fid}-${i}`;
      return `          <label class="mfg-option-item"><input type="checkbox" id="${cid}" name="${escHtml(field.label || fid)}-${i}" value="${escHtml(opt)}"> ${escHtml(opt)}</label>`;
    }).join('\n');
    return `      <div class="mfg-field-group">
        <div class="mfg-label">${labelText}${reqStar}</div>
        <div class="mfg-option-group">
${items}
        </div>
      </div>`;
  }

  /* text, email, number */
  return `      <div class="mfg-field-group">
        <label class="mfg-label" for="${fid}">${labelText}${reqStar}</label>
        <input type="${field.type}" id="${fid}" class="mfg-input" placeholder="${placeholder}"${required}>
      </div>`;
}

function showStatus(msg) {
  statusLabel.textContent = msg;
  statusLabel.classList.add('visible');
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusLabel.classList.remove('visible');
  }, 2000);
}

/* ── Event listeners ── */
addStepBtn.addEventListener('click', addStep);

copyHtmlBtn.addEventListener('click', () => {
  if (state.steps.length === 0) {
    showStatus('Add at least one step first.');
    return;
  }
  const html = buildHtmlOutput();
  navigator.clipboard.writeText(html).then(() => {
    showStatus('Copied to clipboard!');
  }).catch(() => {
    /* Fallback for file:// */
    const ta = document.createElement('textarea');
    ta.value = html;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
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

function setMobileTab(targetId) {
  mobileTabs.forEach(t => t.classList.toggle('active', t.dataset.target === targetId));
  document.getElementById('builderPanel').classList.toggle('mobile-active', targetId === 'builderPanel');
  document.getElementById('previewPanel').classList.toggle('mobile-active', targetId === 'previewPanel');
}

mobileTabs.forEach(tab => {
  tab.addEventListener('click', () => setMobileTab(tab.dataset.target));
});

/* ── Init ── */
setMobileTab('builderPanel');
addStep();
