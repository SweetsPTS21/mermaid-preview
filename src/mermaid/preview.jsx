import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Space, Spin, Tooltip } from 'antd'
import {
    DragOutlined,
    FullscreenExitOutlined,
    FullscreenOutlined,
    ReloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons'
import { Content } from 'antd/es/layout/layout'
import mermaid from 'mermaid'

// Cấu hình Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    suppressErrorRendering: true, // Ẩn thông báo lỗi
    suppressErrorLogging: true // Ẩn log lỗi
})

const MermaidPreview = ({ loading, diagramText }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef(null)
    const contentRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [rendering, setRendering] = useState(false)
    const [diagramSvg, setDiagramSvg] = useState('')
    const debounceTimerRef = useRef(null)

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

    useEffect(() => {
        const preventBrowserZoom = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault()
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener('wheel', preventBrowserZoom, {
                passive: false
            })
            return () => {
                container.removeEventListener('wheel', preventBrowserZoom)
            }
        }
    }, [])

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set timer mới - render sau 1 giây
        debounceTimerRef.current = setTimeout(() => {
            renderDiagram().then()
        }, 1000)

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [diagramText])

    const renderDiagram = async () => {
        if (!diagramText.trim()) {
            setDiagramSvg('')
            return
        }

        setRendering(true)
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)
        try {
            const { svg } = await mermaid.render(id, diagramText)
            setDiagramSvg(svg)
        } catch (error) {
            console.log(error.message)
        } finally {
            setRendering(false)
        }
    }

    // Zoom functions
    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.5, 5))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.5, 0.5))
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

    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.5 : 0.5
            setScale((prev) => Math.max(0.5, Math.min(5, prev + delta)))
        }
    }

    return (
        <Content
            style={{ padding: '20px', background: '#fafafa' }}
            ref={contentRef}
        >
            <Card
                title="Preview Diagram"
                style={{ height: '100%' }}
                styles={{
                    body: {
                        height: 'calc(100% - 57px)',
                        overflow: 'hidden',
                        position: 'relative'
                    }
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
                                disabled={scale >= 5}
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
                    {rendering || loading ? (
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
                                💡 Tip: Kéo để di chuyển, Ctrl + Scroll để zoom
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </Content>
    )
}

export default MermaidPreview
