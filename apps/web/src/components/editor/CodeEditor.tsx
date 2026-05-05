'use client'

import { useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { Language } from '@algoarena/shared-types'

const MONACO_LANGUAGE_MAP: Record<Language, string> = {
  python3: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp17: 'cpp',
  go: 'go',
  rust: 'rust',
  csharp: 'csharp',
  kotlin: 'kotlin',
  ruby: 'ruby',
}

interface Props {
  language: Language
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ language, value, onChange, readOnly = false }: Props) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  return (
    <div className="monaco-container h-full">
      <MonacoEditor
        height="100%"
        language={MONACO_LANGUAGE_MAP[language]}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={(ed) => {
          editorRef.current = ed
        }}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          readOnly,
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  )
}
