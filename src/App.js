import './App.css'
import { ConfigProvider } from 'antd'
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes
} from 'react-router-dom'
import Mermaid from './mermaid'
import MarkdownEditor from './markdown'
import FloatMenu from './menu'

function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#E80962'
                }
            }}
        >
            <Router>
                <FloatMenu />
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/mermaid" replace />}
                    />
                    <Route path="/mermaid" element={<Mermaid />} />
                    <Route path="/markdown" element={<MarkdownEditor />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ConfigProvider>
    )
}

export default App
