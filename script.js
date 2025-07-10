// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs-PeIHCTX1AUqlVEOGFKQRu4sPGba1ls",
  authDomain: "codepitch1.firebaseapp.com",
  projectId: "codepitch1",
  storageBucket: "codepitch1.appspot.com",
  messagingSenderId: "393929936980",
  appId: "1:393929936980:web:cd5b056d7add40732f1dc1"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Dados de exemplo
// Dados de exemplo (6 projetos em nichos diferentes)
const projects = [
  {
    id: 1,
    author: "Maria Silva",
    location: "São Paulo, SP",
    image: "https://via.placeholder.com/400x200/58a6ff/ffffff?text=E-commerce+App",
    description: "Plataforma de e‑commerce com carrinho, pagamento integrado e painel administrativo.",
    tags: ["React", "Node.js", "MongoDB"]
  },
  {
    id: 2,
    author: "João Santos",
    location: "Rio de Janeiro, RJ",
    image: "https://via.placeholder.com/400x200/7c3aed/ffffff?text=Data+Analytics",
    description: "Dashboard interativo para análise de vendas em tempo real usando Python e Plotly.",
    tags: ["Python", "Pandas", "Plotly"]
  },
  {
    id: 3,
    author: "Ana Costa",
    location: "Belo Horizonte, MG",
    image: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=App+Mobile",
    description: "App mobile de gerenciamento de tarefas com autenticação e sincronização via Firebase.",
    tags: ["React Native", "Firebase", "UX/UI"]
  },
  {
    id: 4,
    author: "Carlos Oliveira",
    location: "Porto Alegre, RS",
    image: "https://via.placeholder.com/400x200/10b981/ffffff?text=AI+Chatbot",
    description: "Chatbot para atendimento ao cliente, usando NLP e TensorFlow com WebSocket.",
    tags: ["Python", "NLP", "TensorFlow"]
  },
  {
    id: 5,
    author: "Fernanda Lima",
    location: "Recife, PE",
    image: "https://via.placeholder.com/400x200/ef4444/ffffff?text=Game+Indie",
    description: "Jogo 2D indie em Unity com mecânicas de puzzle e arte pixel art.",
    tags: ["Unity", "C#", "Game Design"]
  },
  {
    id: 6,
    author: "Pedro Rocha",
    location: "Salvador, BA",
    image: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Blockchain+DApp",
    description: "DApp para marketplace de NFTs com smart contracts em Solidity e Web3.js.",
    tags: ["Solidity", "Web3.js", "Blockchain"]
  }
];

let comments = {};

// Ao carregar
document.addEventListener('DOMContentLoaded', () => {
  initProjects();
  firebase.auth().onAuthStateChanged(updateLoginButton);
  initCarousel();
});

// Inicializa lista de projetos
function initProjects() {
  const grid = document.getElementById('projectsGrid');
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-header">
        <div class="project-avatar">${p.author.split(' ').map(n=>n[0]).join('')}</div>
        <div class="project-author">
          <h3>${p.author}</h3>
          <div class="project-location">📍 ${p.location}</div>
        </div>
      </div>
      <div class="project-image"><img src="${p.image}" alt=""></div>
      <div class="project-description">${p.description}</div>
      <div class="project-actions">
        <button class="comment-btn" onclick="openComments(${p.id}, '${p.author}')">💬 Comentários</button>
        <div class="project-tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// Comentários
function openComments(id, author) {
  const modal = document.getElementById('commentsModal');
  document.getElementById('modalTitle').textContent = `Comentários - Projeto de ${author}`;
  modal.style.display = 'block';
  modal.dataset.projectId = id;
  loadComments(id);
}
function closeModal() {
  document.getElementById('commentsModal').style.display = 'none';
}
function addComment() {
  const id = document.getElementById('commentsModal').dataset.projectId;
  const text = document.getElementById('commentText').value.trim();
  if (!text) return;
  const user = auth.currentUser;
  comments[id] = comments[id] || [];
  comments[id].push({
    author: user?.displayName || 'Usuário Anônimo',
    text,
    timestamp: new Date().toLocaleString('pt-BR')
  });
  document.getElementById('commentText').value = '';
  loadComments(id);
}
function loadComments(id) {
  const list = document.getElementById('commentsList');
  const arr = comments[id] || [];
  list.innerHTML = arr.length === 0
    ? '<p style="color:#8b949e;text-align:center;">Nenhum comentário ainda. Seja o primeiro!</p>'
    : arr.map(c => `
      <div class="comment">
        <div class="comment-author">${c.author}</div>
        <div>${c.text}</div>
        <div style="color:#8b949e;font-size:0.8rem;margin-top:0.5rem;">${c.timestamp}</div>
      </div>`).join('');
}

// Autenticação
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = e.target.email.value, pwd = e.target.password.value;
  auth.signInWithEmailAndPassword(email, pwd)
    .then(() => { closeAuthModal(); updateLoginButton(); })
    .catch(err => alert('Erro no login: '+err.message));
});
document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = e.target.name.value, email = e.target.email.value, pwd = e.target.password.value;
  auth.createUserWithEmailAndPassword(email, pwd)
    .then(res => res.user.updateProfile({ displayName: name }))
    .then(() => { alert('Cadastro realizado! Agora faça login.'); showLogin(); })
    .catch(err => alert('Erro no cadastro: '+err.message));
});

function updateLoginButton() {
  const user = auth.currentUser;
  document.getElementById('loginBtn').style.display = user ? 'none' : 'inline-flex';
  document.getElementById('userDropdown').style.display = user ? 'inline-block' : 'none';
  document.getElementById('userNameDisplay').textContent = user?.displayName || 'Usuário';
}
function logout() {
  auth.signOut().then(() => updateLoginButton());
}
function toggleUserMenu() {
  const d = document.getElementById('dropdownContent');
  d.style.display = d.style.display==='block'?'none':'block';
}

// Modais de login/cadastro
function openAuthModal() {
  document.getElementById('authModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}
function showRegister() {
  document.getElementById('loginSection').classList.add('register-active');
  document.getElementById('registerSection').classList.add('active');
}
function showLogin() {
  document.getElementById('loginSection').classList.remove('register-active');
  document.getElementById('registerSection').classList.remove('active');
}

// Fechar modais e dropdown externo
window.onclick = e => {
  if (e.target===document.getElementById('commentsModal')) closeModal();
  if (e.target===document.getElementById('authModal')) closeAuthModal();
  if (!e.target.closest('.user-dropdown')) document.getElementById('dropdownContent').style.display='none';
};
document.onkeydown = e => {
  if (e.key==='Escape') { closeModal(); closeAuthModal(); }
};

// Carrossel
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = [...track.children];
  const dots = [...document.querySelectorAll('.nav-dot')];
  let idx=0;
  function update() {
    track.style.transform = `translateX(-${idx*100}%)`;
    dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  document.getElementById('nextBtn').onclick = () => { idx=(idx+1)%slides.length; update(); };
  document.getElementById('prevBtn').onclick = () => { idx=(idx-1+slides.length)%slides.length; update(); };
  dots.forEach((d,i)=>d.onclick=()=>{ idx=i; update(); });
  setInterval(()=>{ idx=(idx+1)%slides.length; update(); },7000);
}
