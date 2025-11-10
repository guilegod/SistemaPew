document.addEventListener("DOMContentLoaded", () => {
  const setor = localStorage.getItem("usuarioSetor");
  const pagina = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const paginasLiberadasSemLogin = ["login.html", "scanner.html", "bobina.html"];

  if (!setor && !paginasLiberadasSemLogin.includes(pagina)) {
    window.location.href = "login.html";
    return;
  }
  if (paginasLiberadasSemLogin.includes(pagina)) return; // não aplica regras nessas páginas

  // Rótulo do setor no logo
  const logoTxt = document.querySelector(".logo-text");
  if (logoTxt) logoTxt.textContent = `Bundy System (${setor})`;

  // Aplica permissões por atributo data-setor="Producao,Qualidade"
  document.querySelectorAll("[data-setor]").forEach(el => {
    const permissoes = el.dataset.setor.split(",").map(s => s.trim());
    el.style.display = permissoes.includes(setor) ? "" : "none";
  });

  // Botão para trocar setor
  const menu = document.querySelector(".menu ul");
  if (menu && !document.getElementById("trocarSetor")) {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" id="trocarSetor">🔁 Trocar Setor</a>`;
    menu.appendChild(li);
  }
  document.addEventListener("click", (e) => {
    if (e.target.id === "trocarSetor") {
      localStorage.removeItem("usuarioSetor");
      window.location.href = "login.html";
    }
  });
});
