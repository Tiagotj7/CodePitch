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
            loadPostsFromFirestore();
            setupAuthListeners();
        });

        // ================= SISTEMA DE POSTS ================= //
        async function loadPostsFromFirestore() {
            try {
                const grid = document.getElementById('projectsGrid');
                grid.innerHTML = '<p class="loading">Carregando projetos...</p>';
                
                const snapshot = await db.collection('projects')
                    .orderBy('createdAt', 'desc')
                    .get();

                if (snapshot.empty) {
                    grid.innerHTML = '<p class="no-projects">Nenhum projeto encontrado.</p>';
                    return;
                }
                
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
                
                refreshProjectsGrid();
                
            } catch (error) {
                console.error("Erro ao carregar posts:", error);
                projects = [...getFallbackProjects()];
                refreshProjectsGrid();
            }
        }

        function refreshProjectsGrid() {
            const grid = document.getElementById('projectsGrid');
            grid.innerHTML = '';

            const currentUser = auth.currentUser;

            projects.forEach(project => {
                const card = document.createElement('div');
                card.className = 'project-card';
                
                const createdAt = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
                const isAuthor = currentUser && currentUser.uid === project.authorId;
                
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
                                    <button onclick="event.stopPropagation(); deletePost('${project.id}')">Excluir</button>
                                    <button onclick="event.stopPropagation(); openEditModal('${project.id}')">Editar</button>
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
                            ${(project.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
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

        // ================= FUNÇÕES DO MENU DE PROJETO ================= //
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

        // ================= SISTEMA DE COMENTÁRIOS ================= //
        async function openComments(projectId, author) {
            if (!auth.currentUser) {
                alert('Você precisa estar logado para ver comentários!');
                return;
            }
            
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
                commentsList.innerHTML = '<p class="error-comments">Erro ao carregar comentários. Recarregue a página.</p>';
            }
        }

        async function addComment() {
            const user = auth.currentUser;
            if (!user) {
                alert('Você precisa estar logado para comentar!');
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

        // ================= GERENCIAMENTO DE POSTS ================= //
        async function deletePost(postId) {
            if (!auth.currentUser) {
                alert('Você precisa estar logado para excluir projetos!');
                return;
            }
            
            if (!confirm('Tem certeza que deseja excluir este projeto permanentemente?')) {
                return;
            }

            try {
                await db.collection('projects').doc(postId).delete();
                
                // Remove do array local
                projects = projects.filter(project => project.id !== postId);
                refreshProjectsGrid();
                
                alert('Projeto excluído com sucesso!');
            } catch (error) {
                console.error("Erro ao excluir projeto:", error);
                alert('Erro ao excluir projeto. Tente novamente.');
            }
        }

        function openEditModal(projectId) {
            if (!auth.currentUser) {
                alert('Você precisa estar logado para editar projetos!');
                return;
            }
            
            const project = projects.find(p => p.id === projectId);
            if (!project) return;

            // Preenche o modal de edição
            document.getElementById('editPostTitle').value = project.title || '';
            document.getElementById('editPostLocation').value = project.location;
            document.getElementById('editPostImage').value = project.image;
            document.getElementById('editPostDescription').value = project.description;
            document.getElementById('editPostTags').value = project.tags?.join(', ') || '';
            document.getElementById('editProjectId').value = projectId;
            
            // Abre o modal de edição
            document.getElementById('editPostModal').style.display = 'block';
        }

        async function saveEditedPost() {
            const projectId = document.getElementById('editProjectId').value;
            const title = document.getElementById('editPostTitle').value;
            const location = document.getElementById('editPostLocation').value;
            const image = document.getElementById('editPostImage').value;
            const description = document.getElementById('editPostDescription').value;
            const tags = document.getElementById('editPostTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

            try {
                await db.collection('projects').doc(projectId).update({
                    title,
                    location,
                    image,
                    description,
                    tags,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                closeModal();
                await loadPostsFromFirestore();
                alert('Projeto atualizado com sucesso!');
            } catch (error) {
                console.error("Erro ao atualizar projeto:", error);
                alert('Erro ao atualizar projeto. Tente novamente.');
            }
        }

        // ================= AUTENTICAÇÃO ================= //
        function setupAuthListeners() {
            auth.onAuthStateChanged(user => {
                updateUI(user);
                refreshProjectsGrid();
            });
        }

        function updateUI(user) {
            const loginBtn = document.getElementById('loginBtn');
            const userDropdown = document.getElementById('userDropdown');

            if (user) {
                loginBtn.style.display = 'none';
                userDropdown.style.display = 'block';
                document.getElementById('userNameDisplay').textContent = user.displayName || user.email.split('@')[0];
            } else {
                loginBtn.style.display = 'flex';
                userDropdown.style.display = 'none';
            }
        }

        function logout() {
            auth.signOut();
        }

        function toggleUserMenu() {
            const dropdown = document.getElementById('dropdownContent');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }

        // ================= FUNÇÕES GERAIS ================= //
        function closeModal() {
            document.getElementById('commentsModal').style.display = 'none';
            document.getElementById('editPostModal').style.display = 'none';
        }

        // ================= EVENTOS GLOBAIS ================= //
        window.addEventListener('click', (e) => {
            // Fecha menu do usuário
            if (!e.target.closest('.user-dropdown')) {
                document.getElementById('dropdownContent').style.display = 'none';
            }
            
            // Fecha menus de projeto
            if (!e.target.closest('.project-actions-menu')) {
                document.querySelectorAll('.project-actions-menu').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
            
            // Fecha modais
            if (e.target.classList.contains('modal')) {
                closeModal();
            }
        });

        // ================= EXPORT FUNCTIONS ================= //
        window.openComments = openComments;
        window.addComment = addComment;
        window.deleteComment = deleteComment;
        window.closeModal = closeModal;
        window.logout = logout;
        window.toggleUserMenu = toggleUserMenu;
        window.deletePost = deletePost;
        window.openEditModal = openEditModal;
        window.toggleProjectMenu = toggleProjectMenu;
        window.saveEditedPost = saveEditedPost;
