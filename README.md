# Monte um Átomo

Jogo educativo de química, feito para o TCC. O jogador adiciona prótons, nêutrons e elétrons e monta átomos e íons dos 118 elementos da tabela periódica. Os dados dos elementos vêm da API da [PubChem](https://pubchem.ncbi.nlm.nih.gov/).

A mascote **Arly** é a professora que guia o tutorial.

## Como rodar

É preciso ter o **Python 3** instalado. Não é preciso instalar nenhuma biblioteca.

```bash
python server.py
```

Depois abra **http://localhost:8000** no navegador.

> Abrir o `index.html` direto (com dois cliques) não funciona: os dados dos elementos chegam pelo servidor Python.

## Funcionalidades

- **Modo Livre:** monte qualquer átomo ou íon com os botões + e −, ou clique em um elemento da tabela periódica para montá-lo pronto.
- **Modo Desafio:** 10 rodadas. O jogo pede um átomo ou íon (ex.: ²⁴Mg²⁺) e o jogador monta sem usar a tabela. Cada acerto vale 1 ponto.
- **Tutorial com a Arly:** abre na primeira visita. A tela fica embaçada e só a parte explicada pode ser usada, até o jogador fazer o que foi pedido. Dá para rever pelo botão **Tutorial**.
- **Informações em tempo real:** nome do elemento (em português e inglês), número de massa, carga, tipo (átomo neutro, cátion ou ânion) e se o núcleo é estável.
- **Desenho do átomo:** núcleo com prótons e nêutrons e elétrons girando nas camadas, distribuídos pelo diagrama de Linus Pauling.

## Tecnologias

| Tecnologia | Uso |
|---|---|
| Python (só a biblioteca padrão) | Servidor e busca dos dados na PubChem |
| HTML + Tailwind CSS (via CDN) | Estrutura e visual da página |
| CSS | Animações (órbitas e a Arly flutuando) |
| JavaScript | Lógica do jogo, desenho em SVG e tutorial |
| API PubChem | Símbolo, nome, massa atômica e cor de cada elemento |

## Estrutura

```
server.py   servidor; rota /api/elementos busca a tabela da PubChem e guarda em memória
index.html  tela do jogo
jogo.js     lógica do jogo, desenho do átomo e tutorial
arly.png    mascote
```

## Como funciona

1. O `server.py` busca a tabela periódica em `https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON` uma única vez e guarda o resultado em memória.
2. O `jogo.js` pede esses dados em `/api/elementos` e monta a tabela periódica.
3. O **número de prótons** define o elemento; **massa = prótons + nêutrons**; **carga = prótons − elétrons**.

Para mudar os textos do tutorial, edite a lista `PASSOS` no `jogo.js`.

## Simplificações conhecidas

- **Estabilidade:** o núcleo é considerado estável quando o número de nêutrons fica a no máximo 1 do isótopo mais comum. Não é uma tabela real de isótopos.
- **Distribuição eletrônica:** segue o diagrama de Linus Pauling sem as exceções reais (Cr, Cu, Au...), que diferem em 1 ou 2 elétrons.
