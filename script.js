// 🔧 SUA CONFIGURAÇÃO DO FIREBASE:
const firebaseConfig = {
  apiKey: "AIzaSyCs-PeIHCTX1AUqlVEOGFKQRu4sPGba1ls",
  authDomain: "codepitch1.firebaseapp.com",
  projectId: "codepitch1",
  storageBucket: "codepitch1.firebasestorage.app",
  messagingSenderId: "393929936980",
  appId: "1:393929936980:web:cd5b056d7add40732f1dc1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function () {
  const formsContainer = document.querySelector('.forms-container');
  const signupBtn = document.querySelector('.signup-btn');
  const loginBtn = document.querySelector('.login-btn');

  formsContainer.style.transform = 'translateX(0)';

  function resetAnimations(sectionClass) {
    const elements = document.querySelectorAll(`.${sectionClass} .animation`);
    elements.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = null;
    });
  }

  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formsContainer.style.transform = 'translateX(-50%)';
    resetAnimations('register-section');
  });

  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    formsContainer.style.transform = 'translateX(0)';
    resetAnimations('login-section');
  });

  // REGISTRO
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = registerForm.name.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        return userCredential.user.updateProfile({ displayName: name });
      })
      .then(() => {
        alert("Cadastro realizado com sucesso!");
        loginBtn.click();
      })
      .catch(error => {
        alert("Erro no cadastro: " + error.message);
      });
  });

  // LOGIN
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = 'start.html';
      })
      .catch(error => {
        alert("Erro no login: " + error.message);
      });
  });
});
