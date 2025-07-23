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

// ================= INICIALIZAÇÃO DA PÁGINA ================= //
document.addEventListener('DOMContentLoaded', () => {
  initProjects();
  initCarousel();
  setupAuthListeners();
  setupCreatePost();
  setupEditPost();
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
        // Garante que o nome do autor está presente
        author: projectData.author || "Autor desconhecido"
      });
    });
    
    renderProjects();
    
  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    grid.innerHTML = '<p class="error">Erro ao carregar projetos. Tente recarregar a página.</p>';
  }
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const currentUser = auth.currentUser;
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
              <button onclick="deleteProject('${project.id}')">Excluir</button>
              <button onclick="openEditModal('${project.id}')">Editar</button>
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
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// ================= FUNÇÕES DE GERENCIAMENTO DE PROJETOS ================= //
function toggleProjectMenu(button) {
  const menuOptions = button.nextElementSibling;
  menuOptions.style.display = menuOptions.style.display === 'block' ? 'none' : 'block';
}

async function deleteProject(projectId) {
  if (!confirm('Tem certeza que deseja excluir este projeto permanentemente?')) {
    return;
  }

  try {
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

function openEditModal(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('editPostTitle').value = project.title || '';
  document.getElementById('editPostLocation').value = project.location;
  document.getElementById('editPostImage').value = project.image;
  document.getElementById('editPostDescription').value = project.description;
  document.getElementById('editPostTags').value = project.tags.join(', ');
  document.getElementById('editProjectId').value = projectId;
  
  document.getElementById('editPostModal').style.display = 'block';
}

// ================= SISTEMA DE COMENTÁRIOS ================= //
async function openComments(projectId, author) {
  currentProjectId = projectId;
  const modal = document.getElementById('commentsModal');
  document.getElementById('modalTitle').textContent = `Comentários - ${author}`;
  modal.style.display = 'block';
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
  auth.onAuthStateChanged(user => {
    updateLoginButton(user);
    renderProjects();
  });

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
  const createPostBtn = document.getElementById('createPostBtn');
  
  if (user) {
    loginBtn.style.display = 'none';
    userDropdown.style.display = 'block';
    createPostBtn.style.display = 'block';
    document.getElementById('userNameDisplay').textContent = user.displayName || user.email.split('@')[0];
  } else {
    loginBtn.style.display = 'block';
    userDropdown.style.display = 'none';
    createPostBtn.style.display = 'none';
  }
}

function logout() {
  auth.signOut().then(() => {
    closeModal();
    closeAuthModal();
    closeCreatePostModal();
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
      
      // Adiciona ao array local com o ID do Firestore
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

// ================= EDIÇÃO DE POSTS ================= //
function setupEditPost() {
  const editForm = document.getElementById('editPostForm');
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('editProjectId').value;
    const title = document.getElementById('editPostTitle').value.trim();
    const location = document.getElementById('editPostLocation').value.trim();
    const image = document.getElementById('editPostImage').value.trim();
    const description = document.getElementById('editPostDescription').value.trim();
    const tags = document.getElementById('editPostTags').value.split(',').map(t => t.trim()).filter(t => t);
    
    if (!projectId || !title || !location || !image || !description || tags.length === 0) {
      alert('Preencha todos os campos corretamente!');
      return;
    }
    
    try {
      await db.collection('projects').doc(projectId).update({
        title: title,
        location: location,
        image: image,
        description: description,
        tags: tags,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Atualiza o array local
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          title: title,
          location: location,
          image: image,
          description: description,
          tags: tags
        };
      }
      
      renderProjects();
      closeEditPostModal();
      
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      alert('Erro ao atualizar projeto. Tente novamente.');
    }
  });
}

function closeEditPostModal() {
  document.getElementById('editPostModal').style.display = 'none';
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
  let currentIndex = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  document.getElementById('nextBtn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }, 5000);
}

// ================= EVENTOS GLOBAIS ================= //
window.addEventListener('click', (e) => {
  if (e.target === document.getElementById('commentsModal')) closeModal();
  if (e.target === document.getElementById('authModal')) closeAuthModal();
  if (e.target === document.getElementById('createPostModal')) closeCreatePostModal();
  if (e.target === document.getElementById('editPostModal')) closeEditPostModal();
  if (!e.target.closest('.user-dropdown')) {
    document.getElementById('dropdownContent').style.display = 'none';
  }
  
  document.querySelectorAll('.menu-options').forEach(menu => {
    if (!e.target.closest('.project-actions-menu')) {
      menu.style.display = 'none';
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeAuthModal();
    closeCreatePostModal();
    closeEditPostModal();
  }
});

// ================= FUNÇÕES GLOBAIS ================= //
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