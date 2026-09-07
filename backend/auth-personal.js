(function () {
  "use strict";

  console.log("[Estuda+] auth-personal v45 carregado — handshake de estado do app + cache bust");

  const LOGIN_ID = "estudaAuthGate";
  const STYLE_ID = "estudaAuthGateStyle";

  let client = null;
  let subscription = null;

  /*
  =========================================================
  SUPABASE
  =========================================================
  */

  function getClient() {

    if (client) {
      return client;
    }

    if (!window.supabase) {
      throw new Error(
        "Biblioteca do Supabase não foi carregada."
      );
    }

    if (
      !window.ESTUDA_CONFIG ||
      !window.ESTUDA_CONFIG.SUPABASE_URL ||
      !window.ESTUDA_CONFIG.SUPABASE_KEY
    ) {
      throw new Error(
        "Configuração do Supabase não encontrada."
      );
    }

    if (window.estudaSupabase) {

      client = window.estudaSupabase;

    } else if (window.supabaseClient) {

      client = window.supabaseClient;

    } else {

      client = window.supabase.createClient(
        window.ESTUDA_CONFIG.SUPABASE_URL,
        window.ESTUDA_CONFIG.SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );

    }

    window.estudaSupabase = client;
    window.supabaseClient = client;

    return client;
  }


  /*
  =========================================================
  CSS DA TELA DE LOGIN
  =========================================================
  */

  function createStyles() {

    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `

      #${LOGIN_ID} {
        position: fixed;
        inset: 0;

        z-index: 2147483647;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 20px;

        background:
          radial-gradient(
            circle at 18% 15%,
            rgba(37,99,235,.24),
            transparent 35%
          ),
          radial-gradient(
            circle at 82% 8%,
            rgba(6,182,212,.18),
            transparent 30%
          ),
          linear-gradient(
            145deg,
            #07101f,
            #0f172a 58%,
            #111827
          );

        font-family:
          Inter,
          "Segoe UI",
          Arial,
          sans-serif;
      }


      #${LOGIN_ID} .estuda-login-card {

        width: 100%;
        max-width: 420px;

        padding: 30px;

        border-radius: 22px;

        background:
          rgba(15,23,42,.96);

        border:
          1px solid
          rgba(148,163,184,.25);

        box-shadow:
          0 30px 80px
          rgba(0,0,0,.45);

        color: #ffffff;

        box-sizing: border-box;
      }


      #${LOGIN_ID}
      .estuda-login-logo {

        width: 58px;
        height: 58px;

        margin:
          0 auto 16px;

        border-radius: 17px;

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 26px;

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );

        box-shadow:
          0 12px 30px
          rgba(37,99,235,.30);
      }


      #${LOGIN_ID} h1 {

        margin: 0;

        text-align: center;

        font-size: 27px;

        font-weight: 900;
      }


      #${LOGIN_ID}
      .estuda-login-description {

        margin:
          8px 0 23px;

        text-align: center;

        color: #94a3b8;

        font-size: 13px;

        line-height: 1.5;
      }


      #${LOGIN_ID}
      .estuda-login-field {

        display: grid;

        gap: 6px;

        margin-bottom: 13px;
      }


      #${LOGIN_ID} label {

        color: #cbd5e1;

        font-size: 12px;

        font-weight: 800;
      }


      #${LOGIN_ID} input {

        width: 100%;

        height: 45px;

        padding:
          10px 12px;

        box-sizing:
          border-box;

        border-radius: 11px;

        border:
          1px solid #334155;

        background:
          #0b1220;

        color:
          #ffffff;

        outline:
          none;

        font-size:
          14px;
      }


      #${LOGIN_ID}
      input:focus {

        border-color:
          #38bdf8;

        box-shadow:
          0 0 0 3px
          rgba(56,189,248,.12);
      }


      #${LOGIN_ID} button {

        width: 100%;

        min-height: 44px;

        border:
          none;

        border-radius:
          11px;

        cursor:
          pointer;

        font-weight:
          900;

        font-size:
          14px;
      }


      #${LOGIN_ID}
      .estuda-login-submit {

        margin-top: 5px;

        color:
          #ffffff;

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );

        box-shadow:
          0 10px 24px
          rgba(37,99,235,.22);
      }


      #${LOGIN_ID}
      .estuda-login-google {

        margin-top:
          10px;

        color:
          #111827;

        background:
          #ffffff;
      }


      #${LOGIN_ID}
      .estuda-login-error {

        display:
          none;

        margin-top:
          14px;

        padding:
          10px 12px;

        border-radius:
          10px;

        background:
          rgba(220,38,38,.15);

        border:
          1px solid
          rgba(248,113,113,.35);

        color:
          #fecaca;

        font-size:
          12px;

        line-height:
          1.4;
      }


      #${LOGIN_ID}
      .estuda-login-status {

        display:
          none;

        margin-top:
          14px;

        text-align:
          center;

        color:
          #7dd3fc;

        font-size:
          12px;
      }


      #${LOGIN_ID}
      .estuda-login-footer {

        margin-top:
          17px;

        text-align:
          center;

        color:
          #64748b;

        font-size:
          10px;
      }

    `;

    document.head.appendChild(
      style
    );
  }


  /*
  =========================================================
  ESCONDER / MOSTRAR SISTEMA
  =========================================================
  */

  function hideLoader() {

    const loader =
      document.getElementById(
        "estudaPersonalLoader"
      );

    if (loader) {

      loader.style.display =
        "none";

    }

  }


  function hideSystem() {

    document.body.classList.add(
      "estuda-personal-auth-pending"
    );

    hideLoader();

  }


  function showSystem() {

    document.body.classList.remove(
      "estuda-personal-auth-pending"
    );

    hideLoader();


    const login =
      document.getElementById(
        LOGIN_ID
      );

    if (login) {

      login.remove();

    }

  }


  /*
  =========================================================
  USUÁRIO DA BARRA LATERAL
  =========================================================
  */

  function configureUser(session) {

    if (
      !session ||
      !session.user
    ) {
      return;
    }


    const user =
      session.user;


    const metadata =
      user.user_metadata || {};


    const email =
      user.email || "";


    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      (
        email
          ? email.split("@")[0]
          : "Conta logada"
      );


    const sideUser = {

      id:
        user.id,

      name:
        name,

      fullName:
        name,

      email:
        email

    };


    /*
    O index.html procura estas variáveis.
    */

    window.ESTUDA_PERSONAL_USER =
      sideUser;

    window.estudaPersonalUser =
      sideUser;

    window.estudaUser =
      user;


    try {

      localStorage.setItem(
        "estuda_personal_last_user_id",
        user.id || ""
      );


      localStorage.setItem(
        "estuda_personal_user_name",
        name || ""
      );


      localStorage.setItem(
        "estuda_personal_user_email",
        email || ""
      );


      localStorage.setItem(
        "estuda_personal_last_user_email",
        email || ""
      );

    } catch (error) {

      console.warn(
        "[Estuda+] Falha ao salvar informações locais.",
        error
      );

    }


    /*
    Atualiza o quadro:
    Conta logada / Conta ativa
    */

    setTimeout(() => {

      if (
        typeof
        window.renderSideAccount
        === "function"
      ) {

        try {

          window.renderSideAccount();

        } catch (error) {

          console.warn(error);

        }

      }

    }, 0);

  }


  function clearUser() {

    stopCloudRefreshLoop();
    cloudSavePending = null;
    clearTimeout(cloudSaveTimer);

    window.ESTUDA_PERSONAL_USER =
      null;

    window.estudaPersonalUser =
      null;

    window.estudaUser =
      null;

    window.ESTUDA_SESSION =
      null;
    window.ESTUDA_CLOUD_STATE_READY = false;
    window.ESTUDA_CLOUD_SYNC_STATUS = "desconectado";
    destructiveCloudClear = false;
    signedInLastUserId = "";
    signedInInFlight = null;
    signedInInFlightUserId = "";


    try {

      localStorage.removeItem(
        "estuda_personal_last_user_id"
      );

      localStorage.removeItem(
        "estuda_personal_user_name"
      );

      localStorage.removeItem(
        "estuda_personal_user_email"
      );

      localStorage.removeItem(
        "estuda_personal_last_user_email"
      );

      localStorage.removeItem(
        "estuda_session"
      );

    } catch (error) {

      console.warn(error);

    }

  }


  /*
  =========================================================
  ERROS / STATUS LOGIN
  =========================================================
  */

  function showError(message) {

    const element =
      document.querySelector(
        `#${LOGIN_ID} .estuda-login-error`
      );

    if (!element) {
      return;
    }


    element.textContent =
      message ||
      "Não foi possível entrar.";


    element.style.display =
      "block";

  }


  function hideError() {

    const element =
      document.querySelector(
        `#${LOGIN_ID} .estuda-login-error`
      );

    if (element) {

      element.style.display =
        "none";

    }

  }


  function showStatus(message) {

    const element =
      document.querySelector(
        `#${LOGIN_ID} .estuda-login-status`
      );

    if (!element) {
      return;
    }


    element.textContent =
      message || "";


    element.style.display =
      message
        ? "block"
        : "none";

  }


  function setLoading(loading) {

    const login =
      document.getElementById(
        LOGIN_ID
      );

    if (!login) {
      return;
    }


    login
      .querySelectorAll(
        "button,input"
      )
      .forEach(element => {

        element.disabled =
          !!loading;

      });

  }


  /*
  =========================================================
  TELA LOGIN
  =========================================================
  */

  function showLogin(
    initialError = ""
  ) {

    console.log(
      "[Estuda+] mostrando login"
    );


    createStyles();

    hideSystem();


    let login =
      document.getElementById(
        LOGIN_ID
      );


    if (!login) {

      login =
        document.createElement(
          "div"
        );


      login.id =
        LOGIN_ID;


      login.innerHTML = `

        <div
          class="estuda-login-card"
        >

          <div
            class="estuda-login-logo"
          >
            📚
          </div>


          <h1>
            Estuda+
          </h1>


          <div
            class="estuda-login-description"
          >

            Entre na sua conta para acessar
            seus dados de estudo e utilizar
            a integração com o TEC Concursos.

          </div>


          <form
            id="estudaLoginForm"
          >


            <div
              class="estuda-login-field"
            >

              <label
                for="estudaLoginEmail"
              >
                E-mail
              </label>

              <input
                id="estudaLoginEmail"
                type="email"
                autocomplete="email"
                placeholder="seuemail@exemplo.com"
                required
              >

            </div>


            <div
              class="estuda-login-field"
            >

              <label
                for="estudaLoginPassword"
              >
                Senha
              </label>

              <input
                id="estudaLoginPassword"
                type="password"
                autocomplete="current-password"
                placeholder="Sua senha"
                required
              >

            </div>


            <button
              type="submit"
              class="estuda-login-submit"
            >

              Entrar

            </button>

          </form>


          <button
            id="estudaLoginGoogle"
            type="button"
            class="estuda-login-google"
          >

            Entrar com Google

          </button>


          <div
            class="estuda-login-error"
          ></div>


          <div
            class="estuda-login-status"
          ></div>


          <div
            class="estuda-login-footer"
          >

            Sua conta é usada também para
            sincronizar o Estuda+ entre dispositivos.

          </div>

        </div>

      `;


      document.body.appendChild(
        login
      );


      /*
      LOGIN E-MAIL/SENHA
      */

      document
        .getElementById(
          "estudaLoginForm"
        )
        .addEventListener(
          "submit",
          async event => {

            event.preventDefault();


            hideError();


            const email =
              document
                .getElementById(
                  "estudaLoginEmail"
                )
                .value
                .trim();


            const password =
              document
                .getElementById(
                  "estudaLoginPassword"
                )
                .value;


            if (
              !email ||
              !password
            ) {

              showError(
                "Informe o e-mail e a senha."
              );

              return;

            }


            try {

              setLoading(true);

              showStatus(
                "Entrando..."
              );


              const {
                data,
                error
              } =
                await getClient()
                  .auth
                  .signInWithPassword({
                    email,
                    password
                  });


              if (error) {

                throw error;

              }


              if (
                !data ||
                !data.session
              ) {

                throw new Error(
                  "Não foi possível criar a sessão."
                );

              }


              await signedIn(
                data.session
              );


            } catch (error) {


              console.error(
                "[Estuda+] login falhou",
                error
              );


              showStatus("");


              showError(
                error?.message ||
                "Falha ao entrar."
              );


            } finally {


              setLoading(false);

            }

          }
        );


      /*
      LOGIN GOOGLE
      */

      document
        .getElementById(
          "estudaLoginGoogle"
        )
        .addEventListener(
          "click",
          async () => {

            try {


              hideError();

              setLoading(true);

              showStatus(
                "Abrindo Google..."
              );


              const redirectTo =
                window.location.origin +
                window.location.pathname;


              const {
                error
              } =
                await getClient()
                  .auth
                  .signInWithOAuth({

                    provider:
                      "google",

                    options: {
                      redirectTo:
                        redirectTo
                    }

                  });


              if (error) {

                throw error;

              }


            } catch (error) {


              console.error(
                error
              );


              setLoading(false);

              showStatus("");


              showError(
                error?.message ||
                "Não foi possível abrir o Google."
              );

            }

          }
        );

    }


    if (initialError) {

      showError(
        initialError
      );

    }

  }



  /*
  =========================================================
  PERSISTÊNCIA CLOUD DO ESTADO DO ESTUDA+
  =========================================================

  A conta Supabase passa a ser a fonte persistente principal.
  O localStorage continua somente como cache/backup local.
  O index.html já chama window.estudaPersonalQueueCloudSave(state)
  dentro de saveState(); esta implementação atende essa chamada.
  */

  const CLOUD_STATE_KEY = "estuda_plus_state_v2";
  const CLOUD_STATE_META_KEY = "estuda_plus_state_meta_v2";

  let cloudSaveTimer = null;
  let cloudSaveInFlight = false;
  let cloudSavePending = null;
  let cloudHydrating = false;
  let lastCloudFingerprint = "";
  let lastCloudLoadedAt = 0;
  let cloudSyncTimer = null;
  let destructiveCloudClear = false;
  let signedInInFlight = null;
  let signedInInFlightUserId = "";
  let signedInLastUserId = "";
  window.ESTUDA_CLOUD_STATE_READY = false;
  window.ESTUDA_CLOUD_SYNC_STATUS = "aguardando";

  function appStateRead() {
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        return state;
      }
    } catch (e) {}
    return null;
  }

  function appStateWrite(next) {
    try {
      if (typeof state !== "undefined") {
        state = next;
        return true;
      }
    } catch (e) {}
    return false;
  }

  function cloudClone(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (e) {
      return value;
    }
  }

  function cloudStateSize(value) {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch (e) {
      try {
        return JSON.stringify(value).length;
      } catch (e2) {
        return 0;
      }
    }
  }

  function cloudFingerprint(value) {
    try {
      const copy = cloudClone(value) || {};
      if (copy.metadata && typeof copy.metadata === "object") {
        delete copy.metadata.estudaLastSavedAt;
        delete copy.metadata.estudaCloudSavedAt;
      }
      const raw = JSON.stringify(copy);
      let hash = 2166136261;
      for (let i = 0; i < raw.length; i++) {
        hash ^= raw.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return (hash >>> 0).toString(16) + ":" + raw.length;
    } catch (e) {
      return String(Date.now());
    }
  }

  function cloudUserMetadata(user) {
    return user && user.user_metadata && typeof user.user_metadata === "object"
      ? user.user_metadata
      : {};
  }

  function cloudReadStateFromUser(user) {
    const metadata = cloudUserMetadata(user);
    let value = metadata[CLOUD_STATE_KEY];

    if (!value) return null;

    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.warn("[Estuda+] Estado cloud inválido; ignorando a cópia.");
        return null;
      }
    }

    if (!value || typeof value !== "object") return null;
    return value;
  }

  function cloudStampState(value) {
    const result = cloudClone(value);
    if (!result || typeof result !== "object") return result;

    if (!result.metadata || typeof result.metadata !== "object") {
      result.metadata = {};
    }

    result.metadata.estudaCloudPersistenceVersion = "2.0.0";
    result.metadata.estudaCloudSavedAt = new Date().toISOString();

    if (!result.metadata.estudaLastSavedAt) {
      result.metadata.estudaLastSavedAt = result.metadata.estudaCloudSavedAt;
    }

    return result;
  }

  function cloudMergeState(localState, remoteState) {
    if (!localState) return cloudClone(remoteState);
    if (!remoteState) return cloudClone(localState);

    try {
      if (typeof estudaMergeRecoveredState === "function") {
        return estudaMergeRecoveredState(localState, remoteState);
      }
    } catch (e) {
      console.warn("[Estuda+] Falha no merge inteligente; usando merge conservador.", e);
    }

    const local = cloudClone(localState) || {};
    const remote = cloudClone(remoteState) || {};
    const localAt = Date.parse(local?.metadata?.estudaLastSavedAt || "") || 0;
    const remoteAt = Date.parse(remote?.metadata?.estudaLastSavedAt || "") || 0;
    const base = remoteAt > localAt ? { ...local, ...remote } : { ...remote, ...local };

    const union = (a, b, keyFn) => {
      const map = new Map();
      [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].forEach(item => {
        const key = keyFn(item);
        if (!map.has(key)) map.set(key, item);
      });
      return [...map.values()];
    };

    base.weeklyActivities = union(
      local.weeklyActivities,
      remote.weeklyActivities,
      item => item?.id || `${item?.date || ""}|${item?.subject || ""}|${item?.topics || item?.topic || ""}|${item?.type || ""}`
    );

    base.records = union(
      local.records,
      remote.records,
      item => item?.id || `${item?.date || ""}|${item?.time || ""}|${item?.subject || ""}|${item?.sourceActivityId || ""}|${item?.sourceLogId || ""}`
    );

    base.editais = union(
      local.editais,
      remote.editais,
      item => `${item?.subject || ""}||${item?.topic || ""}`
    );

    base.subjects = union(
      local.subjects,
      remote.subjects,
      item => item?.name || item
    );

    base.simulados = union(
      local.simulados,
      remote.simulados,
      item => item?.id || `${item?.date || ""}|${item?.name || ""}`
    );

    base.tecConcursosErrorReasons = union(
      local.tecConcursosErrorReasons,
      remote.tecConcursosErrorReasons,
      item => item?.questionId || item?.questionTecId || item?.questionUrl || item?.url || item?.id
    );

    return base;
  }

  async function cloudGetCurrentUser() {
    const auth = getClient();
    const result = await auth.auth.getUser();

    if (result.error) throw result.error;

    return result?.data?.user || null;
  }

  async function cloudLoadState() {
    if (cloudHydrating) return null;

    try {
      cloudHydrating = true;

      const user = await cloudGetCurrentUser();
      if (!user) return null;

      const remote = cloudReadStateFromUser(user);
      if (!remote) {
        console.log("[Estuda+] Nenhum estado cloud encontrado; usando o estado local para migração.");
        return null;
      }

      lastCloudLoadedAt = Date.now();
      lastCloudFingerprint = cloudFingerprint(remote);

      return remote;
    } catch (error) {
      console.warn("[Estuda+] Falha ao carregar estado cloud:", error);
      return null;
    } finally {
      cloudHydrating = false;
    }
  }

  function cloudShadowKey(userId) {
    const id = String(userId || "").trim();
    return id ? "estudamais_cloud_pending_state_v40_" + id : "";
  }

  function cloudFenceKey(userId) {
    const id = String(userId || "").trim();
    return id ? "estudamais_clear_fence_v36_" + id : "";
  }

  function cloudReadLocalShadow(userId) {
    try {
      const key = cloudShadowKey(userId);
      if (!key) return null;
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function cloudWriteLocalShadow(userId, value) {
    try {
      const key = cloudShadowKey(userId);
      if (!key || !value) return false;
      const raw = JSON.stringify(value);
      if (raw.length > 800000) return false;
      localStorage.setItem(key, raw);
      return true;
    } catch (e) {
      return false;
    }
  }

  function cloudReadFence(userId) {
    try {
      const key = cloudFenceKey(userId);
      const value = key ? localStorage.getItem(key) : "";
      return Date.parse(value || "") || 0;
    } catch (e) {
      return 0;
    }
  }

  function cloudLocalSnapshotAllowed(local, remote, userId) {
    if (!local || typeof local !== "object") return false;
    const localAt = Date.parse(local?.metadata?.estudaLastSavedAt || "") || 0;
    const remoteAt = Date.parse(remote?.metadata?.estudaLastSavedAt || "") || 0;
    const fence = cloudReadFence(userId);
    const localClear = Date.parse(local?.metadata?.recordsClearedAt || "") || 0;
    if (fence && (localAt < fence || (localClear && localClear < fence))) return false;
    if (!remote) return localAt > 0;
    return localAt > remoteAt;
  }

  async function cloudWriteState(snapshot, allowDuringDestructiveClear) {
    if (destructiveCloudClear && !allowDuringDestructiveClear) return false;
    if (cloudSaveInFlight) {
      cloudSavePending = cloudClone(snapshot);
      return false;
    }

    const user = await cloudGetCurrentUser();
    if (!user) return false;

    const payload = cloudStampState(snapshot);
    const size = cloudStateSize(payload);

    /*
      Supabase Auth armazena user_metadata em JSONB. Mantemos um limite de
      segurança para evitar uma requisição excessivamente grande. O estado
      normal do Estuda+ fica abaixo deste limite; caso ultrapasse, mantemos
      a cópia local e avisamos no console sem destruir os dados.
    */
    if (size > 800000) {
      console.error("[Estuda+] Estado maior que o limite de segurança do sync cloud:", size, "bytes");
      return false;
    }

    const metadata = {
      ...cloudUserMetadata(user),
      [CLOUD_STATE_KEY]: payload,
      [CLOUD_STATE_META_KEY]: {
        version: "2.0.0",
        savedAt: payload?.metadata?.estudaCloudSavedAt || new Date().toISOString(),
        bytes: size
      }
    };

    /* Guarda imediatamente o último estado produzido pela interface. O
       snapshot só poderá vencer a nuvem no próximo F5 se for mais novo e
       não estiver atrás do marco de limpeza. */
    cloudWriteLocalShadow(user.id, payload);

    cloudSaveInFlight = true;

    try {
      const { data, error } = await getClient().auth.updateUser({
        data: metadata
      });

      if (error) throw error;

      lastCloudFingerprint = cloudFingerprint(payload);
      lastCloudLoadedAt = Date.now();

      console.log("[Estuda+] Estado salvo na nuvem.", {
        userId: data?.user?.id || user.id,
        bytes: size
      });

      return true;
    } catch (error) {
      console.warn("[Estuda+] Falha ao salvar estado cloud:", error);
      return false;
    } finally {
      cloudSaveInFlight = false;

      if (cloudSavePending) {
        const pending = cloudSavePending;
        cloudSavePending = null;
        setTimeout(() => {
          cloudWriteState(pending).catch(() => {});
        }, 250);
      }
    }
  }

  function queueCloudSave(snapshot) {
    const userId = window.ESTUDA_PERSONAL_USER?.id || "";
    if (!userId) return false;
    if (destructiveCloudClear) return false;
    if (cloudHydrating) return false;

    const copy = cloudClone(snapshot);
    if (!copy || typeof copy !== "object") return false;

    cloudWriteLocalShadow(userId, copy);

    const fp = cloudFingerprint(copy);
    if (fp === lastCloudFingerprint && Date.now() - lastCloudLoadedAt < 30000) {
      return true;
    }

    cloudSavePending = copy;
    clearTimeout(cloudSaveTimer);

    cloudSaveTimer = setTimeout(() => {
      const pending = cloudSavePending;
      cloudSavePending = null;

      if (pending) {
        cloudWriteState(pending).catch(error => {
          console.warn("[Estuda+] sync cloud:", error);
        });
      }
    }, 700);

    return true;
  }

  async function hydrateAppStateFromCloud() {
    if (cloudHydrating) return false;

    try {
      cloudHydrating = true;

      const user = await cloudGetCurrentUser();
      if (!user) {
        window.ESTUDA_CLOUD_STATE_READY = false;
        return false;
      }

      const remote = cloudReadStateFromUser(user);
      const local = cloudReadLocalShadow(user.id);
      const localAllowed = cloudLocalSnapshotAllowed(local, remote, user.id);
      let chosen = null;
      let recoveredPending = false;

      if (remote) {
        if (localAllowed) {
          chosen = cloudClone(local);
          recoveredPending = true;
          console.log("[Estuda+] F5: snapshot local mais novo que o Supabase; recuperando e reenviando.");
        } else {
          chosen = cloudClone(remote);
          /* O estado remoto é autoritativo quando não existe uma pendência
             local comprovadamente mais nova. Isso impede a volta de dados
             antigos depois de uma limpeza. */
          cloudWriteLocalShadow(user.id, chosen);
        }
      } else if (localAllowed) {
        chosen = cloudClone(local);
        recoveredPending = true;
      } else {
        chosen = appStateRead ? cloudClone(appStateRead()) : null;
      }

      if (chosen) {
        appStateWrite(chosen);
        lastCloudLoadedAt = Date.now();
        lastCloudFingerprint = cloudFingerprint(chosen);

        try {
          if (typeof syncEditalTopicsFromWeeklyActivities === "function") {
            syncEditalTopicsFromWeeklyActivities();
          }
          if (typeof syncEditalAfterDelete === "function") {
            syncEditalAfterDelete();
          }
          if (typeof refreshEditalComputedFields === "function") {
            refreshEditalComputedFields();
          }
          if (typeof syncActiveEditalProfile === "function" && !window.editalProfileApplying) {
            syncActiveEditalProfile();
          }
        } catch (e) {
          console.warn("[Estuda+] reconciliação pós-cloud falhou:", e);
        }
      }

      window.ESTUDA_CLOUD_STATE_READY = true;
      window.ESTUDA_CLOUD_LOCAL_PENDING_RECOVERY = recoveredPending;
      window.ESTUDA_CLOUD_SYNC_STATUS = recoveredPending ? "pendente" : "sincronizado";

      if (recoveredPending && chosen) {
        /* Escrita direta da pendência recuperada, sem criar outra hidratação. */
        const ok = await cloudWriteState(chosen, true);
        window.ESTUDA_CLOUD_LOCAL_PENDING_RECOVERY = false;
        window.ESTUDA_CLOUD_SYNC_STATUS = ok ? "sincronizado" : "erro";
      }

      return !!chosen;
    } catch (error) {
      window.ESTUDA_CLOUD_STATE_READY = true;
      window.ESTUDA_CLOUD_SYNC_STATUS = "erro";
      console.warn("[Estuda+] Falha ao hidratar estado cloud:", error);
      return false;
    } finally {
      cloudHydrating = false;
    }
  }

  window.estudaPersonalQueueCloudSave = queueCloudSave;
  window.estudaPersonalCloudLoad = cloudLoadState;
  window.estudaPersonalCloudDiagnostics = async function() {
    try {
      const user = await cloudGetCurrentUser();
      if (!user) return { ok:false, error:"Usuário não autenticado." };
      const cloud = cloudReadStateFromUser(user);
      const meta = cloudUserMetadata(user)[CLOUD_STATE_META_KEY] || null;
      return {
        ok:true,
        userId:user.id,
        stateKey:CLOUD_STATE_KEY,
        metaKey:CLOUD_STATE_META_KEY,
        remoteExists:!!cloud,
        remoteSavedAt:cloud?.metadata?.estudaLastSavedAt || "",
        remoteCloudSavedAt:cloud?.metadata?.estudaCloudSavedAt || "",
        remoteClearedAt:cloud?.metadata?.recordsClearedAt || "",
        remoteWeeklyCount:Array.isArray(cloud?.weeklyActivities)?cloud.weeklyActivities.length:0,
        remoteRecordsCount:Array.isArray(cloud?.records)?cloud.records.length:0,
        meta:meta
      };
    } catch (error) {
      return { ok:false, error:String(error?.message || error) };
    }
  };
  window.estudaPersonalCloudSaveNow = async function(nextState) {
    const current = nextState && typeof nextState === "object" ? nextState : appStateRead();
    return current ? cloudWriteState(current, false) : false;
  };

  window.estudaPersonalCloudReplaceNow = async function(nextState) {
    if (!nextState || typeof nextState !== "object") return false;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    cloudSavePending = null;
    await window.estudaPersonalWaitForCloudIdle();
    return cloudWriteState(nextState, true);
  };

  window.estudaPersonalBeginDestructiveCloudClear = function() {
    destructiveCloudClear = true;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = null;
    cloudSavePending = null;
  };

  window.estudaPersonalEndDestructiveCloudClear = function() {
    destructiveCloudClear = false;
  };

  window.estudaPersonalWaitForCloudIdle = async function() {
    let guard = 0;
    while (cloudSaveInFlight && guard < 400) {
      await new Promise(resolve => setTimeout(resolve, 25));
      guard++;
    }
    return !cloudSaveInFlight;
  };

  function startCloudRefreshLoop() {
    clearInterval(cloudSyncTimer);
    cloudSyncTimer = setInterval(async () => {
      if (cloudHydrating || cloudSaveInFlight || destructiveCloudClear) return;
      try {
        const user = await cloudGetCurrentUser();
        if (!user) return;
        const remote = cloudReadStateFromUser(user);
        if (!remote) return;
        const local = cloudReadLocalShadow(user.id);
        if (cloudLocalSnapshotAllowed(local, remote, user.id)) {
          appStateWrite(cloudClone(local));
          lastCloudFingerprint = cloudFingerprint(local);
          await cloudWriteState(local, false);
          if (typeof render === "function") render();
          return;
        }
        const remoteFp = cloudFingerprint(remote);
        if (remoteFp !== lastCloudFingerprint) {
          appStateWrite(cloudClone(remote));
          cloudWriteLocalShadow(user.id, remote);
          lastCloudFingerprint = remoteFp;
          lastCloudLoadedAt = Date.now();
          try {
            if (typeof syncEditalTopicsFromWeeklyActivities === "function") syncEditalTopicsFromWeeklyActivities();
            if (typeof syncEditalAfterDelete === "function") syncEditalAfterDelete();
            if (typeof refreshEditalComputedFields === "function") refreshEditalComputedFields();
          } catch (e) {}
          if (typeof render === "function") render();
        }
      } catch (error) {
        console.warn("[Estuda+] Atualização periódica cloud falhou:", error);
      }
    }, 60000);
  }

  function stopCloudRefreshLoop() {
    clearInterval(cloudSyncTimer);
    cloudSyncTimer = null;
  }

  /*
  =========================================================
  SINCRONIZAÇÃO COM O APP PRINCIPAL
  =========================================================

  auth-personal.js é carregado antes do bloco principal do index.html.
  Portanto, o Supabase pode terminar INITIAL_SESSION antes da variável
  global `state` existir. Nesse cenário, uma hidratação prematura é perdida
  quando o index.html executa `let state = loadState()`.

  O handshake abaixo faz a autenticação aguardar o estado do aplicativo.
  =========================================================
  */

  function estudaWaitForAppStateReady() {
    try {
      if (window.ESTUDA_APP_STATE_READY === true) return Promise.resolve(true);
      try {
        if (typeof state !== "undefined") {
          window.ESTUDA_APP_STATE_READY = true;
          return Promise.resolve(true);
        }
      } catch (e) {}

      return new Promise(resolve => {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          try { window.ESTUDA_APP_STATE_READY = true; } catch (e) {}
          resolve(true);
        };
        try {
          window.addEventListener("estuda:app-state-ready", finish, { once: true });
        } catch (e) {}

        /* Fallback defensivo: não bloqueia indefinidamente o login. */
        setTimeout(finish, 10000);
      });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  /*
  =========================================================
  USUÁRIO LOGADO
  =========================================================
  */

  async function signedIn(
    session
  ) {
    const userId = String(session?.user?.id || "").trim();
    if (!userId) return;

    if (signedInInFlight && signedInInFlightUserId === userId) {
      return signedInInFlight;
    }

    if (signedInLastUserId === userId && window.ESTUDA_CLOUD_STATE_READY === true) {
      configureUser(session);
      showSystem();
      startCloudRefreshLoop();
      return true;
    }

    signedInInFlightUserId = userId;
    signedInInFlight = (async () => {
      try {
        console.log(
          "[Estuda+] sessão autenticada",
          session.user?.email
        );

        window.ESTUDA_CLOUD_STATE_READY = false;
        configureUser(session);

        /* O index.html declara `state` depois de carregar este arquivo.
           Aguarde o estado principal existir antes de qualquer hidratação
           do Supabase, para que o F5 nunca hydrate um objeto ainda inexistente
           e depois o sobrescreva com INITIAL_DATA. */
        await estudaWaitForAppStateReady();
        await hydrateAppStateFromCloud();
        signedInLastUserId = userId;
        showSystem();
        startCloudRefreshLoop();

        setTimeout(() => {
          try {
            if (typeof window.renderSideAccount === "function") {
              window.renderSideAccount();
            }
            if (typeof window.render === "function") {
              window.render();
            }
          } catch (error) {
            console.warn("[Estuda+] render", error);
          }
        }, 50);

        return true;
      } finally {
        signedInInFlight = null;
        signedInInFlightUserId = "";
      }
    })();

    return signedInInFlight;
  }


  /*
  =========================================================
  LOGOUT
  =========================================================
  */

  async function logoutEstuda() {

    console.log(
      "[Estuda+] logout solicitado"
    );


    try {

      const auth =
        getClient();


      const {
        error
      } =
        await auth.auth
          .signOut({
            scope:
              "local"
          });


      if (error) {

        throw error;

      }


      clearUser();


      showLogin();


      console.log(
        "[Estuda+] logout concluído"
      );


      return true;


    } catch (error) {


      console.error(
        "[Estuda+] erro logout",
        error
      );


      alert(
        "Não foi possível sair da conta: " +
        (
          error?.message ||
          "erro desconhecido"
        )
      );


      return false;

    }

  }


  /*
  =========================================================
  NOMES ESPERADOS PELO INDEX.HTML
  =========================================================

  MUITO IMPORTANTE:

  O botão Sair existente no site procura
  estas funções exatamente.
  */

  window.estudaPersonalLogout =
    logoutEstuda;


  window.estudaPersonalSignOut =
    logoutEstuda;


  /*
  Mantemos também o nome usado
  anteriormente.
  */

  window.estudaLogout =
    logoutEstuda;


  /*
  =========================================================
  INICIALIZAÇÃO
  =========================================================
  */

  async function initialize() {

    window.ESTUDA_CLOUD_STATE_READY = false;
    window.ESTUDA_CLOUD_SYNC_STATUS = "aguardando";

    console.log(
      "[Estuda+] verificando sessão"
    );


    try {

      const auth =
        getClient();


      /*
      Ouvinte da sessão
      */

      if (!subscription) {


        const {
          data
        } =
          auth.auth
            .onAuthStateChange(
              (
                event,
                session
              ) => {


                console.log(
                  "[Estuda+] evento auth:",
                  event
                );


                if (
                  event ===
                    "SIGNED_OUT" ||
                  !session
                ) {


                  clearUser();


                  setTimeout(
                    () => {
                      showLogin();
                    },
                    0
                  );


                  return;

                }


                if (
                  event ===
                    "SIGNED_IN" ||
                  event ===
                    "INITIAL_SESSION" ||
                  event ===
                    "TOKEN_REFRESHED"
                ) {
                  setTimeout(() => { signedIn(session); }, 0);
                  return;
                }

                /* updateUser() dispara USER_UPDATED. Esse evento não é um
                   novo carregamento da base; recarregar aqui criava uma
                   segunda hidratação exatamente no momento em que o site
                   acabava de salvar uma atividade. */
                if (event === "USER_UPDATED") {
                  configureUser(session);
                }

              }
            );


        subscription =
          data?.subscription ||
          null;

      }


      /*
      Consulta sessão existente
      */

      const {
        data,
        error
      } =
        await auth.auth
          .getSession();


      if (error) {

        throw error;

      }


      if (
        data &&
        data.session
      ) {


        await signedIn(
          data.session
        );


      } else {


        clearUser();


        showLogin();

      }


    } catch (error) {


      console.error(
        "[Estuda+] erro inicialização",
        error
      );


      clearUser();


      showLogin(
        error?.message ||
        "Falha ao iniciar autenticação."
      );

    }

  }


  window.iniciarAuthPersonal =
    initialize;


  /*
  =========================================================
  INICIAR
  =========================================================
  */

  if (
    document.readyState ===
    "loading"
  ) {


    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      {
        once:
          true
      }
    );


  } else {


    initialize();

  }

})();