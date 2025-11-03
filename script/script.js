const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleMenu');

// Quando clicar no botão
toggleBtn.addEventListener('click', () => {
  // Alterna a classe 'active' no botão (para animar as barras)
  toggleBtn.classList.toggle('active');

  // Detecta o tipo de tela (desktop x mobile)
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('active'); // aparece por cima (mobile)
  } else {
    sidebar.classList.toggle('hidden'); // recolhe (desktop)
  }
});
