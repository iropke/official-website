'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { WordTablePastePlugin } from './Plugin'

/**
 * Word/Excel 표 → editorialTable 블록 자동 변환 client feature.
 * 별도 노드/툴바/슬래시 메뉴 없이, paste 시점에만 동작하는 plugin 한 개를 등록.
 */
export const WordTablePasteFeatureClient = createClientFeature({
  plugins: [
    {
      Component: WordTablePastePlugin,
      position: 'normal',
    },
  ],
})
