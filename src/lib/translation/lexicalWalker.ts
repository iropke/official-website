/**
 * Lexical 콘텐츠 텍스트 노드 walker
 *
 * Payload Posts.content 는 Lexical JSON (`{ root: { children: [...] } }`)
 * 구조이며, 본문 번역을 위해 모든 `type === 'text'` 노드의 `text` 필드만
 * 추출해 번역기에 전달하고 결과를 같은 위치에 다시 채워 넣어야 합니다.
 *
 * 본 walker 는 입력을 mutate 하지 않고 deep-clone 후 변환합니다.
 *
 * 한계 / 후속 작업:
 *   - 현재 구현은 텍스트 노드를 1건씩 번역기에 전달합니다 (장문 글에서는
 *     호출 횟수가 많아짐). 차후 단계에서 배치 prompt 로 묶거나, 동일 문장
 *     중복 제거(memoization) 를 도입할 수 있습니다.
 *   - 인라인 마크업(format 비트, style) 은 노드 단위로 보존됩니다 — 텍스트만
 *     교체하므로 구조는 그대로입니다.
 *   - editorialMedia / editorialTable / qnaList / videoEmbed / rawHtml 같은
 *     커스텀 블록 내부의 텍스트 필드(caption / cells / question 등) 는
 *     일반 'text' 노드가 아니라 블록 fields 에 저장되어 본 walker 가 닿지
 *     않습니다. Phase B 직전에 블록별 hook 으로 보강 예정.
 */

export interface LexicalRoot {
  root: LexicalNode
  [k: string]: unknown
}

export interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  fields?: { [k: string]: unknown }
  [k: string]: unknown
}

export type TranslateText = (input: string) => Promise<{
  translated: string
  inputTokens: number
  outputTokens: number
}>

export interface WalkerUsage {
  inputTokens: number
  outputTokens: number
  /** 번역 시도된 텍스트 노드 수 */
  nodes: number
}

/**
 * Lexical JSON 을 deep-clone 한 뒤 모든 text 노드를 비동기로 번역하여
 * 새 트리를 반환합니다. 빈 문자열 노드는 건너뜁니다.
 */
export async function translateLexicalRoot(
  source: LexicalRoot,
  translate: TranslateText,
): Promise<{ translated: LexicalRoot; usage: WalkerUsage }> {
  // structuredClone 은 Node 18+ 기본 제공. JSON round-trip 보다 안전하지만
  // 여기서는 단순 JSON 데이터이므로 둘 다 안전.
  const cloned = structuredClone(source) as LexicalRoot
  const usage: WalkerUsage = { inputTokens: 0, outputTokens: 0, nodes: 0 }

  if (cloned.root) {
    await walkNode(cloned.root, translate, usage)
  }
  return { translated: cloned, usage }
}

async function walkNode(
  node: LexicalNode,
  translate: TranslateText,
  usage: WalkerUsage,
): Promise<void> {
  if (node.type === 'text' && typeof node.text === 'string') {
    const raw = node.text
    if (raw.trim().length > 0) {
      const result = await translate(raw)
      node.text = result.translated
      usage.inputTokens += result.inputTokens
      usage.outputTokens += result.outputTokens
      usage.nodes += 1
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await walkNode(child, translate, usage)
    }
  }
}
