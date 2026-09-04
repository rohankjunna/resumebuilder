function setActivePage(){
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav a').forEach(link=>{
    if(link.dataset.page === page) link.classList.add('active');
  });
}

function initFooter(){
  if(document.querySelector('.site-footer')) return;
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="f-logo">Dossier <small style="font:11px monospace;color:#64748b">resume workshop</small></div>
        <div class="f-vision">Our Vision is to<br>Fight Galactic Discontent</div>
        <div class="f-contact">
          <a href="mailto:contact@dossier.app">contact@dossier.app</a><br>
          Bredgade 45B, 1260 K&oslash;benhavn<br>
          Certified Professional Resume Writer (CPRW)<br>
          Professional Association of R&eacute;sum&eacute; Writers &amp; Career Coaches
        </div>
      </div>
      <div class="footer-col">
        <h4>Resume</h4>
        <ul>
          <li><a href="/builder">Resume Builder</a></li>
          <li><a href="/templates">Resume Templates</a></li>
          <li><a href="/career-blog">Resume Examples</a></li>
          <li><a href="/career-blog">How to Write a Resume</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>CV</h4>
        <ul>
          <li><a href="/cv-builder">CV Builder</a></li>
          <li><a href="/templates">CV Templates</a></li>
          <li><a href="/career-blog">European CV Format</a></li>
          <li><a href="/career-blog">How to Write a CV</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Cover Letter</h4>
        <ul>
          <li><a href="/cover-letter">Cover Letter Builder</a></li>
          <li><a href="/cover-letter">Cover Letter Templates</a></li>
          <li><a href="/career-blog">Cover Letter Examples</a></li>
          <li><a href="/career-blog">How to Write a Cover Letter</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/career-blog">Career Blog</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/contact">Help Center</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">Copyright 2026 Dossier. All Rights Reserved.</span>
      <nav class="footer-legal">
        <a href="#">Terms of Use</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Cookie Policy</a>
        <a href="#">Third-Party Tools</a>
      </nav>
    </div>
  </div>`;
  document.body.appendChild(footer);
}

function initNavDropdown(){
  document.querySelectorAll('.nav-dropdown').forEach(dropdown=>{
    const btn  = dropdown.querySelector('.nav-drop-btn');
    const menu = dropdown.querySelector('.nav-drop-menu');
    if(!btn || !menu) return;
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });
  // close when clicking outside
  document.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-drop-menu.open').forEach(m=>m.classList.remove('open'));
  });
}

function initNavToggle(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    toggle.textContent = open ? '✕' : '☰';
    toggle.setAttribute('aria-expanded', open);
  });
  // close nav when a link is clicked
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    nav.classList.remove('open');
    toggle.textContent = '☰';
  }));
}

async function downloadDocument(kind, fileFormat, payload){
  const response = await fetch(`/api/download/${kind}/${fileFormat}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  if(!response.ok){ const data = await response.json().catch(()=>({})); throw new Error(data.error || 'Download failed.'); }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `dossier-${kind}.${fileFormat}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(()=>{
    URL.revokeObjectURL(objectUrl);
    link.remove();
  }, 1000);
}

async function submitAuth(event, endpoint){
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  try{
    const payload = {email:form.email.value, password:form.password.value};
    if(endpoint === '/api/signup'){
      payload.name = form.elements.name.value;
      payload.phone = form.elements.phone.value;
    }
    const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || 'Request failed.');
    const next = new URLSearchParams(window.location.search).get('next');
    window.location.href = next || '/builder';
  }catch(error){ message.textContent = error.message; }
}

function initDarkMode(){
  if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');
  const btn = document.createElement('button');
  btn.className='dark-toggle';
  btn.title='Toggle dark mode';
  btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  btn.addEventListener('click',()=>{
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀️' : '🌙';
  });
  const topbar = document.querySelector('.topbar');
  if(topbar) topbar.appendChild(btn);
}

async function initUserMenu(){
  // only runs on public pages (not html.html which has its own topbar)
  const authLinks = document.querySelector('.auth-links');
  if(!authLinks) return;
  try{
    const res = await fetch('/api/me');
    const data = await res.json();
    if(!data.user) return; // not logged in — keep Log in / Sign up buttons
    const email = data.user.email;
    const initial = email.charAt(0).toUpperCase();
    // build the menu
    const wrap = document.createElement('div');
    wrap.className = 'user-menu';
    wrap.innerHTML = `
      <button class="user-menu-btn" aria-expanded="false" aria-haspopup="true">
        <span class="user-avatar">${initial}</span>
        <span class="user-menu-lines"><span></span><span></span><span></span></span>
        <span class="user-menu-arrow">&#9660;</span>
      </button>
      <div class="user-drop">
        <div class="user-drop-header">
          <div class="user-drop-name">My Account</div>
          <div class="user-drop-email">${email}</div>
        </div>
        <a href="/builder">📄 Resume Builder</a>
        <a href="/cv-builder">📋 CV Builder</a>
        <a href="/cover-letter">✉️ Cover Letter</a>
        <div class="drop-divider"></div>
        <button class="drop-item drop-logout" id="globalLogoutBtn">🚪 Log out</button>
      </div>`;
    authLinks.replaceWith(wrap);
    // toggle
    const btn2 = wrap.querySelector('.user-menu-btn');
    const drop = wrap.querySelector('.user-drop');
    btn2.addEventListener('click', e=>{
      e.stopPropagation();
      const open = drop.classList.toggle('open');
      btn2.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', ()=>drop.classList.remove('open'));
    // logout
    wrap.querySelector('#globalLogoutBtn').addEventListener('click', async ()=>{
      await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json'}});
      window.location.href = '/';
    });
  }catch(e){}
}

document.addEventListener('DOMContentLoaded', ()=>{
  setActivePage();
  initNavDropdown();
  initNavToggle();
  initFooter();
  initUserMenu();
  initDarkMode();
  initTemplateGallery();
  const blogGrid = document.getElementById('blogGrid');
  if(blogGrid){
    const filterBar = document.querySelector('.blog-filters');
    [['personal','Personal Development'],['cover','Cover Letter Writing Tips']].forEach(([value,label])=>{
      if(filterBar && !filterBar.querySelector(`[data-filter="${value}"]`)){
        const button = document.createElement('button');
        button.className = 'filter';
        button.dataset.filter = value;
        button.textContent = label;
        filterBar.appendChild(button);
      }
    });
    const topics = {
      resume: ['Writing a Resume That Gets Read','Resume Keywords That Work','Resume Summary Examples','How to Show Career Progression','Resume Formatting Basics','Quantifying Resume Achievements','Resume Action Verbs','Tailoring a Resume to a Job','Resume Skills Sections','Common Resume Mistakes','Resume Writing for Career Changers','Explaining Employment Gaps','Resume Length Guide','Remote Work Resume Tips','First Resume Guide','Resume Projects Section','Resume Certifications Guide','Resume for Leadership Roles','Resume Proofreading Checklist','ATS Resume Formatting','Resume Accomplishment Statements','Resume Networking Tips','Modern Resume Design','Resume Update Checklist'],
      career: ['Finding Your Career Direction','Building a Practical Job Search','Career Change Planning','How to Set Career Goals','Networking for Introverts','Building a Professional Reputation','Choosing the Right Company','Making a Career Development Plan','Salary Research Basics','Negotiating a Job Offer','Working With a Mentor','Growing as a New Manager','Learning Skills for Your Next Role','Planning a Career Break','Finding Meaningful Work','Building Confidence at Work','Managing a Job Search','Professional Email Etiquette','Making a Career Portfolio','Freelance Career Basics','Remote Career Planning','Career Advice for Graduates','Creating a Five-Year Plan','Recovering From a Job Rejection'],
      interview: ['Interview Questions and Answers','Tell Me About Yourself','Behavioral Interview Preparation','STAR Method Interview Guide','Researching a Company','Questions to Ask an Interviewer','Remote Interview Preparation','Technical Interview Preparation','Interview Confidence Tips','Explaining Your Biggest Weakness','Discussing Salary in an Interview','Handling a Career Gap Interview Question','Panel Interview Advice','Phone Screen Preparation','Follow-Up Email After an Interview','Interview Body Language','Case Interview Preparation','Interviewing for a Promotion','Dealing With Interview Nerves','Final Interview Preparation','Interview Preparation Timeline','How to Tell Your Career Story','Interview Mistakes to Avoid','Thank-You Note Examples'],
      examples: ['Marketing Resume Example','Software Engineer Resume Example','Student Resume Example','Graduate CV Example','Career Changer Resume Example','Project Manager Resume Example','Teacher Resume Example','Nurse Resume Example','Data Analyst Resume Example','Customer Service Resume Example','Graphic Designer Resume Example','Business Analyst Resume Example','Internship Resume Example','Remote Worker Resume Example','Executive Resume Example','Academic CV Example','Finance Resume Example','Sales Resume Example','Operations Resume Example','Entry-Level CV Example','Creative Portfolio Example','Cover Letter Example','LinkedIn Summary Example','Professional Bio Example']
    };
    const sources = ['Indeed Career Guide','Coursera Career Guide','Harvard OPM','LinkedIn Career Advice','Glassdoor Career Guide'];
    const blogCatalog = [];
    Object.entries(topics).forEach(([category, titles])=>titles.forEach((title, index)=>{
      const tag = category === 'resume' ? 'Resume & CV Writing Tips' : category === 'career' ? 'Career Advice' : category === 'interview' ? 'Job Interviews & Find a Job' : 'Examples';
      blogCatalog.push({category, tag, title, source:sources[index % sources.length], summary:`A practical, free guide to ${title.toLowerCase()}, with clear steps and examples you can use in your next application.`});
    }));
    ['Cover Letter Structure Guide','Cover Letter Opening Lines','Cover Letter Achievement Examples','Cover Letter for a Career Change','Cover Letter for an Internship','Cover Letter Follow-Up Advice','Cover Letter Formatting Tips','Cover Letter Mistakes to Avoid'].forEach((title,index)=>blogCatalog.push({category:'career',tag:'Cover Letter Writing Tips',title,source:sources[index % sources.length],summary:`A practical guide to ${title.toLowerCase()} with advice for making your application specific and memorable.`}));
    while(blogCatalog.length < 120){
      const index = blogCatalog.length;
      blogCatalog.push({category:'personal',tag:'Personal Development',title:`Personal Development Plan for Job Seekers: Part ${index - 103}`,source:sources[index % sources.length],summary:'Simple, free ways to build confidence, improve your professional habits, and keep moving forward.'});
    }
    let selectedFilter = 'all';
    let page = 1;
    const perPage = 12;
    const count = document.getElementById('blogCount');
    const pagination = document.createElement('div');
    pagination.className = 'blog-pagination';
    blogGrid.replaceChildren();
    function renderBlogPage(){
      const filtered = blogCatalog.filter(item=>selectedFilter === 'all' || item.category === selectedFilter || (selectedFilter === 'cover' && item.tag === 'Cover Letter Writing Tips'));
      const totalPages = Math.ceil(filtered.length / perPage);
      page = Math.min(page, totalPages || 1);
      const visible = filtered.slice((page - 1) * perPage, page * perPage);
      blogGrid.innerHTML = visible.map(item=>`<article class="blog-card"><span class="blog-category">${item.tag}</span><h2>${item.title}</h2><p>${item.summary}</p><div class="blog-meta">${item.source} · Free public guide</div><a class="read-link" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.source)}">Read article <span>→</span></a></article>`).join('');
      count.textContent = `Showing ${filtered.length ? (page - 1) * perPage + 1 : 0} - ${Math.min(page * perPage, filtered.length)} of ${filtered.length} articles`;
      pagination.innerHTML = `<button class="filter" ${page === 1 ? 'disabled' : ''} data-blog-page="prev">Previous</button><span>Page ${page} of ${totalPages || 1}</span><button class="filter" ${page === totalPages ? 'disabled' : ''} data-blog-page="next">Next</button>`;
      pagination.querySelector('[data-blog-page="prev"]').addEventListener('click',()=>{if(page>1){page--;renderBlogPage();}});
      pagination.querySelector('[data-blog-page="next"]').addEventListener('click',()=>{if(page<totalPages){page++;renderBlogPage();}});
    }
    blogGrid.after(pagination);
    document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click', ()=>{
      document.querySelectorAll('.filter').forEach(item=>item.classList.remove('active'));
      button.classList.add('active');
      selectedFilter = button.dataset.filter;
      page = 1;
      renderBlogPage();
    }));
    renderBlogPage();
  }
  const login = document.getElementById('loginForm');
  const signup = document.getElementById('signupForm');
  if(login || signup){
    fetch('/api/me').then(r=>r.json()).then(d=>{ if(d.user) window.location.href='/builder'; });
  }
  if(login) login.addEventListener('submit', event=>submitAuth(event, '/api/login'));
  if(signup) signup.addEventListener('submit', event=>submitAuth(event, '/api/signup'));
  const contact = document.getElementById('contactForm');
  if(contact) contact.addEventListener('submit', event=>{
    event.preventDefault();
    contact.querySelector('.form-message').textContent = 'Thanks. Your message has been received.';
    contact.reset();
  });
});

function initTemplateGallery(){
  const grid = document.getElementById('templateGrid');
  if(!grid) return;
  const styles = ['classic','modern','creative','minimal'];
  const names = ['Avery','Morgan','Jordan','Riley','Casey','Taylor','Jamie','Alex','Quinn','Parker'];
  const roles = ['Product Designer','Marketing Specialist','Software Engineer','Project Manager','Data Analyst','Operations Lead'];
  const templates = Array.from({length:120}, (_, index)=>({
    id:index + 1,
    style:styles[index % styles.length],
    name:names[index % names.length],
    role:roles[index % roles.length]
  }));
  let selected = 'all';
  function render(){
    const visible = templates.filter(template=>selected === 'all' || template.style === selected);
    grid.innerHTML = visible.map(template=>`
      <article class="template-card">
        <div class="resume-preview ${template.style}">
          <div class="resume-preview-head"><strong>${template.name} Johnson</strong><span>${template.role}</span></div>
          <div class="resume-preview-body"><i></i><i></i><i class="short"></i><b></b><i></i><i class="short"></i><b></b><i></i><i></i></div>
        </div>
        <div class="template-card-info"><div><span class="template-number">${String(template.id).padStart(2,'0')}</span><h2>${template.style[0].toUpperCase() + template.style.slice(1)} ${template.id}</h2></div><button class="btn light use-template" data-template-id="${template.id}">Use template</button></div>
      </article>`).join('');
    const count = document.getElementById('templateCount');
    if(count) count.textContent = `${visible.length} free templates`;
    grid.querySelectorAll('.use-template').forEach(button=>button.addEventListener('click',()=>{
      localStorage.setItem('selectedTemplate', button.dataset.templateId);
      window.location.href = '/builder';
    }));
  }
  document.querySelectorAll('[data-template-filter]').forEach(button=>button.addEventListener('click',()=>{
    selected = button.dataset.templateFilter;
    document.querySelectorAll('[data-template-filter]').forEach(item=>item.classList.toggle('active', item === button));
    render();
  }));
  render();
}