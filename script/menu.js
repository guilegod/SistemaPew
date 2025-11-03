document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenu");
  const sidebar = document.getElementById("sidebar");

  // Se não existir na página, sai sem erro
  if (!toggleBtn || !sidebar) {
    console.warn("⚠️ menu.js: elementos não encontrados nesta página.");
    return;
  }

  // Alterna o estado do menu
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
    toggleBtn.classList.toggle("active");

    // Adiciona efeito de escurecimento no fundo (mobile)
    if (sidebar.classList.contains("active")) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  });

  // Fecha o menu ao clicar fora (somente mobile)
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      toggleBtn.classList.remove("active");
      document.body.classList.remove("menu-open");
    }
  });

  // Garante que o menu fique visível no desktop
  function ajustarMenuPorTamanho() {
    if (window.innerWidth > 768) {
      sidebar.classList.add("active");
      document.body.classList.remove("menu-open");
    } else {
      sidebar.classList.remove("active");
    }
  }

  window.addEventListener("resize", ajustarMenuPorTamanho);
  ajustarMenuPorTamanho();
});
