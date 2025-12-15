import React, { useState } from 'react'
import { Dropdown, FloatButton } from 'antd'
import { EditOutlined, FileMarkdownOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const FloatMenu = () => {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    const items = [
        {
            key: 'mermaid',
            label: 'Mermaid Editor',
            icon: <EditOutlined />,
            onClick: () => {
                navigate('/mermaid')
                setOpen(false)
            }
        },
        {
            key: 'markdown',
            label: 'Markdown Editor',
            icon: <FileMarkdownOutlined />,
            onClick: () => {
                navigate('/markdown')
                setOpen(false)
            }
        }
    ]

    return (
        <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1000 }}>
            <Dropdown
                menu={{ items }}
                placement="topRight"
                open={open}
                onOpenChange={setOpen}
                trigger={['click']}
            >
                <FloatButton
                    type="primary"
                    icon={<EditOutlined />}
                    style={{ height: 50, width: 50, borderRadius: '50%' }}
                />
            </Dropdown>
        </div>
    )
}

export default FloatMenu
