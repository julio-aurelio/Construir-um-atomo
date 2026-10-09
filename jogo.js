// Monte um Átomo — dados dos elementos vêm da PubChem (via server.py)
const NOMES_PT = "Hidrogênio,Hélio,Lítio,Berílio,Boro,Carbono,Nitrogênio,Oxigênio,Flúor,Neônio,Sódio,Magnésio,Alumínio,Silício,Fósforo,Enxofre,Cloro,Argônio,Potássio,Cálcio,Escândio,Titânio,Vanádio,Cromo,Manganês,Ferro,Cobalto,Níquel,Cobre,Zinco,Gálio,Germânio,Arsênio,Selênio,Bromo,Criptônio,Rubídio,Estrôncio,Ítrio,Zircônio,Nióbio,Molibdênio,Tecnécio,Rutênio,Ródio,Paládio,Prata,Cádmio,Índio,Estanho,Antimônio,Telúrio,Iodo,Xenônio,Césio,Bário,Lantânio,Cério,Praseodímio,Neodímio,Promécio,Samário,Európio,Gadolínio,Térbio,Disprósio,Hólmio,Érbio,Túlio,Itérbio,Lutécio,Háfnio,Tântalo,Tungstênio,Rênio,Ósmio,Irídio,Platina,Ouro,Mercúrio,Tálio,Chumbo,Bismuto,Polônio,Astato,Radônio,Frâncio,Rádio,Actínio,Tório,Protactínio,Urânio,Netúnio,Plutônio,Amerício,Cúrio,Berquélio,Califórnio,Einstênio,Férmio,Mendelévio,Nobélio,Laurêncio,Rutherfórdio,Dúbnio,Seabórgio,Bóhrio,Hássio,Meitnério,Darmstádtio,Roentgênio,Copernício,Nihônio,Fleróvio,Moscóvio,Livermório,Tenesso,Oganessônio".split(",");
const MAX = 118;
const PART = {
  p: { nome: "Prótons", cor: "#ef4444", sinal: "+", dica: "Definem o elemento" },
  n: { nome: "Nêutrons", cor: "#9ca3af", sinal: "", dica: "Mudam a massa" },
  e: { nome: "Elétrons", cor: "#3b82f6", sinal: "−", dica: "Mudam a carga" },
};
const st = { p: 0, n: 0, e: 0 };
let EL = [], modo = "livre", alvo = null, rodada = 0, pontos = 0;
const $ = (id) => document.getElementById(id);

// Posição (linha, coluna) na tabela periódica a partir do nº atômico
function posicao(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  if (z <= 10) return [2, z <= 4 ? z - 2 : z + 8];
  if (z <= 18) return [3, z <= 12 ? z - 10 : z];
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  if (z >= 57 && z <= 71) return [9, z - 54];
  if (z >= 89 && z <= 103) return [10, z - 86];
  if (z <= 86) return [6, z <= 56 ? z - 54 : z - 68];
  return [7, z <= 88 ? z - 86 : z - 100];
}

// Elétrons por camada, preenchendo os subníveis na ordem de Linus Pauling: [camada, capacidade]
// ponytail: ignora exceções reais (Cr, Cu, Pd...), que diferem em 1-2 elétrons
const PAULING = [[1,2],[2,2],[2,6],[3,2],[3,6],[4,2],[3,10],[4,6],[5,2],[4,10],[5,6],[6,2],[4,14],[5,10],[6,6],[7,2],[5,14],[6,10],[7,6]];
function camadas(e) {
  const out = [];
  for (const [n, cap] of PAULING) { if (e <= 0) break; out[n - 1] = (out[n - 1] || 0) + Math.min(cap, e); e -= cap; }
  return out;
}

// ponytail: "estável" = nêutrons a ±1 do isótopo mais comum (massa arredondada − Z); tabela real de isótopos se o professor exigir
const estavel = (el) => Math.abs(st.n - (Math.round(el.massa) - st.p)) <= 1;

function desenhar() {
  const svg = $("atomo"), cam = camadas(st.e), total = st.p + st.n;
  // núcleo e camadas encolhem conforme o átomo cresce, para tudo caber no quadro
  const raioNucleo = Math.min(55, 6 * Math.sqrt(total) + 4);
  const passoCamada = Math.min(40, (190 - raioNucleo - 18) / Math.max(1, cam.length - 1));
  const rEletron = cam.length > 4 ? 3.5 : 6;
  const rParticula = Math.max(2.5, Math.min(7, (raioNucleo / Math.sqrt(total || 1)) * 0.9));
  let h = "";
  cam.forEach((qtd, i) => {
    const r = raioNucleo + 18 + i * passoCamada;
    h += `<circle cx="200" cy="200" r="${r}" fill="none" stroke="#c4b5fd" stroke-dasharray="4 4"/>`;
    h += `<g class="orbita" style="animation-duration:${8 + i * 4}s">`;
    for (let k = 0; k < qtd; k++) {
      const a = (2 * Math.PI * k) / qtd;
      h += `<circle cx="${200 + r * Math.cos(a)}" cy="${200 + r * Math.sin(a)}" r="${rEletron}" fill="${PART.e.cor}"/>`;
    }
    h += "</g>";
  });
  // núcleo: prótons e nêutrons intercalados numa espiral
  const nucleo = [];
  for (let i = 0; i < Math.max(st.p, st.n); i++) { if (i < st.p) nucleo.push("p"); if (i < st.n) nucleo.push("n"); }
  nucleo.forEach((t, i) => {
    const r = (raioNucleo - rParticula) * Math.sqrt(i / total), a = i * 2.4;
    h += `<circle cx="${200 + r * Math.cos(a)}" cy="${200 + r * Math.sin(a)}" r="${rParticula}" fill="${PART[t].cor}" stroke="#fff" stroke-width="1"/>`;
  });
  if (!st.p && !st.n && !st.e) h += `<text x="200" y="205" text-anchor="middle" fill="#9ca3af" font-size="14">Adicione partículas abaixo</text>`;
  svg.innerHTML = h;
}

function atualizar() {
  for (const div of document.querySelectorAll(".contador")) div.querySelector("b").textContent = st[div.dataset.p];
  desenhar();
  const el = EL[st.p - 1], carga = st.p - st.e;
  const txtCarga = carga === 0 ? "0" : `${Math.abs(carga)}${carga > 0 ? "+" : "−"}`;
  $("iNome").textContent = el ? `${NOMES_PT[el.z - 1]} (${el.nome_en})` : "-";
  $("iMassa").textContent = st.p + st.n || "-";
  $("iCarga").textContent = txtCarga;
  $("iTipo").textContent = !el ? "-" : carga === 0 ? "Átomo neutro" : carga > 0 ? "Cátion" : "Ânion";
  $("iEstavel").innerHTML = !el ? "-" : estavel(el) ? '<span class="text-green-600">Estável</span>' : '<span class="text-red-500">Instável</span>';
  $("cartao").innerHTML = el
    ? `<span class="text-[10px] text-gray-500">${st.p + st.n}</span><span class="text-3xl font-bold" style="color:#${el.cor === "FFFFFF" ? "6d28d9" : el.cor}">${el.simbolo}</span><span class="text-[10px] text-purple-700">${carga ? txtCarga : ""}</span>`
    : '<span class="text-gray-400 text-2xl">?</span>';
  document.querySelectorAll(".el").forEach((b) => b.classList.toggle("ring-2", +b.dataset.z === st.p));
  tutChecar();
}

function mudar(p, d) {
  st[p] = Math.max(0, Math.min(p === "n" ? 180 : MAX, st[p] + d)); // 180 nêutrons cobre o Oganessônio-294
  atualizar();
}

function novoAlvo() {
  rodada++;
  if (rodada > 10) {
    $("alvo").textContent = `Fim! Você fez ${pontos}/10 pontos!`;
    $("verificar").textContent = "Jogar de novo";
    return;
  }
  const el = EL[Math.floor(Math.random() * 20)]; // primeiros 20 elementos, os que se estudam no ensino médio
  const carga = [0, 0, 1, -1, 2, -2][Math.floor(Math.random() * 6)];
  const e = el.z - carga;
  alvo = { z: el.z, a: Math.round(el.massa), e: e < 0 ? 0 : e };
  const c = el.z - alvo.e;
  $("alvo").innerHTML = `<sup>${alvo.a}</sup>${el.simbolo}${c ? `<sup>${Math.abs(c)}${c > 0 ? "+" : "−"}</sup>` : ""} — ${NOMES_PT[el.z - 1]}`;
  $("rodada").textContent = rodada;
  $("verificar").textContent = "Verificar";
}

function verificar() {
  if (rodada > 10) { rodada = 0; pontos = 0; $("pontos").textContent = 0; return novoAlvo(); }
  const ok = st.p === alvo.z && st.p + st.n === alvo.a && st.e === alvo.e;
  if (ok) $("pontos").textContent = ++pontos;
  status(ok ? "Correto! Muito bem." : `Era ${alvo.z} prótons, ${alvo.a - alvo.z} nêutrons e ${alvo.e} elétrons.`, ok ? "green" : "red");
  Object.assign(st, { p: 0, n: 0, e: 0 });
  atualizar();
  novoAlvo();
}

function status(msg, cor = "gray") {
  $("status").className = `p-3 rounded-xl text-sm bg-${cor}-100 text-${cor}-700`;
  $("status").textContent = msg;
}

function setModo(m) {
  modo = m;
  document.querySelectorAll(".modo").forEach((b) => {
    const on = b.dataset.modo === m;
    b.classList.toggle("bg-gradient-to-r", on); b.classList.toggle("from-purple-600", on);
    b.classList.toggle("to-blue-600", on); b.classList.toggle("text-white", on);
  });
  $("desafio").classList.toggle("hidden", m !== "desafio");
  Object.assign(st, { p: 0, n: 0, e: 0 });
  if (m === "desafio") { rodada = 0; pontos = 0; $("pontos").textContent = 0; novoAlvo(); }
  status(m === "desafio" ? "Monte o átomo pedido e clique em Verificar." : "Modo livre: monte qualquer átomo ou íon.");
  atualizar();
}

// Montagem da interface
for (const div of document.querySelectorAll(".contador")) {
  const p = PART[div.dataset.p];
  div.className = "contador bg-gray-50 rounded-xl border border-gray-200 p-2 text-center";
  div.innerHTML = `
    <div class="text-xs font-semibold flex items-center justify-center gap-1"><span class="w-3 h-3 rounded-full inline-block" style="background:${p.cor}"></span>${p.nome} ${p.sinal}</div>
    <div class="text-[11px] text-gray-400">${p.dica}</div>
    <b class="block text-2xl my-1">0</b>
    <div class="flex gap-1 justify-center">
      <button aria-label="Remover ${p.nome}" class="w-9 h-9 rounded-lg bg-gray-200 hover:bg-gray-300 text-lg">−</button>
      <button aria-label="Adicionar ${p.nome}" class="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg shadow-md">+</button>
    </div>`;
  const [menos, mais] = div.querySelectorAll("button");
  menos.onclick = () => mudar(div.dataset.p, -1);
  mais.onclick = () => mudar(div.dataset.p, 1);
}
document.querySelectorAll(".modo").forEach((b) => (b.onclick = () => setModo(b.dataset.modo)));
$("limpar").onclick = () => { Object.assign(st, { p: 0, n: 0, e: 0 }); atualizar(); };
$("verificar").onclick = verificar;

// Tutorial guiado pela Arly: o blur bloqueia a tela, só o elemento em foco responde
const PASSOS = [
  { txt: "Oi, eu sou a Arly! Vou te ensinar a montar átomos. Todo átomo é feito de três partículas: prótons, nêutrons e elétrons." },
  { alvo: '[data-p="p"]', ok: () => st.p === 1, txt: "Os prótons ficam no núcleo e definem qual é o elemento. Clique no + de Prótons para adicionar um." },
  { alvo: '[data-p="e"]', ok: () => st.e === 1, txt: "Com 1 próton temos o Hidrogênio! Mas a carga ficou 1+. Adicione 1 elétron para equilibrar." },
  { alvo: '[data-p="n"]', ok: () => st.n === 1, txt: "Agora o átomo está neutro: prótons = elétrons. Os nêutrons também ficam no núcleo e mudam só a massa. Adicione 1 nêutron." },
  { alvo: "#info", txt: "Aqui você acompanha tudo: o número de massa (A = prótons + nêutrons), a carga e se o núcleo é estável." },
  { alvo: "#tabelaBox", ok: () => st.p === 6, txt: "Atalho: clique num elemento da tabela para montá-lo pronto. Clique no C, o Carbono." },
  { alvo: "#modos", txt: "No modo Desafio eu peço um átomo ou íon e você monta sozinho. São 10 rodadas valendo pontos. Boa sorte!" },
];
let passo = -1, focado = null;
const lerFlag = () => { try { return localStorage.getItem("tutFeito"); } catch { return null; } };

function tutIniciar() {
  setModo("livre");
  passo = -1;
  $("tutBlur").classList.remove("hidden");
  $("tutCard").classList.remove("hidden");
  tutAvancar();
}

function tutAvancar() {
  focado?.classList.remove("foco");
  if (++passo >= PASSOS.length) return tutFim();
  const p = PASSOS[passo];
  p.feito = null;
  focado = p.alvo ? document.querySelector(p.alvo) : null;
  let embaixo = true;
  if (focado) {
    focado.classList.add("foco");
    focado.scrollIntoView({ block: "center" });
    const r = focado.getBoundingClientRect();
    embaixo = r.top + r.height / 2 < innerHeight / 2; // card do lado oposto ao foco
  }
  $("tutCard").classList.toggle("bottom-6", embaixo);
  $("tutCard").classList.toggle("top-6", !embaixo);
  $("tutTexto").textContent = p.txt;
  $("tutPasso").textContent = `· ${passo + 1} de ${PASSOS.length}`;
  $("tutProximo").classList.toggle("invisible", !!p.ok);
  $("tutProximo").textContent = passo === PASSOS.length - 1 ? "Começar" : "Próximo";
}

function tutChecar() {
  const p = PASSOS[passo];
  if (!p?.ok?.() || p.feito === passo) return;
  p.feito = passo; // evita avançar duas vezes no mesmo passo
  $("tutTexto").textContent = "Isso mesmo!";
  setTimeout(tutAvancar, 700);
}

function tutFim() {
  passo = -1;
  focado?.classList.remove("foco");
  $("tutBlur").classList.add("hidden");
  $("tutCard").classList.add("hidden");
  try { localStorage.setItem("tutFeito", "1"); } catch {}
}

$("tutProximo").onclick = tutAvancar;
$("tutPular").onclick = tutFim;
$("abrirTutorial").onclick = tutIniciar;

// direto da PubChem (tem CORS), assim roda em hospedagem estática como a Vercel
fetch("https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON")
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then(({ Table: t }) => {
    const cols = t.Columns.Column;
    EL = t.Row.map(({ Cell }) => {
      const d = Object.fromEntries(cols.map((c, i) => [c, Cell[i]]));
      return {
        z: +d.AtomicNumber,
        simbolo: d.Symbol,
        nome_en: d.Name,
        massa: parseFloat(d.AtomicMass) || 0,
        grupo: d.GroupBlock,
        cor: d.CPKHexColor || "909090",
      };
    });
    $("tabela").innerHTML = EL.map((el) => {
      const [lin, col] = posicao(el.z);
      return `<button data-z="${el.z}" title="${NOMES_PT[el.z - 1]}"
        class="el aspect-square rounded-sm text-[8px] font-bold ring-purple-600"
        style="grid-row:${lin};grid-column:${col};background:#${el.cor}55">${el.simbolo}</button>`;
    }).join("");
    document.querySelectorAll(".el").forEach((b) => (b.onclick = () => {
      if (modo === "desafio") return status("No desafio, monte sem a tabela!", "yellow");
      const el = EL[b.dataset.z - 1];
      Object.assign(st, { p: el.z, n: Math.round(el.massa) - el.z, e: el.z });
      atualizar();
    }));
    setModo("livre");
    if (!lerFlag()) tutIniciar();
  })
  .catch(() => status("Não foi possível carregar a PubChem. Verifique sua internet.", "red"));
