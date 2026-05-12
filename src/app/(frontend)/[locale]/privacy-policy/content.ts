/**
 * Privacy Policy 콘텐츠 사전 (정적 JSX 렌더용 데이터).
 *
 * 결정 사항:
 *   본 단계에서는 Payload Pages 컬렉션이 아니라 정적 사전 + 페이지 컴포넌트로
 *   구현. 이유:
 *   - 법적 문서이므로 변경 이력 추적이 git 으로 명확
 *   - Pages 컬렉션의 Lexical layout 으로는 14개 anchor 섹션 구조 표현이 번거로움
 *   - 추후 admin 에서 직접 편집해야 한다는 요구사항 발생 시 Pages 로 마이그레이션 가능
 *
 * 기획서: references/requirements/iropke_privacy_policy.md
 * 단일 출처: content-generation/policy/privacy/privacy-policy.md (20 locale 큐레이션).
 * locale 정책: 20 locale 전체 큐레이션 완료 (2026-05-12) — fallback 은 정의되어 있으나
 *   `dictionaries` 가 완전한 Record<Locale, _> 라 실제로는 미진입.
 */

import type { Locale } from '@/i18n/locales'

export interface PrivacySection {
  /** anchor href 에 그대로 사용되는 id (기획서의 Anchor ID 와 동일) */
  anchorId: string
  /** TOC 와 본문 제목 */
  title: string
  /** 단락 (각 string 이 <p>) */
  paragraphs?: string[]
  /** bullet list 항목 */
  bullets?: string[]
}

export interface PrivacyPolicyCopy {
  pageTitle: string
  pageMetaDescription: string
  tocLabel: string
  lastUpdatedLabel: string
  lastUpdated: string
  contactEmail: string
  contactEmailLabel: string
  sections: PrivacySection[]
}

const LAST_UPDATED = '2026-05-12'
const CONTACT_EMAIL = 'privacy@iropke.com'

const en: PrivacyPolicyCopy = {
  pageTitle: 'Privacy Policy',
  pageMetaDescription:
    'How IROPKE collects, uses, and protects your personal data, aligned with GDPR and CCPA.',
  tocLabel: 'Table of contents',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Email us',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'We are committed to protecting your personal data and ensuring transparency in how we collect, use, and manage information.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Data We Collect',
      paragraphs: ['We may collect:'],
      bullets: [
        'Personal identification data (name, email)',
        'Usage data (pages visited, interactions)',
        'Device and technical data (IP, browser type)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'How We Use Data',
      paragraphs: ['We use data to:'],
      bullets: [
        'Provide and improve services',
        'Communicate with users',
        'Ensure security',
        'Comply with legal obligations',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Legal Basis (GDPR)',
      paragraphs: ['Under GDPR, we process data based on:'],
      bullets: [
        'Consent',
        'Contractual necessity',
        'Legal obligations',
        'Legitimate interests',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Data Sharing',
      paragraphs: ['We may share data with:'],
      bullets: [
        'Service providers',
        'Legal authorities when required',
        'Partners under strict agreements',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'International Transfers',
      paragraphs: [
        'Data may be transferred outside the EU. We ensure safeguards such as:',
      ],
      bullets: ['Standard Contractual Clauses (SCC)', 'Adequacy decisions'],
    },
    {
      anchorId: 'data-retention',
      title: 'Data Retention',
      paragraphs: ['We retain data only as long as necessary for:'],
      bullets: ['Service provision', 'Legal compliance', 'Business purposes'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Your Rights (EU)',
      paragraphs: ['Under GDPR, users have rights to:'],
      bullets: [
        'Access data',
        'Correct data',
        'Delete data',
        'Restrict processing',
        'Data portability',
        'Withdraw consent',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Your Rights (California)',
      paragraphs: ['Under CCPA/CPRA:'],
      bullets: [
        'Right to know',
        'Right to delete',
        'Right to opt-out of sale',
        'Right to non-discrimination',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies & Tracking',
      paragraphs: ['We use cookies for:'],
      bullets: ['Analytics', 'Performance', 'Personalization'],
    },
    {
      anchorId: 'security',
      title: 'Security Measures',
      paragraphs: ['We implement:'],
      bullets: ['Encryption', 'Access control', 'Monitoring systems'],
    },
    {
      anchorId: 'children',
      title: "Children's Privacy",
      paragraphs: ['We do not knowingly collect data from children under 13.'],
    },
    {
      anchorId: 'updates',
      title: 'Updates to Policy',
      paragraphs: ['We may update this policy periodically.'],
    },
    {
      anchorId: 'contact',
      title: 'Contact Information',
      paragraphs: ['For inquiries:'],
    },
  ],
}

const zh: PrivacyPolicyCopy = {
  pageTitle: '隐私政策',
  pageMetaDescription: 'IROPKE 如何收集、使用和保护您的个人数据,符合 GDPR 和 CCPA。',
  tocLabel: '目录',
  lastUpdatedLabel: '最后更新',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: '通过邮件联系',
  sections: [
    {
      anchorId: 'introduction',
      title: '简介',
      paragraphs: ['我们致力于保护您的个人数据,并确保收集、使用和管理信息时的透明度。'],
    },
    {
      anchorId: 'data-collection',
      title: '我们收集的数据',
      paragraphs: ['我们可能会收集:'],
      bullets: [
        '个人身份数据(姓名、电子邮箱)',
        '使用数据(访问页面、交互记录)',
        '设备和技术数据(IP、浏览器类型)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: '我们如何使用数据',
      paragraphs: ['我们使用数据以:'],
      bullets: ['提供并改进服务', '与用户沟通', '确保安全', '遵守法律义务'],
    },
    {
      anchorId: 'legal-basis',
      title: '法律依据(GDPR)',
      paragraphs: ['根据 GDPR,我们基于以下依据处理数据:'],
      bullets: ['同意', '合同必要性', '法律义务', '合法利益'],
    },
    {
      anchorId: 'data-sharing',
      title: '数据共享',
      paragraphs: ['我们可能与以下对象共享数据:'],
      bullets: ['服务提供商', '法律要求时的相关当局', '严格协议下的合作伙伴'],
    },
    {
      anchorId: 'international-transfers',
      title: '跨境数据传输',
      paragraphs: ['数据可能传输至欧盟以外地区。我们采用以下保障措施:'],
      bullets: ['标准合同条款 (SCC)', '充分性认定决定'],
    },
    {
      anchorId: 'data-retention',
      title: '数据保留',
      paragraphs: ['我们仅在以下目的所需的时间内保留数据:'],
      bullets: ['服务提供', '法律合规', '业务目的'],
    },
    {
      anchorId: 'eu-rights',
      title: '您的权利(欧盟)',
      paragraphs: ['根据 GDPR,用户拥有以下权利:'],
      bullets: ['访问数据', '更正数据', '删除数据', '限制处理', '数据可携带', '撤回同意'],
    },
    {
      anchorId: 'ca-rights',
      title: '您的权利(加州)',
      paragraphs: ['根据 CCPA/CPRA:'],
      bullets: ['知情权', '删除权', '拒绝出售权', '不受歧视权'],
    },
    {
      anchorId: 'cookies',
      title: 'Cookie 与追踪',
      paragraphs: ['我们使用 Cookie 用于:'],
      bullets: ['分析', '性能', '个性化'],
    },
    {
      anchorId: 'security',
      title: '安全措施',
      paragraphs: ['我们实施:'],
      bullets: ['加密', '访问控制', '监控系统'],
    },
    {
      anchorId: 'children',
      title: '儿童隐私',
      paragraphs: ['我们不会有意收集 13 岁以下儿童的数据。'],
    },
    {
      anchorId: 'updates',
      title: '政策更新',
      paragraphs: ['我们可能会定期更新本政策。'],
    },
    {
      anchorId: 'contact',
      title: '联系方式',
      paragraphs: ['如有咨询:'],
    },
  ],
}

const ja: PrivacyPolicyCopy = {
  pageTitle: 'プライバシーポリシー',
  pageMetaDescription:
    'IROPKE による個人データの収集・利用・保護について。GDPR および CCPA に準拠。',
  tocLabel: '目次',
  lastUpdatedLabel: '最終更新',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'メールで問い合わせる',
  sections: [
    {
      anchorId: 'introduction',
      title: 'はじめに',
      paragraphs: [
        '当社はお客様の個人データの保護と、取得・利用・管理の透明性確保に努めます。',
      ],
    },
    {
      anchorId: 'data-collection',
      title: '収集する情報',
      paragraphs: ['当社が収集する場合がある情報:'],
      bullets: [
        '個人識別情報(氏名、メールアドレス)',
        '利用情報(閲覧ページ、操作履歴)',
        'デバイス・技術情報(IP、ブラウザ種別)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: '情報の利用目的',
      paragraphs: ['取得した情報は次の目的で使用します。'],
      bullets: [
        'サービスの提供および改善',
        'ユーザーとのコミュニケーション',
        'セキュリティの維持',
        '法的義務の遵守',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: '法的根拠 (GDPR)',
      paragraphs: ['GDPR に基づき、次の根拠で処理します。'],
      bullets: ['同意', '契約の履行', '法的義務', '正当な利益'],
    },
    {
      anchorId: 'data-sharing',
      title: '第三者提供',
      paragraphs: ['次の対象に情報を提供する場合があります。'],
      bullets: [
        'サービス提供事業者',
        '法的要請がある場合の関係当局',
        '厳格な契約に基づくパートナー',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: '国外移転',
      paragraphs: ['データが EU 域外へ移転される場合があります。次の保護措置を適用します。'],
      bullets: ['標準契約条項 (SCC)', '十分性認定'],
    },
    {
      anchorId: 'data-retention',
      title: '保有期間',
      paragraphs: ['次の目的に必要な期間に限り保管します。'],
      bullets: ['サービス提供', '法令遵守', '業務上の目的'],
    },
    {
      anchorId: 'eu-rights',
      title: 'お客様の権利 (EU)',
      paragraphs: ['GDPR に基づき、次の権利を行使できます。'],
      bullets: [
        'データへのアクセス',
        'データの訂正',
        'データの削除',
        '処理の制限',
        'データポータビリティ',
        '同意の撤回',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'お客様の権利 (カリフォルニア州)',
      paragraphs: ['CCPA / CPRA に基づき、次の権利があります。'],
      bullets: ['知る権利', '削除する権利', '販売の拒否', '差別を受けない権利'],
    },
    {
      anchorId: 'cookies',
      title: 'クッキーとトラッキング',
      paragraphs: ['次の目的でクッキーを使用します。'],
      bullets: ['分析', 'パフォーマンス', 'パーソナライズ'],
    },
    {
      anchorId: 'security',
      title: 'セキュリティ対策',
      paragraphs: ['次の対策を実施しています。'],
      bullets: ['暗号化', 'アクセス制御', '監視システム'],
    },
    {
      anchorId: 'children',
      title: '児童のプライバシー',
      paragraphs: ['当社は 13 歳未満の児童から意図的に情報を収集することはありません。'],
    },
    {
      anchorId: 'updates',
      title: '方針の更新',
      paragraphs: ['本ポリシーは随時更新される場合があります。'],
    },
    {
      anchorId: 'contact',
      title: 'お問い合わせ',
      paragraphs: ['お問い合わせは下記メールアドレスへお願いします。'],
    },
  ],
}

const de: PrivacyPolicyCopy = {
  pageTitle: 'Datenschutzerklärung',
  pageMetaDescription:
    'Wie IROPKE Ihre personenbezogenen Daten erhebt, verwendet und schützt, gemäß DSGVO und CCPA.',
  tocLabel: 'Inhalt',
  lastUpdatedLabel: 'Zuletzt aktualisiert',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'E-Mail an uns',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Einleitung',
      paragraphs: [
        'Wir verpflichten uns, Ihre personenbezogenen Daten zu schützen und transparent zu machen, wie wir Informationen erheben, verwenden und verwalten.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Erhobene Daten',
      paragraphs: ['Wir können erheben:'],
      bullets: [
        'Identifikationsdaten (Name, E-Mail)',
        'Nutzungsdaten (besuchte Seiten, Interaktionen)',
        'Geräte- und technische Daten (IP, Browsertyp)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Wie wir Daten verwenden',
      paragraphs: ['Wir verwenden Daten, um:'],
      bullets: [
        'Dienste bereitstellen und verbessern',
        'Mit Nutzern kommunizieren',
        'Sicherheit gewährleisten',
        'Gesetzliche Pflichten erfüllen',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Rechtsgrundlage (DSGVO)',
      paragraphs: ['Gemäß DSGVO verarbeiten wir Daten auf folgender Grundlage:'],
      bullets: [
        'Einwilligung',
        'Vertragserfüllung',
        'Gesetzliche Pflichten',
        'Berechtigte Interessen',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Datenweitergabe',
      paragraphs: ['Wir können Daten weitergeben an:'],
      bullets: [
        'Dienstleister',
        'Behörden bei rechtlicher Verpflichtung',
        'Partner unter strengen Vereinbarungen',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Internationale Übermittlungen',
      paragraphs: [
        'Daten können außerhalb der EU übermittelt werden. Wir wenden Schutzmaßnahmen an, wie:',
      ],
      bullets: ['Standardvertragsklauseln (SCC)', 'Angemessenheitsbeschlüsse'],
    },
    {
      anchorId: 'data-retention',
      title: 'Speicherdauer',
      paragraphs: ['Wir speichern Daten nur so lange, wie es notwendig ist für:'],
      bullets: ['Diensterbringung', 'Rechtliche Compliance', 'Geschäftliche Zwecke'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Ihre Rechte (EU)',
      paragraphs: ['Gemäß DSGVO haben Nutzer das Recht:'],
      bullets: [
        'Auf Daten zuzugreifen',
        'Daten zu korrigieren',
        'Daten zu löschen',
        'Verarbeitung einzuschränken',
        'Datenübertragbarkeit',
        'Einwilligung zu widerrufen',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Ihre Rechte (Kalifornien)',
      paragraphs: ['Gemäß CCPA/CPRA:'],
      bullets: [
        'Recht auf Information',
        'Recht auf Löschung',
        'Recht auf Verkaufswiderspruch',
        'Recht auf Nichtdiskriminierung',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies & Tracking',
      paragraphs: ['Wir verwenden Cookies für:'],
      bullets: ['Analyse', 'Leistung', 'Personalisierung'],
    },
    {
      anchorId: 'security',
      title: 'Sicherheitsmaßnahmen',
      paragraphs: ['Wir setzen ein:'],
      bullets: ['Verschlüsselung', 'Zugriffskontrolle', 'Überwachungssysteme'],
    },
    {
      anchorId: 'children',
      title: 'Privatsphäre von Kindern',
      paragraphs: ['Wir erheben wissentlich keine Daten von Kindern unter 13 Jahren.'],
    },
    {
      anchorId: 'updates',
      title: 'Änderungen der Richtlinie',
      paragraphs: ['Wir können diese Richtlinie regelmäßig aktualisieren.'],
    },
    {
      anchorId: 'contact',
      title: 'Kontakt',
      paragraphs: ['Bei Anfragen:'],
    },
  ],
}

const fr: PrivacyPolicyCopy = {
  pageTitle: 'Politique de confidentialité',
  pageMetaDescription:
    "Comment IROPKE collecte, utilise et protège vos données personnelles, conformément au RGPD et au CCPA.",
  tocLabel: 'Sommaire',
  lastUpdatedLabel: 'Dernière mise à jour',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Nous écrire',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introduction',
      paragraphs: [
        "Nous nous engageons à protéger vos données personnelles et à assurer la transparence sur la manière dont nous les collectons, utilisons et gérons.",
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Données collectées',
      paragraphs: ['Nous pouvons collecter :'],
      bullets: [
        "Données d'identification (nom, e-mail)",
        "Données d'utilisation (pages visitées, interactions)",
        "Données de l'appareil et techniques (IP, type de navigateur)",
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Utilisation des données',
      paragraphs: ['Nous utilisons les données pour :'],
      bullets: [
        'Fournir et améliorer les services',
        'Communiquer avec les utilisateurs',
        'Garantir la sécurité',
        'Respecter les obligations légales',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Base légale (RGPD)',
      paragraphs: ['Conformément au RGPD, nous traitons les données sur la base de :'],
      bullets: [
        'Consentement',
        'Nécessité contractuelle',
        'Obligations légales',
        'Intérêts légitimes',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Partage des données',
      paragraphs: ['Nous pouvons partager les données avec :'],
      bullets: [
        'Prestataires de services',
        'Autorités légales lorsque requis',
        'Partenaires sous accords stricts',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Transferts internationaux',
      paragraphs: [
        "Les données peuvent être transférées hors de l'UE. Nous appliquons des garanties telles que :",
      ],
      bullets: ['Clauses Contractuelles Types (CCT)', "Décisions d'adéquation"],
    },
    {
      anchorId: 'data-retention',
      title: 'Conservation des données',
      paragraphs: ['Nous conservons les données uniquement le temps nécessaire pour :'],
      bullets: ['Fourniture du service', 'Conformité légale', 'Fins commerciales'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Vos droits (UE)',
      paragraphs: ['En vertu du RGPD, les utilisateurs ont le droit de :'],
      bullets: [
        'Accéder aux données',
        'Corriger les données',
        'Supprimer les données',
        'Limiter le traitement',
        'Portabilité des données',
        'Retirer le consentement',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Vos droits (Californie)',
      paragraphs: ['En vertu du CCPA/CPRA :'],
      bullets: [
        'Droit de savoir',
        'Droit à la suppression',
        'Droit de refuser la vente',
        'Droit à la non-discrimination',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies et suivi',
      paragraphs: ['Nous utilisons des cookies pour :'],
      bullets: ['Analytique', 'Performance', 'Personnalisation'],
    },
    {
      anchorId: 'security',
      title: 'Mesures de sécurité',
      paragraphs: ['Nous mettons en œuvre :'],
      bullets: ['Chiffrement', "Contrôle d'accès", 'Systèmes de surveillance'],
    },
    {
      anchorId: 'children',
      title: 'Vie privée des enfants',
      paragraphs: [
        "Nous ne collectons pas sciemment de données auprès d'enfants de moins de 13 ans.",
      ],
    },
    {
      anchorId: 'updates',
      title: 'Mises à jour de la politique',
      paragraphs: ['Nous pouvons mettre à jour cette politique périodiquement.'],
    },
    {
      anchorId: 'contact',
      title: 'Coordonnées',
      paragraphs: ['Pour toute demande :'],
    },
  ],
}

const es: PrivacyPolicyCopy = {
  pageTitle: 'Política de Privacidad',
  pageMetaDescription:
    'Cómo IROPKE recopila, utiliza y protege tus datos personales, conforme al GDPR y la CCPA.',
  tocLabel: 'Tabla de contenidos',
  lastUpdatedLabel: 'Última actualización',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Envíanos un correo',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introducción',
      paragraphs: [
        'Nos comprometemos a proteger tus datos personales y garantizar la transparencia en cómo los recopilamos, usamos y gestionamos.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Datos que recopilamos',
      paragraphs: ['Podemos recopilar:'],
      bullets: [
        'Datos de identificación personal (nombre, correo electrónico)',
        'Datos de uso (páginas visitadas, interacciones)',
        'Datos del dispositivo y técnicos (IP, tipo de navegador)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Cómo usamos los datos',
      paragraphs: ['Utilizamos los datos para:'],
      bullets: [
        'Proporcionar y mejorar servicios',
        'Comunicarnos con los usuarios',
        'Garantizar la seguridad',
        'Cumplir obligaciones legales',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Base legal (GDPR)',
      paragraphs: ['Según el GDPR, procesamos los datos en base a:'],
      bullets: [
        'Consentimiento',
        'Necesidad contractual',
        'Obligaciones legales',
        'Intereses legítimos',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Compartición de datos',
      paragraphs: ['Podemos compartir datos con:'],
      bullets: [
        'Proveedores de servicios',
        'Autoridades legales cuando sea necesario',
        'Socios bajo acuerdos estrictos',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Transferencias internacionales',
      paragraphs: ['Los datos pueden transferirse fuera de la UE. Aplicamos salvaguardias como:'],
      bullets: ['Cláusulas Contractuales Tipo (SCC)', 'Decisiones de adecuación'],
    },
    {
      anchorId: 'data-retention',
      title: 'Retención de datos',
      paragraphs: ['Conservamos los datos solo el tiempo necesario para:'],
      bullets: ['Prestación del servicio', 'Cumplimiento legal', 'Fines comerciales'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Tus derechos (UE)',
      paragraphs: ['Según el GDPR, los usuarios tienen derecho a:'],
      bullets: [
        'Acceder a los datos',
        'Corregir datos',
        'Eliminar datos',
        'Restringir el tratamiento',
        'Portabilidad de datos',
        'Retirar el consentimiento',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Tus derechos (California)',
      paragraphs: ['Según la CCPA/CPRA:'],
      bullets: [
        'Derecho a saber',
        'Derecho a eliminar',
        'Derecho a rechazar la venta',
        'Derecho a no ser discriminado',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies y seguimiento',
      paragraphs: ['Utilizamos cookies para:'],
      bullets: ['Análisis', 'Rendimiento', 'Personalización'],
    },
    {
      anchorId: 'security',
      title: 'Medidas de seguridad',
      paragraphs: ['Implementamos:'],
      bullets: ['Cifrado', 'Control de acceso', 'Sistemas de monitoreo'],
    },
    {
      anchorId: 'children',
      title: 'Privacidad de los niños',
      paragraphs: ['No recopilamos a sabiendas datos de menores de 13 años.'],
    },
    {
      anchorId: 'updates',
      title: 'Actualizaciones de la política',
      paragraphs: ['Podemos actualizar esta política periódicamente.'],
    },
    {
      anchorId: 'contact',
      title: 'Información de contacto',
      paragraphs: ['Para consultas:'],
    },
  ],
}

const ko: PrivacyPolicyCopy = {
  pageTitle: '개인정보처리방침',
  pageMetaDescription:
    'IROPKE 가 개인정보를 수집·이용·보관하는 방식과 사용자 권리 안내. GDPR / CCPA 기준 준수.',
  tocLabel: '목차',
  lastUpdatedLabel: '최종 업데이트',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: '이메일로 문의',
  sections: [
    {
      anchorId: 'introduction',
      title: '소개',
      paragraphs: ['저희는 사용자의 개인정보 보호와 처리 과정의 투명성 확보를 약속합니다.'],
    },
    {
      anchorId: 'data-collection',
      title: '수집 항목',
      paragraphs: ['수집할 수 있는 정보:'],
      bullets: [
        '신원 정보 (이름, 이메일)',
        '이용 정보 (방문 페이지, 상호작용 기록)',
        '기기 및 기술 정보 (IP, 브라우저 유형)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: '이용 목적',
      paragraphs: ['수집한 정보는 다음 목적으로 사용됩니다.'],
      bullets: ['서비스 제공 및 개선', '사용자 소통', '보안 유지', '법적 의무 준수'],
    },
    {
      anchorId: 'legal-basis',
      title: '법적 근거 (GDPR)',
      paragraphs: ['GDPR 에 따라 다음 근거로 처리합니다.'],
      bullets: ['동의', '계약 이행', '법적 의무', '정당한 이익'],
    },
    {
      anchorId: 'data-sharing',
      title: '제3자 제공',
      paragraphs: ['다음 대상에게 정보를 제공할 수 있습니다.'],
      bullets: [
        '서비스 제공 업체',
        '법적 요구가 있는 경우 관계 당국',
        '엄격한 계약 하의 파트너',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: '국외 이전',
      paragraphs: ['EU 외부로 정보가 이전될 수 있습니다. 다음 보호 장치를 적용합니다.'],
      bullets: ['표준 계약 조항(SCC)', '적정성 결정'],
    },
    {
      anchorId: 'data-retention',
      title: '보유 기간',
      paragraphs: ['다음 목적에 필요한 기간 동안만 보관합니다.'],
      bullets: ['서비스 제공', '법적 준수', '업무 목적'],
    },
    {
      anchorId: 'eu-rights',
      title: '사용자 권리 (EU)',
      paragraphs: ['GDPR 에 따라 다음 권리를 행사할 수 있습니다.'],
      bullets: ['열람권', '정정권', '삭제권', '처리 제한권', '데이터 이동권', '동의 철회권'],
    },
    {
      anchorId: 'ca-rights',
      title: '사용자 권리 (캘리포니아)',
      paragraphs: ['CCPA / CPRA 에 따라 다음 권리를 행사할 수 있습니다.'],
      bullets: ['열람권', '삭제권', '판매 거부권', '차별 받지 않을 권리'],
    },
    {
      anchorId: 'cookies',
      title: '쿠키 및 추적',
      paragraphs: ['다음 목적으로 쿠키를 사용합니다.'],
      bullets: ['분석', '성능 측정', '개인화'],
    },
    {
      anchorId: 'security',
      title: '보안 조치',
      paragraphs: ['다음 조치를 시행합니다.'],
      bullets: ['암호화', '접근 통제', '모니터링 시스템'],
    },
    {
      anchorId: 'children',
      title: '아동 개인정보',
      paragraphs: ['만 13세 미만 아동의 정보를 의도적으로 수집하지 않습니다.'],
    },
    {
      anchorId: 'updates',
      title: '방침 변경',
      paragraphs: ['본 방침은 주기적으로 업데이트될 수 있습니다.'],
    },
    {
      anchorId: 'contact',
      title: '문의처',
      paragraphs: ['문의는 다음 이메일로 부탁드립니다.'],
    },
  ],
}

const pt: PrivacyPolicyCopy = {
  pageTitle: 'Política de Privacidade',
  pageMetaDescription:
    'Como a IROPKE coleta, utiliza e protege os seus dados pessoais, em conformidade com o RGPD e a CCPA.',
  tocLabel: 'Sumário',
  lastUpdatedLabel: 'Última atualização',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Envie-nos um e-mail',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introdução',
      paragraphs: [
        'Comprometemo-nos a proteger os seus dados pessoais e a garantir transparência na forma como recolhemos, utilizamos e gerimos as informações.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Dados que recolhemos',
      paragraphs: ['Podemos recolher:'],
      bullets: [
        'Dados de identificação pessoal (nome, e-mail)',
        'Dados de utilização (páginas visitadas, interações)',
        'Dados do dispositivo e técnicos (IP, tipo de navegador)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Como utilizamos os dados',
      paragraphs: ['Utilizamos os dados para:'],
      bullets: [
        'Fornecer e melhorar os serviços',
        'Comunicar com os utilizadores',
        'Garantir a segurança',
        'Cumprir obrigações legais',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Base legal (RGPD)',
      paragraphs: ['Nos termos do RGPD, processamos os dados com base em:'],
      bullets: [
        'Consentimento',
        'Necessidade contratual',
        'Obrigações legais',
        'Interesses legítimos',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Partilha de dados',
      paragraphs: ['Podemos partilhar dados com:'],
      bullets: [
        'Prestadores de serviços',
        'Autoridades legais quando exigido',
        'Parceiros sob acordos rigorosos',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Transferências internacionais',
      paragraphs: ['Os dados podem ser transferidos para fora da UE. Aplicamos salvaguardas como:'],
      bullets: ['Cláusulas Contratuais-Tipo (SCC)', 'Decisões de adequação'],
    },
    {
      anchorId: 'data-retention',
      title: 'Retenção de dados',
      paragraphs: ['Conservamos os dados apenas pelo tempo necessário para:'],
      bullets: ['Prestação do serviço', 'Conformidade legal', 'Finalidades empresariais'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Os seus direitos (UE)',
      paragraphs: ['Nos termos do RGPD, os utilizadores têm direito a:'],
      bullets: [
        'Aceder aos dados',
        'Retificar dados',
        'Apagar dados',
        'Limitar o tratamento',
        'Portabilidade dos dados',
        'Retirar o consentimento',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Os seus direitos (Califórnia)',
      paragraphs: ['Ao abrigo da CCPA/CPRA:'],
      bullets: [
        'Direito de saber',
        'Direito a apagar',
        'Direito de recusar a venda',
        'Direito à não discriminação',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies e rastreio',
      paragraphs: ['Utilizamos cookies para:'],
      bullets: ['Análise', 'Desempenho', 'Personalização'],
    },
    {
      anchorId: 'security',
      title: 'Medidas de segurança',
      paragraphs: ['Implementamos:'],
      bullets: ['Encriptação', 'Controlo de acesso', 'Sistemas de monitorização'],
    },
    {
      anchorId: 'children',
      title: 'Privacidade das crianças',
      paragraphs: ['Não recolhemos intencionalmente dados de crianças com menos de 13 anos.'],
    },
    {
      anchorId: 'updates',
      title: 'Atualizações da política',
      paragraphs: ['Podemos atualizar esta política periodicamente.'],
    },
    {
      anchorId: 'contact',
      title: 'Informações de contacto',
      paragraphs: ['Para questões:'],
    },
  ],
}

const hi: PrivacyPolicyCopy = {
  pageTitle: 'गोपनीयता नीति',
  pageMetaDescription:
    'IROPKE आपके व्यक्तिगत डेटा को कैसे एकत्र करता, उपयोग करता और सुरक्षित रखता है, GDPR और CCPA के अनुरूप।',
  tocLabel: 'विषय-सूची',
  lastUpdatedLabel: 'अंतिम अपडेट',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'हमें ईमेल करें',
  sections: [
    {
      anchorId: 'introduction',
      title: 'परिचय',
      paragraphs: [
        'हम आपके व्यक्तिगत डेटा की सुरक्षा करने और जानकारी एकत्र करने, उपयोग करने तथा प्रबंधित करने में पारदर्शिता सुनिश्चित करने के लिए प्रतिबद्ध हैं।',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'हम जो डेटा एकत्र करते हैं',
      paragraphs: ['हम निम्नलिखित एकत्र कर सकते हैं:'],
      bullets: [
        'व्यक्तिगत पहचान डेटा (नाम, ईमेल)',
        'उपयोग डेटा (विज़िट किए गए पृष्ठ, इंटरैक्शन)',
        'डिवाइस और तकनीकी डेटा (IP, ब्राउज़र प्रकार)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'हम डेटा का उपयोग कैसे करते हैं',
      paragraphs: ['हम डेटा का उपयोग करते हैं:'],
      bullets: [
        'सेवाएँ प्रदान करना और सुधारना',
        'उपयोगकर्ताओं के साथ संवाद करना',
        'सुरक्षा सुनिश्चित करना',
        'कानूनी दायित्वों का पालन करना',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'कानूनी आधार (GDPR)',
      paragraphs: ['GDPR के तहत, हम निम्नलिखित आधार पर डेटा संसाधित करते हैं:'],
      bullets: ['सहमति', 'संविदात्मक आवश्यकता', 'कानूनी दायित्व', 'वैध हित'],
    },
    {
      anchorId: 'data-sharing',
      title: 'डेटा साझाकरण',
      paragraphs: ['हम निम्नलिखित के साथ डेटा साझा कर सकते हैं:'],
      bullets: [
        'सेवा प्रदाता',
        'आवश्यकता पड़ने पर कानूनी प्राधिकरण',
        'सख्त समझौतों के तहत भागीदार',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'अंतर्राष्ट्रीय हस्तांतरण',
      paragraphs: [
        'डेटा को EU के बाहर स्थानांतरित किया जा सकता है। हम निम्नलिखित सुरक्षा उपाय सुनिश्चित करते हैं:',
      ],
      bullets: ['मानक संविदात्मक खंड (SCC)', 'पर्याप्तता निर्णय'],
    },
    {
      anchorId: 'data-retention',
      title: 'डेटा प्रतिधारण',
      paragraphs: ['हम डेटा को केवल आवश्यक अवधि तक ही रखते हैं:'],
      bullets: ['सेवा प्रदान करना', 'कानूनी अनुपालन', 'व्यावसायिक उद्देश्य'],
    },
    {
      anchorId: 'eu-rights',
      title: 'आपके अधिकार (EU)',
      paragraphs: ['GDPR के तहत, उपयोगकर्ताओं को निम्नलिखित अधिकार प्राप्त हैं:'],
      bullets: [
        'डेटा तक पहुँचना',
        'डेटा को सही करना',
        'डेटा हटाना',
        'प्रसंस्करण को सीमित करना',
        'डेटा पोर्टेबिलिटी',
        'सहमति वापस लेना',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'आपके अधिकार (कैलिफ़ोर्निया)',
      paragraphs: ['CCPA/CPRA के अंतर्गत:'],
      bullets: [
        'जानने का अधिकार',
        'हटाने का अधिकार',
        'बिक्री से ऑप्ट-आउट का अधिकार',
        'भेदभाव न होने का अधिकार',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'कुकीज़ और ट्रैकिंग',
      paragraphs: ['हम कुकीज़ का उपयोग निम्नलिखित के लिए करते हैं:'],
      bullets: ['विश्लेषण', 'प्रदर्शन', 'वैयक्तिकरण'],
    },
    {
      anchorId: 'security',
      title: 'सुरक्षा उपाय',
      paragraphs: ['हम लागू करते हैं:'],
      bullets: ['एन्क्रिप्शन', 'अभिगम नियंत्रण', 'निगरानी प्रणाली'],
    },
    {
      anchorId: 'children',
      title: 'बच्चों की गोपनीयता',
      paragraphs: ['हम जानबूझकर 13 वर्ष से कम आयु के बच्चों से डेटा एकत्र नहीं करते हैं।'],
    },
    {
      anchorId: 'updates',
      title: 'नीति में अपडेट',
      paragraphs: ['हम इस नीति को समय-समय पर अपडेट कर सकते हैं।'],
    },
    {
      anchorId: 'contact',
      title: 'संपर्क जानकारी',
      paragraphs: ['पूछताछ के लिए:'],
    },
  ],
}

const ru: PrivacyPolicyCopy = {
  pageTitle: 'Политика конфиденциальности',
  pageMetaDescription:
    'Как IROPKE собирает, использует и защищает ваши персональные данные в соответствии с GDPR и CCPA.',
  tocLabel: 'Содержание',
  lastUpdatedLabel: 'Последнее обновление',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Написать нам',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Введение',
      paragraphs: [
        'Мы стремимся защищать ваши персональные данные и обеспечивать прозрачность их сбора, использования и хранения.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Какие данные мы собираем',
      paragraphs: ['Мы можем собирать:'],
      bullets: [
        'Идентификационные данные (имя, email)',
        'Данные об использовании (посещённые страницы, действия)',
        'Данные устройства и технические данные (IP, тип браузера)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Как мы используем данные',
      paragraphs: ['Мы используем данные, чтобы:'],
      bullets: [
        'Предоставлять и улучшать услуги',
        'Связываться с пользователями',
        'Обеспечивать безопасность',
        'Соблюдать правовые обязательства',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Правовое основание (GDPR)',
      paragraphs: ['В соответствии с GDPR обработка осуществляется на основании:'],
      bullets: ['Согласие', 'Исполнение договора', 'Правовые обязательства', 'Законные интересы'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Передача данных',
      paragraphs: ['Мы можем передавать данные следующим сторонам:'],
      bullets: [
        'Поставщики услуг',
        'Государственные органы при необходимости',
        'Партнёры по строгим соглашениям',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Международные передачи',
      paragraphs: [
        'Данные могут передаваться за пределы ЕС. Мы обеспечиваем такие гарантии, как:',
      ],
      bullets: ['Стандартные договорные положения (SCC)', 'Решения об адекватности'],
    },
    {
      anchorId: 'data-retention',
      title: 'Срок хранения данных',
      paragraphs: ['Мы храним данные только в течение времени, необходимого для:'],
      bullets: ['Предоставление услуг', 'Соблюдение законодательства', 'Деловые цели'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Ваши права (ЕС)',
      paragraphs: ['В соответствии с GDPR пользователи имеют право:'],
      bullets: [
        'Получать доступ к данным',
        'Исправлять данные',
        'Удалять данные',
        'Ограничивать обработку',
        'Переносимость данных',
        'Отозвать согласие',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Ваши права (Калифорния)',
      paragraphs: ['Согласно CCPA/CPRA:'],
      bullets: [
        'Право знать',
        'Право на удаление',
        'Право отказаться от продажи',
        'Право на отсутствие дискриминации',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Файлы cookie и отслеживание',
      paragraphs: ['Мы используем файлы cookie для:'],
      bullets: ['Аналитика', 'Производительность', 'Персонализация'],
    },
    {
      anchorId: 'security',
      title: 'Меры безопасности',
      paragraphs: ['Мы применяем:'],
      bullets: ['Шифрование', 'Контроль доступа', 'Системы мониторинга'],
    },
    {
      anchorId: 'children',
      title: 'Конфиденциальность детей',
      paragraphs: ['Мы намеренно не собираем данные о детях младше 13 лет.'],
    },
    {
      anchorId: 'updates',
      title: 'Изменения политики',
      paragraphs: ['Мы можем периодически обновлять эту политику.'],
    },
    {
      anchorId: 'contact',
      title: 'Контактная информация',
      paragraphs: ['По вопросам:'],
    },
  ],
}

const nl: PrivacyPolicyCopy = {
  pageTitle: 'Privacybeleid',
  pageMetaDescription:
    'Hoe IROPKE uw persoonsgegevens verzamelt, gebruikt en beschermt, in overeenstemming met de AVG en CCPA.',
  tocLabel: 'Inhoudsopgave',
  lastUpdatedLabel: 'Laatst bijgewerkt',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Stuur ons een e-mail',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Inleiding',
      paragraphs: [
        'Wij zetten ons in voor de bescherming van uw persoonsgegevens en zorgen voor transparantie over hoe wij informatie verzamelen, gebruiken en beheren.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Gegevens die wij verzamelen',
      paragraphs: ['Wij kunnen verzamelen:'],
      bullets: [
        'Identificatiegegevens (naam, e-mail)',
        "Gebruiksgegevens (bezochte pagina's, interacties)",
        'Apparaat- en technische gegevens (IP, browsertype)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Hoe wij gegevens gebruiken',
      paragraphs: ['Wij gebruiken gegevens om:'],
      bullets: [
        'Diensten leveren en verbeteren',
        'Communiceren met gebruikers',
        'Veiligheid waarborgen',
        'Voldoen aan wettelijke verplichtingen',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Rechtsgrond (AVG)',
      paragraphs: ['Op grond van de AVG verwerken wij gegevens op basis van:'],
      bullets: [
        'Toestemming',
        'Contractuele noodzaak',
        'Wettelijke verplichtingen',
        'Gerechtvaardigde belangen',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Gegevensdeling',
      paragraphs: ['Wij kunnen gegevens delen met:'],
      bullets: [
        'Dienstverleners',
        'Bevoegde autoriteiten indien wettelijk vereist',
        'Partners onder strikte overeenkomsten',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Internationale doorgiften',
      paragraphs: ['Gegevens kunnen buiten de EU worden doorgegeven. Wij hanteren waarborgen zoals:'],
      bullets: ['Standaardcontractbepalingen (SCC)', 'Adequaatheidsbesluiten'],
    },
    {
      anchorId: 'data-retention',
      title: 'Bewaartermijn',
      paragraphs: ['Wij bewaren gegevens slechts zo lang als nodig is voor:'],
      bullets: ['Dienstverlening', 'Naleving van wettelijke verplichtingen', 'Zakelijke doeleinden'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Uw rechten (EU)',
      paragraphs: ['Op grond van de AVG hebben gebruikers het recht om:'],
      bullets: [
        'Toegang tot gegevens',
        'Gegevens te corrigeren',
        'Gegevens te verwijderen',
        'Verwerking te beperken',
        'Gegevensoverdraagbaarheid',
        'Toestemming in te trekken',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Uw rechten (Californië)',
      paragraphs: ['Op grond van de CCPA/CPRA:'],
      bullets: [
        'Recht op informatie',
        'Recht op verwijdering',
        'Recht om verkoop te weigeren',
        'Recht op niet-discriminatie',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies & tracking',
      paragraphs: ['Wij gebruiken cookies voor:'],
      bullets: ['Analyse', 'Prestaties', 'Personalisatie'],
    },
    {
      anchorId: 'security',
      title: 'Beveiligingsmaatregelen',
      paragraphs: ['Wij implementeren:'],
      bullets: ['Versleuteling', 'Toegangscontrole', 'Bewakingssystemen'],
    },
    {
      anchorId: 'children',
      title: 'Privacy van kinderen',
      paragraphs: ['Wij verzamelen niet bewust gegevens van kinderen jonger dan 13 jaar.'],
    },
    {
      anchorId: 'updates',
      title: 'Wijzigingen van het beleid',
      paragraphs: ['Wij kunnen dit beleid periodiek bijwerken.'],
    },
    {
      anchorId: 'contact',
      title: 'Contactgegevens',
      paragraphs: ['Voor vragen:'],
    },
  ],
}

const it: PrivacyPolicyCopy = {
  pageTitle: 'Informativa sulla Privacy',
  pageMetaDescription:
    'Come IROPKE raccoglie, utilizza e protegge i tuoi dati personali, in conformità al GDPR e al CCPA.',
  tocLabel: 'Indice',
  lastUpdatedLabel: 'Ultimo aggiornamento',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Scrivici',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introduzione',
      paragraphs: [
        'Ci impegniamo a proteggere i tuoi dati personali e a garantire la trasparenza sul modo in cui raccogliamo, utilizziamo e gestiamo le informazioni.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Dati che raccogliamo',
      paragraphs: ['Possiamo raccogliere:'],
      bullets: [
        'Dati di identificazione personale (nome, e-mail)',
        'Dati di utilizzo (pagine visitate, interazioni)',
        'Dati del dispositivo e tecnici (IP, tipo di browser)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Come utilizziamo i dati',
      paragraphs: ['Utilizziamo i dati per:'],
      bullets: [
        'Fornire e migliorare i servizi',
        'Comunicare con gli utenti',
        'Garantire la sicurezza',
        'Adempiere agli obblighi legali',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Base giuridica (GDPR)',
      paragraphs: ['Ai sensi del GDPR, trattiamo i dati in base a:'],
      bullets: ['Consenso', 'Necessità contrattuale', 'Obblighi legali', 'Interessi legittimi'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Condivisione dei dati',
      paragraphs: ['Possiamo condividere i dati con:'],
      bullets: [
        'Fornitori di servizi',
        'Autorità legali quando richiesto',
        'Partner soggetti ad accordi rigorosi',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Trasferimenti internazionali',
      paragraphs: [
        "I dati possono essere trasferiti al di fuori dell'UE. Adottiamo misure di salvaguardia come:",
      ],
      bullets: ['Clausole Contrattuali Standard (SCC)', 'Decisioni di adeguatezza'],
    },
    {
      anchorId: 'data-retention',
      title: 'Conservazione dei dati',
      paragraphs: ['Conserviamo i dati solo per il tempo necessario per:'],
      bullets: ['Erogazione del servizio', 'Conformità legale', 'Finalità aziendali'],
    },
    {
      anchorId: 'eu-rights',
      title: 'I tuoi diritti (UE)',
      paragraphs: ['Ai sensi del GDPR, gli utenti hanno il diritto di:'],
      bullets: [
        'Accedere ai dati',
        'Correggere i dati',
        'Cancellare i dati',
        'Limitare il trattamento',
        'Portabilità dei dati',
        'Revocare il consenso',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'I tuoi diritti (California)',
      paragraphs: ['Ai sensi del CCPA/CPRA:'],
      bullets: [
        'Diritto di sapere',
        'Diritto alla cancellazione',
        'Diritto di opporsi alla vendita',
        'Diritto alla non discriminazione',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookie e tracciamento',
      paragraphs: ['Utilizziamo i cookie per:'],
      bullets: ['Analisi', 'Prestazioni', 'Personalizzazione'],
    },
    {
      anchorId: 'security',
      title: 'Misure di sicurezza',
      paragraphs: ['Adottiamo:'],
      bullets: ['Crittografia', 'Controllo degli accessi', 'Sistemi di monitoraggio'],
    },
    {
      anchorId: 'children',
      title: 'Privacy dei minori',
      paragraphs: ['Non raccogliamo consapevolmente dati da minori di 13 anni.'],
    },
    {
      anchorId: 'updates',
      title: "Aggiornamenti dell'informativa",
      paragraphs: ['Possiamo aggiornare periodicamente questa informativa.'],
    },
    {
      anchorId: 'contact',
      title: 'Informazioni di contatto',
      paragraphs: ['Per richieste:'],
    },
  ],
}

const ar: PrivacyPolicyCopy = {
  pageTitle: 'سياسة الخصوصية',
  pageMetaDescription:
    'كيف تجمع IROPKE بياناتك الشخصية وتستخدمها وتحميها وفقًا للائحة GDPR و CCPA.',
  tocLabel: 'المحتويات',
  lastUpdatedLabel: 'آخر تحديث',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'راسلنا عبر البريد',
  sections: [
    {
      anchorId: 'introduction',
      title: 'مقدمة',
      paragraphs: [
        'نحن ملتزمون بحماية بياناتك الشخصية وضمان الشفافية في كيفية جمعها واستخدامها وإدارتها.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'البيانات التي نجمعها',
      paragraphs: ['قد نجمع ما يلي:'],
      bullets: [
        'بيانات التعريف الشخصية (الاسم، البريد الإلكتروني)',
        'بيانات الاستخدام (الصفحات المُزارة، التفاعلات)',
        'بيانات الجهاز والبيانات التقنية (IP، نوع المتصفح)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'كيفية استخدام البيانات',
      paragraphs: ['نستخدم البيانات من أجل:'],
      bullets: [
        'تقديم الخدمات وتحسينها',
        'التواصل مع المستخدمين',
        'ضمان الأمن',
        'الامتثال للالتزامات القانونية',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'الأساس القانوني (GDPR)',
      paragraphs: ['وفقًا للائحة GDPR، نعالج البيانات بناءً على:'],
      bullets: ['الموافقة', 'الضرورة التعاقدية', 'الالتزامات القانونية', 'المصالح المشروعة'],
    },
    {
      anchorId: 'data-sharing',
      title: 'مشاركة البيانات',
      paragraphs: ['قد نشارك البيانات مع:'],
      bullets: [
        'مزودو الخدمات',
        'السلطات القانونية عند الطلب',
        'الشركاء بموجب اتفاقيات صارمة',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'عمليات النقل الدولية',
      paragraphs: ['قد تُنقل البيانات خارج الاتحاد الأوروبي. نضمن إجراءات حماية مثل:'],
      bullets: ['البنود التعاقدية القياسية (SCC)', 'قرارات الكفاية'],
    },
    {
      anchorId: 'data-retention',
      title: 'مدة الاحتفاظ بالبيانات',
      paragraphs: ['نحتفظ بالبيانات فقط للمدة اللازمة لأغراض:'],
      bullets: ['تقديم الخدمة', 'الامتثال القانوني', 'الأغراض التجارية'],
    },
    {
      anchorId: 'eu-rights',
      title: 'حقوقك (الاتحاد الأوروبي)',
      paragraphs: ['بموجب GDPR، يحق للمستخدمين:'],
      bullets: [
        'الوصول إلى البيانات',
        'تصحيح البيانات',
        'حذف البيانات',
        'تقييد المعالجة',
        'نقل البيانات',
        'سحب الموافقة',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'حقوقك (كاليفورنيا)',
      paragraphs: ['بموجب قانون CCPA/CPRA:'],
      bullets: [
        'الحق في المعرفة',
        'الحق في الحذف',
        'الحق في رفض البيع',
        'الحق في عدم التمييز',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'ملفات تعريف الارتباط والتتبع',
      paragraphs: ['نستخدم ملفات تعريف الارتباط لأغراض:'],
      bullets: ['التحليلات', 'الأداء', 'التخصيص'],
    },
    {
      anchorId: 'security',
      title: 'إجراءات الأمان',
      paragraphs: ['نقوم بتطبيق:'],
      bullets: ['التشفير', 'التحكم في الوصول', 'أنظمة المراقبة'],
    },
    {
      anchorId: 'children',
      title: 'خصوصية الأطفال',
      paragraphs: ['لا نجمع عن قصد بيانات من الأطفال دون سن 13 عامًا.'],
    },
    {
      anchorId: 'updates',
      title: 'تحديثات السياسة',
      paragraphs: ['قد نقوم بتحديث هذه السياسة بشكل دوري.'],
    },
    {
      anchorId: 'contact',
      title: 'معلومات الاتصال',
      paragraphs: ['للاستفسارات:'],
    },
  ],
}

const sv: PrivacyPolicyCopy = {
  pageTitle: 'Integritetspolicy',
  pageMetaDescription:
    'Hur IROPKE samlar in, använder och skyddar dina personuppgifter, i enlighet med GDPR och CCPA.',
  tocLabel: 'Innehåll',
  lastUpdatedLabel: 'Senast uppdaterad',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Mejla oss',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Introduktion',
      paragraphs: [
        'Vi är engagerade i att skydda dina personuppgifter och säkerställa transparens i hur vi samlar in, använder och hanterar information.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Uppgifter vi samlar in',
      paragraphs: ['Vi kan samla in:'],
      bullets: [
        'Identifieringsuppgifter (namn, e-post)',
        'Användningsdata (besökta sidor, interaktioner)',
        'Enhets- och tekniska data (IP, webbläsartyp)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Hur vi använder data',
      paragraphs: ['Vi använder data för att:'],
      bullets: [
        'Tillhandahålla och förbättra tjänster',
        'Kommunicera med användare',
        'Säkerställa säkerhet',
        'Uppfylla rättsliga skyldigheter',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Rättslig grund (GDPR)',
      paragraphs: ['Enligt GDPR behandlar vi data baserat på:'],
      bullets: ['Samtycke', 'Avtalsmässig nödvändighet', 'Rättsliga skyldigheter', 'Berättigade intressen'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Datadelning',
      paragraphs: ['Vi kan dela data med:'],
      bullets: [
        'Tjänsteleverantörer',
        'Rättsliga myndigheter när det krävs',
        'Partner under strikta avtal',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Internationella överföringar',
      paragraphs: ['Data kan överföras utanför EU. Vi tillämpar skyddsåtgärder såsom:'],
      bullets: ['Standardavtalsklausuler (SCC)', 'Beslut om adekvat skyddsnivå'],
    },
    {
      anchorId: 'data-retention',
      title: 'Lagring av data',
      paragraphs: ['Vi lagrar data endast så länge det är nödvändigt för:'],
      bullets: ['Tillhandahållande av tjänst', 'Rättslig efterlevnad', 'Affärsändamål'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Dina rättigheter (EU)',
      paragraphs: ['Enligt GDPR har användare rätt att:'],
      bullets: [
        'Få tillgång till data',
        'Rätta data',
        'Radera data',
        'Begränsa behandling',
        'Dataportabilitet',
        'Återkalla samtycke',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Dina rättigheter (Kalifornien)',
      paragraphs: ['Enligt CCPA/CPRA:'],
      bullets: [
        'Rätt att veta',
        'Rätt till radering',
        'Rätt att avstå från försäljning',
        'Rätt till icke-diskriminering',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies och spårning',
      paragraphs: ['Vi använder cookies för:'],
      bullets: ['Analys', 'Prestanda', 'Personalisering'],
    },
    {
      anchorId: 'security',
      title: 'Säkerhetsåtgärder',
      paragraphs: ['Vi tillämpar:'],
      bullets: ['Kryptering', 'Åtkomstkontroll', 'Övervakningssystem'],
    },
    {
      anchorId: 'children',
      title: 'Barns integritet',
      paragraphs: ['Vi samlar inte medvetet in data från barn under 13 år.'],
    },
    {
      anchorId: 'updates',
      title: 'Uppdateringar av policyn',
      paragraphs: ['Vi kan uppdatera denna policy regelbundet.'],
    },
    {
      anchorId: 'contact',
      title: 'Kontaktinformation',
      paragraphs: ['Vid frågor:'],
    },
  ],
}

const th: PrivacyPolicyCopy = {
  pageTitle: 'นโยบายความเป็นส่วนตัว',
  pageMetaDescription:
    'วิธีที่ IROPKE เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ ตามมาตรฐาน GDPR และ CCPA',
  tocLabel: 'สารบัญ',
  lastUpdatedLabel: 'อัปเดตล่าสุด',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'ส่งอีเมลถึงเรา',
  sections: [
    {
      anchorId: 'introduction',
      title: 'บทนำ',
      paragraphs: [
        'เรามุ่งมั่นที่จะปกป้องข้อมูลส่วนบุคคลของคุณ และรับประกันความโปร่งใสในการเก็บรวบรวม การใช้ และการจัดการข้อมูล',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'ข้อมูลที่เราเก็บรวบรวม',
      paragraphs: ['เราอาจเก็บรวบรวม:'],
      bullets: [
        'ข้อมูลระบุตัวตน (ชื่อ, อีเมล)',
        'ข้อมูลการใช้งาน (หน้าที่เข้าชม, การโต้ตอบ)',
        'ข้อมูลอุปกรณ์และข้อมูลทางเทคนิค (IP, ประเภทเบราว์เซอร์)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'วิธีที่เราใช้ข้อมูล',
      paragraphs: ['เราใช้ข้อมูลเพื่อ:'],
      bullets: [
        'ให้บริการและปรับปรุงบริการ',
        'สื่อสารกับผู้ใช้',
        'รับประกันความปลอดภัย',
        'ปฏิบัติตามภาระผูกพันทางกฎหมาย',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'ฐานทางกฎหมาย (GDPR)',
      paragraphs: ['ภายใต้ GDPR เราประมวลผลข้อมูลโดยอาศัย:'],
      bullets: ['ความยินยอม', 'ความจำเป็นตามสัญญา', 'ภาระผูกพันทางกฎหมาย', 'ผลประโยชน์อันชอบธรรม'],
    },
    {
      anchorId: 'data-sharing',
      title: 'การแบ่งปันข้อมูล',
      paragraphs: ['เราอาจแบ่งปันข้อมูลกับ:'],
      bullets: [
        'ผู้ให้บริการ',
        'หน่วยงานทางกฎหมายเมื่อมีการร้องขอ',
        'พันธมิตรภายใต้ข้อตกลงที่เข้มงวด',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'การถ่ายโอนข้อมูลระหว่างประเทศ',
      paragraphs: ['ข้อมูลอาจถูกถ่ายโอนออกนอกสหภาพยุโรป เราใช้มาตรการคุ้มครอง เช่น:'],
      bullets: ['ข้อสัญญามาตรฐาน (SCC)', 'คำตัดสินว่ามีมาตรการคุ้มครองเพียงพอ'],
    },
    {
      anchorId: 'data-retention',
      title: 'การเก็บรักษาข้อมูล',
      paragraphs: ['เราเก็บรักษาข้อมูลเฉพาะเท่าที่จำเป็นเพื่อ:'],
      bullets: ['การให้บริการ', 'การปฏิบัติตามกฎหมาย', 'วัตถุประสงค์ทางธุรกิจ'],
    },
    {
      anchorId: 'eu-rights',
      title: 'สิทธิของคุณ (สหภาพยุโรป)',
      paragraphs: ['ภายใต้ GDPR ผู้ใช้มีสิทธิที่จะ:'],
      bullets: [
        'เข้าถึงข้อมูล',
        'แก้ไขข้อมูล',
        'ลบข้อมูล',
        'จำกัดการประมวลผล',
        'การโอนย้ายข้อมูล',
        'ถอนความยินยอม',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'สิทธิของคุณ (แคลิฟอร์เนีย)',
      paragraphs: ['ภายใต้ CCPA/CPRA:'],
      bullets: [
        'สิทธิที่จะรับทราบ',
        'สิทธิที่จะลบข้อมูล',
        'สิทธิที่จะปฏิเสธการขาย',
        'สิทธิที่จะไม่ถูกเลือกปฏิบัติ',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'คุกกี้และการติดตาม',
      paragraphs: ['เราใช้คุกกี้เพื่อ:'],
      bullets: ['การวิเคราะห์', 'ประสิทธิภาพ', 'การปรับให้เหมาะกับผู้ใช้'],
    },
    {
      anchorId: 'security',
      title: 'มาตรการรักษาความปลอดภัย',
      paragraphs: ['เราดำเนินการ:'],
      bullets: ['การเข้ารหัส', 'การควบคุมการเข้าถึง', 'ระบบเฝ้าระวัง'],
    },
    {
      anchorId: 'children',
      title: 'ความเป็นส่วนตัวของเด็ก',
      paragraphs: ['เราไม่ได้ตั้งใจเก็บรวบรวมข้อมูลจากเด็กอายุต่ำกว่า 13 ปี'],
    },
    {
      anchorId: 'updates',
      title: 'การปรับปรุงนโยบาย',
      paragraphs: ['เราอาจปรับปรุงนโยบายนี้เป็นระยะ'],
    },
    {
      anchorId: 'contact',
      title: 'ข้อมูลการติดต่อ',
      paragraphs: ['สำหรับการสอบถาม:'],
    },
  ],
}

const pl: PrivacyPolicyCopy = {
  pageTitle: 'Polityka Prywatności',
  pageMetaDescription:
    'Jak IROPKE zbiera, wykorzystuje i chroni Twoje dane osobowe, zgodnie z RODO i CCPA.',
  tocLabel: 'Spis treści',
  lastUpdatedLabel: 'Ostatnia aktualizacja',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Napisz do nas',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Wprowadzenie',
      paragraphs: [
        'Zobowiązujemy się do ochrony Twoich danych osobowych i zapewnienia przejrzystości w sposobie ich gromadzenia, wykorzystywania i zarządzania nimi.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Dane, które zbieramy',
      paragraphs: ['Możemy zbierać:'],
      bullets: [
        'Dane identyfikacyjne (imię i nazwisko, e-mail)',
        'Dane o użytkowaniu (odwiedzone strony, interakcje)',
        'Dane urządzenia i techniczne (IP, typ przeglądarki)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Jak wykorzystujemy dane',
      paragraphs: ['Wykorzystujemy dane, aby:'],
      bullets: [
        'Świadczyć i ulepszać usługi',
        'Komunikować się z użytkownikami',
        'Zapewniać bezpieczeństwo',
        'Spełniać obowiązki prawne',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Podstawa prawna (RODO)',
      paragraphs: ['Zgodnie z RODO przetwarzamy dane na podstawie:'],
      bullets: [
        'Zgoda',
        'Niezbędność umowna',
        'Obowiązki prawne',
        'Prawnie uzasadnione interesy',
      ],
    },
    {
      anchorId: 'data-sharing',
      title: 'Udostępnianie danych',
      paragraphs: ['Możemy udostępniać dane:'],
      bullets: [
        'Dostawcom usług',
        'Organom prawnym, gdy jest to wymagane',
        'Partnerom w ramach ścisłych umów',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Przekazywanie międzynarodowe',
      paragraphs: ['Dane mogą być przekazywane poza UE. Stosujemy zabezpieczenia, takie jak:'],
      bullets: ['Standardowe Klauzule Umowne (SCC)', 'Decyzje stwierdzające odpowiedni stopień ochrony'],
    },
    {
      anchorId: 'data-retention',
      title: 'Przechowywanie danych',
      paragraphs: ['Przechowujemy dane wyłącznie tak długo, jak jest to konieczne do:'],
      bullets: ['Świadczenia usług', 'Zgodności z przepisami prawa', 'Celów biznesowych'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Twoje prawa (UE)',
      paragraphs: ['Zgodnie z RODO użytkownicy mają prawo do:'],
      bullets: [
        'Dostępu do danych',
        'Sprostowania danych',
        'Usunięcia danych',
        'Ograniczenia przetwarzania',
        'Przenoszenia danych',
        'Wycofania zgody',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Twoje prawa (Kalifornia)',
      paragraphs: ['Zgodnie z CCPA/CPRA:'],
      bullets: [
        'Prawo do informacji',
        'Prawo do usunięcia',
        'Prawo do rezygnacji ze sprzedaży',
        'Prawo do niedyskryminacji',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Pliki cookie i śledzenie',
      paragraphs: ['Wykorzystujemy pliki cookie do:'],
      bullets: ['Analityka', 'Wydajność', 'Personalizacja'],
    },
    {
      anchorId: 'security',
      title: 'Środki bezpieczeństwa',
      paragraphs: ['Stosujemy:'],
      bullets: ['Szyfrowanie', 'Kontrola dostępu', 'Systemy monitorowania'],
    },
    {
      anchorId: 'children',
      title: 'Prywatność dzieci',
      paragraphs: ['Nie zbieramy świadomie danych od dzieci poniżej 13. roku życia.'],
    },
    {
      anchorId: 'updates',
      title: 'Aktualizacje polityki',
      paragraphs: ['Możemy okresowo aktualizować niniejszą politykę.'],
    },
    {
      anchorId: 'contact',
      title: 'Dane kontaktowe',
      paragraphs: ['W razie pytań:'],
    },
  ],
}

const id: PrivacyPolicyCopy = {
  pageTitle: 'Kebijakan Privasi',
  pageMetaDescription:
    'Bagaimana IROPKE mengumpulkan, menggunakan, dan melindungi data pribadi Anda, sesuai dengan GDPR dan CCPA.',
  tocLabel: 'Daftar isi',
  lastUpdatedLabel: 'Terakhir diperbarui',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Kirim email kepada kami',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Pendahuluan',
      paragraphs: [
        'Kami berkomitmen untuk melindungi data pribadi Anda dan memastikan transparansi dalam cara kami mengumpulkan, menggunakan, dan mengelola informasi.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Data yang kami kumpulkan',
      paragraphs: ['Kami dapat mengumpulkan:'],
      bullets: [
        'Data identifikasi pribadi (nama, email)',
        'Data penggunaan (halaman yang dikunjungi, interaksi)',
        'Data perangkat dan teknis (IP, jenis peramban)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Cara kami menggunakan data',
      paragraphs: ['Kami menggunakan data untuk:'],
      bullets: [
        'Menyediakan dan meningkatkan layanan',
        'Berkomunikasi dengan pengguna',
        'Memastikan keamanan',
        'Mematuhi kewajiban hukum',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Dasar hukum (GDPR)',
      paragraphs: ['Berdasarkan GDPR, kami memproses data berdasarkan:'],
      bullets: ['Persetujuan', 'Kebutuhan kontrak', 'Kewajiban hukum', 'Kepentingan sah'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Pembagian data',
      paragraphs: ['Kami dapat membagikan data dengan:'],
      bullets: [
        'Penyedia layanan',
        'Otoritas hukum bila diperlukan',
        'Mitra di bawah perjanjian ketat',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Transfer internasional',
      paragraphs: ['Data dapat ditransfer ke luar UE. Kami menerapkan perlindungan seperti:'],
      bullets: ['Klausul Kontrak Standar (SCC)', 'Keputusan kecukupan perlindungan'],
    },
    {
      anchorId: 'data-retention',
      title: 'Penyimpanan data',
      paragraphs: ['Kami menyimpan data hanya selama diperlukan untuk:'],
      bullets: ['Penyediaan layanan', 'Kepatuhan hukum', 'Tujuan bisnis'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Hak Anda (UE)',
      paragraphs: ['Berdasarkan GDPR, pengguna berhak untuk:'],
      bullets: [
        'Mengakses data',
        'Memperbaiki data',
        'Menghapus data',
        'Membatasi pemrosesan',
        'Portabilitas data',
        'Menarik persetujuan',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Hak Anda (California)',
      paragraphs: ['Berdasarkan CCPA/CPRA:'],
      bullets: [
        'Hak untuk mengetahui',
        'Hak untuk menghapus',
        'Hak untuk menolak penjualan',
        'Hak untuk tidak didiskriminasi',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookie & pelacakan',
      paragraphs: ['Kami menggunakan cookie untuk:'],
      bullets: ['Analitik', 'Kinerja', 'Personalisasi'],
    },
    {
      anchorId: 'security',
      title: 'Langkah-langkah keamanan',
      paragraphs: ['Kami menerapkan:'],
      bullets: ['Enkripsi', 'Kontrol akses', 'Sistem pemantauan'],
    },
    {
      anchorId: 'children',
      title: 'Privasi anak-anak',
      paragraphs: ['Kami tidak secara sengaja mengumpulkan data dari anak-anak di bawah usia 13 tahun.'],
    },
    {
      anchorId: 'updates',
      title: 'Pembaruan kebijakan',
      paragraphs: ['Kami dapat memperbarui kebijakan ini secara berkala.'],
    },
    {
      anchorId: 'contact',
      title: 'Informasi kontak',
      paragraphs: ['Untuk pertanyaan:'],
    },
  ],
}

const ms: PrivacyPolicyCopy = {
  pageTitle: 'Dasar Privasi',
  pageMetaDescription:
    'Bagaimana IROPKE mengumpul, menggunakan dan melindungi data peribadi anda, selaras dengan GDPR dan CCPA.',
  tocLabel: 'Kandungan',
  lastUpdatedLabel: 'Kemas kini terkini',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'E-mel kami',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Pengenalan',
      paragraphs: [
        'Kami komited untuk melindungi data peribadi anda dan memastikan ketelusan dalam cara kami mengumpul, menggunakan dan mengurus maklumat.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Data yang kami kumpul',
      paragraphs: ['Kami mungkin mengumpul:'],
      bullets: [
        'Data pengenalan diri (nama, e-mel)',
        'Data penggunaan (halaman yang dilawati, interaksi)',
        'Data peranti dan teknikal (IP, jenis pelayar)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Cara kami menggunakan data',
      paragraphs: ['Kami menggunakan data untuk:'],
      bullets: [
        'Menyediakan dan menambah baik perkhidmatan',
        'Berkomunikasi dengan pengguna',
        'Memastikan keselamatan',
        'Mematuhi kewajipan undang-undang',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Asas undang-undang (GDPR)',
      paragraphs: ['Di bawah GDPR, kami memproses data berdasarkan:'],
      bullets: ['Persetujuan', 'Keperluan kontrak', 'Kewajipan undang-undang', 'Kepentingan sah'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Perkongsian data',
      paragraphs: ['Kami mungkin berkongsi data dengan:'],
      bullets: [
        'Penyedia perkhidmatan',
        'Pihak berkuasa undang-undang apabila diperlukan',
        'Rakan kongsi di bawah perjanjian ketat',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Pemindahan antarabangsa',
      paragraphs: ['Data mungkin dipindahkan ke luar EU. Kami memastikan perlindungan seperti:'],
      bullets: ['Klausa Kontrak Standard (SCC)', 'Keputusan kecukupan'],
    },
    {
      anchorId: 'data-retention',
      title: 'Pengekalan data',
      paragraphs: ['Kami menyimpan data hanya selama yang diperlukan untuk:'],
      bullets: ['Penyediaan perkhidmatan', 'Pematuhan undang-undang', 'Tujuan perniagaan'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Hak anda (EU)',
      paragraphs: ['Di bawah GDPR, pengguna mempunyai hak untuk:'],
      bullets: [
        'Mengakses data',
        'Membetulkan data',
        'Memadam data',
        'Mengehadkan pemprosesan',
        'Kemudahalihan data',
        'Menarik balik persetujuan',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Hak anda (California)',
      paragraphs: ['Di bawah CCPA/CPRA:'],
      bullets: [
        'Hak untuk mengetahui',
        'Hak untuk memadam',
        'Hak untuk menolak jualan',
        'Hak untuk tidak didiskriminasi',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Kuki & Penjejakan',
      paragraphs: ['Kami menggunakan kuki untuk:'],
      bullets: ['Analitik', 'Prestasi', 'Pemperibadian'],
    },
    {
      anchorId: 'security',
      title: 'Langkah-langkah keselamatan',
      paragraphs: ['Kami melaksanakan:'],
      bullets: ['Penyulitan', 'Kawalan akses', 'Sistem pemantauan'],
    },
    {
      anchorId: 'children',
      title: 'Privasi kanak-kanak',
      paragraphs: [
        'Kami tidak dengan sengaja mengumpul data daripada kanak-kanak di bawah umur 13 tahun.',
      ],
    },
    {
      anchorId: 'updates',
      title: 'Kemas kini dasar',
      paragraphs: ['Kami mungkin mengemas kini dasar ini secara berkala.'],
    },
    {
      anchorId: 'contact',
      title: 'Maklumat hubungan',
      paragraphs: ['Untuk pertanyaan:'],
    },
  ],
}

const da: PrivacyPolicyCopy = {
  pageTitle: 'Privatlivspolitik',
  pageMetaDescription:
    'Hvordan IROPKE indsamler, bruger og beskytter dine personoplysninger i overensstemmelse med GDPR og CCPA.',
  tocLabel: 'Indholdsfortegnelse',
  lastUpdatedLabel: 'Sidst opdateret',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Send os en e-mail',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Indledning',
      paragraphs: [
        'Vi forpligter os til at beskytte dine personoplysninger og sikre gennemsigtighed i, hvordan vi indsamler, bruger og forvalter information.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Data vi indsamler',
      paragraphs: ['Vi kan indsamle:'],
      bullets: [
        'Identifikationsdata (navn, e-mail)',
        'Brugsdata (besøgte sider, interaktioner)',
        'Enheds- og tekniske data (IP, browsertype)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Sådan bruger vi data',
      paragraphs: ['Vi bruger data til at:'],
      bullets: [
        'Levere og forbedre tjenester',
        'Kommunikere med brugere',
        'Sikre sikkerhed',
        'Overholde retlige forpligtelser',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Retsgrundlag (GDPR)',
      paragraphs: ['I henhold til GDPR behandler vi data på grundlag af:'],
      bullets: ['Samtykke', 'Kontraktlig nødvendighed', 'Retlige forpligtelser', 'Legitime interesser'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Datadeling',
      paragraphs: ['Vi kan dele data med:'],
      bullets: [
        'Tjenesteudbydere',
        'Retlige myndigheder, når det er påkrævet',
        'Partnere under strenge aftaler',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Internationale overførsler',
      paragraphs: ['Data kan overføres uden for EU. Vi sikrer garantier såsom:'],
      bullets: ['Standardkontraktbestemmelser (SCC)', 'Tilstrækkelighedsafgørelser'],
    },
    {
      anchorId: 'data-retention',
      title: 'Opbevaring af data',
      paragraphs: ['Vi opbevarer kun data, så længe det er nødvendigt til:'],
      bullets: ['Levering af tjenester', 'Retlig overholdelse', 'Forretningsmæssige formål'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Dine rettigheder (EU)',
      paragraphs: ['I henhold til GDPR har brugere ret til at:'],
      bullets: [
        'Få adgang til data',
        'Få data rettet',
        'Få data slettet',
        'Begrænse behandling',
        'Dataportabilitet',
        'Trække samtykke tilbage',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Dine rettigheder (Californien)',
      paragraphs: ['I henhold til CCPA/CPRA:'],
      bullets: [
        'Ret til at vide',
        'Ret til sletning',
        'Ret til at fravælge salg',
        'Ret til ikke-diskrimination',
      ],
    },
    {
      anchorId: 'cookies',
      title: 'Cookies og sporing',
      paragraphs: ['Vi bruger cookies til:'],
      bullets: ['Analyse', 'Ydeevne', 'Personalisering'],
    },
    {
      anchorId: 'security',
      title: 'Sikkerhedsforanstaltninger',
      paragraphs: ['Vi implementerer:'],
      bullets: ['Kryptering', 'Adgangskontrol', 'Overvågningssystemer'],
    },
    {
      anchorId: 'children',
      title: 'Børns privatliv',
      paragraphs: ['Vi indsamler ikke bevidst data fra børn under 13 år.'],
    },
    {
      anchorId: 'updates',
      title: 'Opdateringer af politikken',
      paragraphs: ['Vi kan opdatere denne politik med jævne mellemrum.'],
    },
    {
      anchorId: 'contact',
      title: 'Kontaktoplysninger',
      paragraphs: ['Ved henvendelser:'],
    },
  ],
}

const tr: PrivacyPolicyCopy = {
  pageTitle: 'Gizlilik Politikası',
  pageMetaDescription:
    "IROPKE kişisel verilerinizi GDPR ve CCPA'ya uygun şekilde nasıl topladığını, kullandığını ve koruduğunu açıklar.",
  tocLabel: 'İçindekiler',
  lastUpdatedLabel: 'Son güncelleme',
  lastUpdated: LAST_UPDATED,
  contactEmail: CONTACT_EMAIL,
  contactEmailLabel: 'Bize e-posta gönderin',
  sections: [
    {
      anchorId: 'introduction',
      title: 'Giriş',
      paragraphs: [
        'Kişisel verilerinizi korumaya ve bilgileri nasıl topladığımız, kullandığımız ve yönettiğimiz konusunda şeffaflık sağlamaya kararlıyız.',
      ],
    },
    {
      anchorId: 'data-collection',
      title: 'Topladığımız Veriler',
      paragraphs: ['Şunları toplayabiliriz:'],
      bullets: [
        'Kişisel kimlik verileri (ad, e-posta)',
        'Kullanım verileri (ziyaret edilen sayfalar, etkileşimler)',
        'Cihaz ve teknik veriler (IP, tarayıcı türü)',
      ],
    },
    {
      anchorId: 'data-usage',
      title: 'Verileri Nasıl Kullanırız',
      paragraphs: ['Verileri şu amaçlarla kullanırız:'],
      bullets: [
        'Hizmetleri sağlamak ve iyileştirmek',
        'Kullanıcılarla iletişim kurmak',
        'Güvenliği sağlamak',
        'Yasal yükümlülüklere uymak',
      ],
    },
    {
      anchorId: 'legal-basis',
      title: 'Yasal Dayanak (GDPR)',
      paragraphs: ['GDPR kapsamında, verileri şu temellere dayanarak işleriz:'],
      bullets: ['Onay', 'Sözleşmesel zorunluluk', 'Yasal yükümlülükler', 'Meşru menfaatler'],
    },
    {
      anchorId: 'data-sharing',
      title: 'Veri Paylaşımı',
      paragraphs: ['Verileri şunlarla paylaşabiliriz:'],
      bullets: [
        'Hizmet sağlayıcılar',
        'Yasal olarak gerekli durumlarda yetkili merciler',
        'Sıkı sözleşmeler kapsamındaki ortaklar',
      ],
    },
    {
      anchorId: 'international-transfers',
      title: 'Uluslararası Aktarımlar',
      paragraphs: ['Veriler AB dışına aktarılabilir. Şu güvenceleri sağlarız:'],
      bullets: ['Standart Sözleşme Hükümleri (SCC)', 'Yeterlilik kararları'],
    },
    {
      anchorId: 'data-retention',
      title: 'Veri Saklama',
      paragraphs: ['Verileri yalnızca aşağıdakiler için gerekli olduğu sürece saklarız:'],
      bullets: ['Hizmet sunumu', 'Yasal uyumluluk', 'İş amaçları'],
    },
    {
      anchorId: 'eu-rights',
      title: 'Haklarınız (AB)',
      paragraphs: ['GDPR kapsamında kullanıcılar şu haklara sahiptir:'],
      bullets: [
        'Verilere erişmek',
        'Verileri düzeltmek',
        'Verileri silmek',
        'İşlemeyi kısıtlamak',
        'Veri taşınabilirliği',
        'Onayı geri çekmek',
      ],
    },
    {
      anchorId: 'ca-rights',
      title: 'Haklarınız (Kaliforniya)',
      paragraphs: ['CCPA/CPRA kapsamında:'],
      bullets: ['Bilme hakkı', 'Silme hakkı', 'Satışı reddetme hakkı', 'Ayrımcılığa uğramama hakkı'],
    },
    {
      anchorId: 'cookies',
      title: 'Çerezler ve Takip',
      paragraphs: ['Çerezleri şu amaçlarla kullanırız:'],
      bullets: ['Analitik', 'Performans', 'Kişiselleştirme'],
    },
    {
      anchorId: 'security',
      title: 'Güvenlik Önlemleri',
      paragraphs: ['Şunları uygularız:'],
      bullets: ['Şifreleme', 'Erişim kontrolü', 'İzleme sistemleri'],
    },
    {
      anchorId: 'children',
      title: 'Çocukların Gizliliği',
      paragraphs: ['13 yaşın altındaki çocuklardan bilerek veri toplamayız.'],
    },
    {
      anchorId: 'updates',
      title: 'Politika Güncellemeleri',
      paragraphs: ['Bu politikayı periyodik olarak güncelleyebiliriz.'],
    },
    {
      anchorId: 'contact',
      title: 'İletişim Bilgileri',
      paragraphs: ['Sorularınız için:'],
    },
  ],
}

const dictionaries: Record<Locale, PrivacyPolicyCopy> = {
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

export function getPrivacyPolicy(locale: Locale): PrivacyPolicyCopy {
  return dictionaries[locale] ?? en
}
