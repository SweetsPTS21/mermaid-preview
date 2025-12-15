import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Input, Layout, message } from 'antd'
import { parse } from 'marked'
import { markdownInit } from './example'
import './style/markdown.css'
import { decodeHtml, loadFileData, saveAndUpload } from '../utils/utils'
import MarkdownPreview from './preview'
import MarkdownTool from './tools'
import { createMarkdownFile, getMarkdownFile } from '../api/utils'
import { FILE_TYPE } from '../utils/constants'

const { Sider } = Layout
const { TextArea } = Input

const MarkdownEditor = () => {
    const [markdownText, setMarkdownText] = useState(markdownInit)
    const [htmlContent, setHtmlContent] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rendering, setRendering] = useState(false)
    const [shareUrl, setShareUrl] = useState(null)
    const debounceTimerRef = useRef(null)

    // Kiểm tra URL params
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const fileName = urlParams.get('file')
        loadFileData(
            fileName,
            FILE_TYPE.MARKDOWN,
            setMarkdownText,
            setLoading,
            getMarkdownFile
        ).then()
    }, [])

    // Render markdown với debounce
    useEffect(() => {
        setIsTyping(true)
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(async () => {
            await renderMarkdown()
            setIsTyping(false)
        }, 500)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [markdownText])

    const renderMarkdown = async () => {
        try {
            setRendering(true)
            // Parse markdown
            let html = parse(markdownText)

            // Tìm và render Mermaid diagrams
            const mermaidRegex =
                /<code class="language-mermaid">([\s\S]*?)<\/code>/g
            const matches = [...html.matchAll(mermaidRegex)]

            for (let i = 0; i < matches.length; i++) {
                // Decode HTML entities in the Mermaid code
                const mermaidCode = decodeHtml(matches[i][1])
                try {
                    const id = `mermaid-${i}-${Date.now()}`
                    const { svg } = await mermaid.render(id, mermaidCode)
                    html = html.replace(
                        matches[i][0],
                        `<div class="mermaid-diagram">${svg}</div>`
                    )
                } catch (error) {
                    console.error('Mermaid render error:', error)
                    html = html.replace(
                        matches[i][0],
                        `<div class="mermaid-error">❌ Lỗi render Mermaid: ${error.message}</div>`
                    )
                }
            }

            setHtmlContent(html)
        } catch (error) {
            message.error('Lỗi render markdown: ' + error.message)
        } finally {
            setRendering(false)
        }
    }

    const handleSave = async () => {
        await saveAndUpload(
            markdownText,
            'md',
            setSaving,
            setShareUrl,
            createMarkdownFile
        )
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Panel bên trái - Editor */}
            <Sider
                width="50%"
                style={{
                    background: '#fff',
                    borderRight: '1px solid #f0f0f0',
                    maxWidth: '50%',
                    minWidth: '50%',
                    flex: '0 0 50%'
                }}
            >
                <div
                    style={{
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Toolbar */}
                    <MarkdownTool
                        markdownText={markdownText}
                        setMarkdownText={setMarkdownText}
                        handleSave={handleSave}
                        saving={saving}
                        shareUrl={shareUrl}
                    />

                    {/* Editor */}
                    <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                        <TextArea
                            value={markdownText}
                            onChange={(e) => setMarkdownText(e.target.value)}
                            placeholder="Nhập Markdown code..."
                            style={{
                                width: '100%',
                                height: '100%',
                                fontFamily:
                                    'Monaco, Consolas, "Courier New", monospace',
                                fontSize: '14px',
                                resize: 'none',
                                border: 'none'
                            }}
                        />
                        {isTyping && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    color: '#1890ff'
                                }}
                            >
                                ⏳ Đang chờ bạn nhập xong...
                            </div>
                        )}
                    </div>
                </div>
            </Sider>

            <MarkdownPreview
                loading={loading}
                rendering={rendering}
                htmlContent={htmlContent}
            />
        </Layout>
    )
}

export default MarkdownEditor
