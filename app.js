function setActivePage(){
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav a').forEach(link=>{
    if(link.dataset.page === page) link.classList.add('active');
  });
}

function normalizeProductNav(){
  const labels = {'/builder':'📄 Resume Builder','/cv-builder':'📋 CV Builder','/cover-letter':'✉️ Cover Letter','/career-blog':'📰 Career Blog','/about':'💡 About us','/contact':'📬 Contact'};
  document.querySelectorAll('.nav a').forEach(link=>{
    const path = new URL(link.href, window.location.origin).pathname;
    if(labels[path]) link.textContent = labels[path];
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
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/builder';
    window.location.href = safeNext;
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
  normalizeProductNav();
  initNavDropdown();
  initNavToggle();
  initFooter();
  initUserMenu();
  initDarkMode();
  initTemplateGallery();
  initStatsCounter();
  initWhatsApp();
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
  if(contact) contact.addEventListener('submit', async event=>{
    event.preventDefault();
    const status = contact.querySelector('.form-message');
    try{
      const response = await fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:contact.name.value, email:contact.email.value, message:contact.message.value})});
      const data = await response.json();
      if(!response.ok) throw new Error(data.error || 'Could not send your message.');
      status.textContent = 'Thanks. Your message has been received.';
      contact.reset();
    }catch(error){ status.textContent = error.message; }
  });
});

function initWhatsApp(){
  if(document.querySelector('.whatsapp-float')) return;
  const a = document.createElement('a');
  a.className = 'whatsapp-float';
  a.href = 'https://wa.me/919999999999?text=Hi%20Dossier!%20I%20need%20help%20with%20my%20resume.';
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat on WhatsApp');
  a.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg><span class="whatsapp-float-label">Chat with us</span>`;
  document.body.appendChild(a);
}

function initStatsCounter(){
  const nums = document.querySelectorAll('.hero-stat-num[data-target]');
  if(!nums.length) return;
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step = 16;
      const increment = target / (duration / step);
      let current = 0;
      const timer = setInterval(()=>{
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current).toLocaleString() + '+';
        if(current >= target) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, {threshold: 0.5});
  nums.forEach(el => observer.observe(el));
}

function initTemplateGallery(){
  const grid = document.getElementById('templateGrid');
  if(!grid) return;

  const TEMPLATES = [
    {slug:'puffin',      desc:'Thoughtfully designed layout that highlights your profile in a visually appealing way',         users:111602, tags:['all','designer','senior'],       ats:false},
    {slug:'caddisfly',   desc:'Professional table-format design built for clarity and efficient information flow',            users:25392,  tags:['all','engineer','senior'],      ats:false},
    {slug:'stonefly',    desc:'Clean tabular layout that keeps information easy to scan and professionally arranged',          users:8078,   tags:['all'],                          ats:false},
    {slug:'mayfly',      desc:'A structured table-based resume template designed for clear and organized presentation',       users:12458,  tags:['all'],                          ats:false},
    {slug:'chafer',      desc:'Optimized for digital hiring processes with consistent and parse-friendly structure',          users:7203,   tags:['all'],                          ats:true},
    {slug:'anchovy',     desc:'ATS-first resume template focused on simplicity, keywords, and clarity',                      users:33508,  tags:['all'],                          ats:true},
    {slug:'marlin',      desc:'Minimal and ATS-safe format that avoids parsing errors and formatting issues',                 users:13426,  tags:['all'],                          ats:true},
    {slug:'avocet',      desc:'Optimized resume template that balances human readability with machine parsing',               users:8525,   tags:['all'],                          ats:true},
    {slug:'weevil',      desc:'Smartly designed template to improve ranking in applicant tracking systems',                   users:10211,  tags:['all'],                          ats:true},
    {slug:'grebe',       desc:'ATS-compliant design with a focus on clean structure and proper formatting',                   users:5717,   tags:['all'],                          ats:true},
    {slug:'genet',       desc:'Keyword-friendly layout that enhances discoverability in automated hiring systems',            users:15830,  tags:['all'],                          ats:true},
    {slug:'hyrex',       desc:'Streamlined template engineered for maximum ATS success and clarity',                         users:12841,  tags:['all'],                          ats:true},
    {slug:'hornet',      desc:'Simple formatting that ensures accurate keyword detection and ATS compatibility',              users:8601,   tags:['all'],                          ats:true},
    {slug:'haddock',     desc:'Polished resume design with clear structure',                                                 users:21815,  tags:['all'],                          ats:false},
    {slug:'lapwing',     desc:'Refined resume template with simple elegance',                                                users:8389,   tags:['all'],                          ats:false},
    {slug:'stickbug',    desc:'Clean professional CV with smooth layout flow',                                               users:1986,   tags:['all'],                          ats:false},
    {slug:'halibut',     desc:'Elegant career CV with a modern touch',                                                       users:6089,   tags:['all'],                          ats:false},
    {slug:'osprey',      desc:'Streamlined resume template with modern structure',                                           users:3523,   tags:['all'],                          ats:false},
    {slug:'kestrel',     desc:'Dual-section resume template for structured storytelling',                                    users:3714,   tags:['all'],                          ats:false},
    {slug:'budgie',      desc:'Stylish split-format resume with modern alignment',                                           users:3279,   tags:['all'],                          ats:false},
    {slug:'alpaca',      desc:'Clean two-column template for modern professionals',                                          users:2813,   tags:['all'],                          ats:false},
    {slug:'walrus',      desc:'Contemporary two-column CV with structured design',                                          users:970,    tags:['all'],                          ats:false},
    {slug:'lemur',       desc:'Sleek two-column resume with balanced sections',                                              users:13941,  tags:['all'],                          ats:false},
    {slug:'coral',       desc:'Modern and organized resume template',                                                        users:1475,   tags:['all'],                          ats:false},
    {slug:'badger',      desc:'Clean and modern professional resume template',                                               users:1413,   tags:['all'],                          ats:false},
    {slug:'pelican',     desc:'Professional resume layout for social media managers and creators',                           users:6576,   tags:['all','marketing'],              ats:false},
    {slug:'coyote',      desc:'Clean ATS-friendly resume layout for business process optimization roles',                    users:4168,   tags:['all'],                          ats:true},
    {slug:'sloth',       desc:'ATS-friendly resume design for research scientists and analysts',                             users:4682,   tags:['all','data'],                   ats:true},
    {slug:'canary',      desc:'Professional resume layout ideal for technical writing and documentation roles',               users:2233,   tags:['all'],                          ats:false},
    {slug:'cicada',      desc:'Simple and polished creator resume design',                                                   users:9455,   tags:['all'],                          ats:false},
    {slug:'perch',       desc:'Crisp and organized frontend resume design',                                                  users:13651,  tags:['all','engineer'],               ats:false},
    {slug:'zorilla',     desc:'Simple corporate-style resume template',                                                      users:5002,   tags:['all'],                          ats:false},
    {slug:'serval',      desc:'Modern portfolio-ready content creator resume',                                               users:3751,   tags:['all','marketing'],              ats:false},
    {slug:'finch',       desc:'Sleek and structured creative resume template',                                               users:3482,   tags:['all','designer'],               ats:false},
    {slug:'stork',       desc:'Minimal and polished design-focused resume',                                                  users:1547,   tags:['all','designer'],               ats:false},
    {slug:'caracal',     desc:'Stylish portfolio-ready interior designer resume',                                            users:2677,   tags:['all','designer'],               ats:false},
    {slug:'mussel',      desc:'Modern backend developer resume template with clean professional layout',                     users:4177,   tags:['all','engineer'],               ats:false},
    {slug:'colt',        desc:'Clarity-first design tailored for marketing professionals',                                   users:3350,   tags:['all','marketing'],              ats:false},
    {slug:'mantis',      desc:'Professional sales manager resume template with clean modern layout',                        users:1270,   tags:['all','sales'],                  ats:false},
    {slug:'egret',       desc:'Modern writing-focused resume designed for clarity and readability',                         users:1491,   tags:['all'],                          ats:false},
    {slug:'ibis',        desc:'Professional resume design for senior UI/UX specialists',                                    users:1638,   tags:['all','designer','senior'],      ats:false},
    {slug:'wren',        desc:'Clean, content-focused resume template ideal for technical writers',                         users:301,    tags:['all'],                          ats:false},
    {slug:'slug',        desc:'Contemporary tech resume template for AI engineering roles',                                 users:3154,   tags:['all','engineer','data'],        ats:false},
    {slug:'wasp',        desc:'Clean minimalist resume template for senior UX design roles',                                users:2180,   tags:['all','designer','senior'],      ats:false},
    {slug:'sheep',       desc:'Professional resume template ideal for product managers and leaders',                        users:1881,   tags:['all','manager'],                ats:false},
    {slug:'prawn',       desc:'Clean two-column template ideal for product and business professionals',                     users:1494,   tags:['all','manager'],                ats:false},
    {slug:'snail',       desc:'Clean, modern resume ideal for product management roles',                                    users:1503,   tags:['all','manager'],                ats:false},
    {slug:'fossa',       desc:'Ideal for professionals who want equal focus on experience and education',                   users:1128,   tags:['all'],                          ats:false},
    {slug:'yak',         desc:'Ideal for experienced software engineers and tech leads',                                    users:2728,   tags:['all','engineer','senior'],      ats:false},
    {slug:'squirrel',    desc:'Clean, modern resume ideal for sales and business professionals',                            users:24764,  tags:['all','sales'],                  ats:false},
    {slug:'gorilla',     desc:'Strategic, clean design built for marketing managers and specialists',                       users:5254,   tags:['all','marketing','manager'],    ats:false},
    {slug:'otter',       desc:'Clean, beginner-friendly resume ideal for students and junior engineers',                    users:11357,  tags:['all','fresher','engineer'],     ats:false},
    {slug:'frog',        desc:'Tech-focused layout designed for DevOps, SRE, and platform roles',                          users:11509,  tags:['all','engineer'],               ats:false},
    {slug:'falcon',      desc:'Elegant, text-focused template ideal for technical and content writers',                    users:5008,   tags:['all'],                          ats:false},
    {slug:'ostrich',     desc:'Polished resume template designed for sales and marketing professionals',                    users:2458,   tags:['all','sales','marketing'],      ats:false},
    {slug:'hamster',     desc:'Elegant ATS-ready resume for business development job seekers',                             users:2014,   tags:['all'],                          ats:true},
    {slug:'quail',       desc:'Simple, structured resume ideal for sales and CRM-based roles',                            users:2163,   tags:['all','sales'],                  ats:false},
    {slug:'betta',       desc:'Corporate resume layout for SDRs and growth-focused professionals',                         users:1343,   tags:['all','sales'],                  ats:false},
    {slug:'gecko',       desc:'Modern template tailored for tech sales and lead generation roles',                         users:912,    tags:['all','sales'],                  ats:false},
    {slug:'kangaroo',    desc:'Minimal business-focused resume ideal for sales and analytics roles',                       users:2774,   tags:['all','sales','data'],           ats:false},
    {slug:'dove',        desc:'Clean, ATS-friendly resume template for sales and business roles',                         users:1566,   tags:['all','sales'],                  ats:true},
    {slug:'hen',         desc:'A clean, visually balanced resume layout built for clarity and impact',                    users:15839,  tags:['all'],                          ats:false},
    {slug:'swan',        desc:'A clean, structured resume built for ATS accuracy and easy readability',                   users:30311,  tags:['all'],                          ats:true},
    {slug:'bear',        desc:'A stylish, professional template with a clear side-column design',                         users:46681,  tags:['all'],                          ats:false},
    {slug:'donkey',      desc:'Elegant resume layout featuring a crisp top banner and skill circles',                     users:5308,   tags:['all'],                          ats:false},
    {slug:'crane',       desc:'A sleek, minimalist, ATS-approved resume design',                                          users:9592,   tags:['all'],                          ats:true},
    {slug:'camel',       desc:'Stylish developer resume for showcasing coding skills and projects',                        users:8656,   tags:['all','engineer'],               ats:false},
    {slug:'gator',       desc:'Polished resume template for IT managers and project coordinators',                        users:3462,   tags:['all','manager','engineer'],     ats:false},
    {slug:'crab',        desc:'Modern professional resume template for product and tech leadership roles',                 users:2621,   tags:['all','manager','engineer'],     ats:false},
    {slug:'mole',        desc:'Resume for marketers—highlights impact, strategy, and growth',                             users:4651,   tags:['all','marketing'],              ats:false},
    {slug:'draco',       desc:'Modern ATS-friendly template for product managers to highlight strategy and impact',        users:9704,   tags:['all','manager'],                ats:true},
    {slug:'manta',       desc:'ATS-ready resume template for software engineers to showcase skills and projects',          users:4130,   tags:['all','engineer'],               ats:true},
    {slug:'monkey',      desc:'A resume that is ATS friendly and perfect for internships',                                users:37244,  tags:['all','fresher'],                ats:true},
    {slug:'chicken',     desc:'Perfect resume for graduates—puts academics and potential at the center',                  users:24854,  tags:['all','fresher'],                ats:false},
    {slug:'jellyfish',   desc:'Clean and simple, perfect for your first job application',                                 users:11509,  tags:['all','fresher'],                ats:false},
    {slug:'whale',       desc:'Best template for designers & developers showcasing skills with style',                    users:12697,  tags:['all','designer','engineer'],    ats:false},
    {slug:'hawk',        desc:'Ideal for product managers and strategy-driven roles',                                     users:6002,   tags:['all','manager'],                ats:false},
    {slug:'rhino',       desc:'Known to make a great first impression',                                                   users:10838,  tags:['all'],                          ats:false},
    {slug:'rooster',     desc:'Best resume for generalist and technical roles',                                           users:3074,   tags:['all','engineer'],               ats:false},
    {slug:'salmon',      desc:'Perfect resume for LinkedIn outreach for any jobs',                                        users:1650,   tags:['all'],                          ats:false},
    {slug:'raven',       desc:'Well structured resume aimed to impress the recruiter',                                    users:5087,   tags:['all'],                          ats:false},
    {slug:'alligator',   desc:'Modern resume template to impress any employer',                                           users:11354,  tags:['all'],                          ats:false},
    {slug:'elephant',    desc:'Ideal for professionals who want to stand out',                                            users:3674,   tags:['all','senior'],                 ats:false},
    {slug:'lion',        desc:'Ideal for finance and other professional jobs',                                            users:5287,   tags:['all','senior'],                 ats:false},
    {slug:'dolphin',     desc:'Simple yet visually appealing resume template for any professional',                       users:2434,   tags:['all'],                          ats:false},
    {slug:'fox',         desc:'Suited for Freshers who want a clean and visually appealing resume',                      users:6247,   tags:['all','fresher'],                ats:false},
    {slug:'penguin',     desc:'The perfect resume to impress any hiring manager',                                         users:8127,   tags:['all'],                          ats:false},
    {slug:'tiger',       desc:'Known to impress both recruiters and ATS bots',                                            users:12209,  tags:['all'],                          ats:true},
    {slug:'rabbit',      desc:'Known to make a memorable first impression',                                               users:18231,  tags:['all'],                          ats:false},
    {slug:'wolf',        desc:'Preferred by working professionals',                                                       users:16553,  tags:['all','senior'],                 ats:false},
    {slug:'hyena',       desc:'Humans and ATS bots love this template',                                                   users:42054,  tags:['all'],                          ats:true},
    {slug:'panther',     desc:'Ideal for careers in consulting and generalist roles',                                     users:29331,  tags:['all','senior'],                 ats:false},
    {slug:'eagle',       desc:'Ideal for freshers, who are just starting out',                                            users:45355,  tags:['all','fresher'],                ats:false},
    {slug:'shark',       desc:'Ideal for all job types',                                                                  users:75458,  tags:['all'],                          ats:false},
    {slug:'stockholm',   desc:'Ideal for careers in business and management',                                             users:24088,  tags:['all','manager'],                ats:false},
    {slug:'dublin',      desc:'Ideal for careers in product and engineering',                                             users:52637,  tags:['all','engineer','manager'],     ats:false},
    {slug:'harvard',     desc:'Sleek and organized layout tailored for visually impactful resumes',                       users:89868,  tags:['all','senior'],                 ats:false},
    {slug:'cambridge',   desc:'Elegant structure with a refined layout for a standout presentation',                     users:123923, tags:['all','senior'],                 ats:false},
    {slug:'auckland',    desc:'Ideal for careers in finance, talent and other roles',                                     users:142997, tags:['all'],                          ats:false},
  ];

  // colour palette cycling for the preview thumbnails
  const PALETTES = [
    {bg:'#f0f4ff',accent:'#4f46e5',line:'#c7d2fe'},
    {bg:'#f0fdf4',accent:'#16a34a',line:'#bbf7d0'},
    {bg:'#fdf4ff',accent:'#9333ea',line:'#e9d5ff'},
    {bg:'#fff7ed',accent:'#ea580c',line:'#fed7aa'},
    {bg:'#f0f9ff',accent:'#0284c7',line:'#bae6fd'},
    {bg:'#fefce8',accent:'#ca8a04',line:'#fef08a'},
  ];

  let activeFilter = 'all';
  let searchQuery  = '';

  function fmt(n){ return n >= 1000 ? (n/1000).toFixed(n%1000===0?0:1)+'k' : String(n); }

  function render(){
    const q = searchQuery.toLowerCase();
    const visible = TEMPLATES.filter(t=>{
      const matchFilter = activeFilter === 'ats' ? t.ats : t.tags.includes(activeFilter);
      const matchSearch = !q || t.slug.includes(q) || t.desc.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
    const count = document.getElementById('templateCount');
    if(count) count.textContent = `${visible.length} Template${visible.length !== 1 ? 's' : ''}`;
    grid.innerHTML = visible.map((t, i)=>{
      const p = PALETTES[i % PALETTES.length];
      const atsBadge = t.ats ? `<span class="tpl-ats-badge">ATS</span>` : '';
      return `
      <article class="template-card" data-slug="${t.slug}">
        <div class="tpl-thumb" style="background:${p.bg}">
          <div class="tpl-thumb-inner">
            <div class="tpl-bar tpl-bar-name" style="background:${p.accent}"></div>
            <div class="tpl-bar" style="background:${p.line};width:70%"></div>
            <div class="tpl-bar" style="background:${p.line};width:55%"></div>
            <div class="tpl-divider" style="background:${p.accent}"></div>
            <div class="tpl-bar" style="background:${p.line}"></div>
            <div class="tpl-bar" style="background:${p.line};width:80%"></div>
            <div class="tpl-bar" style="background:${p.line};width:60%"></div>
            <div class="tpl-bar" style="background:${p.line};width:75%"></div>
          </div>
          ${atsBadge}
        </div>
        <div class="template-card-info">
          <div class="tpl-meta">
            <h2 class="tpl-name">${t.slug.charAt(0).toUpperCase()+t.slug.slice(1)}</h2>
            <p class="tpl-desc">${t.desc}</p>
            <span class="tpl-users">Chosen by ${fmt(t.users)} users</span>
          </div>
          <button class="btn light use-template" data-slug="${t.slug}">Use template</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.use-template').forEach(btn=>btn.addEventListener('click',()=>{
      localStorage.setItem('selectedTemplate', btn.dataset.slug);
      window.location.href = '/builder';
    }));
  }

  // filter buttons
  document.querySelectorAll('[data-template-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    activeFilter = btn.dataset.templateFilter;
    document.querySelectorAll('[data-template-filter]').forEach(b=>b.classList.toggle('active', b === btn));
    render();
  }));

  // search
  const searchInput = document.getElementById('templateSearch');
  if(searchInput) searchInput.addEventListener('input', e=>{ searchQuery = e.target.value; render(); });

  render();
}