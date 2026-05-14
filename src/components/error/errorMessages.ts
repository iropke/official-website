/**
 * 오류 페이지 (404 / 500 / 503 / 403) 의 locale 별 카피.
 *
 * 기획서: references/requirements/iropke_error.md
 *   - "위트 있되 어린 톤은 아니어야 함"
 *   - "차분, 신뢰 유지, 명확한 복귀 동선"
 *
 * 9 locale (ko/en/ja/es/ru/de/fr/zh/ar) 1차 번역 완료. 나머지 11 locale
 * (pt/hi/nl/it/sv/th/pl/id/ms/da/tr) 은 getErrorCopy 가 en fallback 으로
 * 처리. Phase B 에서 admin 번역 API 활성화 시 빈 항목 보완 + 정제.
 */

import type { Locale } from '@/i18n/locales'

export type ErrorKind = '404' | '500' | '503' | '403'

export interface ErrorCopy {
  title: string
  witty: string
  description: string
  homeLabel: string
  backLabel: string
  contactLabel: string
  hintPrefix: string
}

const en: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Page Not Found',
    witty: 'I understand that feeling too.\nGetting lost happens.',
    description:
      'The page you were looking for may have been moved, renamed, or no longer exists.',
    homeLabel: 'Home',
    backLabel: 'Go Back',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '500': {
    title: 'Internal Server Error',
    witty: 'Something behind the curtain\nseems to be having a moment.',
    description:
      'Something went wrong on our side while processing your request.',
    homeLabel: 'Home',
    backLabel: 'Try Again',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '503': {
    title: 'Service Unavailable',
    witty: 'We are briefly unavailable.\nEven systems need a breath.',
    description:
      'The service is temporarily unavailable. Please try again in a few moments.',
    homeLabel: 'Home',
    backLabel: 'Try Again',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
  '403': {
    title: 'Access Denied',
    witty: 'This door seems to require\na different key.',
    description: 'You do not currently have permission to access this page.',
    homeLabel: 'Home',
    backLabel: 'Go Back',
    contactLabel: 'Contact Us',
    hintPrefix: 'Error Code',
  },
}

const ko: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: '페이지를 찾을 수 없습니다',
    witty: '길을 잃는 일은\n누구에게나 있습니다.',
    description:
      '찾으시는 페이지가 이동되었거나 이름이 바뀌었을 수 있습니다. 또는 더 이상 존재하지 않을 수 있습니다.',
    homeLabel: '홈으로',
    backLabel: '이전 페이지',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '500': {
    title: '서버 오류',
    witty: '커튼 뒤편에서\n잠시 문제가 생긴 것 같습니다.',
    description: '요청을 처리하는 중에 문제가 발생했습니다.',
    homeLabel: '홈으로',
    backLabel: '다시 시도',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '503': {
    title: '서비스 점검 중',
    witty: '잠시 숨을\n고르는 중입니다.',
    description: '서비스가 일시적으로 이용 불가합니다. 잠시 후 다시 시도해 주세요.',
    homeLabel: '홈으로',
    backLabel: '다시 시도',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
  '403': {
    title: '접근 권한 없음',
    witty: '이 문은\n다른 열쇠를 필요로 합니다.',
    description: '이 페이지에 접근할 권한이 없습니다.',
    homeLabel: '홈으로',
    backLabel: '이전 페이지',
    contactLabel: '문의하기',
    hintPrefix: '오류 코드',
  },
}

const ja: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'ページが見つかりません',
    witty: '迷うことは、\n誰にでもあります。',
    description:
      'お探しのページは移動、名称変更、または削除された可能性があります。',
    homeLabel: 'ホームへ',
    backLabel: '前のページ',
    contactLabel: 'お問い合わせ',
    hintPrefix: 'エラーコード',
  },
  '500': {
    title: 'サーバーエラー',
    witty: '舞台裏で少し\n問題が起きているようです。',
    description: 'リクエストの処理中に問題が発生しました。',
    homeLabel: 'ホームへ',
    backLabel: '再試行',
    contactLabel: 'お問い合わせ',
    hintPrefix: 'エラーコード',
  },
  '503': {
    title: 'サービス利用不可',
    witty: '一息ついている\n最中です。',
    description: 'サービスは一時的にご利用いただけません。しばらくしてからお試しください。',
    homeLabel: 'ホームへ',
    backLabel: '再試行',
    contactLabel: 'お問い合わせ',
    hintPrefix: 'エラーコード',
  },
  '403': {
    title: 'アクセス拒否',
    witty: 'この扉には\n別の鍵が必要なようです。',
    description: 'このページにアクセスする権限がありません。',
    homeLabel: 'ホームへ',
    backLabel: '前のページ',
    contactLabel: 'お問い合わせ',
    hintPrefix: 'エラーコード',
  },
}

const es: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Página no encontrada',
    witty: 'Entiendo la sensación.\nPerderse pasa.',
    description:
      'La página que buscabas puede haberse movido, cambiado de nombre o ya no existir.',
    homeLabel: 'Inicio',
    backLabel: 'Volver',
    contactLabel: 'Contáctanos',
    hintPrefix: 'Código de error',
  },
  '500': {
    title: 'Error interno del servidor',
    witty: 'Parece que algo detrás del telón\nestá teniendo un momento.',
    description: 'Algo salió mal de nuestro lado al procesar tu solicitud.',
    homeLabel: 'Inicio',
    backLabel: 'Reintentar',
    contactLabel: 'Contáctanos',
    hintPrefix: 'Código de error',
  },
  '503': {
    title: 'Servicio no disponible',
    witty: 'Estamos brevemente fuera de servicio.\nIncluso los sistemas necesitan respirar.',
    description:
      'El servicio no está disponible temporalmente. Inténtalo de nuevo en unos momentos.',
    homeLabel: 'Inicio',
    backLabel: 'Reintentar',
    contactLabel: 'Contáctanos',
    hintPrefix: 'Código de error',
  },
  '403': {
    title: 'Acceso denegado',
    witty: 'Esta puerta parece requerir\nuna llave diferente.',
    description: 'Actualmente no tienes permiso para acceder a esta página.',
    homeLabel: 'Inicio',
    backLabel: 'Volver',
    contactLabel: 'Contáctanos',
    hintPrefix: 'Código de error',
  },
}

const ru: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Страница не найдена',
    witty: 'Знакомое чувство.\nЗаблудиться — это нормально.',
    description:
      'Запрашиваемая страница могла быть перемещена, переименована или удалена.',
    homeLabel: 'На главную',
    backLabel: 'Назад',
    contactLabel: 'Связаться с нами',
    hintPrefix: 'Код ошибки',
  },
  '500': {
    title: 'Внутренняя ошибка сервера',
    witty: 'Похоже, что-то за кулисами\nпереживает непростой момент.',
    description: 'При обработке запроса возникла ошибка на нашей стороне.',
    homeLabel: 'На главную',
    backLabel: 'Повторить',
    contactLabel: 'Связаться с нами',
    hintPrefix: 'Код ошибки',
  },
  '503': {
    title: 'Сервис недоступен',
    witty: 'Мы ненадолго недоступны.\nДаже системам нужна передышка.',
    description: 'Сервис временно недоступен. Попробуйте снова через несколько минут.',
    homeLabel: 'На главную',
    backLabel: 'Повторить',
    contactLabel: 'Связаться с нами',
    hintPrefix: 'Код ошибки',
  },
  '403': {
    title: 'Доступ запрещён',
    witty: 'Похоже, эта дверь\nтребует другого ключа.',
    description: 'У вас сейчас нет прав на доступ к этой странице.',
    homeLabel: 'На главную',
    backLabel: 'Назад',
    contactLabel: 'Связаться с нами',
    hintPrefix: 'Код ошибки',
  },
}

const de: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Seite nicht gefunden',
    witty: 'Das Gefühl kenne ich.\nSich zu verirren passiert.',
    description:
      'Die gesuchte Seite wurde möglicherweise verschoben, umbenannt oder existiert nicht mehr.',
    homeLabel: 'Startseite',
    backLabel: 'Zurück',
    contactLabel: 'Kontakt',
    hintPrefix: 'Fehlercode',
  },
  '500': {
    title: 'Interner Serverfehler',
    witty: 'Hinter den Kulissen scheint\ngerade etwas einen Moment zu brauchen.',
    description:
      'Bei der Verarbeitung Ihrer Anfrage ist auf unserer Seite ein Fehler aufgetreten.',
    homeLabel: 'Startseite',
    backLabel: 'Erneut versuchen',
    contactLabel: 'Kontakt',
    hintPrefix: 'Fehlercode',
  },
  '503': {
    title: 'Dienst nicht verfügbar',
    witty: 'Wir sind kurz nicht erreichbar.\nAuch Systeme brauchen mal eine Pause.',
    description:
      'Der Dienst ist vorübergehend nicht verfügbar. Bitte versuchen Sie es in Kürze erneut.',
    homeLabel: 'Startseite',
    backLabel: 'Erneut versuchen',
    contactLabel: 'Kontakt',
    hintPrefix: 'Fehlercode',
  },
  '403': {
    title: 'Zugriff verweigert',
    witty: 'Diese Tür scheint einen\nanderen Schlüssel zu benötigen.',
    description: 'Sie haben derzeit keine Berechtigung, diese Seite aufzurufen.',
    homeLabel: 'Startseite',
    backLabel: 'Zurück',
    contactLabel: 'Kontakt',
    hintPrefix: 'Fehlercode',
  },
}

const fr: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'Page introuvable',
    witty: 'Je comprends ce sentiment.\nSe perdre, ça arrive.',
    description:
      'La page recherchée a peut-être été déplacée, renommée ou n’existe plus.',
    homeLabel: 'Accueil',
    backLabel: 'Retour',
    contactLabel: 'Nous contacter',
    hintPrefix: 'Code d’erreur',
  },
  '500': {
    title: 'Erreur interne du serveur',
    witty: 'On dirait que quelque chose en coulisses\ntraverse un mauvais moment.',
    description:
      'Une erreur s’est produite de notre côté lors du traitement de votre requête.',
    homeLabel: 'Accueil',
    backLabel: 'Réessayer',
    contactLabel: 'Nous contacter',
    hintPrefix: 'Code d’erreur',
  },
  '503': {
    title: 'Service indisponible',
    witty: 'Nous sommes brièvement indisponibles.\nMême les systèmes ont besoin d’une pause.',
    description:
      'Le service est temporairement indisponible. Veuillez réessayer dans un instant.',
    homeLabel: 'Accueil',
    backLabel: 'Réessayer',
    contactLabel: 'Nous contacter',
    hintPrefix: 'Code d’erreur',
  },
  '403': {
    title: 'Accès refusé',
    witty: 'Cette porte semble nécessiter\nune autre clé.',
    description:
      'Vous n’avez pas l’autorisation d’accéder à cette page pour le moment.',
    homeLabel: 'Accueil',
    backLabel: 'Retour',
    contactLabel: 'Nous contacter',
    hintPrefix: 'Code d’erreur',
  },
}

const zh: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: '页面未找到',
    witty: '理解这种感觉。\n迷路是常有的事。',
    description: '您查找的页面可能已被移动、重命名或不再存在。',
    homeLabel: '首页',
    backLabel: '返回',
    contactLabel: '联系我们',
    hintPrefix: '错误代码',
  },
  '500': {
    title: '服务器内部错误',
    witty: '幕后似乎\n暂时遇到了一些状况。',
    description: '处理您的请求时我们这边出现了问题。',
    homeLabel: '首页',
    backLabel: '重试',
    contactLabel: '联系我们',
    hintPrefix: '错误代码',
  },
  '503': {
    title: '服务暂不可用',
    witty: '我们暂时无法响应,\n系统也需要片刻喘息。',
    description: '服务暂时不可用,请稍后再试。',
    homeLabel: '首页',
    backLabel: '重试',
    contactLabel: '联系我们',
    hintPrefix: '错误代码',
  },
  '403': {
    title: '访问被拒绝',
    witty: '这扇门似乎\n需要另一把钥匙。',
    description: '您目前没有访问此页面的权限。',
    homeLabel: '首页',
    backLabel: '返回',
    contactLabel: '联系我们',
    hintPrefix: '错误代码',
  },
}

const ar: Record<ErrorKind, ErrorCopy> = {
  '404': {
    title: 'الصفحة غير موجودة',
    witty: 'أفهم هذا الشعور.\nالضياع يحدث للجميع.',
    description: 'ربما تم نقل الصفحة التي تبحث عنها أو إعادة تسميتها أو لم تعد موجودة.',
    homeLabel: 'الرئيسية',
    backLabel: 'رجوع',
    contactLabel: 'تواصل معنا',
    hintPrefix: 'رمز الخطأ',
  },
  '500': {
    title: 'خطأ في الخادم',
    witty: 'يبدو أن شيئًا خلف الكواليس\nيمر بلحظة عصيبة.',
    description: 'حدث خطأ من جانبنا أثناء معالجة طلبك.',
    homeLabel: 'الرئيسية',
    backLabel: 'إعادة المحاولة',
    contactLabel: 'تواصل معنا',
    hintPrefix: 'رمز الخطأ',
  },
  '503': {
    title: 'الخدمة غير متوفرة',
    witty: 'نحن متوقفون لبرهة.\nحتى الأنظمة تحتاج إلى نَفَس.',
    description: 'الخدمة غير متوفرة مؤقتًا. يرجى المحاولة مرة أخرى بعد لحظات.',
    homeLabel: 'الرئيسية',
    backLabel: 'إعادة المحاولة',
    contactLabel: 'تواصل معنا',
    hintPrefix: 'رمز الخطأ',
  },
  '403': {
    title: 'تم رفض الوصول',
    witty: 'يبدو أن هذا الباب\nيحتاج إلى مفتاح آخر.',
    description: 'ليس لديك حاليًا إذن للوصول إلى هذه الصفحة.',
    homeLabel: 'الرئيسية',
    backLabel: 'رجوع',
    contactLabel: 'تواصل معنا',
    hintPrefix: 'رمز الخطأ',
  },
}

const dictionaries: Partial<Record<Locale, Record<ErrorKind, ErrorCopy>>> = {
  ko,
  en,
  ja,
  es,
  ru,
  de,
  fr,
  zh,
  ar,
}

export function getErrorCopy(locale: Locale, kind: ErrorKind): ErrorCopy {
  return dictionaries[locale]?.[kind] ?? en[kind]
}
