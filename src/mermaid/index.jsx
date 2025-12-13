import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Input, Layout, message, Space, Spin, Tooltip, Upload } from 'antd'
import {
    DragOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    LinkOutlined,
    ReloadOutlined,
    SaveOutlined,
    UploadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons'
import mermaid from 'mermaid'
import { exampleDiagram } from './example'
import { createMermaidFile, getFileData, getMermaidFile } from '../api/mermaid'
import { formatFilename } from './utls'

const { Sider, Content } = Layout
const { TextArea } = Input

// Cấu hình Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose'
})

function Mermaid() {
    const [diagramText, setDiagramText] = useState(
        'graph TD\n  A[Start] --> B[Process]\n  B --> C[End]'
    )
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [diagramSvg, setDiagramSvg] = useState('')
    const [shareUrl, setShareUrl] = useState(null)
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef(null)
    const contentRef = useRef(null)

    // Kiểm tra URL params để tải file từ B2
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const fileName = urlParams.get('file')

        if (fileName) {
            loadFileData(fileName).then()
        }
    }, [])

    // Render diagram khi text thay đổi
    useEffect(() => {
        if (diagramText) {
            renderDiagram().then()
        }
    }, [diagramText])

    const renderDiagram = async () => {
        if (!diagramText.trim()) {
            setDiagramSvg('')
            return
        }

        try {
            setLoading(true)
            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)
            const { svg } = await mermaid.render(id, diagramText)
            setDiagramSvg(svg)
        } catch (error) {
            message.error('Lỗi render diagram: ' + error.message)
            setDiagramSvg('')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = (file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target.result
            setDiagramText(content)
            message.success('Đã tải file thành công!')
        }
        reader.onerror = () => {
            message.error('Lỗi đọc file!')
        }
        reader.readAsText(file)
        return false // Ngăn upload tự động
    }

    const uploadMermaidFile = async () => {
        if (!diagramText.trim()) {
            message.warning('Vui lòng nhập nội dung diagram!')
            return
        }

        try {
            setSaving(true)

            // Tạo file mmd từ text
            const blob = new Blob([diagramText], { type: 'text/plain' })
            const formData = new FormData()
            formData.append('file', blob, `diagram-${Date.now()}.mmd`)

            const {
                success,
                message: errorMsg,
                data
            } = await createMermaidFile(formData)

            if (!success) {
                message.error(`Lỗi khi lưu file ${errorMsg}`)
            }

            // Lưu vào localStorage để cache
            const fileName = formatFilename(data?.fileName)
            localStorage.setItem(fileName, diagramText)

            // Tạo URL với file ID
            const shareUrl = `${process.env.REACT_APP_MAIN_APP_URL}?file=${fileName}`

            // Copy URL vào clipboard
            await navigator.clipboard.writeText(shareUrl)

            message.success(
                'Đã lưu thành công! Link đã được copy vào clipboard.'
            )
            setShareUrl(shareUrl)

            // Hiển thị modal với link
            const linkText = `Link chia sẻ: ${shareUrl}`
            console.log(linkText)
        } catch (error) {
            message.error('Lỗi lưu file: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const loadFileData = async (fileName) => {
        try {
            setLoading(true)

            // load local file first
            const localData = loadLocalFile(fileName)
            if (localData) {
                setDiagramText(localData)
                return
            }

            // fetch file url from server
            const {
                success,
                message: errorMsg,
                data
            } = await getMermaidFile(fileName)
            if (!success) {
                message.error(`Lỗi khi tải file ${errorMsg}`)
            }

            // get file data
            const fileData = await getFileData(data?.fileDownloadUri)
            if (fileData) {
                setDiagramText(fileData)
            } else {
                message.error('Không tìm thấy file!')
            }
        } catch (error) {
            message.error('Lỗi tải file: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const loadLocalFile = (fileName) => {
        return window.localStorage.getItem(fileName)
    }

    const copyShareLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            message.success('Đã copy link!')
        } else {
            message.warning('Vui lòng lưu diagram trước!')
        }
    }

    // Zoom functions
    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.2, 3))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.2, 0.5))
    }

    const handleResetView = () => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }

    // Drag functions
    const handleMouseDown = (e) => {
        if (e.button === 0) {
            // Left click only
            setIsDragging(true)
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            })
        }
    }

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Fullscreen functions
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            contentRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            )
        }
    }, [])

    // Mouse wheel zoom
    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)))
        }
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                width={400}
                style={{
                    background: '#fff',
                    padding: '20px',
                    borderRight: '1px solid #f0f0f0'
                }}
            >
                <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size="large"
                >
                    <Card title="Upload File MMD" size="small">
                        <Upload
                            accept=".mmd,.md,.txt"
                            beforeUpload={handleFileUpload}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} block>
                                Chọn file .mmd
                            </Button>
                        </Upload>
                    </Card>

                    <Card title="Hoặc nhập Mermaid code" size="small">
                        <TextArea
                            value={diagramText}
                            onChange={(e) => setDiagramText(e.target.value)}
                            placeholder="Nhập Mermaid diagram code..."
                            rows={15}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '13px'
                            }}
                        />
                    </Card>

                    <Space style={{ width: '100%' }}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={uploadMermaidFile}
                            loading={saving}
                            block
                        >
                            Lưu & Tạo Link
                        </Button>
                        {shareUrl && (
                            <Button
                                icon={<LinkOutlined />}
                                onClick={copyShareLink}
                            >
                                Copy Link
                            </Button>
                        )}
                    </Space>

                    <Card size="small" title="Ví dụ Mermaid syntax:">
                        <pre
                            style={{
                                fontSize: '11px',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {exampleDiagram}
                        </pre>
                    </Card>
                </Space>
            </Sider>

            <Content
                style={{ padding: '20px', background: '#fafafa' }}
                ref={contentRef}
            >
                <Card
                    title="Preview Diagram"
                    style={{ height: '100%' }}
                    bodyStyle={{
                        height: 'calc(100% - 57px)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                    extra={
                        <Space>
                            <Tooltip title="Thu nhỏ (Ctrl + Scroll)">
                                <Button
                                    icon={<ZoomOutOutlined />}
                                    onClick={handleZoomOut}
                                    disabled={scale <= 0.5}
                                    size="small"
                                />
                            </Tooltip>
                            <span
                                style={{
                                    minWidth: '60px',
                                    textAlign: 'center',
                                    display: 'inline-block'
                                }}
                            >
                                {Math.round(scale * 100)}%
                            </span>
                            <Tooltip title="Phóng to (Ctrl + Scroll)">
                                <Button
                                    icon={<ZoomInOutlined />}
                                    onClick={handleZoomIn}
                                    disabled={scale >= 3}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Reset view">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetView}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip
                                title={
                                    isFullscreen
                                        ? 'Thoát toàn màn hình (F11)'
                                        : 'Toàn màn hình (F11)'
                                }
                            >
                                <Button
                                    icon={
                                        isFullscreen ? (
                                            <FullscreenExitOutlined />
                                        ) : (
                                            <FullscreenOutlined />
                                        )
                                    }
                                    onClick={toggleFullscreen}
                                    size="small"
                                />
                            </Tooltip>
                        </Space>
                    }
                >
                    <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            background:
                                'linear-gradient(90deg, #f0f0f0 1px, transparent 1px), linear-gradient(#f0f0f0 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    >
                        {loading ? (
                            <Spin size="large" tip="Đang render diagram..." />
                        ) : diagramSvg ? (
                            <div
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    transformOrigin: 'center center',
                                    transition: isDragging
                                        ? 'none'
                                        : 'transform 0.1s ease-out',
                                    maxWidth: '100%',
                                    userSelect: 'none'
                                }}
                                dangerouslySetInnerHTML={{ __html: diagramSvg }}
                            />
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: '#999',
                                    cursor: 'default'
                                }}
                            >
                                <DragOutlined
                                    style={{
                                        fontSize: '48px',
                                        marginBottom: '16px',
                                        display: 'block'
                                    }}
                                />
                                <p>
                                    Upload file hoặc nhập Mermaid code để xem
                                    preview
                                </p>
                                <p
                                    style={{
                                        fontSize: '12px',
                                        marginTop: '8px'
                                    }}
                                >
                                    💡 Tip: Kéo để di chuyển, Ctrl + Scroll để
                                    zoom
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </Content>
        </Layout>
    )
}

export default Mermaid
