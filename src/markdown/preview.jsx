import React, { useEffect, useRef, useState } from 'react'
import { Content } from 'antd/es/layout/layout'
import { Button, Space, Spin, Tooltip } from 'antd'
import {
    FullscreenExitOutlined,
    FullscreenOutlined,
    LoadingOutlined,
    ReloadOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from '@ant-design/icons'
import { handleFullScreen, preventDefaultZoom } from '../utils/utils'

const MarkdownPreview = ({
    loading = false,
    rendering = false,
    htmlContent = '',
    minScale = 0.5,
    maxScale = 2
}) => {
    const [scale, setScale] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const previewRef = useRef(null)
    const containerRef = useRef(null)

    useEffect(() => {
        preventDefaultZoom(containerRef)
    }, [])

    useEffect(() => {
        handleFullScreen(setIsFullscreen)
    }, [])

    const handleZoomIn = () =>
        setScale((prev) => Math.min(prev + 0.1, maxScale))
    const handleZoomOut = () =>
        setScale((prev) => Math.max(prev - 0.1, minScale))
    const handleResetZoom = () => setScale(1)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            previewRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const handleWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setScale((prev) =>
                Math.max(minScale, Math.min(maxScale, prev + delta))
            )
        }
    }

    return (
        <Content style={{ background: '#fff' }} ref={previewRef}>
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Toolbar */}
                <div
                    style={{
                        padding: '16px',
                        borderBottom: '1px solid #f0f0f0',
                        background: '#fafafa'
                    }}
                >
                    <Space>
                        <Tooltip title="Thu nhỏ">
                            <Button
                                icon={<ZoomOutOutlined />}
                                onClick={handleZoomOut}
                                disabled={scale <= minScale}
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
                        <Tooltip title="Phóng to">
                            <Button
                                icon={<ZoomInOutlined />}
                                onClick={handleZoomIn}
                                disabled={scale >= maxScale}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip title="Reset">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetZoom}
                                size="small"
                            />
                        </Tooltip>
                        <Tooltip
                            title={
                                isFullscreen
                                    ? 'Thoát toàn màn hình'
                                    : 'Toàn màn hình'
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
                </div>

                {/* Preview */}

                <div
                    style={{
                        flex: 1,
                        padding: '32px',
                        overflow: 'auto',
                        background: '#fff'
                    }}
                >
                    <Spin
                        indicator={<LoadingOutlined />}
                        spinning={loading || rendering}
                        tip="Đang render..."
                        style={{ height: '100%' }}
                    >
                        <div
                            ref={containerRef}
                            onWheel={handleWheel}
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                transition: 'transform 0.2s ease',
                                width: `${100 / scale}%`
                            }}
                        >
                            <div
                                className="markdown-preview"
                                dangerouslySetInnerHTML={{
                                    __html: htmlContent
                                }}
                                style={{
                                    maxWidth: '900px',
                                    margin: '0 auto',
                                    lineHeight: '1.8',
                                    color: '#333'
                                }}
                            />
                        </div>
                    </Spin>
                </div>
            </div>
        </Content>
    )
}

export default MarkdownPreview
