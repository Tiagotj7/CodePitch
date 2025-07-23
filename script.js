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

// ================= VARIÁVEIS GLOBAIS ================= //
let projects = [];
let currentProjectId = null;
let currentSlide = 0;

// ================= INICIALIZAÇÃO DA PÁGINA ================= //
document.addEventListener('DOMContentLoaded', () => {
  initProjects();
  initCarousel();
  setupAuthListeners();
  setupCreatePost();
  setupEditPost();
  setupCommentSystem();
});

// ================= SISTEMA DE PROJETOS ================= //
async function initProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '<p class="loading">Carregando projetos...</p>';
  
  try {
    const snapshot = await db.collection('projects')
      .orderBy('createdAt', 'desc')
      .get();
    
    projects = [];
    snapshot.forEach(doc => {
      const projectData = doc.data();
      projects.push({
        id: doc.id,
        ...projectData,
        author: projectData.author || "Autor desconhecido",
        tags: projectData.tags || []
      });
    });
    
    renderProjects();
    
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    projects = getFallbackProjects();
    renderProjects();
  }
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  
  const currentUser = auth.currentUser;

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const isAuthor = currentUser && currentUser.uid === project.authorId;
    const createdAt = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
    
    card.innerHTML = `
      <div class="project-header">
        <div class="project-avatar">${getInitials(project.author)}</div>
        <div>
          <h3>${project.title || "Projeto sem título"}</h3>
          <div class="project-author">Por ${project.author}</div>
          <div class="project-location">📍 ${project.location}</div>
        </div>
        ${isAuthor ? `
          <div class="project-actions-menu">
            <button class="menu-btn" onclick="toggleProjectMenu(this)">⋮</button>
            <div class="menu-options">
              <button class="delete-btn" onclick="event.stopPropagation(); deleteProject('${project.id}')">Excluir</button>
              <button class="edit-btn" onclick="event.stopPropagation(); openEditModal('${project.id}')">Editar</button>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="project-image">
        <img src="${project.image}" alt="${project.description}" onerror="this.src='https://via.placeholder.com/400x200?text=Imagem+não+disponível'">
      </div>
      <div class="project-description">${project.description}</div>
      <div class="project-actions">
        <button class="comment-btn" onclick="openComments('${project.id}', '${project.author}')">
          💬 Comentários
        </button>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="project-date">
        Postado em ${createdAt.toLocaleDateString('pt-BR')} às ${createdAt.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
      </div>
    `;
    grid.appendChild(card);
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getFallbackProjects() {
  return [
    {
      id: "1",
      title: "E-commerce Platform",
      author: "Maria Silva",
      location: "São Paulo, SP",
      image: "https://imgs.search.brave.com/bAM5fcnemhP2h-qykELl60oruXYNqSRqlwQZpkg-lRc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zZWph/ZWZpLmNvbS5ici9w/b3J0YWwvd3AtY29u/dGVudC91cGxvYWRz/LzIwMjQvMTAvcGFn/YW1lbnRvLW9ubGlu/ZS5wbmc",
      description: "Plataforma de e‑commerce com carrinho, pagamento integrado e painel administrativo.",
      tags: ["React", "Node.js", "MongoDB"],
      createdAt: new Date('2023-01-15').toISOString()
    },
    {
      id: "2",
      title: "Sales Dashboard",
      author: "João Santos",
      location: "Rio de Janeiro, RJ",
      image: "https://imgs.search.brave.com/ZYaopMwrlahUA2MEowLQU9wQz9YvvYIT8pzgRgjQcA4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9naXRo/dWIuY29tL3Bsb3Rs/eS9kYXNoLXNhbXBs/ZS1hcHBzL3Jhdy9t/YWluL2FwcHMvZGFz/aC1tYW51ZmFjdHVy/ZS1zcGMtZGFzaGJv/YXJkL2ltZy9zY3Jl/ZW5jYXB0dXJlMS5w/bmc",
      description: "Dashboard interativo para análise de vendas em tempo real usando Python e Plotly.",
      tags: ["Python", "Pandas", "Plotly"],
      createdAt: new Date('2023-02-20').toISOString()
    },
    {
      id: "3",
      title: "Task Manager App",
      author: "Ana Costa",
      location: "Belo Horizonte, MG",
      image: "https://images.unsplash.com/photo-1558655146-d09347e92766?fit=crop&w=800&q=80",
      description: "App mobile de gerenciamento de tarefas com autenticação e sincronização via Firebase.",
      tags: ["React Native", "Firebase", "UX/UI"],
      createdAt: new Date('2023-03-10').toISOString()
    }
  ];
}

// ================= FUNÇÕES DE GERENCIAMENTO DE PROJETOS ================= //
function toggleProjectMenu(button) {
  const menuContainer = button.closest('.project-actions-menu');
  menuContainer.classList.toggle('active');
  
  // Fecha outros menus abertos
  document.querySelectorAll('.project-actions-menu').forEach(menu => {
    if (menu !== menuContainer) {
      menu.classList.remove('active');
    }
  });
}

async function deleteProject(projectId) {
  if (!auth.currentUser) {
    alert('Você precisa estar logado para excluir projetos!');
    return;
  }
  
  if (!confirm('Tem certeza que deseja excluir este projeto permanentemente?')) {
    return;
  }

  try {
    // Verifica se o usuário é o autor
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (projectDoc.exists && projectDoc.data().authorId !== auth.currentUser.uid) {
      alert('Você não tem permissão para excluir este projeto!');
      return;
    }
    
    await db.collection('projects').doc(projectId).delete();
    
    // Remove do array local
    projects = projects.filter(project => project.id !== projectId);
    renderProjects();
    
    alert('Projeto excluído com sucesso!');
  } catch (error) {
    console.error("Erro ao excluir projeto:", error);
    alert('Erro ao excluir projeto. Tente novamente.');
  }
}

// ================= EDIÇÃO DE POSTS ================= //
function setupEditPost() {
  // Aguarda o DOM estar pronto e configura o listener
  setTimeout(() => {
    const editForm = document.getElementById('editPostForm');
    if (editForm) {
      // Remove listener anterior se existir
      editForm.removeEventListener('submit', handleEditSubmit);
      // Adiciona o novo listener
      editForm.addEventListener('submit', handleEditSubmit);
    }
  }, 100);
}

// Função separada para o handler do submit
function handleEditSubmit(e) {
  e.preventDefault();
  saveEditedPost();
}

async function saveEditedPost() {
  const user = auth.currentUser;
  if (!user) {
    alert('Você precisa estar logado para editar projetos!');
    return;
  }
  
  const projectId = document.getElementById('editProjectId').value;
  const title = document.getElementById('editPostTitle').value.trim();
  const location = document.getElementById('editPostLocation').value.trim();
  const image = document.getElementById('editPostImage').value.trim();
  const description = document.getElementById('editPostDescription').value.trim();
  const tags = document.getElementById('editPostTags').value.split(',').map(t => t.trim()).filter(t => t);
  
  // Validação básica
  if (!projectId || !title || !location || !image || !description || tags.length === 0) {
    alert('Preencha todos os campos corretamente!');
    return;
  }
  
  try {
    // Verifica se o usuário é o autor
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (projectDoc.exists && projectDoc.data().authorId !== user.uid) {
      alert('Você não tem permissão para editar este projeto!');
      return;
    }
    
    // Atualiza no Firestore
    await db.collection('projects').doc(projectId).update({
      title,
      location,
      image,
      description,
      tags,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Atualiza localmente
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex] = {
        ...projects[projectIndex],
        title,
        location,
        image,
        description,
        tags
      };
    }
    
    // Re-renderiza os projetos
    renderProjects();
    
    // Fecha o modal
    closeEditPostModal();
    alert('Projeto atualizado com sucesso!');
    
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    alert('Erro ao atualizar projeto. Tente novamente.');
  }
}

function openEditModal(projectId) {
  const user = auth.currentUser;
  if (!user) {
    alert('Você precisa estar logado para editar projetos!');
    openAuthModal();
    return;
  }
  
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    alert('Projeto não encontrado!');
    return;
  }
  
  // Verifica se o usuário é o autor
  if (project.authorId !== user.uid) {
    alert('Você não tem permissão para editar este projeto!');
    return;
  }
  
  // Preenche o formulário
  document.getElementById('editPostTitle').value = project.title || '';
  document.getElementById('editPostLocation').value = project.location || '';
  document.getElementById('editPostImage').value = project.image || '';
  document.getElementById('editPostDescription').value = project.description || '';
  document.getElementById('editPostTags').value = project.tags?.join(', ') || '';
  document.getElementById('editProjectId').value = projectId;
  
  // Abre o modal
  document.getElementById('editPostModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeEditPostModal() {
  document.getElementById('editPostModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// ================= SISTEMA DE COMENTÁRIOS ================= //
function setupCommentSystem() {
  // Configuração básica do sistema de comentários
}

async function openComments(projectId, author) {
  if (!auth.currentUser) {
    alert('Você precisa estar logado para ver comentários!');
    openAuthModal();
    return;
  }
  
  currentProjectId = projectId;
  const modal = document.getElementById('commentsModal');
  document.getElementById('modalTitle').textContent = `Comentários - ${author}`;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  await loadComments(projectId);
}

async function loadComments(projectId) {
  const commentsList = document.getElementById('commentsList');
  commentsList.innerHTML = '<p class="loading-comments">Carregando comentários...</p>';

  try {
    const snapshot = await db.collection('comments')
      .where('projectId', '==', projectId)
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
      
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `
        <div class="comment-header">
          <span class="comment-author">${comment.authorName}</span>
          ${currentUser?.uid === comment.authorId ? 
            `<button class="delete-comment-btn" onclick="deleteComment('${doc.id}')">🗑️</button>` : ''}
        </div>
        <p class="comment-text">${comment.text}</p>
        <small class="comment-date">${date}</small>
      `;
      commentsList.appendChild(commentElement);
    });
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
    commentsList.innerHTML = '<p class="error-comments">Erro ao carregar comentários.</p>';
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
      projectId: currentProjectId,
      authorId: user.uid,
      authorName: user.displayName || user.email.split('@')[0],
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('commentText').value = '';
    await loadComments(currentProjectId);
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
  document.body.style.overflow = 'auto';
}

// ================= AUTENTICAÇÃO ================= //
function setupAuthListeners() {
  auth.onAuthStateChanged(user => {
    updateUI(user);
    renderProjects();
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

function updateUI(user) {
  const loginBtn = document.getElementById('loginBtn');
  const userDropdown = document.getElementById('userDropdown');
  const createPostBtn = document.getElementById('createPostBtn');
  
  if (user) {
    loginBtn.style.display = 'none';
    userDropdown.style.display = 'block';
    createPostBtn.style.display = 'flex';
    document.getElementById('userNameDisplay').textContent = user.displayName || user.email.split('@')[0];
  } else {
    loginBtn.style.display = 'flex';
    userDropdown.style.display = 'none';
    createPostBtn.style.display = 'none';
  }
}

function logout() {
  auth.signOut().then(() => {
    closeModal();
    closeAuthModal();
    closeCreatePostModal();
    closeEditPostModal();
    document.getElementById('dropdownContent').style.display = 'none';
  }).catch(error => {
    console.error("Erro ao fazer logout:", error);
  });
}

function toggleUserMenu() {
  const dropdown = document.getElementById('dropdownContent');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// ================= CRIAÇÃO DE POSTS ================= //
function setupCreatePost() {
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) {
        alert('Você precisa estar logado para criar um post!');
        return;
      }

      const title = document.getElementById('postTitle').value.trim();
      const location = document.getElementById('postLocation').value.trim();
      const image = document.getElementById('postImage').value.trim();
      const description = document.getElementById('postDescription').value.trim();
      const tags = document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(t => t);
      
      if (!title || !location || !image || !description || tags.length === 0) {
        alert('Preencha todos os campos corretamente!');
        return;
      }
      
      try {
        const docRef = await db.collection('projects').add({
          title: title,
          author: user.displayName || user.email.split('@')[0],
          authorId: user.uid,
          location: location,
          image: image,
          description: description,
          tags: tags,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Adiciona ao array local
        projects.unshift({
          id: docRef.id,
          title: title,
          author: user.displayName || user.email.split('@')[0],
          authorId: user.uid,
          location: location,
          image: image,
          description: description,
          tags: tags,
          createdAt: new Date().toISOString()
        });
        
        renderProjects();
        postForm.reset();
        closeCreatePostModal();
        
      } catch (error) {
        console.error('Erro ao criar projeto:', error);
        alert('Erro ao criar projeto. Tente novamente.');
      }
    });
  }
}

function openCreatePostModal() {
  if (!auth.currentUser) {
    alert('Você precisa estar logado para criar um post!');
    openAuthModal();
    return;
  }
  document.getElementById('createPostModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCreatePostModal() {
  document.getElementById('createPostModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// ================= CARROSSEL ================= //
function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll('.nav-dot'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!track || slides.length === 0) return;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      updateCarousel();
    });
  });

  // Auto-avanço
  setInterval(nextSlide, 5000);
}

// ================= MODAIS DE AUTENTICAÇÃO ================= //
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

// ================= EVENTOS GLOBAIS ================= //
window.addEventListener('click', (e) => {
  // Fecha modais ao clicar fora
  if (e.target.classList.contains('modal')) {
    closeModal();
    closeAuthModal();
    closeCreatePostModal();
    closeEditPostModal();
  }
  
  // Fecha menus dropdown ao clicar fora
  if (!e.target.closest('.user-dropdown')) {
    document.getElementById('dropdownContent').style.display = 'none';
  }
  
  // Fecha menus de projeto ao clicar fora
  if (!e.target.closest('.project-actions-menu')) {
    document.querySelectorAll('.project-actions-menu').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAuthModal();
    closeCreatePostModal();
    closeEditPostModal();
  }
});

// ================= EXPORT FUNCTIONS ================= //
window.openComments = openComments;
window.addComment = addComment;
window.deleteComment = deleteComment;
window.closeModal = closeModal;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.showRegister = showRegister;
window.showLogin = showLogin;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.deleteProject = deleteProject;
window.openEditModal = openEditModal;
window.toggleProjectMenu = toggleProjectMenu;
window.closeEditPostModal = closeEditPostModal;
window.saveEditedPost = saveEditedPost;