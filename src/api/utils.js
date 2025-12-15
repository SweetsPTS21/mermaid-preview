export const BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1/utils`

export async function createMermaidFile(formData) {
    try {
        const response = await fetch(`${BASE_URL}/mermaid-file`, {
            method: 'POST',
            body: formData
        })

        return await response.json()
    } catch (error) {
        console.error('Error creating mermaid file:', error)
        throw error
    }
}

export async function getMermaidFile(name) {
    try {
        const response = await fetch(`${BASE_URL}/mermaid-file/${name}`)
        return await response.json()
    } catch (error) {
        console.error('Error getting mermaid file:', error)
        throw error
    }
}

export async function createMarkdownFile(formData) {
    try {
        const response = await fetch(`${BASE_URL}/markdown-file`, {
            method: 'POST',
            body: formData
        })

        return await response.json()
    } catch (error) {
        console.error('Error creating markdown file:', error)
        throw error
    }
}

export async function getMarkdownFile(name) {
    try {
        const response = await fetch(`${BASE_URL}/markdown-file/${name}`)
        return await response.json()
    } catch (error) {
        console.error('Error getting markdown file:', error)
        throw error
    }
}

export async function getFileData(url) {
    if (!url) {
        console.error('No URL provided to getFileData')
        return null
    }

    try {
        console.log('Fetching file from URL:', url)
        const response = await fetch(url)

        if (!response.ok) {
            console.error('Error response:', {
                status: response.status,
                statusText: response.statusText,
                url: url
            })
            return null
        }

        return await response.text()
    } catch (error) {
        console.error('Error in getFileData:', {
            error: error.message,
            url: url,
            stack: error.stack
        })
        return null
    }
}
