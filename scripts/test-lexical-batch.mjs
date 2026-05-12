#!/usr/bin/env node
// Mock-translate verification for the paragraph-level batching walker.
// Run: pnpm exec tsx scripts/test-lexical-batch.mjs
// Exits 0 on success, 1 on first failure.

process.env.NODE_ENV = 'production'

const { translateLexicalRoot } = await import(
  '../src/lib/translation/lexicalWalker.ts'
)

let failures = 0

function assertEqual(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) {
    failures++
    console.error(`\n❌ ${name}`)
    console.error(`   expected: ${e}`)
    console.error(`   actual:   ${a}`)
  } else {
    console.log(`✅ ${name}`)
  }
}

// ──────────────────────────────────────────────────────────────────────
// Case 1: paragraph with text + inline code + text (the split-view bug)
// Word-order rearranged in Korean output, placeholders preserved.
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'The cleanest defense is to stop reading ', format: 0 },
            { type: 'text', text: 'window.innerWidth', format: 16 },
            { type: 'text', text: ' for layout decisions entirely.', format: 0 },
          ],
        },
      ],
    },
  }

  const mock = async (text) => {
    if (text === 'The cleanest defense is to stop reading ⟪1⟫ for layout decisions entirely.') {
      return {
        translated: '가장 깔끔한 해결방법은 레이아웃 결정에 ⟪1⟫ 를 읽지 않는 것입니다.',
        inputTokens: 50,
        outputTokens: 30,
      }
    }
    throw new Error(`unexpected: ${JSON.stringify(text)}`)
  }

  const { translated, usage } = await translateLexicalRoot(source, mock)
  const para = translated.root.children[0]
  assertEqual('case 1: text[0] pre-placeholder fragment',
    para.children[0].text,
    '가장 깔끔한 해결방법은 레이아웃 결정에 ')
  assertEqual('case 1: code[1] preserved',
    para.children[1].text,
    'window.innerWidth')
  assertEqual('case 1: code[1] format bit preserved',
    para.children[1].format,
    16)
  assertEqual('case 1: text[2] post-placeholder fragment',
    para.children[2].text,
    ' 를 읽지 않는 것입니다.')
  assertEqual('case 1: usage.nodes counts translatable only',
    usage.nodes,
    2)
}

// ──────────────────────────────────────────────────────────────────────
// Case 2: paragraph with single text node (direct translate)
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'Hello world.', format: 0 },
          ],
        },
      ],
    },
  }

  const mock = async (text) => {
    if (text === 'Hello world.') {
      return { translated: '안녕하세요.', inputTokens: 10, outputTokens: 5 }
    }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  assertEqual('case 2: single text node translated directly',
    translated.root.children[0].children[0].text,
    '안녕하세요.')
}

// ──────────────────────────────────────────────────────────────────────
// Case 3: 5-fragment "Avoid polling" — placeholders kept in tree order
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'Avoid polling ', format: 0 },
            { type: 'text', text: 'window.innerWidth', format: 16 },
            { type: 'text', text: ' inside ', format: 0 },
            { type: 'text', text: 'setInterval', format: 16 },
            { type: 'text', text: ' for the highest-value check.', format: 0 },
          ],
        },
      ],
    },
  }

  const mock = async (text) => {
    if (text === 'Avoid polling ⟪1⟫ inside ⟪3⟫ for the highest-value check.') {
      // Korean output preserves placeholders in tree order (⟪1⟫ then ⟪3⟫)
      return {
        translated: '⟪1⟫ 를 ⟪3⟫ 안에서 폴링하는 방식은 가장 가치 있는 검사를 위해 피해야 합니다.',
        inputTokens: 60,
        outputTokens: 40,
      }
    }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  const para = translated.root.children[0]

  // splitByPlaceholders on ⟪1⟫ then ⟪3⟫ → fragments = ['', ' 를 ', ' 안에서 폴링하는 방식은 가장 가치 있는 검사를 위해 피해야 합니다.']
  // Tree-order translatable items at indices 0, 2, 4 receive fragments 0, 1, 2.
  // fragments[0] = '' → walker keeps original (defensive empty-fragment guard).
  assertEqual('case 3: text[0] kept as original when fragment empty',
    para.children[0].text,
    'Avoid polling ')
  assertEqual('case 3: code[1] preserved',
    para.children[1].text,
    'window.innerWidth')
  assertEqual('case 3: text[2] receives middle fragment',
    para.children[2].text,
    ' 를 ')
  assertEqual('case 3: code[3] preserved',
    para.children[3].text,
    'setInterval')
  assertEqual('case 3: text[4] receives tail fragment',
    para.children[4].text,
    ' 안에서 폴링하는 방식은 가장 가치 있는 검사를 위해 피해야 합니다.')
}

// ──────────────────────────────────────────────────────────────────────
// Case 3b: placeholders LOST during translation → fallback to per-item
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'See ', format: 0 },
            { type: 'text', text: 'foo()', format: 16 },
            { type: 'text', text: ' for details.', format: 0 },
          ],
        },
      ],
    },
  }

  let batchCalled = false
  const mock = async (text) => {
    if (text === 'See ⟪1⟫ for details.') {
      batchCalled = true
      // Simulate model that DROPPED the placeholder
      return { translated: '자세히 보기.', inputTokens: 20, outputTokens: 10 }
    }
    // Fallback per-item calls:
    if (text === 'See ') return { translated: '참조: ', inputTokens: 5, outputTokens: 3 }
    if (text === ' for details.') return { translated: ' 자세히는.', inputTokens: 5, outputTokens: 3 }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  const para = translated.root.children[0]

  assertEqual('case 3b: batch was attempted', batchCalled, true)
  assertEqual('case 3b: fallback text[0] from per-item call',
    para.children[0].text,
    '참조: ')
  assertEqual('case 3b: code[1] still preserved',
    para.children[1].text,
    'foo()')
  assertEqual('case 3b: fallback text[2] from per-item call',
    para.children[2].text,
    ' 자세히는.')
}

// ──────────────────────────────────────────────────────────────────────
// Case 4: heading with simple text
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          tag: 'h2',
          children: [
            { type: 'text', text: 'What to ship this week', format: 0 },
          ],
        },
      ],
    },
  }

  const mock = async (text) => {
    if (text === 'What to ship this week') {
      return { translated: '이번 주에 시도해볼 체크리스트들', inputTokens: 15, outputTokens: 10 }
    }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  assertEqual('case 4: heading text translated',
    translated.root.children[0].children[0].text,
    '이번 주에 시도해볼 체크리스트들')
}

// ──────────────────────────────────────────────────────────────────────
// Case 5: listitem with text + nested list (deferred block recursion)
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'listitem',
              children: [
                { type: 'text', text: 'Outer item.', format: 0 },
                {
                  type: 'list',
                  children: [
                    {
                      type: 'listitem',
                      children: [
                        { type: 'text', text: 'Nested item.', format: 0 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  }

  const calls = []
  const mock = async (text) => {
    calls.push(text)
    if (text === 'Outer item.') return { translated: '바깥 항목.', inputTokens: 5, outputTokens: 3 }
    if (text === 'Nested item.') return { translated: '중첩 항목.', inputTokens: 5, outputTokens: 3 }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  const outer = translated.root.children[0].children[0]
  const inner = outer.children[1].children[0]
  assertEqual('case 5: outer listitem text',
    outer.children[0].text,
    '바깥 항목.')
  assertEqual('case 5: nested listitem text',
    inner.children[0].text,
    '중첩 항목.')
  assertEqual('case 5: two separate batch calls (outer + nested)',
    calls.length,
    2)
}

// ──────────────────────────────────────────────────────────────────────
// Case 6: paragraph with link wrapping text (adjacent-translatable guard)
// Per-item fallback fires because no preserve anchor between text spans.
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'Read ', format: 0 },
            {
              type: 'link',
              fields: { url: 'https://example.com' },
              children: [
                { type: 'text', text: 'our blog', format: 0 },
              ],
            },
            { type: 'text', text: ' for more.', format: 0 },
          ],
        },
      ],
    },
  }

  const calls = []
  const mock = async (text) => {
    calls.push(text)
    if (text === 'Read ') return { translated: '읽어보세요: ', inputTokens: 5, outputTokens: 3 }
    if (text === 'our blog') return { translated: '우리 블로그', inputTokens: 5, outputTokens: 3 }
    if (text === ' for more.') return { translated: ' 자세한 내용.', inputTokens: 5, outputTokens: 3 }
    throw new Error(`unexpected: ${text}`)
  }

  const { translated } = await translateLexicalRoot(source, mock)
  const para = translated.root.children[0]
  const linkInner = para.children[1].children[0]

  // Adjacent translatable items (text-link-text where link's child is text)
  // → all collapsed as translatable adjacency → per-item fallback.
  assertEqual('case 6: text[0] translated per-item',
    para.children[0].text,
    '읽어보세요: ')
  assertEqual('case 6: link inner text translated per-item',
    linkInner.text,
    '우리 블로그')
  assertEqual('case 6: text[2] translated per-item',
    para.children[2].text,
    ' 자세한 내용.')
  assertEqual('case 6: link wrapper preserved',
    para.children[1].type,
    'link')
  assertEqual('case 6: 3 per-item calls (no batch call)',
    calls.length,
    3)
}

// ──────────────────────────────────────────────────────────────────────
// Case 7: paragraph with ONLY inline code (no translatable) — skipped
// ──────────────────────────────────────────────────────────────────────
{
  const source = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'foo.bar()', format: 16 },
          ],
        },
      ],
    },
  }

  const mock = async (text) => {
    throw new Error(`unexpected call: ${text}`)
  }

  const { translated, usage } = await translateLexicalRoot(source, mock)
  assertEqual('case 7: code-only paragraph untouched',
    translated.root.children[0].children[0].text,
    'foo.bar()')
  assertEqual('case 7: no nodes counted',
    usage.nodes,
    0)
}

// ──────────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? '✅ all assertions passed' : `❌ ${failures} assertion(s) failed`}`)
process.exit(failures === 0 ? 0 : 1)
