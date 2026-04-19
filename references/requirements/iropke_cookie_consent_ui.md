# iropke_cookie_consent_ui.md

# Cookie Consent UI Definition (GDPR / CCPA Aligned)

---

## 1. Purpose

The cookie consent UI ensures:
- Legal compliance (GDPR, ePrivacy, CCPA/CPRA)
- Transparent data usage communication
- User control over tracking and preferences

---

## 2. UI Types

### 2.1 Initial Consent Banner
- Appears on first visit
- Positioned bottom or center overlay

### 2.2 Preference Modal
- Opens when user clicks “Manage Preferences”
- Allows granular control

---

## 3. Layout Structure

```plaintext
[Banner]
- Message
- Accept All
- Reject All
- Manage Preferences

[Modal]
- Category Toggles
- Description
- Save Preferences
```

---

## 4. Banner Components

### Message
We use cookies to improve your experience, analyze traffic, and personalize content.

### Buttons
- Accept All (Primary)
- Reject All
- Manage Preferences

### Behavior
- Blocks non-essential cookies before consent
- Stores user choice

---

## 5. Preference Modal Components

### Categories

#### 1. Necessary (Always On)
- Required for site functionality
- Cannot be disabled

#### 2. Analytics
- Tracks usage and performance

#### 3. Marketing
- Ad personalization and tracking

#### 4. Functional
- Enhances usability (preferences, etc.)

---

### Each Category Includes:
- Toggle switch
- Short description

---

### Actions
- Save Preferences
- Accept All
- Reject All

---

## 6. Behavior & Logic

- Default: only necessary cookies active
- Consent stored (localStorage or cookie)
- Re-openable via footer link (“Cookie Settings”)
- Expiration: 6–12 months

---

## 7. UX Guidelines

- Clear language (no legal jargon)
- Equal visibility for Accept / Reject
- No dark patterns
- Accessible (keyboard + screen reader)

---

## 8. Mobile Behavior

- Bottom sheet or full modal
- Large touch targets
- Sticky CTA buttons

---

## 9. Compliance Notes

### GDPR
- Prior consent required
- Granular choice mandatory

### CCPA/CPRA
- “Do Not Sell or Share” option required (if applicable)

---

## 10. Required UI Components

- Banner container
- Button group
- Modal overlay
- Toggle switches
- Save state logic
- Reopen link (footer)

---

## Final Definition

A transparent, user-controlled cookie consent system that enables compliance while preserving user trust.
