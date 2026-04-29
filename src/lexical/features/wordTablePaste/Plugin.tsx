'use client'

/**
 * WordTablePastePlugin — Lexical paste handler
 *
 * 사용자가 Word/Excel/Google Docs 등에서 표를 복사해 본문에 붙여넣을 때,
 * 클립보드의 `text/html` 에서 `<table>` 을 감지하여
 * 자동으로 `editorialTable` 블록(TSV 데이터)으로 삽입한다.
 *
 * 동작:
 *   1) PASTE_COMMAND 를 HIGH 우선순위로 가로챔.
 *   2) clipboardData.getData('text/html') 안에 `<table>` 이 있으면 처리.
 *   3) 첫 번째(또는 다중) `<table>` 을 TSV(탭 구분 / 줄바꿈) 로 변환.
 *   4) `INSERT_BLOCK_COMMAND` 디스패치 → BlocksFeature 의
 *      editorialTable 블록 노드로 추가.
 *   5) `<table>` 이 없으면 false 반환 → 기본 paste 동작 그대로 진행.
 *
 * 다중 표 paste 도 지원 (각 `<table>` 별로 한 블록씩 삽입).
 */

import { useEffect } from 'react'
// Payload re-exports lexical / @lexical/react via proxy subpaths so consumers
// don't need to declare them as direct dependencies. See package.json exports
// in @payloadcms/richtext-lexical (./lexical, ./lexical/react/...).
import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from '@payloadcms/richtext-lexical/lexical'
import { INSERT_BLOCK_COMMAND } from '@payloadcms/richtext-lexical/client'

function htmlTableToTSV(table: HTMLTableElement): string {
  const lines: string[] = []
  const rows = Array.from(table.querySelectorAll('tr'))
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll<HTMLElement>('th, td'))
    if (!cells.length) continue
    const cellText = cells.map((c) =>
      (c.innerText || c.textContent || '')
        // Word 의 셀 내부 줄바꿈은 공백으로 단일화 (TSV 행 구분과 충돌 방지)
        .replace(/\r\n|\r|\n/g, ' ')
        // TSV 열 구분과 충돌 방지
        .replace(/\t/g, ' ')
        // Word 의 nbsp 제거
        .replace(/ /g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    lines.push(cellText.join('\t'))
  }
  return lines.join('\n')
}

export function WordTablePastePlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | DragEvent) => {
        const clipboardData =
          (event as ClipboardEvent).clipboardData ??
          (event as DragEvent).dataTransfer
        if (!clipboardData) return false

        const html = clipboardData.getData('text/html')
        if (!html || !/<table[\s>]/i.test(html)) return false

        let tables: HTMLTableElement[]
        try {
          const doc = new DOMParser().parseFromString(html, 'text/html')
          tables = Array.from(doc.querySelectorAll<HTMLTableElement>('table'))
        } catch {
          return false
        }
        if (!tables.length) return false

        const tsvList = tables
          .map(htmlTableToTSV)
          .filter((tsv) => tsv.trim().length > 0)
        if (!tsvList.length) return false

        // 표를 감지했으므로 기본 paste 동작 차단 후 블록 삽입.
        event.preventDefault()
        for (const tsv of tsvList) {
          editor.dispatchCommand(INSERT_BLOCK_COMMAND, {
            blockName: '',
            blockType: 'editorialTable',
            data: tsv,
            caption: '',
          })
        }
        return true
      },
      COMMAND_PRIORITY_HIGH,
    )
  }, [editor])

  return null
}
