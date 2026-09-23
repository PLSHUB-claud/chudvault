# 💾 CHUD VAULT // INDEXADOR RETRÔ DE DOWNLOADS

Site interativo de indexação de downloads desenvolvido com estética retrô dos anos 90/2000, fóruns underground (phpBB/vBulletin/chan) e estilo memes chud, fiel ao esboço fornecido.

---

## 📸 Estrutura em Relação ao Esboço

| Seção no Esboço | Implementação no Site |
| :--- | :--- |
| **BANNER** (Caixa Branca) | Topo com ASCII art, título em alto contraste, borda branca iluminada e letreiro `marquee` clássico de avisos. |
| **APP** (Caixa Vermelha) | Barra de filtros rápidos por categoria: `TODOS`, `APP`, `GAMES`, `TOOLS`, `EMULADORES`, `SISTEMA`. |
| **⬆ DOWNLOADS** (Contêiner Central) | Seção com bordas vermelhas no estilo do desenho, ícone de seta `⬆`, barra de pesquisa em tempo real, ordenação, cards completos de arquivos, botão de cópia de MD5 e links diretos/espelhos. |
| **AVISOS** (Caixa Vermelha Inferior) | Mural de recados fixos da moderação, senhas padrão de descompactação e diretrizes de links quebrados. |
| **Extras Retrô** | Contador de visitantes analógico (`004291`), selos 88x31 clássicos ("Chud Approved", "Netscape Now", "Made with Notepad"), som de clique 8-bit e alternador de scanlines CRT. |

---

## 🚀 Como Executar

Você pode usar de duas formas simples no Windows:

1. **Direto no Navegador (Sem servidor)**:
   - Basta dar **dois cliques** no arquivo `index.html`! Ele carrega automaticamente o catálogo embutido e salva novos cadastros no `localStorage`.

2. **Servidor Local Automático**:
   - Dê dois cliques no arquivo `start.bat`.
   - Ele subirá um servidor leve na porta 8080 e abrirá seu navegador automaticamente em `http://localhost:8080`.

---

## ➕ Como Adicionar Novos Downloads

1. **Pela Própria Interface**:
   - Clique no botão **`+ INDEXAR NOVO DOWNLOAD`** no topo da lista.
   - Preencha os campos (Título, Categoria, Versão, Links, etc.) e clique em **Salvar & Indexar**.
   - O item aparecerá imediatamente na lista e ficará salvo no seu navegador.
   - Você pode clicar em **`💾 EXPORTAR JSON`** para baixar um arquivo atualizado com todos os itens!

2. **Pelo Arquivo `data/downloads.json`**:
   - Edite o arquivo `data/downloads.json` em qualquer editor de texto e adicione novos blocos com título, categoria, links e tamanhos.

---

## 🎛️ Controles no Topo

- **`[CRT: ON / OFF]`**: Liga e desliga as linhas de varredura de monitor de tubo.
- **`[TEMA: VERMELHO / MATRIX / WIN98]`**: Alterna entre o tema padrão vermelho sangrento, verde terminal phosphor e cinza clássico Windows 98.
- **`[SOM: ON / OFF]`**: Liga e desliga os efeitos sonoros retrô sintetizados em tempo real.
