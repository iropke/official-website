/**
 * 쿠키 동의 UI 카피 사전.
 *
 * 진실 원천: content-generation/policy/cookies/cookie-policy.md (20 locale 큐레이션).
 * 기획서: references/requirements/iropke_cookie_consent_ui.md
 *
 * locale 정책: 약관성 콘텐츠는 자동 번역 대상에서 제외 — 20 locale 모두 사람이
 * 큐레이션한 카피를 직접 등록한다. `getCookieConsentCopy()` 의 fallback 은
 * 안전망일 뿐 정상 경로에서는 도달하지 않는다.
 */

import type { Locale } from '@/i18n/locales'

export interface CookieCategoryCopy {
  title: string
  description: string
}

export interface CookieConsentCopy {
  bannerMessage: string
  acceptAll: string
  rejectAll: string
  managePreferences: string
  modalTitle: string
  modalIntro: string
  savePreferences: string
  closeLabel: string
  alwaysOn: string
  categories: {
    necessary: CookieCategoryCopy
    analytics: CookieCategoryCopy
    marketing: CookieCategoryCopy
    functional: CookieCategoryCopy
  }
}

const en: CookieConsentCopy = {
  bannerMessage:
    'We use cookies to improve your experience, analyze traffic, and personalize content.',
  acceptAll: 'Accept All',
  rejectAll: 'Reject All',
  managePreferences: 'Manage Preferences',
  modalTitle: 'Cookie Preferences',
  modalIntro:
    'Choose which categories of cookies you allow. Necessary cookies are always active.',
  savePreferences: 'Save Preferences',
  closeLabel: 'Close',
  alwaysOn: 'Always on',
  categories: {
    necessary: {
      title: 'Necessary',
      description: 'Required for site functionality. Cannot be disabled.',
    },
    analytics: {
      title: 'Analytics',
      description: 'Tracks usage and performance to help us improve the site.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Used for ad personalization and tracking.',
    },
    functional: {
      title: 'Functional',
      description: 'Enhances usability such as remembering preferences.',
    },
  },
}

const ko: CookieConsentCopy = {
  bannerMessage:
    '저희는 사용자 경험 향상, 트래픽 분석, 콘텐츠 개인화를 위해 쿠키를 사용합니다.',
  acceptAll: '모두 허용',
  rejectAll: '모두 거부',
  managePreferences: '설정 관리',
  modalTitle: '쿠키 환경설정',
  modalIntro:
    '허용할 쿠키 카테고리를 선택해 주세요. 필수 쿠키는 항상 활성화되어 있습니다.',
  savePreferences: '설정 저장',
  closeLabel: '닫기',
  alwaysOn: '항상 켜짐',
  categories: {
    necessary: {
      title: '필수',
      description: '사이트 기본 기능에 반드시 필요합니다. 비활성화할 수 없습니다.',
    },
    analytics: {
      title: '분석',
      description: '사이트 개선을 위해 이용 패턴과 성능을 측정합니다.',
    },
    marketing: {
      title: '마케팅',
      description: '광고 개인화 및 추적에 사용됩니다.',
    },
    functional: {
      title: '기능',
      description: '환경설정 기억 등 사용 편의 기능에 사용됩니다.',
    },
  },
}

const zh: CookieConsentCopy = {
  bannerMessage: '我们使用 Cookie 来改善您的体验、分析流量并个性化内容。',
  acceptAll: '全部接受',
  rejectAll: '全部拒绝',
  managePreferences: '管理偏好',
  modalTitle: 'Cookie 偏好设置',
  modalIntro: '请选择您允许的 Cookie 类别。必需 Cookie 始终启用。',
  savePreferences: '保存偏好',
  closeLabel: '关闭',
  alwaysOn: '始终启用',
  categories: {
    necessary: {
      title: '必需',
      description: '网站基本功能所必需,无法禁用。',
    },
    analytics: {
      title: '分析',
      description: '追踪使用情况和性能,帮助我们改进网站。',
    },
    marketing: {
      title: '营销',
      description: '用于广告个性化和追踪。',
    },
    functional: {
      title: '功能',
      description: '增强可用性,例如记住偏好设置。',
    },
  },
}

const ja: CookieConsentCopy = {
  bannerMessage:
    '当サイトは、体験の向上、トラフィック分析、コンテンツのパーソナライズのためにクッキーを使用しています。',
  acceptAll: 'すべて許可',
  rejectAll: 'すべて拒否',
  managePreferences: '設定を管理',
  modalTitle: 'クッキーの設定',
  modalIntro:
    '許可するクッキーのカテゴリを選択してください。必須クッキーは常に有効です。',
  savePreferences: '設定を保存',
  closeLabel: '閉じる',
  alwaysOn: '常に有効',
  categories: {
    necessary: {
      title: '必須',
      description: 'サイトの基本機能に必要です。無効にできません。',
    },
    analytics: {
      title: '分析',
      description: 'サイト改善のため、利用状況とパフォーマンスを計測します。',
    },
    marketing: {
      title: 'マーケティング',
      description: '広告のパーソナライズおよびトラッキングに使用します。',
    },
    functional: {
      title: '機能',
      description: '設定の記憶など、使い勝手の向上に使用します。',
    },
  },
}

const de: CookieConsentCopy = {
  bannerMessage:
    'Wir verwenden Cookies, um Ihr Erlebnis zu verbessern, den Datenverkehr zu analysieren und Inhalte zu personalisieren.',
  acceptAll: 'Alle akzeptieren',
  rejectAll: 'Alle ablehnen',
  managePreferences: 'Einstellungen verwalten',
  modalTitle: 'Cookie-Einstellungen',
  modalIntro:
    'Wählen Sie, welche Cookie-Kategorien Sie zulassen. Notwendige Cookies sind immer aktiv.',
  savePreferences: 'Einstellungen speichern',
  closeLabel: 'Schließen',
  alwaysOn: 'Immer aktiv',
  categories: {
    necessary: {
      title: 'Notwendig',
      description:
        'Erforderlich für die Funktion der Website. Kann nicht deaktiviert werden.',
    },
    analytics: {
      title: 'Analyse',
      description: 'Erfasst Nutzung und Leistung, um die Website zu verbessern.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Für Anzeigenpersonalisierung und Tracking.',
    },
    functional: {
      title: 'Funktional',
      description:
        'Verbessert die Benutzerfreundlichkeit, z. B. durch Speichern von Einstellungen.',
    },
  },
}

const fr: CookieConsentCopy = {
  bannerMessage:
    'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.',
  acceptAll: 'Tout accepter',
  rejectAll: 'Tout refuser',
  managePreferences: 'Gérer les préférences',
  modalTitle: 'Préférences des cookies',
  modalIntro:
    'Choisissez les catégories de cookies que vous autorisez. Les cookies nécessaires sont toujours actifs.',
  savePreferences: 'Enregistrer les préférences',
  closeLabel: 'Fermer',
  alwaysOn: 'Toujours actif',
  categories: {
    necessary: {
      title: 'Nécessaires',
      description:
        'Nécessaires au fonctionnement du site. Ne peuvent pas être désactivées.',
    },
    analytics: {
      title: 'Analytique',
      description:
        "Suit l'utilisation et les performances pour améliorer le site.",
    },
    marketing: {
      title: 'Marketing',
      description: 'Utilisés pour la personnalisation et le suivi des publicités.',
    },
    functional: {
      title: 'Fonctionnels',
      description:
        "Améliore l'expérience, par exemple en mémorisant les préférences.",
    },
  },
}

const es: CookieConsentCopy = {
  bannerMessage:
    'Usamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.',
  acceptAll: 'Aceptar todo',
  rejectAll: 'Rechazar todo',
  managePreferences: 'Gestionar preferencias',
  modalTitle: 'Preferencias de cookies',
  modalIntro:
    'Elige qué categorías de cookies permites. Las cookies necesarias siempre están activas.',
  savePreferences: 'Guardar preferencias',
  closeLabel: 'Cerrar',
  alwaysOn: 'Siempre activo',
  categories: {
    necessary: {
      title: 'Necesarias',
      description:
        'Necesarias para el funcionamiento del sitio. No se pueden desactivar.',
    },
    analytics: {
      title: 'Análisis',
      description:
        'Rastrea el uso y el rendimiento para ayudarnos a mejorar el sitio.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Se usan para personalización y seguimiento de anuncios.',
    },
    functional: {
      title: 'Funcionales',
      description: 'Mejora la usabilidad, como recordar preferencias.',
    },
  },
}

const pt: CookieConsentCopy = {
  bannerMessage:
    'Usamos cookies para melhorar a sua experiência, analisar o tráfego e personalizar o conteúdo.',
  acceptAll: 'Aceitar tudo',
  rejectAll: 'Rejeitar tudo',
  managePreferences: 'Gerir preferências',
  modalTitle: 'Preferências de cookies',
  modalIntro:
    'Escolha que categorias de cookies permite. Os cookies necessários estão sempre ativos.',
  savePreferences: 'Guardar preferências',
  closeLabel: 'Fechar',
  alwaysOn: 'Sempre ativos',
  categories: {
    necessary: {
      title: 'Necessários',
      description:
        'Necessários para o funcionamento do site. Não podem ser desativados.',
    },
    analytics: {
      title: 'Análise',
      description:
        'Acompanha o uso e o desempenho para nos ajudar a melhorar o site.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Usados para personalização e rastreamento de anúncios.',
    },
    functional: {
      title: 'Funcionais',
      description: 'Melhora a usabilidade, como memorizar preferências.',
    },
  },
}

const hi: CookieConsentCopy = {
  bannerMessage:
    'हम आपके अनुभव को बेहतर बनाने, ट्रैफ़िक का विश्लेषण करने और सामग्री को वैयक्तिकृत करने के लिए कुकीज़ का उपयोग करते हैं।',
  acceptAll: 'सभी स्वीकार करें',
  rejectAll: 'सभी अस्वीकार करें',
  managePreferences: 'प्राथमिकताएँ प्रबंधित करें',
  modalTitle: 'कुकी प्राथमिकताएँ',
  modalIntro:
    'चुनें कि आप किन श्रेणियों की कुकीज़ की अनुमति देते हैं। आवश्यक कुकीज़ हमेशा सक्रिय रहती हैं।',
  savePreferences: 'प्राथमिकताएँ सहेजें',
  closeLabel: 'बंद करें',
  alwaysOn: 'हमेशा चालू',
  categories: {
    necessary: {
      title: 'आवश्यक',
      description: 'साइट की कार्यक्षमता के लिए आवश्यक। अक्षम नहीं किया जा सकता।',
    },
    analytics: {
      title: 'एनालिटिक्स',
      description:
        'हमें साइट सुधारने में मदद करने के लिए उपयोग और प्रदर्शन को ट्रैक करता है।',
    },
    marketing: {
      title: 'मार्केटिंग',
      description: 'विज्ञापन वैयक्तिकरण और ट्रैकिंग के लिए उपयोग किए जाते हैं।',
    },
    functional: {
      title: 'कार्यात्मक',
      description: 'प्राथमिकताओं को याद रखने जैसी उपयोगिता को बढ़ाता है।',
    },
  },
}

const ru: CookieConsentCopy = {
  bannerMessage:
    'Мы используем файлы cookie, чтобы улучшать ваш опыт, анализировать трафик и персонализировать контент.',
  acceptAll: 'Принять всё',
  rejectAll: 'Отклонить всё',
  managePreferences: 'Настройки',
  modalTitle: 'Настройки cookie',
  modalIntro:
    'Выберите, какие категории файлов cookie разрешить. Необходимые файлы cookie всегда активны.',
  savePreferences: 'Сохранить настройки',
  closeLabel: 'Закрыть',
  alwaysOn: 'Всегда включено',
  categories: {
    necessary: {
      title: 'Необходимые',
      description: 'Необходимы для работы сайта. Их нельзя отключить.',
    },
    analytics: {
      title: 'Аналитика',
      description:
        'Отслеживает использование и производительность для улучшения сайта.',
    },
    marketing: {
      title: 'Маркетинг',
      description: 'Используются для персонализации рекламы и отслеживания.',
    },
    functional: {
      title: 'Функциональные',
      description: 'Улучшает удобство, например, запоминание настроек.',
    },
  },
}

const nl: CookieConsentCopy = {
  bannerMessage:
    'We gebruiken cookies om uw ervaring te verbeteren, verkeer te analyseren en content te personaliseren.',
  acceptAll: 'Alles accepteren',
  rejectAll: 'Alles weigeren',
  managePreferences: 'Voorkeuren beheren',
  modalTitle: 'Cookievoorkeuren',
  modalIntro:
    'Kies welke categorieën cookies u toestaat. Noodzakelijke cookies zijn altijd actief.',
  savePreferences: 'Voorkeuren opslaan',
  closeLabel: 'Sluiten',
  alwaysOn: 'Altijd aan',
  categories: {
    necessary: {
      title: 'Noodzakelijk',
      description:
        'Vereist voor de werking van de site. Kan niet worden uitgeschakeld.',
    },
    analytics: {
      title: 'Analyse',
      description:
        'Volgt gebruik en prestaties om ons te helpen de site te verbeteren.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Gebruikt voor advertentiepersonalisatie en tracking.',
    },
    functional: {
      title: 'Functioneel',
      description:
        'Verbetert de bruikbaarheid, zoals het onthouden van voorkeuren.',
    },
  },
}

const it: CookieConsentCopy = {
  bannerMessage:
    'Utilizziamo i cookie per migliorare la tua esperienza, analizzare il traffico e personalizzare i contenuti.',
  acceptAll: 'Accetta tutto',
  rejectAll: 'Rifiuta tutto',
  managePreferences: 'Gestisci preferenze',
  modalTitle: 'Preferenze cookie',
  modalIntro:
    'Scegli quali categorie di cookie consentire. I cookie necessari sono sempre attivi.',
  savePreferences: 'Salva preferenze',
  closeLabel: 'Chiudi',
  alwaysOn: 'Sempre attivi',
  categories: {
    necessary: {
      title: 'Necessari',
      description:
        'Richiesti per il funzionamento del sito. Non possono essere disattivati.',
    },
    analytics: {
      title: 'Analitici',
      description:
        'Monitora utilizzo e prestazioni per aiutarci a migliorare il sito.',
    },
    marketing: {
      title: 'Marketing',
      description:
        'Utilizzati per la personalizzazione e il tracciamento degli annunci.',
    },
    functional: {
      title: 'Funzionali',
      description:
        "Migliora l'usabilità, ad esempio ricordando le preferenze.",
    },
  },
}

const ar: CookieConsentCopy = {
  bannerMessage:
    'نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحليل حركة الزيارات، وتخصيص المحتوى.',
  acceptAll: 'قبول الكل',
  rejectAll: 'رفض الكل',
  managePreferences: 'إدارة التفضيلات',
  modalTitle: 'تفضيلات ملفات تعريف الارتباط',
  modalIntro:
    'اختر فئات ملفات تعريف الارتباط التي تسمح بها. ملفات تعريف الارتباط الضرورية مفعّلة دائمًا.',
  savePreferences: 'حفظ التفضيلات',
  closeLabel: 'إغلاق',
  alwaysOn: 'مفعّل دائمًا',
  categories: {
    necessary: {
      title: 'الضرورية',
      description: 'مطلوبة لعمل الموقع. لا يمكن تعطيلها.',
    },
    analytics: {
      title: 'التحليلات',
      description: 'تتعقب الاستخدام والأداء لمساعدتنا في تحسين الموقع.',
    },
    marketing: {
      title: 'التسويق',
      description: 'تُستخدم لتخصيص الإعلانات وتتبعها.',
    },
    functional: {
      title: 'الوظيفية',
      description: 'تعزز سهولة الاستخدام مثل تذكر التفضيلات.',
    },
  },
}

const sv: CookieConsentCopy = {
  bannerMessage:
    'Vi använder cookies för att förbättra din upplevelse, analysera trafik och anpassa innehåll.',
  acceptAll: 'Acceptera alla',
  rejectAll: 'Avvisa alla',
  managePreferences: 'Hantera inställningar',
  modalTitle: 'Cookie-inställningar',
  modalIntro:
    'Välj vilka cookiekategorier du tillåter. Nödvändiga cookies är alltid aktiva.',
  savePreferences: 'Spara inställningar',
  closeLabel: 'Stäng',
  alwaysOn: 'Alltid på',
  categories: {
    necessary: {
      title: 'Nödvändiga',
      description: 'Krävs för webbplatsens funktion. Kan inte inaktiveras.',
    },
    analytics: {
      title: 'Analys',
      description:
        'Spårar användning och prestanda för att hjälpa oss att förbättra webbplatsen.',
    },
    marketing: {
      title: 'Marknadsföring',
      description: 'Används för annonspersonalisering och spårning.',
    },
    functional: {
      title: 'Funktionella',
      description:
        'Förbättrar användbarheten, t.ex. genom att komma ihåg inställningar.',
    },
  },
}

const th: CookieConsentCopy = {
  bannerMessage:
    'เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณ วิเคราะห์การเข้าชม และปรับแต่งเนื้อหา',
  acceptAll: 'ยอมรับทั้งหมด',
  rejectAll: 'ปฏิเสธทั้งหมด',
  managePreferences: 'จัดการการตั้งค่า',
  modalTitle: 'การตั้งค่าคุกกี้',
  modalIntro:
    'เลือกหมวดหมู่คุกกี้ที่คุณอนุญาต คุกกี้ที่จำเป็นจะเปิดใช้งานอยู่เสมอ',
  savePreferences: 'บันทึกการตั้งค่า',
  closeLabel: 'ปิด',
  alwaysOn: 'เปิดใช้งานเสมอ',
  categories: {
    necessary: {
      title: 'ที่จำเป็น',
      description: 'จำเป็นสำหรับการทำงานของเว็บไซต์ ไม่สามารถปิดได้',
    },
    analytics: {
      title: 'การวิเคราะห์',
      description: 'ติดตามการใช้งานและประสิทธิภาพเพื่อช่วยให้เราปรับปรุงเว็บไซต์',
    },
    marketing: {
      title: 'การตลาด',
      description: 'ใช้สำหรับการปรับแต่งและติดตามโฆษณา',
    },
    functional: {
      title: 'ฟังก์ชัน',
      description: 'เพิ่มความสะดวกในการใช้งาน เช่น การจดจำการตั้งค่า',
    },
  },
}

const pl: CookieConsentCopy = {
  bannerMessage:
    'Używamy plików cookie, aby poprawić Twoje wrażenia, analizować ruch i personalizować treści.',
  acceptAll: 'Zaakceptuj wszystkie',
  rejectAll: 'Odrzuć wszystko',
  managePreferences: 'Zarządzaj preferencjami',
  modalTitle: 'Preferencje plików cookie',
  modalIntro:
    'Wybierz, na które kategorie plików cookie zezwalasz. Niezbędne pliki cookie są zawsze aktywne.',
  savePreferences: 'Zapisz preferencje',
  closeLabel: 'Zamknij',
  alwaysOn: 'Zawsze włączone',
  categories: {
    necessary: {
      title: 'Niezbędne',
      description: 'Wymagane do działania witryny. Nie można ich wyłączyć.',
    },
    analytics: {
      title: 'Analityka',
      description: 'Śledzi użycie i wydajność, aby pomóc nam ulepszyć witrynę.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Używane do personalizacji reklam i śledzenia.',
    },
    functional: {
      title: 'Funkcjonalne',
      description: 'Zwiększa użyteczność, np. zapamiętując preferencje.',
    },
  },
}

const id: CookieConsentCopy = {
  bannerMessage:
    'Kami menggunakan cookie untuk meningkatkan pengalaman Anda, menganalisis lalu lintas, dan mempersonalisasi konten.',
  acceptAll: 'Terima semua',
  rejectAll: 'Tolak semua',
  managePreferences: 'Kelola preferensi',
  modalTitle: 'Preferensi cookie',
  modalIntro:
    'Pilih kategori cookie yang Anda izinkan. Cookie yang diperlukan selalu aktif.',
  savePreferences: 'Simpan preferensi',
  closeLabel: 'Tutup',
  alwaysOn: 'Selalu aktif',
  categories: {
    necessary: {
      title: 'Diperlukan',
      description: 'Diperlukan untuk fungsi situs. Tidak dapat dinonaktifkan.',
    },
    analytics: {
      title: 'Analitik',
      description:
        'Melacak penggunaan dan kinerja untuk membantu kami meningkatkan situs.',
    },
    marketing: {
      title: 'Pemasaran',
      description: 'Digunakan untuk personalisasi dan pelacakan iklan.',
    },
    functional: {
      title: 'Fungsional',
      description: 'Meningkatkan kegunaan seperti mengingat preferensi.',
    },
  },
}

const ms: CookieConsentCopy = {
  bannerMessage:
    'Kami menggunakan kuki untuk meningkatkan pengalaman anda, menganalisis trafik, dan memperibadikan kandungan.',
  acceptAll: 'Terima semua',
  rejectAll: 'Tolak semua',
  managePreferences: 'Urus keutamaan',
  modalTitle: 'Keutamaan kuki',
  modalIntro:
    'Pilih kategori kuki yang anda benarkan. Kuki yang diperlukan sentiasa aktif.',
  savePreferences: 'Simpan keutamaan',
  closeLabel: 'Tutup',
  alwaysOn: 'Sentiasa aktif',
  categories: {
    necessary: {
      title: 'Diperlukan',
      description:
        'Diperlukan untuk fungsi laman web. Tidak boleh dilumpuhkan.',
    },
    analytics: {
      title: 'Analitik',
      description:
        'Menjejaki penggunaan dan prestasi untuk membantu kami meningkatkan laman web.',
    },
    marketing: {
      title: 'Pemasaran',
      description: 'Digunakan untuk pemperibadian dan penjejakan iklan.',
    },
    functional: {
      title: 'Berfungsi',
      description:
        'Meningkatkan kebolehgunaan seperti mengingati keutamaan.',
    },
  },
}

const da: CookieConsentCopy = {
  bannerMessage:
    'Vi bruger cookies for at forbedre din oplevelse, analysere trafik og personalisere indhold.',
  acceptAll: 'Accepter alle',
  rejectAll: 'Afvis alle',
  managePreferences: 'Administrer præferencer',
  modalTitle: 'Cookieindstillinger',
  modalIntro:
    'Vælg hvilke cookiekategorier du tillader. Nødvendige cookies er altid aktive.',
  savePreferences: 'Gem præferencer',
  closeLabel: 'Luk',
  alwaysOn: 'Altid til',
  categories: {
    necessary: {
      title: 'Nødvendige',
      description:
        'Krævet for at webstedet kan fungere. Kan ikke deaktiveres.',
    },
    analytics: {
      title: 'Analyse',
      description:
        'Sporer brug og ydeevne for at hjælpe os med at forbedre webstedet.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Bruges til annoncepersonalisering og sporing.',
    },
    functional: {
      title: 'Funktionelle',
      description:
        'Forbedrer brugervenligheden, f.eks. ved at huske præferencer.',
    },
  },
}

const tr: CookieConsentCopy = {
  bannerMessage:
    'Deneyiminizi iyileştirmek, trafiği analiz etmek ve içeriği kişiselleştirmek için çerezler kullanıyoruz.',
  acceptAll: 'Tümünü kabul et',
  rejectAll: 'Tümünü reddet',
  managePreferences: 'Tercihleri yönet',
  modalTitle: 'Çerez tercihleri',
  modalIntro:
    'Hangi çerez kategorilerine izin verdiğinizi seçin. Gerekli çerezler her zaman etkindir.',
  savePreferences: 'Tercihleri kaydet',
  closeLabel: 'Kapat',
  alwaysOn: 'Her zaman açık',
  categories: {
    necessary: {
      title: 'Gerekli',
      description:
        'Site işlevselliği için gereklidir. Devre dışı bırakılamaz.',
    },
    analytics: {
      title: 'Analiz',
      description:
        'Siteyi iyileştirmemize yardımcı olmak için kullanım ve performansı izler.',
    },
    marketing: {
      title: 'Pazarlama',
      description: 'Reklam kişiselleştirme ve takip için kullanılır.',
    },
    functional: {
      title: 'İşlevsel',
      description: 'Tercihleri hatırlama gibi kullanılabilirliği artırır.',
    },
  },
}

const dictionaries: Record<Locale, CookieConsentCopy> = {
  en,
  zh,
  ja,
  de,
  fr,
  es,
  ko,
  pt,
  hi,
  ru,
  nl,
  it,
  ar,
  sv,
  th,
  pl,
  id,
  ms,
  da,
  tr,
}

export function getCookieConsentCopy(locale: Locale): CookieConsentCopy {
  return dictionaries[locale] ?? en
}
