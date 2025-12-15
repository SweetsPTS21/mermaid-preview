import React from 'react'
import {
    CopyOutlined,
    DownloadOutlined,
    LinkOutlined,
    SaveOutlined,
    UploadOutlined
} from '@ant-design/icons'
import { Button, message, Space, Upload } from 'antd'

const MarkdownTool = ({
    markdownText = '',
    setMarkdownText = () => {},
    handleSave = () => {},
    saving = false,
    shareUrl = ''
}) => {
    const handleFileUpload = (file) => {
        const fileName = file.name.toLowerCase()
        if (!fileName.endsWith('.md')) {
            message.error('Chỉ chấp nhận file có định dạng .md!')
            return false
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            setMarkdownText(e.target.result)
            message.success(`Đã tải file "${file.name}" thành công!`)
        }
        reader.onerror = () => {
            message.error('Lỗi đọc file!')
        }
        reader.readAsText(file)
        return false
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdownText)
            message.success('Đã copy nội dung!')
        } catch (error) {
            message.error('Lỗi copy: ' + error.message)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([markdownText], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `markdown-${Date.now()}.md`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        message.success('Đã tải xuống file!')
    }

    return (
        <div
            style={{
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
                background: '#fafafa'
            }}
        >
            <Space wrap>
                <Upload
                    accept=".md"
                    beforeUpload={handleFileUpload}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />} size="small">
                        Tải lên
                    </Button>
                </Upload>
                <Button
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    size="small"
                >
                    Copy
                </Button>
                <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    size="small"
                >
                    Tải xuống
                </Button>
                <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    size="small"
                >
                    Lưu & Chia sẻ
                </Button>
                {shareUrl && (
                    <Button
                        icon={<LinkOutlined />}
                        onClick={() => {
                            navigator.clipboard.writeText(shareUrl)
                            message.success('Đã copy link!')
                        }}
                        size="small"
                    >
                        Copy Link
                    </Button>
                )}
            </Space>
        </div>
    )
}

export default MarkdownTool
