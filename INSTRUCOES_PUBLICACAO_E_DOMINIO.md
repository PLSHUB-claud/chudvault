# GUIA DEFINITIVO: PUBLICAR NO GITHUB PAGES E VINCULAR DOMÍNIO COM CLOUDFLARE WAF

Este guia foi preparado para você executar quando comprar o novo domínio, mesmo sem precisar de IA ou assistente. Siga o passo a passo abaixo.

---

## ETAPA 1: PUBLICAR O SITE NO GITHUB AGORA (Sem domínio por enquanto)

Como o projeto já foi todo commitado na branch `main`:

1. Abra o **GitHub Desktop**.
2. Na parte superior, clique no botão azul **"Publish repository"**.
3. Na janelinha que abrir:
   - **Name**: pode ser `chud-vault`, `retro-hub` ou o nome que você quiser.
   - **IMPORTANTE**: **DESMARQUE** a caixinha *"Keep this code private"* (o GitHub Pages gratuito só funciona em repositórios públicos).
   - Clique em **"Publish repository"**.
4. Abra o seu repositório no navegador em:
   `https://github.com/PLSHUB-claud/NOME-DO-SEU-REPO`
5. Vá em **Settings** (no topo) -> **Pages** (no menu lateral esquerdo).
6. Em **Build and deployment**:
   - **Branch**: Selecione `main`.
   - **Folder**: Deixe em `/ (root)`.
   - Clique em **Save**.
7. Pronto! Em 1 minuto seu site estará online gratuitamente no link:
   `https://PLSHUB-claud.github.io/NOME-DO-SEU-REPO/`

---

## ETAPA 2: QUANDO COMPRAR O NOVO DOMÍNIO NA NAMECHEAP

Assim que você comprar seu novo domínio na Namecheap, faça o seguinte:

### 1. Criar o arquivo CNAME automaticamente:
Na pasta do seu projeto (`retro-download-hub`):
- Dê dois cliques no arquivo **`CONFIGURAR_DOMINIO.bat`**.
- Digite o nome do seu domínio (exemplo: `meunovosite.com`) e dê Enter.
- O script vai criar o arquivo `CNAME`, commitar e enviar para o GitHub sozinho.
*(Se ele não der push automático, abra o GitHub Desktop e clique em "Push origin" no topo).*

---

## ETAPA 3: CADASTRAR O DOMÍNIO NA CLOUDFLARE (WAF + Anti-DDoS Grátis)

A Cloudflare é a ferramenta que vai filtrar o tráfego e barrar ataques DDoS antes que eles toquem no GitHub.

1. Crie uma conta ou faça login em [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Clique no botão azul **"Add a site"** (Adicionar site).
3. Digite o nome do seu novo domínio (ex: `meunovosite.com`) e clique em Continuar.
4. Escolha o plano **Free** (R$ 0 / Grátis) no final da página e confirme.
5. A Cloudflare vai te mostrar **2 Servidores de Nome (Nameservers)**.
   *Exemplo de como eles aparecem:*
   - `aria.ns.cloudflare.com`
   - `noah.ns.cloudflare.com`
   *(Anote os dois nomes que aparecerem para você).*

---

## ETAPA 4: APONTAR A NAMECHEAP PARA A CLOUDFLARE

Agora você precisa dizer para a Namecheap que quem manda no domínio é a Cloudflare:

1. Acesse o painel da Namecheap: [ap.www.namecheap.com](https://ap.www.namecheap.com/).
2. Vá em **Domain List** e clique no botão **Manage** ao lado do seu novo domínio.
3. Role até a seção **Nameservers**:
   - Mude de *Namecheap BasicDNS* para **Custom DNS**.
   - No campo **Nameserver 1**, cole o primeiro servidor da Cloudflare.
   - No campo **Nameserver 2**, cole o segundo servidor da Cloudflare.
   - Clique no ícone de **Check verde** para salvar.
   *(Pode levar de 5 a 30 minutos para propagar).*

---

## ETAPA 5: CONFIGURAR OS REGISTROS DNS NA CLOUDFLARE

No painel da Cloudflare, entre no seu domínio e clique em **DNS > Records**.
Adicione as 5 entradas abaixo (clique em **Add record** para cada uma):

### Entradas para o domínio raiz (sem www):
1. **Type**: `A` | **Name**: `@` | **IPv4 address**: `185.199.108.153` | **Proxy status**: Proxied (Nuvem Laranja ☁️)
2. **Type**: `A` | **Name**: `@` | **IPv4 address**: `185.199.109.153` | **Proxy status**: Proxied (Nuvem Laranja ☁️)
3. **Type**: `A` | **Name**: `@` | **IPv4 address**: `185.199.110.153` | **Proxy status**: Proxied (Nuvem Laranja ☁️)
4. **Type**: `A` | **Name**: `@` | **IPv4 address**: `185.199.111.153` | **Proxy status**: Proxied (Nuvem Laranja ☁️)

### Entrada para o subdomínio www:
5. **Type**: `CNAME` | **Name**: `www` | **Target**: `PLSHUB-claud.github.io` | **Proxy status**: Proxied (Nuvem Laranja ☁️)

> **ATENÇÃO:** Certifique-se de que a **Nuvem Laranja (Proxied)** esteja ativada em todos eles. Isso é o que esconde o IP real e bloqueia ataques DDoS.

---

## ETAPA 6: CONFIGURAÇÕES DE BLINDAGEM NO WAF DA CLOUDFLARE

No menu lateral do seu domínio na Cloudflare:

1. **SSL/TLS**:
   - Deixe o modo de criptografia em **Full** ou **Full (Strict)**.
   - Na aba **Edge Certificates**, ative:
     - **Always Use HTTPS**: ON
     - **Automatic HTTPS Rewrites**: ON
2. **Security > Settings**:
   - **Security Level**: Defina como **Medium** ou **High**.
   - **Under Attack Mode**: Caso seu site sofra ataque de negação de serviço massivo, basta ligar esta chave para exibir o desafio de 5 segundos a todos os visitantes.
   - **Browser Integrity Check**: ON (bloqueia requisições forjadas de scripts maliciosos).
3. **Security > Bots**:
   - Ative o **Bot Fight Mode** (bloqueia robôs e scrapers automatizados).

---

## ETAPA 7: ATIVAR O DOMÍNIO NO GITHUB PAGES

1. Volte ao seu repositório no GitHub -> **Settings** -> **Pages**.
2. No campo **Custom domain**, digite o seu novo domínio (ex: `meunovosite.com`) e clique em **Save**.
3. Aguarde alguns minutos para o GitHub validar o DNS.
4. Quando a opção **Enforce HTTPS** ficar disponível, marque a caixinha.

**Seu site estará 100% online, protegido por WAF e Anti-DDoS, e rodando gratuitamente no GitHub Pages!**
