# Site CCA Consultoria · Como editar

Este é o site completo da CCA Consultoria. São arquivos simples (HTML, CSS e JavaScript): não precisa instalar nada para editar e nada para o site funcionar.

## O que tem na pasta

| Arquivo | O que é | Quando mexer |
|---|---|---|
| `index.html` | Todos os textos e seções do site | Trocar textos, títulos, serviços, links |
| `config.js` | WhatsApp, e-mail do formulário | Trocar número ou e-mail |
| `estilo.css` | Cores, fontes, espaçamentos | Mudar o visual |
| `app.js` | Animações (cena 3D da abertura, efeitos) | Só se quiser mexer no movimento |
| `assets/logo.png` | Logo | Trocar pelo logo novo (mesmo nome) |
| `assets/img/*.svg` | Artes animadas das seções | Trocar as artes |
| `assets/og.jpg` | Imagem que aparece quando o link é compartilhado no WhatsApp | Opcional |

## Ver o site no computador

- Jeito mais fácil: dar dois cliques em `index.html`, que abre no navegador.
- Jeito recomendado (o formulário funciona melhor): no **VS Code**, instale a extensão **Live Server**, abra a pasta e clique em **Go Live**.
- Outra opção, com Python instalado: abra o terminal dentro da pasta, rode `python -m http.server 4173` e acesse http://localhost:4173.

Para editar, use o **VS Code** (gratuito): https://code.visualstudio.com

## Trocar textos

Abra o `index.html`. Cada seção começa com um comentário que diz qual é:

```html
<!-- 01 SOBRE -->
<!-- 02 ÁREAS DE ATUAÇÃO -->
<!-- 03 COMO TRABALHAMOS -->
<!-- 04 PORTFÓLIO -->
<!-- 05 CONTATO -->
```

Troque só o texto entre as tags, por exemplo:

```html
<h2>Gestão empresarial com visão integrada.</h2>
```

Os 3 textos que aparecem durante a animação da abertura ficam nos blocos `class="momento"`, no começo do `index.html`.

**Adicionar ou remover um serviço:** copie ou apague um bloco inteiro `<article class="painel cartao revelar"> ... </article>`.

## Trocar WhatsApp e e-mail

Abra o `config.js`:

```js
whatsapp: {
  numero: "5527998003842",   // 55 + DDD + número, só dígitos
  mensagem: "Olá! Gostaria de conversar com a CCA Consultoria sobre um projeto.",
},
contato: {
  email: "claudio.almeida@ccaempresarial.com.br",  // quem recebe o formulário
```

No `index.html`, seção **05 CONTATO**, também estão o e-mail e os telefones que aparecem escritos na tela.

## Formulário de contato (chega por e-mail)

O formulário usa o **FormSubmit** (grátis, sem cadastro). Na **primeira** mensagem enviada pelo site já publicado, chega um e-mail do FormSubmit no endereço do `config.js`. É só clicar em **Activate** uma vez; daí em diante as mensagens chegam normalmente.

Se preferir o **Web3Forms** (também grátis): crie uma chave em https://web3forms.com e cole em `web3formsChave: ""` no `config.js`.

## Trocar cores e fontes

No começo do `estilo.css`:

```css
--fundo: #081a24;     /* fundo azul-petróleo */
--acento: #e4652b;    /* laranja da marca (botões, destaques) */
--verde: #8fa152;     /* verde-oliva */
--ciano: #6fdfc0;     /* brilho técnico */
--fonte-titulo: "Archivo", ...;
--fonte-texto: "Geist", ...;
```

Se trocar a fonte, troque também o link do Google Fonts no `<head>` do `index.html`.

## Mexer na animação da abertura (opcional)

No `app.js`, procure `subdividir(`. Cada linha é um dos triângulos do logo:
- a lista de cores (`["#e4652b", ...]`) muda a cor dos cacos;
- o número (`6`, `7`, `3`) é quantas fileiras de cacos cada triângulo tem (mais fileiras, mais pedaços).

A duração da rolagem da abertura fica no `index.html`: `style="--altura: 440vh"`. Valor maior deixa a animação mais lenta; menor, mais rápida.

## Publicar

Qualquer hospedagem de site estático serve. Basta subir **esta pasta inteira**:
- **Netlify Drop**: https://app.netlify.com/drop (arrastar a pasta e soltar)
- **Vercel**, **GitHub Pages** ou a hospedagem atual do domínio ccaempresarial.com.br

Antes de publicar no domínio oficial, apague esta linha do `index.html`, que impede o Google de indexar a prévia:

```html
<meta name="robots" content="noindex">
```

## Editar com ajuda de IA

Dá para abrir esta pasta no Claude Code, no Cursor ou no ChatGPT, mandar este arquivo junto e pedir, por exemplo: *"troque o título da seção Sobre para X"* ou *"adicione uma seção de clientes depois do Portfólio, no mesmo estilo"*.

---
Estrutura: Site Cinematográfico · Labrego IA. Mantenha os comentários e as tags `meta` de autoria no topo do `index.html`.
