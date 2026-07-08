// js/components/i18n.js
// Centralized translations. Exposes window.applyTranslations (used by
// router.js after every SPA content swap) and window.t(key) for page
// scripts that need to translate dynamically-rendered text (e.g. status
// badges built in JS after data loads from the API).

const translations = {
    en: {
        "nav.dashboard": "Dashboard", "nav.profile": "Profile", "nav.education": "Education", "nav.skills": "Skills", "nav.experience": "Experience", "nav.projects": "Projects", "nav.certificates": "Certificates", "nav.gallery": "Gallery & Docs", "nav.assets": "Assets", "nav.finance": "Finance", "nav.reports": "Reports", "nav.tasks": "Tasks", "nav.resume": "Resume",
        "header.profile": "My Profile", "header.settings": "Settings", "header.logout": "Logout", "title.welcome": "Welcome",
        "word.income": "Income", "word.expense": "Expense", "word.balance": "Balance", "word.pending": "Pending", "word.completed": "Completed", "word.notifications": "Notifications", "word.recent": "Recent",
        "btn.add": "Add", "btn.edit": "Edit", "btn.delete": "Delete", "btn.save": "Save", "btn.cancel": "Cancel", "btn.close": "Close", "btn.search": "Search", "btn.download": "Download", "btn.upload": "Upload", "btn.view": "View", "btn.update": "Update", "btn.confirm": "Confirm", "btn.saveChanges": "Save Changes",
        "table.action": "Action", "table.status": "Status", "table.date": "Date", "table.category": "Category", "table.amount": "Amount", "table.description": "Description", "table.noRecords": "No records found.",
        "status.all": "All", "status.pending": "Pending", "status.inProgress": "In Progress", "status.completed": "Completed", "status.cancelled": "Cancelled",
        "settings.account": "Account", "settings.security": "Security & Password", "settings.notifications": "Notifications", "settings.appearance": "Appearance", "settings.changePassword": "Change Password", "settings.deleteAccount": "Delete Account",
        "msg.savedSuccess": "Saved successfully!", "msg.deletedSuccess": "Deleted successfully.", "msg.errorOccurred": "An error occurred.", "common.loading": "Loading..."
    },
    sw: {
        "nav.dashboard": "Dashibodi", "nav.profile": "Wasifu", "nav.education": "Elimu", "nav.skills": "Ujuzi", "nav.experience": "Uzoefu", "nav.projects": "Miradi", "nav.certificates": "Vyeti", "nav.gallery": "Picha & Nyaraka", "nav.assets": "Mali Zangu", "nav.finance": "Fedha", "nav.reports": "Ripoti", "nav.tasks": "Majukumu", "nav.resume": "Wasifu (CV)",
        "header.profile": "Wasifu Wangu", "header.settings": "Mipangilio", "header.logout": "Toka", "title.welcome": "Karibu",
        "word.income": "Mapato", "word.expense": "Matumizi", "word.balance": "Salio", "word.pending": "Inasubiri", "word.completed": "Imekamilika", "word.notifications": "Arifa", "word.recent": "Mapya",
        "btn.add": "Ongeza", "btn.edit": "Hariri", "btn.delete": "Futa", "btn.save": "Hifadhi", "btn.cancel": "Ghairi", "btn.close": "Funga", "btn.search": "Tafuta", "btn.download": "Pakua", "btn.upload": "Pakia", "btn.view": "Tazama", "btn.update": "Sasisha", "btn.confirm": "Thibitisha", "btn.saveChanges": "Hifadhi Mabadiliko",
        "table.action": "Kitendo", "table.status": "Hali", "table.date": "Tarehe", "table.category": "Aina", "table.amount": "Kiasi", "table.description": "Maelezo", "table.noRecords": "Hakuna rekodi zilizopatikana.",
        "status.all": "Zote", "status.pending": "Inasubiri", "status.inProgress": "Inaendelea", "status.completed": "Imekamilika", "status.cancelled": "Imeghairiwa",
        "settings.account": "Akaunti", "settings.security": "Usalama na Nenosiri", "settings.notifications": "Arifa", "settings.appearance": "Muonekano", "settings.changePassword": "Badilisha Nenosiri", "settings.deleteAccount": "Futa Akaunti",
        "msg.savedSuccess": "Imehifadhiwa kwa mafanikio!", "msg.deletedSuccess": "Imefutwa kwa mafanikio.", "msg.errorOccurred": "Hitilafu imetokea.", "common.loading": "Inapakia..."
    },
    fr: {
        "nav.dashboard": "Tableau de Bord", "nav.profile": "Profil", "nav.education": "Éducation", "nav.skills": "Compétences", "nav.experience": "Expérience", "nav.projects": "Projets", "nav.certificates": "Certificats", "nav.gallery": "Galerie", "nav.assets": "Actifs", "nav.finance": "Finances", "nav.reports": "Rapports", "nav.tasks": "Tâches", "nav.resume": "Mon CV",
        "header.profile": "Mon Profil", "header.settings": "Paramètres", "header.logout": "Déconnexion", "title.welcome": "Bienvenue",
        "word.income": "Revenu", "word.expense": "Dépense", "word.balance": "Solde", "word.pending": "En attente", "word.completed": "Terminé", "word.notifications": "Notifications", "word.recent": "Récent",
        "btn.add": "Ajouter", "btn.edit": "Modifier", "btn.delete": "Supprimer", "btn.save": "Enregistrer", "btn.cancel": "Annuler", "btn.close": "Fermer", "btn.search": "Rechercher", "btn.download": "Télécharger", "btn.upload": "Importer", "btn.view": "Voir", "btn.update": "Mettre à jour", "btn.confirm": "Confirmer", "btn.saveChanges": "Enregistrer les modifications",
        "table.action": "Action", "table.status": "Statut", "table.date": "Date", "table.category": "Catégorie", "table.amount": "Montant", "table.description": "Description", "table.noRecords": "Aucun enregistrement trouvé.",
        "status.all": "Tous", "status.pending": "En attente", "status.inProgress": "En cours", "status.completed": "Terminé", "status.cancelled": "Annulé",
        "settings.account": "Compte", "settings.security": "Sécurité & Mot de passe", "settings.notifications": "Notifications", "settings.appearance": "Apparence", "settings.changePassword": "Changer le mot de passe", "settings.deleteAccount": "Supprimer le compte",
        "msg.savedSuccess": "Enregistré avec succès !", "msg.deletedSuccess": "Supprimé avec succès.", "msg.errorOccurred": "Une erreur s'est produite.", "common.loading": "Chargement..."
    },
    es: {
        "nav.dashboard": "Panel", "nav.profile": "Perfil", "nav.education": "Educación", "nav.skills": "Habilidades", "nav.experience": "Experiencia", "nav.projects": "Proyectos", "nav.certificates": "Certificados", "nav.gallery": "Galería", "nav.assets": "Activos", "nav.finance": "Finanzas", "nav.reports": "Reportes", "nav.tasks": "Tareas", "nav.resume": "Currículum",
        "header.profile": "Mi Perfil", "header.settings": "Ajustes", "header.logout": "Cerrar sesión", "title.welcome": "Bienvenido",
        "word.income": "Ingreso", "word.expense": "Gasto", "word.balance": "Saldo", "word.pending": "Pendiente", "word.completed": "Completado", "word.notifications": "Notificaciones", "word.recent": "Reciente",
        "btn.add": "Agregar", "btn.edit": "Editar", "btn.delete": "Eliminar", "btn.save": "Guardar", "btn.cancel": "Cancelar", "btn.close": "Cerrar", "btn.search": "Buscar", "btn.download": "Descargar", "btn.upload": "Subir", "btn.view": "Ver", "btn.update": "Actualizar", "btn.confirm": "Confirmar", "btn.saveChanges": "Guardar Cambios",
        "table.action": "Acción", "table.status": "Estado", "table.date": "Fecha", "table.category": "Categoría", "table.amount": "Monto", "table.description": "Descripción", "table.noRecords": "No se encontraron registros.",
        "status.all": "Todos", "status.pending": "Pendiente", "status.inProgress": "En progreso", "status.completed": "Completado", "status.cancelled": "Cancelado",
        "settings.account": "Cuenta", "settings.security": "Seguridad y Contraseña", "settings.notifications": "Notificaciones", "settings.appearance": "Apariencia", "settings.changePassword": "Cambiar Contraseña", "settings.deleteAccount": "Eliminar Cuenta",
        "msg.savedSuccess": "¡Guardado con éxito!", "msg.deletedSuccess": "Eliminado con éxito.", "msg.errorOccurred": "Ocurrió un error.", "common.loading": "Cargando..."
    },
    de: {
        "nav.dashboard": "Dashboard", "nav.profile": "Profil", "nav.education": "Bildung", "nav.skills": "Fähigkeiten", "nav.experience": "Erfahrung", "nav.projects": "Projekte", "nav.certificates": "Zertifikate", "nav.gallery": "Galerie", "nav.assets": "Vermögenswerte", "nav.finance": "Finanzen", "nav.reports": "Berichte", "nav.tasks": "Aufgaben", "nav.resume": "Lebenslauf",
        "header.profile": "Mein Profil", "header.settings": "Einstellungen", "header.logout": "Abmelden", "title.welcome": "Willkommen",
        "word.income": "Einkommen", "word.expense": "Ausgabe", "word.balance": "Saldo", "word.pending": "Ausstehend", "word.completed": "Abgeschlossen", "word.notifications": "Benachrichtigungen", "word.recent": "Kürzlich",
        "btn.add": "Hinzufügen", "btn.edit": "Bearbeiten", "btn.delete": "Löschen", "btn.save": "Speichern", "btn.cancel": "Abbrechen", "btn.close": "Schließen", "btn.search": "Suchen", "btn.download": "Herunterladen", "btn.upload": "Hochladen", "btn.view": "Ansehen", "btn.update": "Aktualisieren", "btn.confirm": "Bestätigen", "btn.saveChanges": "Änderungen speichern",
        "table.action": "Aktion", "table.status": "Status", "table.date": "Datum", "table.category": "Kategorie", "table.amount": "Betrag", "table.description": "Beschreibung", "table.noRecords": "Keine Einträge gefunden.",
        "status.all": "Alle", "status.pending": "Ausstehend", "status.inProgress": "In Bearbeitung", "status.completed": "Abgeschlossen", "status.cancelled": "Storniert",
        "settings.account": "Konto", "settings.security": "Sicherheit & Passwort", "settings.notifications": "Benachrichtigungen", "settings.appearance": "Erscheinungsbild", "settings.changePassword": "Passwort ändern", "settings.deleteAccount": "Konto löschen",
        "msg.savedSuccess": "Erfolgreich gespeichert!", "msg.deletedSuccess": "Erfolgreich gelöscht.", "msg.errorOccurred": "Ein Fehler ist aufgetreten.", "common.loading": "Wird geladen..."
    },
    zh: {
        "nav.dashboard": "仪表板", "nav.profile": "个人资料", "nav.education": "教育", "nav.skills": "技能", "nav.experience": "经验", "nav.projects": "项目", "nav.certificates": "证书", "nav.gallery": "画廊", "nav.assets": "资产", "nav.finance": "财务", "nav.reports": "报告", "nav.tasks": "任务", "nav.resume": "简历",
        "header.profile": "我的资料", "header.settings": "设置", "header.logout": "登出", "title.welcome": "欢迎",
        "word.income": "收入", "word.expense": "支出", "word.balance": "余额", "word.pending": "待处理", "word.completed": "已完成", "word.notifications": "通知", "word.recent": "最近",
        "btn.add": "添加", "btn.edit": "编辑", "btn.delete": "删除", "btn.save": "保存", "btn.cancel": "取消", "btn.close": "关闭", "btn.search": "搜索", "btn.download": "下载", "btn.upload": "上传", "btn.view": "查看", "btn.update": "更新", "btn.confirm": "确认", "btn.saveChanges": "保存更改",
        "table.action": "操作", "table.status": "状态", "table.date": "日期", "table.category": "类别", "table.amount": "金额", "table.description": "描述", "table.noRecords": "未找到记录。",
        "status.all": "全部", "status.pending": "待处理", "status.inProgress": "进行中", "status.completed": "已完成", "status.cancelled": "已取消",
        "settings.account": "账户", "settings.security": "安全与密码", "settings.notifications": "通知", "settings.appearance": "外观", "settings.changePassword": "修改密码", "settings.deleteAccount": "删除账户",
        "msg.savedSuccess": "保存成功！", "msg.deletedSuccess": "删除成功。", "msg.errorOccurred": "发生错误。", "common.loading": "加载中..."
    },
    ar: {
        "nav.dashboard": "لوحة القيادة", "nav.profile": "الملف الشخصي", "nav.education": "التعليم", "nav.skills": "المهارات", "nav.experience": "خبرة", "nav.projects": "مشاريع", "nav.certificates": "الشهادات", "nav.gallery": "صالة عرض", "nav.assets": "أصول", "nav.finance": "المالية", "nav.reports": "تقارير", "nav.tasks": "مهام", "nav.resume": "السيرة الذاتية",
        "header.profile": "ملفي", "header.settings": "إعدادات", "header.logout": "تسجيل خروج", "title.welcome": "مرحباً",
        "word.income": "الدخل", "word.expense": "المصروف", "word.balance": "الرصيد", "word.pending": "قيد الانتظار", "word.completed": "مكتمل", "word.notifications": "الإشعارات", "word.recent": "الأخيرة",
        "btn.add": "إضافة", "btn.edit": "تعديل", "btn.delete": "حذف", "btn.save": "حفظ", "btn.cancel": "إلغاء", "btn.close": "إغلاق", "btn.search": "بحث", "btn.download": "تنزيل", "btn.upload": "رفع", "btn.view": "عرض", "btn.update": "تحديث", "btn.confirm": "تأكيد", "btn.saveChanges": "حفظ التغييرات",
        "table.action": "إجراء", "table.status": "الحالة", "table.date": "التاريخ", "table.category": "الفئة", "table.amount": "المبلغ", "table.description": "الوصف", "table.noRecords": "لم يتم العثور على سجلات.",
        "status.all": "الكل", "status.pending": "قيد الانتظار", "status.inProgress": "قيد التنفيذ", "status.completed": "مكتمل", "status.cancelled": "ملغى",
        "settings.account": "الحساب", "settings.security": "الأمان وكلمة المرور", "settings.notifications": "الإشعارات", "settings.appearance": "المظهر", "settings.changePassword": "تغيير كلمة المرور", "settings.deleteAccount": "حذف الحساب",
        "msg.savedSuccess": "تم الحفظ بنجاح!", "msg.deletedSuccess": "تم الحذف بنجاح.", "msg.errorOccurred": "حدث خطأ.", "common.loading": "جارٍ التحميل..."
    },
    hi: {
        "nav.dashboard": "डैशबोर्ड", "nav.profile": "प्रोफ़ाइल", "nav.education": "शिक्षा", "nav.skills": "कौशल", "nav.experience": "अनुभव", "nav.projects": "प्रोजेक्ट्स", "nav.certificates": "प्रमाणपत्र", "nav.gallery": "गैलरी", "nav.assets": "संपत्ति", "nav.finance": "वित्त", "nav.reports": "रिपोर्ट्स", "nav.tasks": "कार्य", "nav.resume": "रिज्यूमे",
        "header.profile": "मेरी प्रोफ़ाइल", "header.settings": "सेटिंग्स", "header.logout": "लॉग आउट", "title.welcome": "स्वागत",
        "word.income": "आय", "word.expense": "व्यय", "word.balance": "शेष", "word.pending": "लंबित", "word.completed": "पूर्ण", "word.notifications": "सूचनाएं", "word.recent": "हाल का",
        "btn.add": "जोड़ें", "btn.edit": "संपादित करें", "btn.delete": "हटाएं", "btn.save": "सहेजें", "btn.cancel": "रद्द करें", "btn.close": "बंद करें", "btn.search": "खोजें", "btn.download": "डाउनलोड", "btn.upload": "अपलोड", "btn.view": "देखें", "btn.update": "अपडेट करें", "btn.confirm": "पुष्टि करें", "btn.saveChanges": "परिवर्तन सहेजें",
        "table.action": "कार्रवाई", "table.status": "स्थिति", "table.date": "तारीख", "table.category": "श्रेणी", "table.amount": "राशि", "table.description": "विवरण", "table.noRecords": "कोई रिकॉर्ड नहीं मिला।",
        "status.all": "सभी", "status.pending": "लंबित", "status.inProgress": "प्रगति में", "status.completed": "पूर्ण", "status.cancelled": "रद्द",
        "settings.account": "खाता", "settings.security": "सुरक्षा और पासवर्ड", "settings.notifications": "सूचनाएं", "settings.appearance": "रूप", "settings.changePassword": "पासवर्ड बदलें", "settings.deleteAccount": "खाता हटाएं",
        "msg.savedSuccess": "सफलतापूर्वक सहेजा गया!", "msg.deletedSuccess": "सफलतापूर्वक हटाया गया।", "msg.errorOccurred": "एक त्रुटि हुई।", "common.loading": "लोड हो रहा है..."
    },
    pt: {
        "nav.dashboard": "Painel", "nav.profile": "Perfil", "nav.education": "Educação", "nav.skills": "Habilidades", "nav.experience": "Experiência", "nav.projects": "Projetos", "nav.certificates": "Certificados", "nav.gallery": "Galeria", "nav.assets": "Ativos", "nav.finance": "Finanças", "nav.reports": "Relatórios", "nav.tasks": "Tarefas", "nav.resume": "Currículo",
        "header.profile": "Meu Perfil", "header.settings": "Configurações", "header.logout": "Sair", "title.welcome": "Bem-vindo",
        "word.income": "Renda", "word.expense": "Despesa", "word.balance": "Saldo", "word.pending": "Pendente", "word.completed": "Concluído", "word.notifications": "Notificações", "word.recent": "Recente",
        "btn.add": "Adicionar", "btn.edit": "Editar", "btn.delete": "Excluir", "btn.save": "Salvar", "btn.cancel": "Cancelar", "btn.close": "Fechar", "btn.search": "Pesquisar", "btn.download": "Baixar", "btn.upload": "Enviar", "btn.view": "Ver", "btn.update": "Atualizar", "btn.confirm": "Confirmar", "btn.saveChanges": "Salvar Alterações",
        "table.action": "Ação", "table.status": "Status", "table.date": "Data", "table.category": "Categoria", "table.amount": "Valor", "table.description": "Descrição", "table.noRecords": "Nenhum registro encontrado.",
        "status.all": "Todos", "status.pending": "Pendente", "status.inProgress": "Em andamento", "status.completed": "Concluído", "status.cancelled": "Cancelado",
        "settings.account": "Conta", "settings.security": "Segurança e Senha", "settings.notifications": "Notificações", "settings.appearance": "Aparência", "settings.changePassword": "Alterar Senha", "settings.deleteAccount": "Excluir Conta",
        "msg.savedSuccess": "Salvo com sucesso!", "msg.deletedSuccess": "Excluído com sucesso.", "msg.errorOccurred": "Ocorreu um erro.", "common.loading": "Carregando..."
    },
    ru: {
        "nav.dashboard": "Панель", "nav.profile": "Профиль", "nav.education": "Образование", "nav.skills": "Навыки", "nav.experience": "Опыт", "nav.projects": "Проекты", "nav.certificates": "Сертификаты", "nav.gallery": "Галерея", "nav.assets": "Активы", "nav.finance": "Финансы", "nav.reports": "Отчеты", "nav.tasks": "Задачи", "nav.resume": "Резюме",
        "header.profile": "Мой профиль", "header.settings": "Настройки", "header.logout": "Выйти", "title.welcome": "Добро пожаловать",
        "word.income": "Доход", "word.expense": "Расход", "word.balance": "Баланс", "word.pending": "В ожидании", "word.completed": "Завершено", "word.notifications": "Уведомления", "word.recent": "Недавние",
        "btn.add": "Добавить", "btn.edit": "Редактировать", "btn.delete": "Удалить", "btn.save": "Сохранить", "btn.cancel": "Отмена", "btn.close": "Закрыть", "btn.search": "Поиск", "btn.download": "Скачать", "btn.upload": "Загрузить", "btn.view": "Просмотр", "btn.update": "Обновить", "btn.confirm": "Подтвердить", "btn.saveChanges": "Сохранить изменения",
        "table.action": "Действие", "table.status": "Статус", "table.date": "Дата", "table.category": "Категория", "table.amount": "Сумма", "table.description": "Описание", "table.noRecords": "Записи не найдены.",
        "status.all": "Все", "status.pending": "В ожидании", "status.inProgress": "В процессе", "status.completed": "Завершено", "status.cancelled": "Отменено",
        "settings.account": "Аккаунт", "settings.security": "Безопасность и пароль", "settings.notifications": "Уведомления", "settings.appearance": "Внешний вид", "settings.changePassword": "Изменить пароль", "settings.deleteAccount": "Удалить аккаунт",
        "msg.savedSuccess": "Успешно сохранено!", "msg.deletedSuccess": "Успешно удалено.", "msg.errorOccurred": "Произошла ошибка.", "common.loading": "Загрузка..."
    },
    ja: {
        "nav.dashboard": "ダッシュボード", "nav.profile": "プロフィール", "nav.education": "教育", "nav.skills": "スキル", "nav.experience": "経験", "nav.projects": "プロジェクト", "nav.certificates": "証明書", "nav.gallery": "ギャラリー", "nav.assets": "資産", "nav.finance": "財務", "nav.reports": "レポート", "nav.tasks": "タスク", "nav.resume": "履歴書",
        "header.profile": "マイプロフィール", "header.settings": "設定", "header.logout": "ログアウト", "title.welcome": "ようこそ",
        "word.income": "収入", "word.expense": "支出", "word.balance": "残高", "word.pending": "保留中", "word.completed": "完了", "word.notifications": "通知", "word.recent": "最近",
        "btn.add": "追加", "btn.edit": "編集", "btn.delete": "削除", "btn.save": "保存", "btn.cancel": "キャンセル", "btn.close": "閉じる", "btn.search": "検索", "btn.download": "ダウンロード", "btn.upload": "アップロード", "btn.view": "表示", "btn.update": "更新", "btn.confirm": "確認", "btn.saveChanges": "変更を保存",
        "table.action": "操作", "table.status": "ステータス", "table.date": "日付", "table.category": "カテゴリー", "table.amount": "金額", "table.description": "説明", "table.noRecords": "記録が見つかりません。",
        "status.all": "すべて", "status.pending": "保留中", "status.inProgress": "進行中", "status.completed": "完了", "status.cancelled": "キャンセル済み",
        "settings.account": "アカウント", "settings.security": "セキュリティとパスワード", "settings.notifications": "通知", "settings.appearance": "外観", "settings.changePassword": "パスワードを変更", "settings.deleteAccount": "アカウントを削除",
        "msg.savedSuccess": "正常に保存されました！", "msg.deletedSuccess": "正常に削除されました。", "msg.errorOccurred": "エラーが発生しました。", "common.loading": "読み込み中..."
    }
};

function applyTranslations(lang) {
    const dict = translations[lang] || translations['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });
    // Also translate placeholder text where requested via data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });
    document.documentElement.setAttribute('lang', lang);
}

// Looks up a single translated string for use in dynamically-rendered
// content (e.g. table rows built by page controllers after data loads).
window.t = function (key) {
    const lang = localStorage.getItem('app_lang') || 'en';
    const dict = translations[lang] || translations['en'];
    return dict[key] || translations['en'][key] || key;
};

// Exposed so router.js can re-translate content after every SPA page swap
// (without this, only the sidebar/header — which never get replaced —
// stayed translated, while swapped-in page content stayed in English).
window.applyTranslations = applyTranslations;

window.changeLanguage = function (lang) {
    localStorage.setItem('app_lang', lang);
    applyTranslations(lang);
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('app_lang') || 'en';
    applyTranslations(savedLang);

    const langBtns = document.querySelectorAll('.lang-selector');
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const chosenLang = e.target.getAttribute('data-lang');
            window.changeLanguage(chosenLang);
        });
    });
});
