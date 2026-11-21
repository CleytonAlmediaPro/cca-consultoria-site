/* Site Cinematográfico · © 2026 Labrego IA · LBG-SC-2026-v1
   Abertura em cena 3D própria (sem vídeo), movimento, WhatsApp e formulário. */
(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;
  const ponteiroFino = matchMedia("(pointer: fine)").matches;

  console.log("%cSite Cinematográfico · Labrego IA", "font:600 12px sans-serif;color:#e4652b",
    `\nlabregoia.com.br · ${S.assinatura || ""}`);

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const suave = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ── Abertura: cacos de vidro e linhas de luz que montam o símbolo da CCA ── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas) {
    const ctx = canvas.getContext("2d");
    const momentos = [...cine.querySelectorAll(".momento")];
    const pctEl = cine.querySelector(".hud-pct");

    // Gerador pseudoaleatório fixo: a cena é sempre a mesma
    let semente = 7;
    const rnd = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;

    // Triângulo retângulo (A topo, B ângulo reto, C direita) subdividido em cacos
    const cacos = [];
    const subdividir = (A, B, C, n, z, cores, alfa) => {
      const pt = (u, v) => [B[0] + u * (C[0] - B[0]) + v * (A[0] - B[0]), B[1] + u * (C[1] - B[1]) + v * (A[1] - B[1])];
      for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) {
        const tris = [[pt(i / n, j / n), pt((i + 1) / n, j / n), pt(i / n, (j + 1) / n)]];
        if (i + j < n - 1) tris.push([pt((i + 1) / n, j / n), pt((i + 1) / n, (j + 1) / n), pt(i / n, (j + 1) / n)]);
        for (const t of tris) {
          const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
          const ang = rnd() * Math.PI * 2, dist = 2.2 + rnd() * 4.2;
          cacos.push({
            alvo: [cx, cy, z],
            local: t.map((p) => [(p[0] - cx) * 0.93, (p[1] - cy) * 0.93, 0]),
            inicio: [cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist * 0.7, z - 4 + rnd() * 7],
            giro: [(rnd() - 0.5) * 7, (rnd() - 0.5) * 7, (rnd() - 0.5) * 7],
            atraso: rnd(), fase: rnd() * 6.28,
            cor: cores[Math.floor(rnd() * cores.length)], alfa,
          });
        }
      }
    };
    subdividir([-0.66, 0.30], [-0.66, -0.66], [0.22, -0.66], 6, -0.16, ["#c4ced3", "#a9b5bb", "#8d9ba2"], 0.72);
    subdividir([-0.44, 0.64], [-0.44, -0.44], [0.62, -0.44], 7, 0, ["#e4652b", "#f07a3c", "#d0561f", "#ff8a4a"], 0.9);
    subdividir([0.28, 0.62], [0.28, 0.30], [0.60, 0.30], 3, 0.06, ["#e4652b", "#ff8a4a"], 0.92);
    for (const c of cacos) c.pares = [Math.floor(rnd() * cacos.length), Math.floor(rnd() * cacos.length)];

    const poeira = Array.from({ length: celular ? 110 : 220 }, () => ({
      p: [(rnd() - 0.5) * 14, (rnd() - 0.5) * 9, (rnd() - 0.5) * 14], v: 0.02 + rnd() * 0.06, f: rnd() * 6.28,
    }));

    let W = 0, H = 0, dpr = 1, alvo = 0, atual = 0, t0 = performance.now(), visivel = true;
    let mx = 0, my = 0, mxs = 0, mys = 0;
    const ajustar = () => {
      dpr = Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 1.75);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Câmera
    let cam = { yaw: 0, pitch: 0, dist: 6, f: 600, cx: 0, cy: 0 };
    const projetar = (x, y, z) => {
      const cy_ = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      let x1 = x * cy_ + z * sy, z1 = -x * sy + z * cy_;
      let y1 = y * cp - z1 * sp; z1 = y * sp + z1 * cp;
      const zc = cam.dist - z1;
      return [cam.cx + (x1 * cam.f) / zc, cam.cy - (y1 * cam.f) / zc, zc, x1, y1];
    };
    const girar = (v, a, b, c) => {
      let [x, y, z] = v;
      let t = y * Math.cos(a) - z * Math.sin(a); z = y * Math.sin(a) + z * Math.cos(a); y = t;
      t = x * Math.cos(b) + z * Math.sin(b); z = -x * Math.sin(b) + z * Math.cos(b); x = t;
      t = x * Math.cos(c) - y * Math.sin(c); y = x * Math.sin(c) + y * Math.cos(c); x = t;
      return [x, y, z];
    };

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      return clamp(-r.top / ((cine.offsetHeight - innerHeight) || 1));
    };
    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
      if (pctEl) pctEl.textContent = String(Math.round(suave(0.05, 0.92, p) * 100)).padStart(3, "0");
    };

    const linhaChao = (a, b, alfa) => {
      const pa = projetar(...a), pb = projetar(...b);
      if (pa[2] < 0.3 || pb[2] < 0.3) return;
      ctx.strokeStyle = `rgba(111,223,192,${alfa})`;
      ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
    };

    function desenhar(p, tempo) {
      const e = easeIO(p);
      cam.f = celular ? W * 1.25 : Math.min(W, H * 1.25) * 0.82;
      cam.cx = W / 2; cam.cy = H * (celular ? 0.38 : 0.44);
      cam.yaw = lerp(0.95, 0.08, e) + mxs * 0.18 + Math.sin(tempo * 0.25) * 0.04;
      cam.pitch = lerp(-0.42, -0.04, e) + mys * 0.1;
      cam.dist = lerp(7.2, 3.5, e);

      ctx.clearRect(0, 0, W, H);
      // Halo de fundo
      const halo = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, Math.max(W, H) * 0.7);
      halo.addColorStop(0, `rgba(23,58,80,${0.55 + 0.25 * e})`);
      halo.addColorStop(1, "rgba(8,26,36,0)");
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

      // Chão em grade
      ctx.lineWidth = 1;
      const yc = -1.7, desl = (tempo * 0.35) % 0.8;
      for (let i = -10; i <= 10; i++) linhaChao([i * 0.8, yc, -9], [i * 0.8, yc, 7], 0.07);
      for (let k = 0; k < 20; k++) { const z = -9 + k * 0.8 + desl; linhaChao([-8, yc, z], [8, yc, z], 0.06 * (1 - Math.abs(z) / 10)); }

      // Poeira
      ctx.globalCompositeOperation = "lighter";
      for (const d of poeira) {
        const y = d.p[1] + Math.sin(tempo * d.v * 6 + d.f) * 0.15;
        const q = projetar(d.p[0], y, d.p[2]);
        if (q[2] < 0.3) continue;
        const r = Math.max(0.4, 2.2 / q[2]);
        ctx.fillStyle = `rgba(160,230,215,${clamp(0.5 / q[2])})`;
        ctx.fillRect(q[0], q[1], r, r);
      }

      // Posição dos cacos
      const montado = [];
      for (const c of cacos) {
        const t = easeIO(clamp((p - 0.06 - c.atraso * 0.32) / 0.5));
        const flutua = (1 - t) * 0.12;
        const pos = [
          lerp(c.inicio[0], c.alvo[0], t),
          lerp(c.inicio[1], c.alvo[1], t) + Math.sin(tempo * 0.8 + c.fase) * flutua,
          lerp(c.inicio[2], c.alvo[2], t),
        ];
        const k = 1 - t, a = c.giro[0] * k + Math.sin(tempo * 0.5 + c.fase) * 0.15 * k;
        const vs = c.local.map((v) => { const g = girar(v, a, c.giro[1] * k, c.giro[2] * k); return projetar(pos[0] + g[0], pos[1] + g[1], pos[2] + g[2]); });
        const centro = projetar(...pos);
        montado.push({ c, vs, centro, t, z: centro[2] });
      }

      // Linhas de luz entre os cacos (fase do meio)
      const janela = suave(0.1, 0.32, p) * (1 - suave(0.72, 0.94, p));
      if (janela > 0.01) {
        ctx.lineWidth = 1;
        for (let i = 0; i < montado.length; i++) {
          const a = montado[i];
          for (const j of a.c.pares) {
            const b = montado[j];
            if (a.z < 0.3 || b.z < 0.3) continue;
            const g = ctx.createLinearGradient(a.centro[0], a.centro[1], b.centro[0], b.centro[1]);
            g.addColorStop(0, `rgba(228,101,43,${0.28 * janela})`);
            g.addColorStop(1, `rgba(111,223,192,${0.22 * janela})`);
            ctx.strokeStyle = g;
            ctx.beginPath(); ctx.moveTo(a.centro[0], a.centro[1]); ctx.lineTo(b.centro[0], b.centro[1]); ctx.stroke();
            // pulso de dado correndo pela linha
            const u = (tempo * 0.35 + a.c.fase) % 1;
            ctx.fillStyle = `rgba(255,200,160,${0.8 * janela})`;
            ctx.fillRect(lerp(a.centro[0], b.centro[0], u) - 1, lerp(a.centro[1], b.centro[1], u) - 1, 2, 2);
          }
        }
      }
      ctx.globalCompositeOperation = "source-over";

      // Anel (o círculo do símbolo) se desenhando no fim
      const anel = suave(0.62, 0.95, p);
      if (anel > 0) {
        const N = 120, R = 1.12, zr = -0.3, fim = Math.floor(N * anel);
        const pts = [];
        for (let i = 0; i <= fim; i++) { const ang = Math.PI * 0.5 + (i / N) * Math.PI * 2; pts.push([projetar(Math.cos(ang) * R, Math.sin(ang) * R, zr), ang]); }
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(111,223,192,${0.35 * anel})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); pts.forEach(([q], i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
        // crescente verde (lado esquerdo/baixo, como no logo)
        for (const [larg, alfa] of [[14, 0.12], [5, 0.85]]) {
          ctx.strokeStyle = `rgba(143,161,82,${alfa * anel})`; ctx.lineWidth = larg * (cam.f / 900);
          ctx.beginPath(); let on = false;
          for (const [q, ang] of pts) {
            const a = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            if (a > Math.PI * 0.62 && a < Math.PI * 1.75) { on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true; } else on = false;
          }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        // brilho quente atrás da estrutura montada
        const c0 = projetar(0, 0, -0.4), rr = (cam.f * 1.3) / c0[2];
        const gl = ctx.createRadialGradient(c0[0], c0[1], 0, c0[0], c0[1], rr);
        gl.addColorStop(0, `rgba(228,101,43,${0.16 * anel})`); gl.addColorStop(1, "rgba(228,101,43,0)");
        ctx.fillStyle = gl; ctx.fillRect(c0[0] - rr, c0[1] - rr, rr * 2, rr * 2);
      }

      // Cacos (do fundo para a frente)
      montado.sort((a, b) => b.z - a.z);
      ctx.lineJoin = "round";
      for (const m of montado) {
        const [a, b, c] = m.vs;
        if (a[2] < 0.3 || b[2] < 0.3 || c[2] < 0.3) continue;
        const nz = (b[3] - a[3]) * (c[4] - a[4]) - (b[4] - a[4]) * (c[3] - a[3]);
        const area = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
        const luz = 0.45 + 0.55 * clamp(Math.abs(nz) * 30);
        const nevoa = clamp(1.4 - m.z / 9);
        ctx.globalAlpha = m.c.alfa * luz * nevoa;
        ctx.fillStyle = m.c.cor;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
        if (area > 6) {
          ctx.globalAlpha = (0.2 + 0.35 * (1 - m.t)) * nevoa;
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.7; ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    const quadro = (agora) => {
      requestAnimationFrame(quadro);
      if (!visivel) return;
      alvo = progresso();
      atual += (alvo - atual) * 0.09;
      if (Math.abs(alvo - atual) < 0.0005) atual = alvo;
      mxs += (mx - mxs) * 0.05; mys += (my - mys) * 0.05;
      desenhar(atual, (agora - t0) / 1000);
      atualizarMomentos(atual);
    };

    addEventListener("resize", ajustar);
    if (ponteiroFino) addEventListener("pointermove", (ev) => { mx = ev.clientX / innerWidth - 0.5; my = ev.clientY / innerHeight - 0.5; }, { passive: true });
    new IntersectionObserver(([en]) => (visivel = en.isIntersecting)).observe(cine);
    ajustar();
    if (reduzir) { desenhar(1, 0); atualizarMomentos(0); }
    else requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  const moverArtes = () => {
    for (const a of artes) {
      const r = a.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      a.style.transform = `translate3d(0, ${(c * -70).toFixed(1)}px, 0) scale(1.08)`;
    }
  };

  /* ── Etapas: a linha do processo se acende conforme a rolagem ─────────── */
  const passos = document.querySelector(".passos");
  const moverPassos = () => {
    if (!passos) return;
    const r = passos.getBoundingClientRect();
    passos.style.setProperty("--feito", clamp((innerHeight * 0.75 - r.top) / r.height).toFixed(3));
  };

  /* ── Topo, barra de progresso, WhatsApp ───────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  const barra = document.querySelector(".barra-progresso span");
  let formNaTela = false;
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6 && !formNaTela);
    barra && barra.style.setProperty("--p", (scrollY / ((document.documentElement.scrollHeight - innerHeight) || 1)).toFixed(4));
    moverArtes(); moverPassos();
  };
  const formEl = document.querySelector(".form");
  if (formEl && celular) new IntersectionObserver(([e]) => { formNaTela = e.isIntersecting; aoRolar(); }).observe(formEl);
  addEventListener("scroll", () => requestAnimationFrame(aoRolar), { passive: true });
  aoRolar();

  /* ── Revelar em cascata ───────────────────────────────────────────────── */
  document.querySelectorAll(".cartoes, .projetos, .contato-grade, .portfolio-grade").forEach((g) =>
    [...g.querySelectorAll(":scope > .revelar, :scope > * > .revelar")].forEach((el, i) => el.style.setProperty("--atraso", `${(i % 3) * 0.12}s`)));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── Luz do cursor e cartões que reagem ao mouse ──────────────────────── */
  if (ponteiroFino && !reduzir) {
    const luz = document.querySelector(".luz-cursor");
    addEventListener("pointermove", (ev) => {
      if (!luz) return;
      luz.classList.add("ligada");
      luz.style.setProperty("--mx", `${ev.clientX}px`); luz.style.setProperty("--my", `${ev.clientY}px`);
    }, { passive: true });
    document.querySelectorAll(".cartao, .projeto").forEach((el) => {
      el.addEventListener("pointermove", (ev) => {
        const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        el.style.setProperty("--cx", `${x * 100}%`); el.style.setProperty("--cy", `${y * 100}%`);
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-3px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  /* ── WhatsApp ─────────────────────────────────────────────────────────── */
  if (whats && S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
  }

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) : c.value.trim().length > 1;
        c.closest(".campo").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar("Confira os campos destacados.", "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;
      const assunto = `${S.contato.assunto || "Novo contato pelo site"} · ${dados.assunto || ""}`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        url = `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar("Enviando…");
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar("Mensagem recebida. A CCA retorna em breve.", "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar("Não foi possível enviar agora. Chame a CCA no WhatsApp.", "falha");
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
