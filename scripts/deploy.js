#!/usr/bin/env node
/**
 * Deploy dist/ to remote server via SFTP.
 *
 * Set these env vars (or create .env.deploy and run with dotenv):
 *   DEPLOY_HOST     - e.g. sftp.example.com
 *   DEPLOY_USER     - SSH username
 *   DEPLOY_PASSWORD - SSH password (or use DEPLOY_KEY for key auth)
 *   DEPLOY_KEY      - Path to private key (e.g. ~/.ssh/id_rsa)
 *   DEPLOY_REMOTE   - Remote path, e.g. /var/www/html or /public_html
 *   DEPLOY_PORT     - Optional, default 22
 *
 * Usage: npm run deploy
 * Or:    node scripts/deploy.js
 */

import SftpClient from 'ssh2-sftp-client'
import { config } from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const distDir = join(root, 'dist')

// Load .env.deploy if it exists (keep credentials out of git)
config({ path: join(root, '.env.deploy') })

const host = process.env.DEPLOY_HOST
const user = process.env.DEPLOY_USER
const password = process.env.DEPLOY_PASSWORD
const privateKeyPath = process.env.DEPLOY_KEY
const remotePath = process.env.DEPLOY_REMOTE
const port = parseInt(process.env.DEPLOY_PORT || '22', 10)

if (!host || !user || !remotePath) {
  console.error('Missing required env vars: DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE')
  console.error('Optional: DEPLOY_PASSWORD or DEPLOY_KEY, DEPLOY_PORT')
  process.exit(1)
}

async function deploy() {
  const sftp = new SftpClient()

  try {
    const config = { host, port, username: user }
    if (password) config.password = password
    else if (privateKeyPath) {
      const { readFileSync } = await import('fs')
      const keyPath = privateKeyPath.replace(/^~/, process.env.HOME || process.env.USERPROFILE || '')
      config.privateKey = readFileSync(keyPath, 'utf-8')
    } else {
      console.error('Provide DEPLOY_PASSWORD or DEPLOY_KEY')
      process.exit(1)
    }

    console.log(`Connecting to ${user}@${host}:${port}...`)
    await sftp.connect(config)

    console.log(`Uploading dist/ to ${remotePath}...`)
    await sftp.uploadDir(distDir, remotePath, {
      filter: (path) => !path.includes('node_modules') && !path.endsWith('.map'),
    })

    console.log('Deploy complete.')
  } catch (err) {
    console.error('Deploy failed:', err.message)
    process.exit(1)
  } finally {
    await sftp.end()
  }
}

deploy()
