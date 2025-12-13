export const BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1/utils/mermaid-file`

export async function createMermaidFile(formData) {
    try {
        const response = await fetch(BASE_URL, {
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
        const response = await fetch(`${BASE_URL}/${name}`)
        return await response.json()
    } catch (error) {
        console.error('Error getting mermaid file:', error)
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

        const text = await response.text()
        return text
    } catch (error) {
        console.error('Error in getFileData:', {
            error: error.message,
            url: url,
            stack: error.stack
        })
        return null
    }
}
