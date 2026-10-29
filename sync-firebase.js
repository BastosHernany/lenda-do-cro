/* Login e sincronização do Lenda do CRO com o Firebase (Auth + Firestore). */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const P = window.PlannerSync;
const cfg = window.FIREBASE_CONFIG;
if (!cfg || !cfg.apiKey || String(cfg.apiKey).startsWith("COLE")) {
  document.getElementById("loginMsg").textContent = "Firebase não configurado. Veja o LEIA-ME.";
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  auth.useDeviceLanguage();
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  /* adaptador: o Planner fala com "documentos" sem saber que é Firestore */
  const adaptar = ref => ({
    async get() { const s = await getDoc(ref); return { exists: s.exists(), data: () => s.data() }; },
    set: dados => setDoc(ref, dados),
    delete: () => deleteDoc(ref),
    onSnapshot: (ok, erro) => onSnapshot(ref, { includeMetadataChanges: false },
      s => ok({ exists: s.exists(), data: () => s.data(), metadata: { hasPendingWrites: s.metadata.hasPendingWrites } }), erro)
  });

  const msg = t => { document.getElementById("loginMsg").textContent = t || ""; };
  const traduz = e => ({
    "auth/invalid-email": "Esse e-mail não parece válido.",
    "auth/missing-password": "Digite a senha.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Use a aba \"Entrar\".",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Não existe conta com esse e-mail. Use a aba \"Criar conta\".",
    "auth/too-many-requests": "Muitas tentativas. Espere alguns minutos e tente de novo.",
    "auth/network-request-failed": "Sem internet. Conecte-se e tente de novo.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada. Tente de novo.",
    "auth/popup-blocked": "O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.",
    "auth/cancelled-popup-request": ""
  }[e && e.code] || "Não deu certo agora. Tente de novo.");

  /* aba ativa da tela de login */
  const tabs = document.querySelectorAll(".login-tab");
  const panes = document.querySelectorAll(".login-pane");
  tabs.forEach(tab => tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.toggle("ativo", t === tab));
    panes.forEach(p => p.hidden = p.id !== tab.dataset.pane);
    msg("");
  }));

  /* Entrar */
  document.getElementById("formEntrar").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("entrarEmail").value.trim();
    const senha = document.getElementById("entrarSenha").value;
    msg("Entrando…");
    try { await signInWithEmailAndPassword(auth, email, senha); msg(""); } catch (err) { msg(traduz(err)); }
  });

  /* Criar conta */
  document.getElementById("formCriar").addEventListener("submit", async e => {
    e.preventDefault();
    const nome = document.getElementById("criarNome").value.trim();
    const email = document.getElementById("criarEmail").value.trim();
    const senha = document.getElementById("criarSenha").value;
    const confirma = document.getElementById("criarConfirma").value;
    if (senha !== confirma) { msg("As senhas não combinam."); return; }
    if (senha.length < 6) { msg("A senha precisa ter pelo menos 6 caracteres."); return; }
    msg("Criando sua conta…");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      if (nome) await updateProfile(cred.user, { displayName: nome });
      msg("");
    } catch (err) { msg(traduz(err)); }
  });

  /* Esqueci a senha */
  document.getElementById("formEsqueci").addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("esqueciEmail").value.trim();
    if (!email) { msg("Digite seu e-mail acima."); return; }
    msg("Enviando…");
    try { await sendPasswordResetEmail(auth, email); msg("Pronto! Verifique seu e-mail para criar uma nova senha."); } catch (err) { msg(traduz(err)); }
  });

  /* Entrar com Google */
  document.querySelectorAll(".btn-google").forEach(btn => btn.addEventListener("click", async () => {
    msg("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        try { await signInWithRedirect(auth, googleProvider); } catch (e2) { msg(traduz(e2)); }
      } else if (err.code !== "auth/cancelled-popup-request") { msg(traduz(err)); }
    }
  }));

  P.aoSair = () => signOut(auth);

  onAuthStateChanged(auth, user => {
    if (user) {
      P.conectar(
        user.email || "",
        user.displayName || "",
        user.uid,
        adaptar(doc(db, "usuarios", user.uid, "planner", "estado")),
        adaptar(doc(db, "usuarios", user.uid, "planner", "respostas"))
      );
    } else {
      P.desconectar();
    }
  });
}
