const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist')
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir)
}

// Read the config template
const configTemplate = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8')

// Replace environment variables
const configContent = configTemplate
  .replace('process.env.SUPABASE_URL', `'${process.env.SUPABASE_URL}'`)
  .replace('process.env.SUPABASE_ANON_KEY', `'${process.env.SUPABASE_ANON_KEY}'`)
  .replace('process.env.API_BASE_URL', `'${process.env.API_BASE_URL}'`)

// Write the new config file
fs.writeFileSync(path.join(distDir, 'config.js'), configContent)

// Copy other files to dist
const filesToCopy = [
  'popup.html',
  'popup.js',
  'styles.css',
  'content.js',
  'background.js',
  'manifest.json',
  'auth.js',
  'api.js'
]

filesToCopy.forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, file),
    path.join(distDir, file)
  )
})

console.log('Build completed successfully!') 