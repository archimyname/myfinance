import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, onSnapshot }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const cfg = window.FIREBASE_CONFIG;
const ui = (icon, text, signedIn) => window.setSyncStatus && window.setSyncStatus(icon, text, signedIn);

if (!cfg || !cfg.apiKey || cfg.apiKey.indexOf('ВСТАВЬТЕ') === 0) {
  ui('☁️', 'Синхронизация не настроена: заполните файл firebase-config.js (см. README.txt). Пока данные хранятся только на этом устройстве.', false);
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalAutoDetectLongPolling: true
  });

  let ref = null, unsub = null, timer = null, applying = false;

  const ERR = {
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/invalid-email': 'Некорректный email',
    'auth/email-already-in-use': 'Такой аккаунт уже есть — нажмите «Войти»',
    'auth/weak-password': 'Пароль слишком короткий (минимум 6 символов)',
    'auth/network-request-failed': 'Нет соединения с интернетом',
    'auth/too-many-requests': 'Слишком много попыток, попробуйте позже',
    'auth/operation-not-allowed': 'В Firebase не включён вход по email и паролю',
    'auth/unauthorized-domain': 'Добавьте адрес сайта в Authentication → Settings → Authorized domains'
  };
  const errText = e => ERR[e.code] || ('Ошибка: ' + (e.code || e.message));

  async function run(fn) {
    const email = document.getElementById('syncEmail').value.trim();
    const pass = document.getElementById('syncPass').value;
    if (!email || !pass) { ui('☁️', 'Введите email и пароль', false); return; }
    ui('🔄', 'Подключение…', false);
    try { await fn(auth, email, pass); } catch (e) { ui('☁️', errText(e), false); }
  }

  function doPush() {
    if (!ref) return;
    const d = window.App.getData();
    setDoc(ref, { expenses: d.expenses, shopping: d.shopping, updatedAt: d.updatedAt, month: d.month, income: d.income || 0, more: d.more || {} })
      .catch(e => ui('⚠️', 'Не удалось отправить: ' + (e.code || e.message), true));
  }
  function push() {
    if (!ref || applying) return;
    clearTimeout(timer);
    ui('🔄', 'Отправка…', true);
    timer = setTimeout(doPush, 600);
  }

  window.Sync = {
    push,
    signIn: () => run(signInWithEmailAndPassword),
    signUp: () => run(createUserWithEmailAndPassword),
    signOut: () => signOut(auth)
  };

  onAuthStateChanged(auth, user => {
    if (unsub) { unsub(); unsub = null; }
    if (!user) {
      ref = null;
      ui('☁️', 'Вы не вошли. Данные хранятся только на этом устройстве.', false);
      return;
    }
    ref = doc(db, 'users', user.uid);
    let first = true;
    unsub = onSnapshot(ref, { includeMetadataChanges: true }, snap => {
      const pending = snap.metadata.hasPendingWrites;
      const cached = snap.metadata.fromCache;
      const local = window.App.getData();
      if (!pending) {
        if (snap.exists()) {
          const r = snap.data();
          if ((r.updatedAt || 0) > local.updatedAt) {
            applying = true; window.App.applyRemote(r); applying = false;
          } else if (first && (r.updatedAt || 0) < local.updatedAt) {
            doPush();
          }
        } else if (first && !cached) {
          doPush(); // в облаке пока пусто — загружаем данные этого устройства
        }
      }
      if (!cached) first = false;
      if (pending) ui('🔄', 'Отправка…', true);
      else if (cached) ui('📴', 'Нет связи с сервером. Изменения сохранятся на устройстве и отправятся позже. Аккаунт: ' + user.email, true);
      else ui('✅', 'Синхронизировано. Аккаунт: ' + user.email, true);
    }, err => ui('⚠️', 'Ошибка синхронизации: ' + (err.code || err.message), true));
  });
}
