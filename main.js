
const githubUserName = 'baysory'
const apiKey = "AIzaSyCB3sN3loZNZqBsQvZg8HJJu6JIFa8kzy4" // API key do Gemini

const manualFeaturedProjects = [
    {name: "API de tarefas", desc:"API RESTful com JWT & Swagger", tags:["Node.js", "SQL"], link: "#"},
    {name: "Chat em tempo real", desc:"WebSockets para comunicação instantânea", tags:["Socket.io", "JS"], link:"#"}
];

let allGithubProjects = [];
let currentTab = 'featured';
let lastListedProjectsInTerminal= []
let hauntInterval;

const realSkull = `
                            @         @                          
                         @         @                         
                     @   @         @   @                     
                     @  @@         @@  @                     
                     @@ @@@       @@@ @@                     
             @      @@   @@@     @@@   @@      @             
            @@      @@   @@@     @@@   @@      @@            
           @@      @@    @@@@   @@@@    @@      @@           
           @@     @@@    @@@@  @@@@@    @@@     @@@          
       @  @@@    @@@@    @@@@   @@@@    @@@@   @@@@  @       
       @@ @@@@@  @@@@   @@@@@   @@@@@   @@@@  @@@@@ @@       
       @@ @@@@@  @@@@@@@@@@@     @@@@@@@@@@@  @@@@@ @@       
       @@ @@@@@  @@@@@@@@@@@     @@@@@@@@@@@  @@@@@ @@       
      @@@  @@@@   @@@@@@@@@@@@@@@@@@@@@@@@@   @@@@  @@@      
     @@@@  @@@@   @@@@@@@@@@@@@@@@@@@@@@@@@   @@@@  @@@@     
    @@@@   @@@@@ @@@@@@@@@@@@@@@@@@@@@@@@@@@ @@@@@   @@@@    
   @@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   @@@@    
   @@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@    
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    
     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     
     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      
     @@@@@           @@@@@@@@@@@@@@@@@@@           @@@@@     
     @@@@@@             @@@@@@@@@@@@@             @@@@@@     
      @@@@@@@        ..     @@@@@@@@@     ..        @@@@@@   
       @@@@@@@@             @@@@@             @@@@@@@@       
        @@@@@@@@@@           @@@           @@@@@@@@@@        
           @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@           
              @@@@@@@@@@@@@@@   @@@@@@@@@@@@@@@              
                  @@@@@@@@@@     @@@@@@@@@@                  
                   @@@@@@@@       @@@@@@@@                   
                  @@@@@@@@@       @@@@@@@@@                  
                  @@@@@@@@@ @@@@@ @@@@@@@@@                  
                 @@@@@@@@@@@@@@@@@@@@@@@@@@@                 
                 @@@  @@@@@@@@@@@@@@@@@  @@@                 
                  @@  @@@@  @@@@@  @@@@  @@                  
                       @@@@  @@@@@  @@@@                      
`;

function switchTab(tab) {
    currentTab = tab;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(tab === 'featured') document.querySelector('.tab-btn:first-child').classList.add('active');
    else document.querySelector('.tab-btn:last-child').classList.add('active');
    renderProjects();
}

function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = ''; 

    let projectsToRender = (currentTab === 'featured') ? manualFeaturedProjects : allGithubProjects;

    if (projectsToRender.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">' + (currentTab === 'all' ? 'Carregando GitHub...' : 'Nenhum projeto.') + '</p>'; 
        return;
    }

    projectsToRender.forEach((proj, index) => {
        const item = document.createElement('a');
        item.href = proj.link || proj.html_url || '#'
        item.target = "_blank";
        item.className = 'project-item';

        let tagsHtml = proj.tags ? proj.tags.map(t => `<span class="mini-tag">${t}</span>`).join('') : (proj.language ? `<span class="mini-tag">${proj.language}</span>` : '');

        item.innerHTML = `<div class="project-index">#${(index + 1).toString().padStart(2, '0')}</div><div class="project-info"><div class="project-tap-row"><span class="project-title">${proj.name}</span><i class="ph ph-arrow-up-right" style="color:var(--accent)"></i></div><div class="project-desc">${proj.desc || proj.description || 'Sem descrição.'}</div><div class="project-meta">${tagsHtml}</div></div>`;
        container.appendChild(item);
    });
}

async function fetchGitHubData() {
    try {
        const pRes = await fetch(`https://api.github.com/users/${githubUserName}`); const pData = await pRes.json();
        if(pData.avatar_url) document.getElementById('profile-avatar').innerHTML = `<img src="${pData.avatar_url}" class="avatar-img">`;
        document.getElementById('github-link').href = pData.html_url || '#'; 

        const rRes = await fetch(`https://api.github.com/users/${githubUserName}/repos?sort=updated&direction=desc`);
        const rData = await rRes.json();
        allGithubProjects = rData.filter(r => !r.fork);

        if(currentTab === 'all') 
            renderProjects()
    }
    
    catch (e) {
        console.error(e);
    }
};

    const termOverlay = document.getElementById('terminal-overlay');
    const mainInterface =  document.getElementById('main-interface');
    const termOutput = document.getElementById('term-output');
    const termInput = document.getElementById('term-input');
    const termPromptDiv = document.getElementById('term-prompt-div');
    const promptLabel = document.getElementById('term-prompt-span');
    const statusBar = document.getElementById('term-status-bar');
    const statusText = document.getElementById('status-text');


    let isTerminalBooted = false;
    let isChatMode = false;

    const termData = {
        help: `
        <span class="t-header">COMANDOS:</span>
<div class="t-grid">
<div><span class="t-cmd">sobre</span></div>    <div>Infos sobre o perfil</div>
<div><span class="t-cmd">skills</span></div>   <div>Minha stack técnica</div>
<div><span class="t-cmd">projetos</span></div> <div>Listar portfólio</div>
<div><span class="t-cmd">api [res]</span></div><div><span class="t-highlight">NEW!</span> Retorna JSON (ex: api skills)</div>
<div><span class="t-cmd">chat</span></div>     <div><span class="t-ai">Modo IA</span> (Entrevista)</div>
<div><span class="t-cmd">status</span></div>   <div>System Monitor</div>
<div><span class="t-cmd">clear</span></div>    <div>Limpar tela</div>
<div><span class="t-cmd">exit</span></div>     <div>Sair do terminal</div>
</div>`,
            
        sobre: `
<span class="t-header">PERFIL:</span>
<div class="t-grid">
<div><span class="t-key">Role:</span></div>     <div>Back-end Developer</div>
<div><span class="t-key">Foco:</span></div>     <div>Performance & IA</div>
</div>
<br>
<span class="t-icon">➜</span> Ex-jogador competitivo focado em <span class="t-highlight">disciplina</span>.
<span class="t-icon">➜</span> Buscando construir sistemas escaláveis.`,

        skills: `
<span class="t-header">STACK:</span>
<div class="t-grid">
<div><span class="t-key">Back-end:</span></div>    <div>Node.js, Express, REST</div>
<div><span class="t-key">Linguagens:</span></div>  <div>JavaScript, Python, SQL</div>
<div><span class="t-key">Tools:</span></div>       <div>Git, Linux, Docker</div>
</div>`,

        cv: `
<span class="t-header">RESUMO CV:</span>
<span class="t-highlight">[Atual]</span> Estudos Intensivos em Back-end & IA.
<span class="t-highlight">[Anterior]</span> Carreira competitiva em E-sports.
<br><span class="t-dim">Digite 'download' para baixar o PDF.</span>`

    };

    const apiData = {
        skills: {
            backend: ["Node.js", "Express", "Python", "REST APIs"],
            database: ["PostgreSQL", "MongoDB", "Redis"],
            devops: ["Docker", "Git", "CI/CD"],
            level: "Junior+"
        },
        project: manualFeaturedProjects.map(p => ({name: p.name, stack: p.tags, url: p.link})),
        profile: {
            area: "back-end Developer",
            status: "Open to Work",
            focus: "AI & Scalability"
        }
    };

    function openTerminal() {
        mainInterface.style.opacity = '0';
        setTimeout(() => {
            mainInterface.style.display = 'none';
            termOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'
            if(!isTerminalBooted) {
                bootTerminal();
                hauntInterval = setInterval(triggerHaunt, 12000 + Math.random() * 8000);
            }
            else termInput.focus();
        }, 300);
    };