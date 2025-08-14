import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files with proper MIME types
app.use(express.static('dist', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript')
    } else if (path.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript')
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css')
    } else if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html')
    }
  }
}))

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
}) 