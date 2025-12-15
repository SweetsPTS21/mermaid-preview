import React, { useEffect, useState } from 'react'
import {
    Button,
    Card,
    Input,
    Layout,
    message,
    Space,
    Splitter,
    Upload
} from 'antd'
import {
    ArrowRightOutlined,
    LinkOutlined,
    SaveOutlined,
    UploadOutlined
} from '@ant-design/icons'
import { exampleDiagram } from './example'
import { createMermaidFile, getMermaidFile } from '../api/utils'
import MermaidPreview from './preview'
import mermaid from 'mermaid'
import { loadFileData, saveAndUpload } from '../utils/utils'

const { TextArea } = Input

function Mermaid() {
    const [diagramText, setDiagramText] = useState(
        'graph TD\n  A[Start] --> B[Process]\n  B --> C[End]'
    )
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [shareUrl, setShareUrl] = useState(null)

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const fileName = urlParams.get('file')

        if (fileName) {
            loadFileData(
                fileName,
                setDiagramText,
                setLoading,
                getMermaidFile
            ).then()
        }
    }, [])

    const handleFileUpload = (file) => {
        const fileName = file.name.toLowerCase()
        if (!fileName.endsWith('.mmd')) {
            message.error('Chỉ chấp nhận file có định dạng .mmd!')
            return false
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target.result
            checkValidDiagram(content).then((result) => {
                if (result) {
                    setDiagramText(content)
                    message.success('Đã tải file thành công!')
                } else {
                    message.error('File không hợp lệ hoặc có lỗi cú pháp!')
                }
            })
        }
        reader.onerror = () => {
            message.error('Lỗi đọc file!')
        }
        reader.readAsText(file)
        return false // Ngăn upload tự động
    }

    const checkValidDiagram = async (content) => {
        return await mermaid.parse(content, { suppressErrors: true })
    }

    const uploadMermaidFile = async () => {
        await saveAndUpload(
            diagramText,
            'mmd',
            setSaving,
            setShareUrl,
            createMermaidFile
        )
    }

    const copyShareLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl)
            message.success('Đã copy link!')
        } else {
            message.warning('Vui lòng lưu diagram trước!')
        }
    }

    const onChange = (diagram) => {
        setDiagramText(diagram)
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Splitter>
                <Splitter.Panel defaultSize="30%" min="20%" max="60%">
                    <Space
                        orientation="vertical"
                        style={{
                            width: '100%',
                            height: '100vh',
                            backgroundColor: '#fff',
                            padding: 20
                        }}
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
                                onChange={(e) => onChange(e.target.value)}
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

                        <Button
                            icon={<ArrowRightOutlined />}
                            onClick={() => {}}
                        >
                            Try markdown
                        </Button>
                    </Space>
                </Splitter.Panel>
                <Splitter.Panel>
                    <MermaidPreview
                        loading={loading}
                        diagramText={diagramText}
                    />
                </Splitter.Panel>
            </Splitter>
        </Layout>
    )
}

export default Mermaid
