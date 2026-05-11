'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './ProjectInquiry.module.css';

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */
interface FieldConfig {
  name: string;
  required: boolean;
}

type FieldState = '' | 'valid' | 'invalid';

interface FormData {
  companyName: string;
  contactName: string;
  jobTitle: string;
  phone: string;
  email: string;
  projectOverview: string;
  website: string;
  launchDate: string;
  rfpFile: File | null;
}

/* reCAPTCHA v3 — global runtime injected by Google's api.js */
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

/* ═══════════════════════════════════════════════════════════════
   Validators
   ═══════════════════════════════════════════════════════════════ */
const validators: Record<string, (value: string) => boolean> = {
  companyName: (v) => v.trim().length > 0,
  contactName: (v) => v.trim().length > 0,
  jobTitle: (v) => v.trim().length === 0 || v.trim().length >= 2,
  phone: (v) => {
    const trimmed = v.trim();
    const digitsOnly = trimmed.replace(/\D/g, '');
    const allowed = /^[+\d\s().-]+$/;
    return trimmed.length > 0 && allowed.test(trimmed) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
  },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  projectOverview: (v) => v.trim().length > 0,
  website: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return false;
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const url = new URL(normalized);
      return !!url.hostname && url.hostname.includes('.');
    } catch {
      return false;
    }
  },
  launchDate: (v) => {
    const trimmed = v.trim();
    if (!trimmed) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  },
  rfpFile: () => true,
};

const fieldConfigs: FieldConfig[] = [
  { name: 'companyName', required: true },
  { name: 'contactName', required: true },
  { name: 'jobTitle', required: false },
  { name: 'phone', required: true },
  { name: 'email', required: true },
  { name: 'projectOverview', required: true },
  { name: 'rfpFile', required: false },
  { name: 'website', required: true },
  { name: 'launchDate', required: false },
];

/* ═══════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════ */
export default function ProjectInquiryClient() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? 'en';

  /* ── Form state ── */
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    jobTitle: '',
    phone: '',
    email: '',
    projectOverview: '',
    website: '',
    launchDate: '',
    rfpFile: null,
  });

  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Validate a single field ── */
  const validateField = useCallback(
    (name: string, forceSubmit = false): boolean => {
      if (name === 'rfpFile') return true; // File field — skip string validation
      const value = (formData as unknown as Record<string, string>)[name] ?? '';
      const isEmpty = value.trim() === '';
      const isValid = validators[name] ? validators[name](value) : true;

      if (!forceSubmit && isEmpty && !touched[name]) {
        setFieldStates((prev) => ({ ...prev, [name]: '' }));
        return isValid;
      }

      setFieldStates((prev) => ({
        ...prev,
        [name]: isValid ? 'valid' : 'invalid',
      }));

      return isValid;
    },
    [formData, touched],
  );

  /* ── Change handler ── */
  const handleChange = useCallback(
    (name: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    [],
  );

  /* Revalidate touched fields whenever formData changes */
  useEffect(() => {
    Object.keys(touched).forEach((name) => {
      if (touched[name]) validateField(name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  /* ── Load reCAPTCHA v3 script once on mount ── */
  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('[ProjectInquiry] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured');
      return;
    }
    if (typeof window === 'undefined') return;

    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setRecaptchaReady(true));
      return;
    }

    const scriptId = 'recaptcha-v3-script';
    if (document.getElementById(scriptId)) {
      const tryReady = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => setRecaptchaReady(true));
        } else {
          setTimeout(tryReady, 100);
        }
      };
      tryReady();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => setRecaptchaReady(true));
    };
    document.head.appendChild(script);
  }, []);

  /* ── Acquire a reCAPTCHA token for this submission ── */
  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return null;
    try {
      return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'inquiry' });
    } catch (err) {
      console.error('[ProjectInquiry] grecaptcha.execute failed', err);
      return null;
    }
  }, []);

  /* ── Blur handler ── */
  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name);
    },
    [validateField],
  );

  /* ── File handlers ── */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, rfpFile: file }));
    setUploadFileName(file ? `Selected file: ${file.name}` : '');
    if (file) {
      setFieldStates((prev) => ({ ...prev, rfpFile: 'valid' }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = '#5EB6B2';
    (e.currentTarget as HTMLElement).style.background = '#f3fbfa';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = '';
    (e.currentTarget as HTMLElement).style.background = '';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderColor = '';
    (e.currentTarget as HTMLElement).style.background = '';
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      setFormData((prev) => ({ ...prev, rfpFile: file }));
      setUploadFileName(`Selected file: ${file.name}`);
      setFieldStates((prev) => ({ ...prev, rfpFile: 'valid' }));
    }
  }, []);

  /* ── Submit ── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;

      let allValid = true;
      const newTouched: Record<string, boolean> = {};
      fieldConfigs.forEach(({ name }) => {
        newTouched[name] = true;
      });
      setTouched(newTouched);

      fieldConfigs.forEach(({ name }) => {
        const valid = validateField(name, true);
        if (!valid) allValid = false;
      });

      if (!allValid) {
        /* Focus first invalid field */
        const firstInvalid = fieldConfigs.find(({ name }) => {
          if (name === 'rfpFile') return false; // File field is always valid
          const value = (formData as unknown as Record<string, string>)[name] ?? '';
          return !(validators[name] ? validators[name](value) : true);
        });
        if (firstInvalid) {
          const el = formRef.current?.querySelector(`[name="${firstInvalid.name}"]`) as HTMLElement;
          el?.focus();
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      /* Submit to Payload via /api/inquiries */
      setSubmitError(null);
      setSubmitting(true);
      try {
        /* Acquire reCAPTCHA token (v3 — invisible) */
        const recaptchaToken = await getRecaptchaToken();
        if (!recaptchaToken) {
          setSubmitError(
            'Spam protection failed to initialize. Please reload the page and try again.',
          );
          setSubmitting(false);
          return;
        }

        const fd = new globalThis.FormData();
        fd.append('companyName', formData.companyName);
        fd.append('contactName', formData.contactName);
        fd.append('jobTitle', formData.jobTitle);
        fd.append('phone', formData.phone);
        fd.append('email', formData.email);
        fd.append('projectOverview', formData.projectOverview);
        fd.append('website', formData.website);
        fd.append('launchDate', formData.launchDate);
        fd.append('recaptchaToken', recaptchaToken);
        fd.append('submittedLocale', locale);
        if (formData.rfpFile) fd.append('rfpFile', formData.rfpFile);

        const res = await fetch('/api/inquiries', {
          method: 'POST',
          body: fd,
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string; errors?: Array<{ field: string; message: string }> }
            | null;
          const msg =
            data?.errors?.map((e) => `${e.field}: ${e.message}`).join(' · ') ||
            data?.error ||
            `Submission failed (${res.status}).`;
          setSubmitError(msg);
          return;
        }

        /* Success — show modal and reset form */
        lastFocusedRef.current = document.activeElement as HTMLElement;
        setShowModal(true);
        document.body.style.overflow = 'hidden';

        setFormData({
          companyName: '',
          contactName: '',
          jobTitle: '',
          phone: '',
          email: '',
          projectOverview: '',
          website: '',
          launchDate: '',
          rfpFile: null,
        });
        setUploadFileName('');
        setFieldStates({});
        setTouched({});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [formData, locale, submitting, validateField, getRecaptchaToken],
  );

  /* ── Modal close ── */
  const closeModal = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = '';
    lastFocusedRef.current?.focus();
  }, []);

  /* Focus modal close button on open */
  useEffect(() => {
    if (showModal) modalCloseRef.current?.focus();
  }, [showModal]);

  /* Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showModal, closeModal]);

  /* ── Helper: get field class ── */
  const fieldClass = (name: string, extras = '') => {
    const state = fieldStates[name];
    return [
      styles.field,
      extras,
      state === 'valid' ? styles.fieldValid : '',
      state === 'invalid' ? styles.fieldInvalid : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <>
      <main className={styles.section}>
        <div className={styles.grid}>
          <div className={styles.main}>
            {/* ── Form Card ── */}
            <section className={styles.formCard} aria-labelledby="project-inquiry-title">
              <span className={styles.eyebrow}>Start a conversation</span>
              <h1 className={styles.formTitle} id="project-inquiry-title">
                Project Inquiry
              </h1>
              <p className={styles.formIntro}>
                Share the outline of your project and your current website context. We will review the
                inquiry and get back to you with the next step.
              </p>

              <form ref={formRef} className={styles.fields} noValidate onSubmit={handleSubmit}>
                {/* Company Name */}
                <div className={fieldClass('companyName')}>
                  <label className={styles.fieldLabel} htmlFor="companyName">
                    <span>Company Name</span>
                    <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                  </label>
                  <div className={styles.fieldControl}>
                    <input
                      className={styles.fieldInput}
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="e.g. Iropke"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      onBlur={() => handleBlur('companyName')}
                    />
                  </div>
                  <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                  <p className={styles.fieldError}>Required field is missing.</p>
                </div>

                {/* Name + Job Title (half row) */}
                <div className={styles.fieldHalf}>
                  <div className={fieldClass('contactName', styles.fieldGroup)}>
                    <label className={styles.fieldLabel} htmlFor="contactName">
                      <span>Name</span>
                      <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                    </label>
                    <div className={styles.fieldControl}>
                      <input
                        className={styles.fieldInput}
                        id="contactName"
                        name="contactName"
                        type="text"
                        placeholder="e.g. Clark Kent"
                        required
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        onBlur={() => handleBlur('contactName')}
                      />
                    </div>
                    <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                    <p className={styles.fieldError}>Required field is missing.</p>
                  </div>

                  <div className={fieldClass('jobTitle', styles.fieldGroup)}>
                    <label className={styles.fieldLabel} htmlFor="jobTitle">
                      <span>Job Title</span>
                      <span className={styles.fieldMeta}>Optional</span>
                    </label>
                    <div className={styles.fieldControl}>
                      <input
                        className={styles.fieldInput}
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        placeholder="e.g. CEO / Marketing Lead"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                        onBlur={() => handleBlur('jobTitle')}
                      />
                    </div>
                    <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                    <p className={styles.fieldError}>Please enter a valid value.</p>
                  </div>
                </div>

                {/* Phone + Email (half row) */}
                <div className={styles.fieldHalf}>
                  <div className={fieldClass('phone', styles.fieldGroup)}>
                    <label className={styles.fieldLabel} htmlFor="phone">
                      <span>Contact Number</span>
                      <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                    </label>
                    <div className={styles.fieldControl}>
                      <input
                        className={styles.fieldInput}
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="e.g. +82 10 1234 5678"
                        required
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                      />
                    </div>
                    <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                    <p className={styles.fieldError}>Please enter a valid phone number.</p>
                  </div>

                  <div className={fieldClass('email', styles.fieldGroup)}>
                    <label className={styles.fieldLabel} htmlFor="email">
                      <span>Email Address</span>
                      <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                    </label>
                    <div className={styles.fieldControl}>
                      <input
                        className={styles.fieldInput}
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        placeholder="e.g. hello@company.com"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                      />
                    </div>
                    <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                    <p className={styles.fieldError}>Please enter a valid email address.</p>
                  </div>
                </div>

                {/* Project Overview */}
                <div className={fieldClass('projectOverview')}>
                  <label className={styles.fieldLabel} htmlFor="projectOverview">
                    <span>Project Overview</span>
                    <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                  </label>
                  <div className={styles.fieldControl}>
                    <textarea
                      className={styles.fieldTextarea}
                      id="projectOverview"
                      name="projectOverview"
                      placeholder="e.g. We are planning a global website renewal and need strategy, UX, design, development, and multilingual rollout support."
                      required
                      value={formData.projectOverview}
                      onChange={(e) => handleChange('projectOverview', e.target.value)}
                      onBlur={() => handleBlur('projectOverview')}
                    />
                  </div>
                  <span className={`${styles.fieldStatus} ${styles.fieldTextareaStatus}`} aria-hidden="true">&#10003;</span>
                  <p className={styles.fieldError}>Required field is missing.</p>
                </div>

                {/* RFP File Upload */}
                <div className={fieldClass('rfpFile')}>
                  <div className={`${uploadFileName ? styles.uploadHasFile : ''}`}>
                    <div className={styles.fieldLabel}>
                      <span>RFP File Upload</span>
                      <span className={styles.fieldMeta}>Optional</span>
                    </div>
                    <div className={styles.fieldControl}>
                      <div
                        className={styles.uploadDropzone}
                        tabIndex={0}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <p className={styles.uploadTitle}>
                          Drag and drop your file here, or click the <strong>Choose File</strong> button.
                        </p>
                        <p className={styles.uploadAccepted}>
                          Accepted file types: PowerPoint, Word, PDF, ZIP (up to 20MB)
                        </p>
                        <label className={styles.uploadButton} htmlFor="rfpFile">
                          Choose File
                        </label>
                        <input
                          ref={fileInputRef}
                          className={styles.uploadInput}
                          id="rfpFile"
                          name="rfpFile"
                          type="file"
                          accept=".ppt,.pptx,.doc,.docx,.pdf,.zip"
                          onChange={handleFileChange}
                        />
                        {uploadFileName && <p className={styles.uploadFilename}>{uploadFileName}</p>}
                      </div>
                    </div>
                  </div>
                  <span className={`${styles.fieldStatus} ${styles.fieldUploadStatus}`} aria-hidden="true">&#10003;</span>
                </div>

                {/* Website URL */}
                <div className={fieldClass('website')}>
                  <label className={styles.fieldLabel} htmlFor="website">
                    <span>Current Website URL</span>
                    <span className={`${styles.fieldMeta} ${styles.fieldMetaRequired}`}>Required</span>
                  </label>
                  <div className={styles.fieldControl}>
                    <input
                      className={styles.fieldInput}
                      id="website"
                      name="website"
                      type="url"
                      inputMode="url"
                      placeholder="e.g. https://www.company.com"
                      required
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      onBlur={() => handleBlur('website')}
                    />
                  </div>
                  <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                  <p className={styles.fieldError}>Please enter a valid website URL.</p>
                </div>

                {/* Launch Date */}
                <div className={fieldClass('launchDate')}>
                  <label className={styles.fieldLabel} htmlFor="launchDate">
                    <span>Desired Launch Date</span>
                    <span className={styles.fieldMeta}>Optional</span>
                  </label>
                  <div className={styles.fieldControl}>
                    <input
                      className={styles.fieldDate}
                      id="launchDate"
                      name="launchDate"
                      type="text"
                      placeholder="e.g. 2026-12-31"
                      value={formData.launchDate}
                      onChange={(e) => handleChange('launchDate', e.target.value)}
                      onBlur={() => handleBlur('launchDate')}
                    />
                  </div>
                  <span className={styles.fieldStatus} aria-hidden="true">&#10003;</span>
                  <p className={styles.fieldError}>Please enter a valid date.</p>
                </div>

                {/* Submit */}
                <div className={styles.actions}>
                  {submitError && (
                    <p className={styles.submitError} role="alert">
                      {submitError}
                    </p>
                  )}
                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={submitting || !recaptchaReady}
                    aria-busy={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit Project Inquiry'}
                  </button>
                  <p className={styles.recaptchaNotice}>
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>
                </div>
              </form>
            </section>

            {/* ── Process Aside ── */}
            <aside className={styles.processCard} aria-labelledby="project-process-title">
              <span className={styles.eyebrow}>Inquiry process</span>
              <h2 className={styles.processTitle} id="project-process-title">
                What happens next
              </h2>
              <p className={styles.processDesc}>
                A quick note before you submit. This panel is here so the process feels less like a
                black box and more like a well-lit hallway.
              </p>

              <div className={styles.processList}>
                <div className={styles.processItem}>
                  <span className={styles.processItemNum}>1</span>
                  <p className={styles.processItemText}>
                    Please complete all required fields so we can review your inquiry properly.
                  </p>
                </div>
                <div className={styles.processItem}>
                  <span className={styles.processItemNum}>2</span>
                  <p className={styles.processItemText}>
                    Once your inquiry is submitted, you can expect a reply within 3 hours on business
                    days, excluding public holidays.
                  </p>
                </div>
                <div className={styles.processItem}>
                  <span className={styles.processItemNum}>3</span>
                  <p className={styles.processItemText}>
                    Prefer email right away? Send your project brief directly to{' '}
                    <strong>hello@iropke.com</strong>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════
         Success Modal
         ═══════════════════════════════════════════════════════════ */}
      <div
        className={`${styles.successModal} ${showModal ? styles.successModalOpen : ''}`}
        aria-hidden={!showModal}
        role="dialog"
        aria-labelledby="successModalTitle"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className={styles.successModalDialog}>
          <div className={styles.successModalIcon} aria-hidden="true">
            &#10003;
          </div>
          <h2 className={styles.successModalTitle} id="successModalTitle">
            Inquiry submitted successfully
          </h2>
          <p className={styles.successModalText}>
            Thank you for reaching out. Your project inquiry has been received, and our team will
            review it shortly.
          </p>
          <button
            ref={modalCloseRef}
            className={styles.successModalButton}
            type="button"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
