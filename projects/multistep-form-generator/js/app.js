/* ── Field type definitions ── */
const FIELD_TYPES = {
  text:      { label: 'Short Text',      icon: 'Aa',  color: '#60a5fa', hasPlaceholder: true  },
  textarea:  { label: 'Long Text',       icon: '¶',   color: '#a78bfa', hasPlaceholder: true  },
  email:     { label: 'Email',           icon: '@',   color: '#fb923c', hasPlaceholder: true  },
  phone:     { label: 'Phone',           icon: '☎',   color: '#4ade80', hasPlaceholder: true  },
  number:    { label: 'Number',          icon: '#',   color: '#c084fc', hasPlaceholder: true  },
  url:       { label: 'URL',             icon: '↗',   color: '#38bdf8', hasPlaceholder: true  },
  date:      { label: 'Date',            icon: '▦',   color: '#34d399', hasPlaceholder: false },
  time:      { label: 'Time',            icon: '◷',   color: '#2dd4bf', hasPlaceholder: false },
  file:      { label: 'File',            icon: '↑',   color: '#94a3b8', hasPlaceholder: false },
  password:  { label: 'Password',        icon: '●●',  color: '#f43f5e', hasPlaceholder: true  },
  select:    { label: 'Dropdown',        icon: '▾',   color: '#fbbf24', hasPlaceholder: true,  hasOptions: true },
  radio:     { label: 'Multiple Choice', icon: '◉',   color: '#f97316', hasPlaceholder: false, hasOptions: true },
  checkbox:  { label: 'Checkboxes',      icon: '☑',   color: '#86efac', hasPlaceholder: false, hasOptions: true },
  yesno:     { label: 'Yes / No',        icon: 'Y/N', color: '#e879f9', hasPlaceholder: false, hasOptions: true },
  rating:    { label: 'Rating',          icon: '★',   color: '#fbbf24', hasPlaceholder: false },
  scale:     { label: 'Opinion Scale',   icon: '↔',   color: '#67e8f9', hasPlaceholder: false },
  statement: { label: 'Statement',       icon: '✦',   color: '#e8ff47', hasPlaceholder: false, isContent: true },
  country:   { label: 'Country',         icon: '⊛',   color: '#22d3ee', hasPlaceholder: true  },
};

const FIELD_CATEGORIES = [
  { label: 'Text',    types: ['text', 'textarea', 'email', 'phone', 'number', 'url', 'date', 'time', 'file', 'password'] },
  { label: 'Choice',  types: ['select', 'radio', 'checkbox', 'yesno', 'country'] },
  { label: 'Scale',   types: ['rating', 'scale'] },
  { label: 'Content', types: ['statement'] },
];

const FIELD_DEFAULTS = {
  select:   { options: ['Option 1', 'Option 2', 'Option 3'] },
  radio:    { options: ['Option 1', 'Option 2', 'Option 3'] },
  checkbox: { options: ['Option 1', 'Option 2'] },
  yesno:    { options: ['Yes', 'No'] },
  rating:   { options: ['5'] },
  scale:    { options: ['1', '10', '', ''] },
};

const COUNTRY_LIST = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (Brazzaville)','Congo (Kinshasa)','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic',
  'Denmark','Djibouti','Dominica','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia',
  'Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana',
  'Haiti','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway',
  'Oman',
  'Pakistan','Palau','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar',
  'Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam',
  'Yemen',
  'Zambia','Zimbabwe',
];

/* ── Form templates ── */
const TEMPLATES = [
  {
    id: 'contact', name: 'Contact & Inquiry', icon: '✉', color: '#60a5fa',
    desc: 'Capture leads and general inquiries from your website',
    steps: [
      { name: 'Your Details', fields: [
        { type: 'text',     label: 'Full Name',            required: true,  placeholder: 'Jane Smith' },
        { type: 'email',    label: 'Email Address',        required: true,  placeholder: 'jane@company.com' },
        { type: 'phone',    label: 'Phone Number',         required: false, placeholder: '+1 (555) 000-0000' },
        { type: 'text',     label: 'Company',              required: false, placeholder: 'Your company name' },
      ]},
      { name: 'Your Message', fields: [
        { type: 'select',   label: 'Reason for Contact',   required: true,  placeholder: 'Choose a topic…',
          options: ['General Inquiry', 'Sales', 'Support', 'Partnership', 'Other'] },
        { type: 'textarea', label: 'Message',              required: true,  placeholder: 'How can we help you?' },
        { type: 'radio',    label: 'Preferred Contact Method',
          options: ['Email', 'Phone', 'Either'] },
      ]},
    ],
  },
  {
    id: 'job-application', name: 'Job Application', icon: '◈', color: '#a78bfa',
    desc: 'Collect structured applications for open positions',
    steps: [
      { name: 'Personal Info', fields: [
        { type: 'text',     label: 'Full Name',              required: true,  placeholder: 'Jane Smith' },
        { type: 'email',    label: 'Email Address',          required: true,  placeholder: 'jane@example.com' },
        { type: 'phone',    label: 'Phone Number',           required: true,  placeholder: '+1 (555) 000-0000' },
        { type: 'url',      label: 'LinkedIn Profile',       placeholder: 'linkedin.com/in/…' },
      ]},
      { name: 'Experience', fields: [
        { type: 'text',     label: 'Position Applying For',  required: true },
        { type: 'select',   label: 'Years of Experience',    required: true,
          options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'] },
        { type: 'text',     label: 'Current or Most Recent Employer', placeholder: 'Company name' },
        { type: 'textarea', label: 'Why do you want this role?', required: true, placeholder: 'Tell us what excites you about this opportunity…' },
      ]},
      { name: 'Documents', fields: [
        { type: 'file',     label: 'Upload Resume / CV',     required: true },
        { type: 'url',      label: 'Portfolio or Work Samples URL', placeholder: 'https://…' },
        { type: 'date',     label: 'Earliest Start Date',    required: true },
        { type: 'radio',    label: 'How did you hear about us?',
          options: ['LinkedIn', 'Job Board', 'Referral', 'Company Website', 'Other'] },
      ]},
    ],
  },
  {
    id: 'feedback', name: 'Customer Feedback', icon: '★', color: '#fbbf24',
    desc: 'Measure satisfaction and collect improvement insights',
    steps: [
      { name: 'Overall Experience', fields: [
        { type: 'statement', label: 'We\'d love to hear about your experience. This only takes 2 minutes.' },
        { type: 'rating',    label: 'Overall Satisfaction', required: true, options: ['5'] },
        { type: 'radio',     label: 'How easy was it to work with us?',
          options: ['Very easy', 'Easy', 'Neutral', 'Difficult', 'Very difficult'] },
      ]},
      { name: 'Your Thoughts', fields: [
        { type: 'textarea', label: 'What went well?',         placeholder: 'Tell us what you liked…' },
        { type: 'textarea', label: 'What could we improve?',  placeholder: 'Any suggestions are welcome…' },
        { type: 'scale',    label: 'How likely are you to recommend us?', options: ['0', '10', 'Not likely', 'Very likely'] },
      ]},
      { name: 'About You', fields: [
        { type: 'text',  label: 'Name (optional)',            placeholder: 'Jane Smith' },
        { type: 'email', label: 'Email (optional)',           placeholder: 'jane@example.com' },
        { type: 'radio', label: 'Customer type',
          options: ['New customer', 'Returning customer', 'Long-term client'] },
      ]},
    ],
  },
  {
    id: 'event-registration', name: 'Event Registration', icon: '▦', color: '#34d399',
    desc: 'Register attendees for events, webinars, and workshops',
    steps: [
      { name: 'Your Details', fields: [
        { type: 'text',  label: 'First Name',           required: true,  placeholder: 'Jane' },
        { type: 'text',  label: 'Last Name',            required: true,  placeholder: 'Smith' },
        { type: 'email', label: 'Email Address',        required: true,  placeholder: 'jane@example.com' },
        { type: 'phone', label: 'Phone Number',         placeholder: '+1 (555) 000-0000' },
        { type: 'text',  label: 'Company / Organisation', placeholder: 'Optional' },
      ]},
      { name: 'Attendance', fields: [
        { type: 'radio',    label: 'Ticket Type',       required: true,
          options: ['General Admission', 'VIP', 'Student / Non-profit'] },
        { type: 'number',   label: 'Number of Guests (including yourself)', placeholder: '1' },
        { type: 'checkbox', label: 'Dietary Requirements',
          options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'None'] },
        { type: 'textarea', label: 'Accessibility or Special Requirements', placeholder: 'Any specific needs we should know about?' },
      ]},
      { name: 'Confirm', fields: [
        { type: 'select',   label: 'How did you hear about this event?',
          options: ['Email Newsletter', 'Social Media', 'Friend / Colleague', 'Website', 'Other'] },
        { type: 'checkbox', label: 'Agreements', required: true,
          options: ['I agree to the terms and conditions', 'I consent to receive event communications'] },
      ]},
    ],
  },
  {
    id: 'quote-request', name: 'Service Quote Request', icon: '◎', color: '#f97316',
    desc: 'Let prospects describe their project and request a proposal',
    steps: [
      { name: 'Contact Info', fields: [
        { type: 'text',    label: 'Full Name',     required: true,  placeholder: 'Jane Smith' },
        { type: 'email',   label: 'Email Address', required: true,  placeholder: 'jane@company.com' },
        { type: 'phone',   label: 'Phone Number',  required: true,  placeholder: '+1 (555) 000-0000' },
        { type: 'text',    label: 'Company Name',  required: true,  placeholder: 'Your business name' },
        { type: 'country', label: 'Country',       required: true },
      ]},
      { name: 'Project Details', fields: [
        { type: 'select',   label: 'Service Needed', required: true, placeholder: 'Select a service…',
          options: ['Consulting', 'Design', 'Development', 'Marketing', 'Training', 'Other'] },
        { type: 'textarea', label: 'Project Description', required: true, placeholder: 'Describe your project and goals…' },
        { type: 'radio',    label: 'Estimated Budget', required: true,
          options: ['Under $1,000', '$1,000 – $5,000', '$5,000 – $20,000', '$20,000+', 'To be discussed'] },
        { type: 'radio',    label: 'Timeline', required: true,
          options: ['ASAP', 'Within 1 month', '1–3 months', 'Flexible'] },
      ]},
      { name: 'Final Details', fields: [
        { type: 'radio',    label: 'Preferred Contact Method', options: ['Email', 'Phone', 'Video Call'] },
        { type: 'textarea', label: 'Anything else we should know?', placeholder: 'Additional context, constraints, or questions…' },
      ]},
    ],
  },
  {
    id: 'onboarding', name: 'Client Onboarding', icon: '⊕', color: '#e879f9',
    desc: 'Gather essential information from new clients at the start of an engagement',
    steps: [
      { name: 'Business Info', fields: [
        { type: 'text',    label: 'Business Name',  required: true },
        { type: 'url',     label: 'Website',        placeholder: 'https://yoursite.com' },
        { type: 'select',  label: 'Industry',       required: true, placeholder: 'Select your industry…',
          options: ['Retail / E-commerce', 'Professional Services', 'Healthcare', 'Technology', 'Hospitality', 'Construction', 'Education', 'Non-profit', 'Other'] },
        { type: 'radio',   label: 'Company Size',
          options: ['Just me', '2–10 employees', '11–50 employees', '51–200 employees', '200+ employees'] },
      ]},
      { name: 'Primary Contact', fields: [
        { type: 'text',  label: 'Contact Name',  required: true },
        { type: 'text',  label: 'Job Title',     required: true },
        { type: 'email', label: 'Email Address', required: true },
        { type: 'phone', label: 'Phone Number',  required: true },
      ]},
      { name: 'Goals & Challenges', fields: [
        { type: 'textarea', label: 'What are your main goals for working together?', required: true, placeholder: 'e.g. increase revenue, launch a new product…' },
        { type: 'textarea', label: 'What challenges are you currently facing?',     placeholder: 'e.g. limited time, lack of expertise…' },
        { type: 'radio',    label: 'How would you rate your current solution?',
          options: ['No current solution', 'Poor', 'Fair', 'Good'] },
      ]},
      { name: 'Preferences', fields: [
        { type: 'checkbox', label: 'Preferred Communication Channels',
          options: ['Email', 'Phone', 'Video Call', 'Chat / Messaging'] },
        { type: 'select',   label: 'Preferred Meeting Frequency',
          options: ['Weekly', 'Bi-weekly', 'Monthly', 'As needed'] },
        { type: 'textarea', label: 'Any other preferences or notes?', placeholder: 'Time zones, availability, specific requests…' },
      ]},
    ],
  },
  {
    id: 'support', name: 'Support Ticket', icon: '◬', color: '#94a3b8',
    desc: 'Let customers report issues and track support requests',
    steps: [
      { name: 'Your Info', fields: [
        { type: 'text',  label: 'Full Name',              required: true },
        { type: 'email', label: 'Email Address',          required: true },
        { type: 'text',  label: 'Account or Order Number', placeholder: 'e.g. ORD-12345' },
      ]},
      { name: 'Issue Details', fields: [
        { type: 'select',   label: 'Issue Category', required: true, placeholder: 'Select a category…',
          options: ['Billing', 'Technical Issue', 'Account Access', 'Product Question', 'Refund / Return', 'Complaint', 'Other'] },
        { type: 'radio',    label: 'Priority', required: true,
          options: ['Low — minor inconvenience', 'Medium — affecting my work', 'High — urgent, blocking me'] },
        { type: 'textarea', label: 'Describe the Issue', required: true, placeholder: 'What happened and what did you expect instead?' },
        { type: 'file',     label: 'Attach a Screenshot (optional)' },
      ]},
    ],
  },
  {
    id: 'newsletter', name: 'Newsletter Sign-up', icon: '◉', color: '#38bdf8',
    desc: 'Build your mailing list with qualified, consenting subscribers',
    steps: [
      { name: 'About You', fields: [
        { type: 'text',   label: 'First Name',    required: true,  placeholder: 'Jane' },
        { type: 'email',  label: 'Email Address', required: true,  placeholder: 'jane@example.com' },
        { type: 'text',   label: 'Company',       placeholder: 'Optional' },
        { type: 'select', label: 'Industry',      placeholder: 'Select your industry…',
          options: ['Retail', 'Technology', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Other'] },
      ]},
      { name: 'Your Interests', fields: [
        { type: 'checkbox', label: 'Topics You Care About', required: true,
          options: ['Industry News', 'Tips & How-tos', 'Product Updates', 'Case Studies', 'Events & Webinars', 'Special Offers'] },
        { type: 'radio',    label: 'How often do you want to hear from us?',
          options: ['Weekly', 'Bi-weekly', 'Monthly'] },
        { type: 'checkbox', label: 'Consent', required: true,
          options: ['I agree to receive marketing emails and can unsubscribe at any time'] },
      ]},
    ],
  },
];

/* ── State ── */
const state = {
  steps: [],
  nextStepId: 1,
  nextFieldId: 1,
  previewStep: 0,
  mobileBuilderStep: 0,
  settings: {
    progressStyle: 'dots',
    formAction: '',
    formMethod: 'POST',
    successMessage: 'Thank you!',
  },
};

/* ── DOM refs ── */
const stepsList           = document.getElementById('stepsList');
const stepTabsBar         = document.getElementById('stepTabsBar');
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
const progressStyleGrid   = document.getElementById('progressStyleGrid');
const formActionInput     = document.getElementById('formAction');
const successMessageInput = document.getElementById('successMessage');
const methodToggle        = document.getElementById('methodToggle');
const templatesBtn        = document.getElementById('templatesBtn');
const templatesModal      = document.getElementById('templatesModal');
const templatesBackdrop   = document.getElementById('templatesBackdrop');
const templatesClose      = document.getElementById('templatesClose');
const templatesGrid       = document.getElementById('templatesGrid');

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
  return FIELD_TYPES[type] || { label: type, icon: '?', color: '#888', hasPlaceholder: true };
}

function findFieldById(fieldId) {
  for (const step of state.steps) {
    const f = step.fields.find(f => f.id === fieldId);
    if (f) return f;
  }
  return null;
}

function getFieldsBefore(targetFieldId) {
  const result = [];
  for (const step of state.steps) {
    for (const field of step.fields) {
      if (field.id === targetFieldId) return result;
      result.push(field);
    }
  }
  return result;
}

/* ── Templates ── */
function buildTemplatesModal() {
  templatesGrid.innerHTML = '';
  TEMPLATES.forEach(tpl => {
    const card = document.createElement('button');
    card.className = 'template-card';
    card.innerHTML = `
      <span class="template-icon" style="color:${tpl.color}">${tpl.icon}</span>
      <span class="template-name">${escHtml(tpl.name)}</span>
      <span class="template-desc">${escHtml(tpl.desc)}</span>`;
    card.addEventListener('click', () => loadTemplate(tpl));
    templatesGrid.appendChild(card);
  });
}

function openTemplatesModal() {
  templatesModal.classList.remove('hidden');
}

function closeTemplatesModal() {
  templatesModal.classList.add('hidden');
}

function loadTemplate(tpl) {
  const hasContent = state.steps.some(s => s.fields.length > 0) || state.steps.length > 1;
  if (hasContent && !confirm(`Load "${tpl.name}"? This will replace your current form.`)) return;

  state.steps = [];
  state.previewStep = 0;
  state.mobileBuilderStep = 0;
  state.nextStepId = 1;
  state.nextFieldId = 1;

  tpl.steps.forEach(stepDef => {
    const stepId = state.nextStepId++;
    const fields = (stepDef.fields || []).map(fDef => {
      const defaults = FIELD_DEFAULTS[fDef.type] || {};
      return {
        id: state.nextFieldId++,
        type: fDef.type,
        label: fDef.label || '',
        placeholder: fDef.placeholder || '',
        required: fDef.required || false,
        options: fDef.options ? [...fDef.options] : (defaults.options ? [...defaults.options] : []),
        condition: null,
      };
    });
    state.steps.push({ id: stepId, name: stepDef.name, collapsed: false, fields });
  });

  closeTemplatesModal();
  renderBuilder();
  renderPreview();
  showStatus(`"${tpl.name}" loaded`);
}

templatesBtn.addEventListener('click', openTemplatesModal);
templatesBackdrop.addEventListener('click', closeTemplatesModal);
templatesClose.addEventListener('click', closeTemplatesModal);

/* ── Field type picker modal (dynamically built from FIELD_TYPES) ── */
function buildFieldTypeModal() {
  const container = document.getElementById('fieldTypeCategories');
  container.innerHTML = '';

  FIELD_CATEGORIES.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'field-type-category';

    const lbl = document.createElement('div');
    lbl.className = 'ftc-label';
    lbl.textContent = cat.label;
    catDiv.appendChild(lbl);

    const grid = document.createElement('div');
    grid.className = 'field-type-grid';

    cat.types.forEach(type => {
      const def = typeDef(type);
      const btn = document.createElement('button');
      btn.className = 'field-type-btn';
      btn.dataset.type = type;

      const icon = document.createElement('span');
      icon.className = 'field-type-icon';
      icon.textContent = def.icon;
      icon.style.color = def.color;

      const name = document.createElement('span');
      name.textContent = def.label;

      btn.appendChild(icon);
      btn.appendChild(name);
      btn.addEventListener('click', () => {
        if (pendingAddFieldStepId !== null) addField(pendingAddFieldStepId, type);
        closeModal();
      });

      grid.appendChild(btn);
    });

    catDiv.appendChild(grid);
    container.appendChild(catDiv);
  });
}

function openModal(stepId) {
  pendingAddFieldStepId = stepId;
  fieldTypeModal.classList.remove('hidden');
  const firstBtn = fieldTypeModal.querySelector('.field-type-btn');
  if (firstBtn) firstBtn.focus();
}

function closeModal() {
  fieldTypeModal.classList.add('hidden');
  pendingAddFieldStepId = null;
}

modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeFieldEditor(); closeTemplatesModal(); }
});

/* ── Step operations ── */
function addStep() {
  const id = stepUid();
  state.steps.push({ id, name: `Step ${state.steps.length + 1}`, collapsed: false, fields: [] });
  state.mobileBuilderStep = state.steps.length - 1;
  renderBuilder();
  renderPreview();
}

function deleteStep(stepId) {
  state.steps = state.steps.filter(s => s.id !== stepId);
  if (state.previewStep >= state.steps.length) {
    state.previewStep = Math.max(0, state.steps.length - 1);
  }
  if (state.mobileBuilderStep >= state.steps.length) {
    state.mobileBuilderStep = Math.max(0, state.steps.length - 1);
  }
  renderBuilder();
  renderPreview();
}

function renameStep(stepId, name) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.name = name;
  renderPreview();
  const idx = state.steps.findIndex(s => s.id === stepId);
  const tabs = stepTabsBar.querySelectorAll('.step-tab:not(.step-tab-add)');
  if (tabs[idx]) tabs[idx].textContent = name || `Step ${idx + 1}`;
}

function toggleCollapse(stepId) {
  const step = state.steps.find(s => s.id === stepId);
  if (step) step.collapsed = !step.collapsed;
  renderBuilder();
}

/* ── Mobile builder step tabs ── */
function setMobileBuilderStep(idx) {
  if (idx < 0 || idx >= state.steps.length) return;
  state.mobileBuilderStep = idx;
  stepTabsBar.querySelectorAll('.step-tab:not(.step-tab-add)').forEach((tab, i) => {
    tab.classList.toggle('active', i === idx);
  });
  stepsList.querySelectorAll('.step-card').forEach((card, i) => {
    card.classList.toggle('mobile-step-active', i === idx);
  });
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
    condition: null,
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

/* ── Field editor sheet ── */
function openFieldEditor(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  if (!field) return;
  editingStepId = stepId;
  editingFieldId = fieldId;
  const def = typeDef(field.type);
  editorTypeIcon.textContent = def.icon;
  editorTypeIcon.style.color = def.color || '';
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

  fieldEditorBody.appendChild(makeEditorText(
    def.isContent ? 'Content' : 'Label',
    field.label,
    def.isContent ? 'Write your statement text…' : 'Enter a label',
    val => { field.label = val; renderPreview(); renderBuilder(); }
  ));

  if (def.hasPlaceholder) {
    fieldEditorBody.appendChild(makeEditorText(
      'Placeholder',
      field.placeholder,
      'Hint text shown inside the field',
      val => { field.placeholder = val; renderPreview(); }
    ));
  }

  if (!def.isContent) {
    fieldEditorBody.appendChild(makeEditorToggle(
      'Required',
      field.required,
      val => { field.required = val; renderPreview(); renderBuilder(); }
    ));
  }

  if (def.hasOptions) {
    const sec = document.createElement('div');
    sec.id = 'editorOptionsSection';
    fieldEditorBody.appendChild(sec);
    renderEditorOptions(stepId, fieldId);
  }

  if (field.type === 'rating') {
    fieldEditorBody.appendChild(makeEditorSelect(
      'Stars',
      ['3', '4', '5', '7', '10'],
      opt => `${opt} stars`,
      field.options[0] || '5',
      val => { field.options[0] = val; renderPreview(); }
    ));
  }

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

  if (!def.isContent) {
    fieldEditorBody.appendChild(makeConditionSection(stepId, fieldId));
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

function makeConditionSection(stepId, fieldId) {
  const field = getField(stepId, fieldId);
  if (!field) return document.createElement('div');

  const beforeFields = getFieldsBefore(fieldId).filter(f => !typeDef(f.type).isContent);

  const section = document.createElement('div');
  section.className = 'condition-section';

  const title = document.createElement('div');
  title.className = 'editor-group-label';
  title.textContent = 'Conditional Logic';
  section.appendChild(title);

  if (beforeFields.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'condition-empty-msg';
    msg.textContent = 'Add fields before this one to show it conditionally.';
    section.appendChild(msg);
    return section;
  }

  const enableRow = document.createElement('div');
  enableRow.className = 'editor-group editor-toggle-row';

  const enableId = `cond-enable-${fieldId}`;
  const enableLabel = document.createElement('label');
  enableLabel.htmlFor = enableId;
  enableLabel.textContent = 'Only show when…';
  enableLabel.style.cssText = 'font-size:13px;font-weight:500;text-transform:none;letter-spacing:0;color:var(--text-primary)';

  const enableToggle = document.createElement('input');
  enableToggle.type = 'checkbox';
  enableToggle.className = 'toggle-checkbox';
  enableToggle.id = enableId;
  enableToggle.checked = !!field.condition;

  enableRow.appendChild(enableLabel);
  enableRow.appendChild(enableToggle);
  section.appendChild(enableRow);

  const rule = document.createElement('div');
  rule.className = 'condition-rule';
  if (!field.condition) rule.style.display = 'none';

  const srcSel = document.createElement('select');
  srcSel.className = 'input';
  beforeFields.forEach(f => {
    const o = document.createElement('option');
    o.value = f.id;
    o.textContent = f.label || `Untitled ${typeDef(f.type).label}`;
    if (field.condition && field.condition.fieldId === f.id) o.selected = true;
    srcSel.appendChild(o);
  });

  const opSel = document.createElement('select');
  opSel.className = 'input';
  [['eq', 'equals'], ['neq', 'not equals'], ['contains', 'contains']].forEach(([val, lbl]) => {
    const o = document.createElement('option');
    o.value = val; o.textContent = lbl;
    if (field.condition && field.condition.operator === val) o.selected = true;
    opSel.appendChild(o);
  });

  const valInp = document.createElement('input');
  valInp.type = 'text';
  valInp.className = 'input';
  valInp.placeholder = 'value…';
  valInp.value = field.condition ? field.condition.value || '' : '';

  rule.appendChild(srcSel);
  rule.appendChild(opSel);
  rule.appendChild(valInp);
  section.appendChild(rule);

  function syncCondition() {
    if (!field.condition) return;
    field.condition.fieldId = parseInt(srcSel.value, 10);
    field.condition.operator = opSel.value;
    field.condition.value = valInp.value;
  }

  enableToggle.addEventListener('change', () => {
    if (enableToggle.checked) {
      const firstId = beforeFields[0] ? beforeFields[0].id : null;
      field.condition = {
        fieldId: parseInt(srcSel.value, 10) || firstId,
        operator: opSel.value,
        value: valInp.value,
      };
      rule.style.display = 'flex';
    } else {
      field.condition = null;
      rule.style.display = 'none';
    }
    renderPreview();
    renderBuilder();
  });

  srcSel.addEventListener('change', () => { syncCondition(); renderPreview(); });
  opSel.addEventListener('change', () => { syncCondition(); renderPreview(); });
  valInp.addEventListener('input', () => { syncCondition(); renderPreview(); });

  return section;
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
  /* Step tabs bar */
  stepTabsBar.innerHTML = '';
  state.steps.forEach((step, idx) => {
    const tab = document.createElement('button');
    tab.className = 'step-tab' + (idx === state.mobileBuilderStep ? ' active' : '');
    tab.textContent = step.name || `Step ${idx + 1}`;
    tab.addEventListener('click', () => setMobileBuilderStep(idx));
    stepTabsBar.appendChild(tab);
  });
  const addTab = document.createElement('button');
  addTab.className = 'step-tab step-tab-add';
  addTab.textContent = '+ Step';
  addTab.addEventListener('click', addStep);
  stepTabsBar.appendChild(addTab);

  /* Step cards */
  stepsList.innerHTML = '';

  if (state.steps.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'text-align:center;color:#666;padding:40px 20px;font-size:13px;';
    empty.textContent = 'No steps yet — click "Add Step" to get started.';
    stepsList.appendChild(empty);
    return;
  }

  state.steps.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = [
      'step-card',
      step.collapsed ? 'collapsed' : '',
      idx === state.mobileBuilderStep ? 'mobile-step-active' : '',
    ].filter(Boolean).join(' ');
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
  pill.style.color = def.color;

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
  if (field.condition) {
    const badge = document.createElement('span');
    badge.className = 'field-condition-badge';
    badge.title = 'Has conditional logic';
    badge.textContent = '⚡';
    card.appendChild(badge);
  }
  card.appendChild(editBtn);
  card.appendChild(deleteBtn);

  card.addEventListener('click', e => {
    if (e.target === deleteBtn || e.target === dragHandle) return;
    openFieldEditor(stepId, field.id);
  });

  return card;
}

/* ── Preview progress ── */
function buildPreviewProgress(currentIdx, total) {
  const style = state.settings.progressStyle;
  if (style === 'none') return null;

  const el = document.createElement('div');
  el.id = 'previewIndicator';

  if (style === 'numbers') {
    el.className = 'preview-progress-numbers';
    el.textContent = `Step ${currentIdx + 1} of ${total}`;
  } else if (style === 'dots') {
    el.className = 'preview-progress-dots';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'preview-dot' + (i === currentIdx ? ' active' : '');
      el.appendChild(dot);
    }
  } else if (style === 'bar') {
    el.className = 'preview-progress-bar-wrap';
    const fill = document.createElement('div');
    fill.className = 'preview-progress-bar-fill';
    fill.style.width = `${((currentIdx + 1) / total) * 100}%`;
    el.appendChild(fill);
  }

  return el;
}

function updatePreviewProgress(idx) {
  const ind = previewContainer.querySelector('#previewIndicator');
  if (!ind) return;
  const total = state.steps.length;
  const style = state.settings.progressStyle;

  if (style === 'numbers') {
    ind.textContent = `Step ${idx + 1} of ${total}`;
  } else if (style === 'dots') {
    ind.querySelectorAll('.preview-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  } else if (style === 'bar') {
    const fill = ind.querySelector('.preview-progress-bar-fill');
    if (fill) fill.style.width = `${((idx + 1) / total) * 100}%`;
  }
}

/* ── Preview render ── */
function renderPreview() {
  previewContainer.innerHTML = '';

  const totalFields = state.steps.reduce((n, s) => n + s.fields.length, 0);

  if (state.steps.length === 0 || totalFields === 0) {
    const empty = document.createElement('div');
    empty.className = 'preview-empty-state';
    empty.innerHTML = '<p>Add fields in the builder to see your form here.</p>';
    const tplHint = document.createElement('div');
    tplHint.className = 'preview-template-hint';
    const hintLabel = document.createElement('p');
    hintLabel.textContent = 'Or jump-start with a template:';
    tplHint.appendChild(hintLabel);
    const grid = document.createElement('div');
    grid.className = 'preview-template-chips';
    TEMPLATES.forEach(tpl => {
      const chip = document.createElement('button');
      chip.className = 'preview-template-chip';
      chip.innerHTML = `<span style="color:${tpl.color}">${tpl.icon}</span> ${escHtml(tpl.name)}`;
      chip.addEventListener('click', () => loadTemplate(tpl));
      grid.appendChild(chip);
    });
    tplHint.appendChild(grid);
    empty.appendChild(tplHint);
    previewContainer.appendChild(empty);
    return;
  }

  const nextLabel   = nextLabelInput.value || 'Next';
  const backLabel   = backLabelInput.value || 'Back';
  const submitLabel = submitLabelInput.value || 'Submit';

  const wrap = document.createElement('div');
  wrap.className = 'preview-form-wrap';

  const progress = buildPreviewProgress(state.previewStep, state.steps.length);
  if (progress) wrap.appendChild(progress);

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
      group.dataset.previewFieldGroup = field.id;

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
      const fieldEl = buildPreviewField(field);
      fieldEl.dataset.previewInput = field.id;
      group.appendChild(fieldEl);
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
  evaluatePreviewConditions();
}

function getPreviewFieldValue(fieldId) {
  const el = previewContainer.querySelector(`[data-preview-input="${fieldId}"]`);
  if (!el) return '';
  if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return el.value || '';
  if (el.tagName === 'INPUT') return el.value || '';
  const yesnoBtn = el.querySelector('.preview-yesno-btn.selected');
  if (yesnoBtn) return yesnoBtn.textContent;
  const checkedRadio = el.querySelector('input[type="radio"]:checked');
  if (checkedRadio) return checkedRadio.value;
  const checked = [...el.querySelectorAll('input[type="checkbox"]:checked')].map(e => e.value);
  return checked.join(',');
}

function evaluatePreviewConditions() {
  state.steps.forEach(step => {
    step.fields.forEach(field => {
      if (!field.condition) return;
      const group = previewContainer.querySelector(`[data-preview-field-group="${field.id}"]`);
      if (!group) return;
      const { fieldId, operator, value } = field.condition;
      const sv = getPreviewFieldValue(fieldId).toLowerCase();
      const cv = (value || '').toLowerCase();
      let show = false;
      if (operator === 'eq')            show = sv === cv;
      else if (operator === 'neq')      show = sv !== cv;
      else if (operator === 'contains') show = sv.includes(cv);
      group.style.display = show ? '' : 'none';
    });
  });
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
        evaluatePreviewConditions();
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

  if (field.type === 'country') {
    const el = document.createElement('select');
    el.className = 'preview-input';
    const ph = document.createElement('option');
    ph.value = ''; ph.disabled = true; ph.selected = true;
    ph.textContent = field.placeholder || 'Select a country';
    el.appendChild(ph);
    COUNTRY_LIST.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = c;
      el.appendChild(o);
    });
    return el;
  }

  if (field.type === 'statement') {
    const el = document.createElement('div');
    el.className = 'preview-statement';
    el.textContent = field.label || 'Add your statement text in the field editor.';
    return el;
  }

  /* text, email, phone, url, number, date, time, file, password */
  const el = document.createElement('input');
  if (field.type === 'phone') {
    el.type = 'tel';
  } else if (field.type === 'time') {
    el.type = 'time';
  } else {
    el.type = field.type;
  }
  el.className = 'preview-input';
  if (field.placeholder) el.placeholder = field.placeholder;
  return el;
}

function goPreviewStep(idx) {
  state.previewStep = idx;
  previewContainer.querySelectorAll('.preview-step').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  updatePreviewProgress(idx);
  evaluatePreviewConditions();
}

function showPreviewSuccess(wrap) {
  wrap.innerHTML = `
    <div class="preview-success">
      <div class="preview-success-icon">✓</div>
      <h2>${escHtml(state.settings.successMessage || 'Thank you!')}</h2>
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
  const successMsg  = escHtml(state.settings.successMessage || 'Thank you!');
  const formAction  = state.settings.formAction ? ` action="${escHtml(state.settings.formAction)}"` : '';
  const formMethod  = ` method="${state.settings.formMethod}"`;
  const total       = state.steps.length;

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

  const progressHtml = buildExportProgress(total);
  const progressCss  = buildExportProgressCss();

  return `<style>
  .mfg-wrap{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15px;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px 0}
  ${progressCss}
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
${progressHtml}
  <form id="mfgForm"${formAction}${formMethod} onsubmit="mfgSubmit(event)" novalidate>
${stepsHtml}
  </form>
</div>

<script>
(function(){
  var cur=0,total=${total};
  function mfgGetFieldVal(fid){
    var el=document.getElementById('f'+fid);
    if(el)return el.value||'';
    var r=document.querySelector('input[name="r'+fid+'"]:checked');
    if(r)return r.value;
    var h=document.getElementById('f'+fid+'-val');
    if(h)return h.value||'';
    return '';
  }
  function mfgEvalCond(){
    document.querySelectorAll('[data-cond-fid]').forEach(function(el){
      var fid=el.getAttribute('data-cond-fid');
      var op=el.getAttribute('data-cond-op');
      var val=(el.getAttribute('data-cond-val')||'').toLowerCase();
      var sv=mfgGetFieldVal(fid).toLowerCase();
      var show=op==='eq'?sv===val:op==='neq'?sv!==val:sv.indexOf(val)>=0;
      el.style.display=show?'':'none';
    });
  }
  function show(n){
    document.querySelectorAll('.mfg-step').forEach(function(s,i){s.classList.toggle('active',i===n);});
    document.querySelectorAll('.mfg-dot').forEach(function(d,i){d.classList.toggle('active',i===n);});
    var bf=document.querySelector('.mfg-bar-fill');if(bf)bf.style.width=(((n+1)/total)*100)+'%';
    var cn=document.getElementById('mfgCur');if(cn)cn.textContent=n+1;
    cur=n;window.scrollTo(0,0);
    mfgEvalCond();
  }
  function validate(n){
    var step=document.querySelectorAll('.mfg-step')[n];
    if(!step)return true;
    var ok=true;
    step.querySelectorAll('.mfg-err-msg').forEach(function(el){el.remove();});
    step.querySelectorAll('.mfg-input').forEach(function(el){el.classList.remove('mfg-err');});
    step.querySelectorAll('[data-req]').forEach(function(el){
      if(el.type==='radio'||el.type==='checkbox')return;
      if(el.closest('[data-cond-fid]')&&el.closest('[data-cond-fid]').style.display==='none')return;
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
    mfgEvalCond();
  };
  window.mfgRate=function(star,val,gid){
    document.querySelectorAll('#'+gid+' .mfg-star').forEach(function(s,i){s.classList.toggle('on',i<val);});
    var h=document.querySelector('#'+gid+'-val');if(h)h.value=val;
    mfgEvalCond();
  };
  window.mfgSubmit=function(e){
    if(!validate(cur)){e.preventDefault();return;}
    var hasAction=document.getElementById('mfgForm').getAttribute('action');
    if(!hasAction){
      e.preventDefault();
      document.getElementById('mfgForm').parentNode.innerHTML='<div class="mfg-success"><h2>${successMsg}</h2><p>Your response has been received.</p></div>';
    }
  };
  document.addEventListener('change',mfgEvalCond);
  document.addEventListener('input',mfgEvalCond);
  show(0);
})();
<\/script>`;
}

function buildExportProgress(total) {
  const style = state.settings.progressStyle;
  if (style === 'none') return '';
  if (style === 'dots') {
    const dots = Array.from({ length: total }, (_, i) =>
      `    <span class="mfg-dot${i === 0 ? ' active' : ''}"></span>`).join('\n');
    return `  <div class="mfg-progress">\n${dots}\n  </div>\n`;
  }
  if (style === 'bar') {
    return `  <div class="mfg-progress-bar"><div class="mfg-bar-fill" style="width:${Math.round(100/total)}%"></div></div>\n`;
  }
  if (style === 'numbers') {
    return `  <div class="mfg-progress-num">Step <span id="mfgCur">1</span> of ${total}</div>\n`;
  }
  return '';
}

function buildExportProgressCss() {
  const style = state.settings.progressStyle;
  if (style === 'dots')    return '.mfg-progress{display:flex;gap:6px;margin-bottom:28px}.mfg-dot{width:8px;height:8px;border-radius:50%;background:#d0d0d0;transition:background .2s}.mfg-dot.active{background:#333}';
  if (style === 'bar')     return '.mfg-progress-bar{height:4px;background:#eee;border-radius:2px;margin-bottom:28px;overflow:hidden}.mfg-bar-fill{height:100%;background:#333;border-radius:2px;transition:width .3s}';
  if (style === 'numbers') return '.mfg-progress-num{font-size:13px;color:#999;margin-bottom:20px;font-weight:500}';
  return '';
}

function buildFieldHtml(field) {
  const def = typeDef(field.type);
  const label = escHtml(field.label || `Unlabeled ${def.label}`);
  const ph    = escHtml(field.placeholder || '');
  const req   = field.required ? ' data-req required' : '';
  const star  = field.required ? '<span class="mfg-req">*</span>' : '';
  const fid   = `f${field.id}`;
  const condAttr  = field.condition
    ? ` data-cond-fid="${field.condition.fieldId}" data-cond-op="${escHtml(field.condition.operator)}" data-cond-val="${escHtml(field.condition.value || '')}"`
    : '';
  const condStyle = field.condition ? ' style="display:none"' : '';

  if (field.type === 'statement') {
    return `      <div class="mfg-statement"><p>${label}</p></div>`;
  }

  if (field.type === 'textarea') {
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <textarea id="${fid}" class="mfg-input" placeholder="${ph}"${req}></textarea>
      </div>`;
  }

  if (field.type === 'select') {
    const opts = (field.options || []).map(o =>
      `          <option value="${escHtml(o)}">${escHtml(o)}</option>`).join('\n');
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <select id="${fid}" class="mfg-input"${req}>
          <option value="" disabled selected>${ph || 'Select an option'}</option>
${opts}
        </select>
      </div>`;
  }

  if (field.type === 'radio') {
    const name = `r${field.id}`;
    const items = (field.options || []).map(o =>
      `          <label class="mfg-choice-item"><input type="radio" name="${name}" value="${escHtml(o)}"${field.required ? ' required' : ''}> ${escHtml(o)}</label>`
    ).join('\n');
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
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
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <div class="mfg-label">${label}${star}</div>
        <div class="mfg-choice-group">
${items}
        </div>
      </div>`;
  }

  if (field.type === 'yesno') {
    const yes = escHtml(field.options[0] || 'Yes');
    const no  = escHtml(field.options[1] || 'No');
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
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
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
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
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <div class="mfg-label">${label}${star}</div>
        <div>
          <input type="range" id="${fid}" class="mfg-scale-slider" min="${min}" max="${max}" value="${mid}" name="${fid}"${req}>
          <div class="mfg-scale-nums">${nums.join('')}</div>
          ${lblsHtml}
        </div>
      </div>`;
  }

  if (field.type === 'country') {
    const opts = COUNTRY_LIST.map(c =>
      `          <option value="${escHtml(c)}">${escHtml(c)}</option>`).join('\n');
    return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <select id="${fid}" class="mfg-input"${req}>
          <option value="" disabled selected>${ph || 'Select a country'}</option>
${opts}
        </select>
      </div>`;
  }

  /* text, email, phone, url, number, date, time, file, password */
  const inputType = field.type === 'phone' ? 'tel'
    : field.type === 'time' ? 'time'
    : field.type;
  return `      <div class="mfg-field-group"${condAttr}${condStyle}>
        <label class="mfg-label" for="${fid}">${label}${star}</label>
        <input type="${inputType}" id="${fid}" class="mfg-input" placeholder="${ph}" name="${fid}"${req}>
      </div>`;
}

function showStatus(msg) {
  statusLabel.textContent = msg;
  statusLabel.classList.add('visible');
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => statusLabel.classList.remove('visible'), 2000);
}

/* ── Settings event listeners ── */
progressStyleGrid.querySelectorAll('.progress-style-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.settings.progressStyle = btn.dataset.style;
    progressStyleGrid.querySelectorAll('.progress-style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPreview();
  });
});

methodToggle.querySelectorAll('.method-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.settings.formMethod = btn.dataset.method;
    methodToggle.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

formActionInput.addEventListener('input', e => { state.settings.formAction = e.target.value; });
successMessageInput.addEventListener('input', e => { state.settings.successMessage = e.target.value; });

/* ── Core event listeners ── */
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
    state.mobileBuilderStep = 0;
    state.nextStepId = 1;
    state.nextFieldId = 1;
    state.settings = { progressStyle: 'dots', formAction: '', formMethod: 'POST', successMessage: 'Thank you!' };
    nextLabelInput.value = 'Next';
    backLabelInput.value = 'Back';
    submitLabelInput.value = 'Submit';
    formActionInput.value = '';
    successMessageInput.value = 'Thank you!';
    progressStyleGrid.querySelectorAll('.progress-style-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.style === 'dots'));
    methodToggle.querySelectorAll('.method-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.method === 'POST'));
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
previewContainer.addEventListener('change', evaluatePreviewConditions);
previewContainer.addEventListener('input', evaluatePreviewConditions);
buildTemplatesModal();
buildFieldTypeModal();
setMobileTab('builder');
addStep();
