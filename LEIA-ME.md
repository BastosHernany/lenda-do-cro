# Lenda do CRO: como colocar no ar

São duas partes. Cada uma é feita uma vez só, e leva uns 20 minutos no total.

1. **Firebase** guarda o login e o progresso de cada pessoa, para o celular e o computador ficarem iguais.
2. **GitHub Pages** deixa o app num endereço com https, que é o que permite instalar como app.

---

## Parte 1: Firebase (login e sincronização)

1. Acesse **console.firebase.google.com** e entre com uma conta Google.
2. Clique em **Criar um projeto**, dê o nome `lenda-do-cro` e avance. O Google Analytics pode ficar desligado.
3. **Login por e-mail e senha:**
   - No menu da esquerda: **Criação > Authentication > Vamos começar**.
   - Na aba **Método de login**, escolha **E-mail/senha**, ative a primeira chave e salve.
4. **Login com Google:**
   - Ainda em **Método de login**, escolha **Google**, ative, preencha o e-mail de suporte (use o seu) e salve.
5. **Banco de dados:**
   - No menu: **Criação > Firestore Database > Criar banco de dados**.
   - Local: `southamerica-east1 (São Paulo)`.
   - Escolha **Iniciar no modo de produção** e crie.
6. **Regras de segurança** (cada pessoa só vê o próprio progresso):
   - No Firestore, abra a aba **Regras**.
   - Apague tudo, cole o conteúdo do arquivo `firestore.rules` deste pacote e clique em **Publicar**.
7. **Configuração do app:**
   - Clique na engrenagem ao lado de "Visão geral do projeto" e depois em **Configurações do projeto**.
   - Em "Seus apps", clique no ícone **`</>`** (Web), dê o nome `lenda-cro` e registre. **Não** marque o Firebase Hosting.
   - Aparece um bloco de código com `const firebaseConfig = { apiKey: ..., authDomain: ..., ... }`. Copie só o que está entre as chaves `{ }`.
   - Abra o arquivo `firebase-config.js` deste pacote num editor de texto (Bloco de Notas serve) e troque os `"COLE_AQUI"` pelos valores copiados. Salve.

   Esses valores não são senha: podem ficar públicos no GitHub. Quem protege os dados são as regras do passo 6.

---

## Parte 2: GitHub Pages (o endereço do app)

1. Acesse **github.com** e entre na sua conta.
2. Clique em **New repository**:
   - Nome: `lenda-do-cro`.
   - Deixe **Public**. O GitHub Pages gratuito exige repositório público. Os PDFs das apostilas **não** vão junto, só o app.
   - Clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
   - Arraste **todos os arquivos e a pasta `icones`** deste pacote, com o `firebase-config.js` já preenchido.
   - Clique em **Commit changes**.
4. Vá em **Settings > Pages**:
   - Em "Branch", escolha `main` e a pasta `/ (root)`.
   - Clique em **Save**.
5. Espere 1 ou 2 minutos e recarregue a página. Vai aparecer o endereço, algo como `https://SEU-USUARIO.github.io/lenda-do-cro/`.
6. **Autorize esse endereço no Firebase:**
   - Abra Authentication > **Configurações** > **Domínios autorizados** > **Adicionar domínio**.
   - Coloque `SEU-USUARIO.github.io`, sem o https e sem a barra no final.

---

## Parte 3: usando o app

1. Abra o endereço do GitHub Pages no celular ou no computador.
2. Na tela de login:
   - **Criar conta:** aba "Criar conta", preencha nome, e-mail e senha.
   - **Google:** clique em "Entrar com Google" (a opção mais rápida).
   - **Já tem conta:** aba "Entrar", digite e-mail e senha.
3. **Instalar como app no celular:**
   - **Android (Chrome):** menu ⋮ > **Instalar app** ou **Adicionar à tela inicial**.
   - **iPhone (Safari):** botão Compartilhar > **Adicionar à Tela de Início**.
   - **Computador (Chrome ou Edge):** ícone de instalar na barra de endereço.
4. O app abre em tela cheia, como um app nativo. Cada pessoa cria a própria conta e tem o progresso separado.

## Compartilhar com amigos

Basta enviar o link do GitHub Pages. Quem abrir cria a própria conta e tem o planner completo com calendário, banco de questões, conquistas e níveis — tudo salvo na nuvem.

## Se algo não funcionar

- **"Firebase não configurado":** o `firebase-config.js` ainda está com `COLE_AQUI`, ou foi salvo com algum erro de digitação.
- **Erro ao criar conta ou entrar:** confira se o login por **E-mail/senha** e **Google** estão ativados (Parte 1, passos 3 e 4) e se o domínio do GitHub foi autorizado (Parte 2, passo 6).
- **Login com Google não funciona:** o provedor Google precisa estar ativo no Firebase (Parte 1, passo 4).
- **Não sincroniza:** confira se as regras do Firestore foram publicadas (Parte 1, passo 6).
- **Atualizar o app:** envie o novo `index.html` para o mesmo repositório. O app pega a versão nova sozinho na próxima vez que abrir com internet.
