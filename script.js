// ================= CONFIGURAÇÃO DO FIREBASE ================= //
const firebaseConfig = {
  apiKey: "AIzaSyCs-PeIHCTX1AUqlVEOGFKQRu4sPGba1ls",
  authDomain: "codepitch1.firebaseapp.com",
  projectId: "codepitch1",
  storageBucket: "codepitch1.appspot.com",
  messagingSenderId: "393929936980",
  appId: "1:393929936980:web:cd5b056d7add40732f1dc1"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ================= DADOS DOS PROJETOS ================= //
const projects = [
  {
    id: 1,
    author: "Maria Silva",
    location: "São Paulo, SP",
    image: "https://imgs.search.brave.com/bAM5fcnemhP2h-qykELl60oruXYNqSRqlwQZpkg-lRc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZWph/ZWZpLmNvbS5ici9w/b3J0YWwvd3AtY29u/dGVudC91cGxvYWRz/LzIwMjQvMTAvcGFn/YW1lbnRvLW9ubGlu/ZS5wbmc",
    description: "Plataforma de e‑commerce com carrinho, pagamento integrado e painel administrativo.",
    tags: ["React", "Node.js", "MongoDB"]
  },
      {
      id: 2,
      author: "João Santos",
      location: "Rio de Janeiro, RJ",
      image: "https://imgs.search.brave.com/ZYaopMwrlahUA2MEowLQU9wQz9YvvYIT8pzgRgjQcA4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9naXRo/dWIuY29tL3Bsb3Rs/eS9kYXNoLXNhbXBs/ZS1hcHBzL3Jhdy9t/YWluL2FwcHMvZGFz/aC1tYW51ZmFjdHVy/ZS1zcGMtZGFzaGJv/YXJkL2ltZy9zY3Jl/ZW5jYXB0dXJlMS5w/bmc",
      description: "Dashboard interativo para análise de vendas em tempo real usando Python e Plotly.",
      tags: ["Python", "Pandas", "Plotly"]
    },
    {
      id: 3,
      author: "Ana Costa",
      location: "Belo Horizonte, MG",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?fit=crop&w=800&q=80",
      description: "App mobile de gerenciamento de tarefas com autenticação e sincronização via Firebase.",
      tags: ["React Native", "Firebase", "UX/UI"]
    },
    {
      id: 4,
      author: "Carlos Oliveira",
      location: "Porto Alegre, RS",
      image: "https://imgs.search.brave.com/xprXZhFBhAyjI8d_cBhn08JqyqTSNn1QmMS-xko3BuA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93cC5z/ZmRjZGlnaXRhbC5j/b20vcHQtYnIvd3At/Y29udGVudC91cGxv/YWRzL3NpdGVzLzE1/LzIwMjMvMDUvcHJv/ZHVjdC1mZWF0dXJl/cy1laW5zdGVpbi1i/b3RzLWFwaS0xLmpw/Zz93PTEwMjQ",
      description: "Chatbot para atendimento ao cliente, usando NLP e TensorFlow com WebSocket.",
      tags: ["Python", "NLP", "TensorFlow"]
    },
    {
      id: 5,
      author: "Fernanda Lima",
      location: "Recife, PE",
      image: "https://imgs.search.brave.com/vVaQIgzDrB9kOEaii4yPOFhUwbOoSq4Lb5i6gkmjAMc/rs:fit:860:0:0:0/g:ce/aHR0cDovL3d3dy5n/YW1lcmluZm8uY29t/LmJyL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDIwLzAxL2pvZ29z/LWVtLXBpeGVsLWFy/dC1wYXJhLXBjLXN0/YXJkZXctdmFsbGV5/LmpwZw",
      description: "Jogo 2D indie em Unity com mecânicas de puzzle e arte pixel art.",
      tags: ["Unity", "C#", "Game Design"]
    },
    {
      id: 6,
      author: "Pedro Rocha",
      location: "Salvador, BA",
      image: "https://imgs.search.brave.com/T2DX3mBYNR8AizVXcpq-lAxL27gy0cXSJlqWvuC3lWA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9maXJl/YmFzZS5nb29nbGUu/Y29tL3N0YXRpYy9p/bWFnZXMvcHJvZHVj/dHMvcmVhbHRpbWUt/ZGF0YWJhc2UvZGF0/YWJhc2UtMi5wbmc_/aGw9cHQtYnI",
      description: "DApp para marketplace de NFTs com smart contracts em Solidity e Web3.js.",
      tags: ["Solidity", "Web3.js", "Blockchain"]
    }
];

// ================= INICIALIZAÇÃO DA PÁGINA ================= //
document.addEventListener('DOMContentLoaded', () => {
  initProjects();
  initCarousel();
  setupAuthListeners();
});

// ================= SISTEMA DE PROJETOS ================= //
function initProjects() {
  const grid = document.getElementById('projectsGrid');
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="project-header">
        <div class="project-avatar">${project.author.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h3>${project.author}</h3>
          <div class="project-location">📍 ${project.location}</div>
        </div>
      </div>
      <div class="project-image">
        <img src="${project.image}" alt="${project.description}">
      </div>
      <div class="project-description">${project.description}</div>
      <div class="project-actions">
        <button class="comment-btn" onclick="openComments(${project.id}, '${project.author}')">
          💬 Comentários
        </button>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ================= SISTEMA DE COMENTÁRIOS ================= //
let currentProjectId = null;

function openComments(projectId, author) {
  currentProjectId = projectId;
  const modal = document.getElementById('commentsModal');
  document.getElementById('modalTitle').textContent = `Comentários - ${author}`;
  modal.style.display = 'block';
  loadComments(projectId);
}

async function loadComments(projectId) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '<p class="loading">Carregando comentários...</p>';

  try {
    const snapshot = await db.collection('comments')
      .where('projectId', '==', parseInt(projectId))
      .orderBy('timestamp', 'desc')
      .get();

    if (snapshot.empty) {
      commentsList.innerHTML = '<p class="no-comments">Nenhum comentário ainda. Seja o primeiro!</p>';
      return;
    }

    commentsList.innerHTML = '';
    const currentUser = auth.currentUser;

    snapshot.forEach(doc => {
      const comment = doc.data();
      const date = comment.timestamp?.toDate().toLocaleString('pt-BR') || 'Agora';
      
      commentsList.innerHTML += `
        <div class="comment">
          <div class="comment-header">
            <span class="comment-author">${comment.authorName}</span>
            ${currentUser?.uid === comment.authorId ? 
              `<button class="delete-comment-btn" onclick="deleteComment('${doc.id}')">🗑️</button>` : ''}
          </div>
          <p class="comment-text">${comment.text}</p>
          <small class="comment-date">${date}</small>
        </div>
      `;
    });
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
    commentsList.innerHTML = '<p class="error">Erro ao carregar comentários.</p>';
  }
}

async function addComment() {
  const user = auth.currentUser;
  if (!user) {
    alert('Você precisa estar logado para comentar!');
    openAuthModal();
    return;
  }

  const text = document.getElementById('commentText').value.trim();
  if (!text) {
    alert('Digite um comentário válido!');
    return;
  }

  try {
    await db.collection('comments').add({
      projectId: parseInt(currentProjectId),
      authorId: user.uid,
      authorName: user.displayName || user.email.split('@')[0],
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('commentText').value = '';
    loadComments(currentProjectId);
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    alert('Erro ao enviar comentário. Tente novamente.');
  }
}

async function deleteComment(commentId) {
  if (!confirm('Tem certeza que deseja apagar este comentário?')) return;
  
  try {
    await db.collection('comments').doc(commentId).delete();
    loadComments(currentProjectId);
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    alert('Erro ao apagar comentário.');
  }
}

function closeModal() {
  document.getElementById('commentsModal').style.display = 'none';
}

// ================= AUTENTICAÇÃO ================= //
function setupAuthListeners() {
  // Listener de estado de autenticação
  auth.onAuthStateChanged(user => {
    updateLoginButton(user);
  });

  // Login
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
      closeAuthModal();
    } catch (error) {
      alert('Erro no login: ' + error.message);
    }
  });

  // Cadastro
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      alert('Cadastro realizado! Faça login.');
      showLogin();
    } catch (error) {
      alert('Erro no cadastro: ' + error.message);
    }
  });
}

function updateLoginButton(user) {
  const loginBtn = document.getElementById('loginBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (user) {
    loginBtn.style.display = 'none';
    userDropdown.style.display = 'block';
    document.getElementById('userNameDisplay').textContent = user.displayName || user.email.split('@')[0];
  } else {
    loginBtn.style.display = 'block';
    userDropdown.style.display = 'none';
  }
}

function logout() {
  auth.signOut().then(() => {
    closeModal(); // Fecha o modal de comentários se estiver aberto
  }).catch(error => {
    console.error("Erro ao fazer logout:", error);
  });
}

function toggleUserMenu() {
  const dropdown = document.getElementById('dropdownContent');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// ================= MODAIS ================= //
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

// ================= CARROSSEL ================= //
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll('.nav-dot'));
  let currentIndex = 0;

  // Atualiza a posição do carrossel
  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Botões de navegação
  document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  // Navegação por dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  // Auto-play (opcional)
  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }, 5000);
}

// ================= EVENTOS GLOBAIS ================= //
// Fecha modais ao clicar fora
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('commentsModal')) closeModal();
  if (e.target === document.getElementById('authModal')) closeAuthModal();
  if (!e.target.closest('.user-dropdown')) {
    document.getElementById('dropdownContent').style.display = 'none';
  }
});

// Fecha modais com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAuthModal();
  }
});