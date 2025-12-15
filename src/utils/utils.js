import { message } from 'antd'
import { getFileData } from '../api/utils'
import { FILE_TYPE } from './constants'

export function getFileType(fileExt) {
    switch (fileExt) {
        case 'mmd':
            return 'mermaid'
        case 'md':
            return 'markdown'
        default:
            return 'text'
    }
}

export function decodeHtml(html) {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
}

export function formatFilename(fileName) {
    return fileName.replace(/\.[^/.]+$/, '').toLowerCase()
}

export function buildShareUrl(fileName, ext) {
    const type = getFileType(ext)

    return `${process.env.REACT_APP_MAIN_APP_URL}/${type}?file=${fileName}`
}

export function handleFullScreen(setIsFullscreen) {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
}

export function preventDefaultZoom(containerRef) {
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
}

export async function saveAndUpload(
    content = '',
    fileExt = 'txt',
    setSaving,
    setShareUrl,
    uploadFn = () => {}
) {
    if (!content.trim()) {
        message.warning('Vui lòng nhập nội dung!')
        return
    }

    try {
        setSaving(true)

        // Tạo file từ text
        const blob = new Blob([content], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', blob, `file-${Date.now()}.${fileExt}`)

        const { success, message: errorMsg, data } = await uploadFn(formData)

        if (!success) {
            message.error(`Lỗi khi lưu file ${errorMsg}`)
        }

        // Xoá file cũ
        deleteOldFile(fileExt)

        // Lưu vào localStorage để cache
        const fileName = formatFilename(data?.fileName)
        localStorage.setItem(fileName, content)

        // Tạo URL với file ID
        const shareUrl = buildShareUrl(fileName, fileExt)

        // Copy URL vào clipboard
        await navigator.clipboard.writeText(shareUrl)

        message.success('Đã lưu thành công! Link đã được copy vào clipboard.')
        setShareUrl(shareUrl)
    } catch (error) {
        message.error('Lỗi lưu file: ' + error.message)
    } finally {
        setSaving(false)
    }
}

export async function loadFileData(
    fileName = '',
    fileType = FILE_TYPE.MERMAID,
    setDiagramText,
    setLoading,
    loadDataFn = () => {}
) {
    try {
        setLoading(true)

        // load data from local
        if (!fileName) {
            const data = getLocalFile(fileType)
            if (data.length > 0) {
                setDiagramText(data[0])
            }

            return
        }

        // fetch file from server
        const { success, message: errorMsg, data } = await loadDataFn(fileName)
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

export function getLocalFile(fileType) {
    return Object.keys(localStorage)
        .filter((key) => key.includes(fileType))
        .map((key) => localStorage.getItem(key))
}

export function deleteOldFile(fileExt) {
    const fileType = getFileType(fileExt)

    Object.keys(localStorage).forEach((key) => {
        if (key.includes(fileType)) {
            localStorage.removeItem(key)
        }
    })
}
