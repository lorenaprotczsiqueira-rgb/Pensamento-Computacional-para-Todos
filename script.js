document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.documentElement;
  const btnAumentar = document.getElementById("btn-aumentar");
  const btnDiminuir = document.getElementById("btn-diminuir");
  const btnTema = document.getElementById("btn-tema");
  const btnVoz = document.getElementById("btn-voz");
  const btnSomFoco = document.getElementById("btn-som-foco");
  const btnTopo = document.getElementById("btn-topo");
  const btnQuiz = document.getElementById("btn-quiz");

  let currentFontSize = 16;
  let audioFocoAtivo = true;

  // 🔊 GERADOR DE BIPS SONOROS (Sem arquivos externos de áudio)
  function tocarBeep(frequencia = 440, tipo = 'sine', duracao = 0.1) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = tipo;
      osc.frequency.value = frequencia;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duracao);
    } catch (e) {
      // Navegadores podem bloquear áudio antes da primeira interação
    }
  }

  // 🗣️ LEITOR DE SÍNTESE DE VOZ (Lê textos específicos)
  function falarTexto(texto) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Para leituras anteriores
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = "pt-BR";
      utterance.rate = 1.1; // Velocidade ajustada para fluidez
      window.speechSynthesis.speak(utterance);
    }
  }

  // 1. Controle do Tamanho da Fonte
  btnAumentar.addEventListener("click", () => {
    if (currentFontSize < 24) {
      currentFontSize += 2;
      rootElement.style.setProperty("--font-size", `${currentFontSize}px`);
      tocarBeep(600, 'triangle');
      falarTexto("Fonte aumentada");
    }
  });

  btnDiminuir.addEventListener("click", () => {
    if (currentFontSize > 12) {
      currentFontSize -= 2;
      rootElement.style.setProperty("--font-size", `${currentFontSize}px`);
      tocarBeep(300, 'triangle');
      falarTexto("Fonte diminuída");
    }
  });

  // 2. Alternar Tema (Modo Escuro / Claro)
  btnTema.addEventListener("click", () => {
    const isDark = rootElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      rootElement.removeAttribute("data-theme");
      btnTema.textContent = "Modo Escuro 🌙";
      falarTexto("Modo claro ativado");
    } else {
      rootElement.setAttribute("data-theme", "dark");
      btnTema.textContent = "Modo Claro ☀️";
      falarTexto("Modo escuro ativado");
    }
    tocarBeep(523.25, 'sine', 0.15);
  });

  // 3. Alternar Áudio ao Focar / Passar Mouse
  btnSomFoco.addEventListener("click", () => {
    audioFocoAtivo = !audioFocoAtivo;
    if (audioFocoAtivo) {
      btnSomFoco.textContent = "Áudio ao Focar: ON 🎧";
      falarTexto("Áudio ao focar ativado");
    } else {
      btnSomFoco.textContent = "Áudio ao Focar: OFF 🔇";
      falarTexto("Áudio ao focar desativado");
    }
    tocarBeep(400, 'square', 0.1);
  });

  // 4. Leitura Completa da Página
  let lendoPagina = false;
  btnVoz.addEventListener("click", () => {
    if ('speechSynthesis' in window) {
      if (lendoPagina) {
        window.speechSynthesis.cancel();
        lendoPagina = false;
        btnVoz.textContent = "Ouvir Página 🔊";
      } else {
        const texto = document.getElementById("conteudo-principal").innerText;
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = "pt-BR";
        utterance.onend = () => {
          lendoPagina = false;
          btnVoz.textContent = "Ouvir Página 🔊";
        };
        window.speechSynthesis.speak(utterance);
        lendoPagina = true;
        btnVoz.textContent = "Parar Leitura ⏹️";
        tocarBeep(800, 'sine', 0.2);
      }
    }
  });

  // 5. Feedback Sonoro ao Focar / Passar o Mouse nos Elementos
  const elementosInterativos = document.querySelectorAll("a, button, section[tabindex='0'], input[type='radio']");
  elementosInterativos.forEach(elem => {
    elem.addEventListener("focus", () => {
      if (!audioFocoAtivo) return;
      tocarBeep(440, 'sine', 0.05); // Bip suave ao focar
      
      // Lê o rótulo do botão, link ou o título da seção focada
      const textoParaLer = elem.getAttribute("aria-label") || elem.innerText || elem.querySelector("h2")?.innerText;
      if (textoParaLer && !lendoPagina) {
        falarTexto(textoParaLer);
      }
    });
  });

  // 6. Botão Voltar ao Topo
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btnTopo.style.display = "block";
    } else {
      btnTopo.style.display = "none";
    }
  });

  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    tocarBeep(700, 'sine', 0.15);
    falarTexto("Voltando ao topo");
  });

  // 7. Lógica do Quiz com Feedback Sonoro (Bip grave para erro, agudo para acerto)
  btnQuiz.addEventListener("click", () => {
    const opcoes = document.getElementsByName("q1");
    const resultado = document.getElementById("quiz-resultado");
    let selecionado = "";

    for (const opcao of opcoes) {
      if (opcao.checked) {
        selecionado = opcao.value;
        break;
      }
    }

    if (selecionado === "B") {
      resultado.textContent = "✅ Correto! A Abstração é o pilar que filtra os detalhes irrelevantes.";
      resultado.style.color = "green";
      tocarBeep(880, 'sine', 0.2); // Bip agudo de vitória
      falarTexto("Resposta correta! A Abstração é o pilar que filtra os detalhes irrelevantes.");
    } else if (selecionado === "") {
      resultado.textContent = "⚠️ Por favor, selecione uma opção antes de verificar.";
      resultado.style.color = "orange";
      tocarBeep(350, 'sawtooth', 0.15);
      falarTexto("Por favor, selecione uma opção antes de verificar.");
    } else {
      resultado.textContent = "❌ Incorreto. Tente novamente!";
      resultado.style.color = "red";
      tocarBeep(220, 'sawtooth', 0.25); // Bip grave de erro
      falarTexto("Resposta incorreta. Tente novamente.");
    }
  });
});
