export const HOME = '/home/dimchatzis'
export const CWD_DEFAULT = '/home/dimchatzis'

export const FS_PATH = ['/usr/bin', '/apps', '/games', '/home/dimchatzis/cv']

export const FS = {
  t: 'd',
  c: {
    home: { t: 'd', c: {
      dimchatzis: { t: 'd', c: {
        cv: { t: 'd', c: {
          'about.txt': { t: 'f', special: 'about' },
          'README.md': { t: 'f', body: '# dimchatzis.cv\n\nType `help` for commands. Type `cat about.txt` to start.\n' },
          projects: { t: 'd', c: {} },
        } },
      } },
    } },
    apps: { t: 'd', c: {
      calculator: { t: 'e', cmd: 'calculator' },
      notepad: { t: 'e', cmd: 'notepad' },
      'typing-test': { t: 'e', cmd: 'typing' },
      encoder: { t: 'e', cmd: 'encoder' },
      qrcode: { t: 'e', cmd: 'qr' },
      pomodoro: { t: 'e', cmd: 'pomodoro' },
      'build-something': { t: 'e', cmd: 'build something' },
      'color-picker': { t: 'e', cmd: 'color' },
      stopwatch: { t: 'e', cmd: 'stopwatch' },
      password: { t: 'e', cmd: 'password' },
      coffee: { t: 'e', cmd: 'coffee' },
    } },
    games: { t: 'd', c: {
      snake: { t: 'e', cmd: 'snake' },
      fortune: { t: 'e', cmd: 'fortune' },
    } },
    usr: { t: 'd', c: {
      bin: { t: 'd', c: {
        cat: { t: 'e', cmd: 'cat' },
        date: { t: 'e', cmd: 'date' },
        whoami: { t: 'e', cmd: 'whoami' },
        echo: { t: 'e', cmd: 'echo' },
        clear: { t: 'e', cmd: 'clear' },
        ls: { t: 'e', cmd: 'ls' },
        man: { t: 'e', cmd: 'man' },
        help: { t: 'e', cmd: 'help' },
        curl: { t: 'e', cmd: 'curl api/me' },
        weather: { t: 'e', cmd: 'weather' },
        neofetch: { t: 'e', cmd: 'neofetch' },
      } },
      lib: { t: 'd', c: {
        node_modules: { t: 'd', c: {
          dimchatzis: { t: 'd', c: {
            scripts: { t: 'd', c: { coffee: { t: 'e', cmd: 'npm run coffee' } } },
          } },
        } },
      } },
    } },
  },
}

export function pathSegments(p) {
  return p.split('/').filter(Boolean)
}

export function resolvePath(current, pathStr) {
  if (!pathStr || pathStr === '.') return current
  const pathStrTrim = pathStr.trim()
  if (pathStrTrim.startsWith('/')) {
    const segs = pathSegments(pathStrTrim)
    return segs.length ? '/' + segs.join('/') : '/'
  }
  if (pathStrTrim === '~' || pathStrTrim.startsWith('~/')) {
    const rest = pathStrTrim === '~' ? '' : pathStrTrim.slice(2)
    const home = pathSegments(HOME).join('/')
    const homePath = '/' + home
    return rest ? homePath + '/' + rest.replace(/^\/+/, '').split('/').filter(Boolean).join('/') : homePath
  }
  const cur = pathSegments(current)
  const parts = pathStrTrim.split('/').filter(Boolean)
  for (const p of parts) {
    if (p === '..') cur.pop()
    else if (p !== '.') cur.push(p)
  }
  return cur.length ? '/' + cur.join('/') : '/'
}

export function getNode(root, absPath) {
  const segs = pathSegments(absPath)
  if (segs.length === 0) return root
  let node = root
  for (const seg of segs) {
    if (!node || node.t !== 'd') return null
    node = node.c[seg]
    if (node === undefined) return null
  }
  return node
}

export function listDir(root, absPath) {
  const node = getNode(root, absPath)
  if (!node || node.t !== 'd') return null
  return Object.entries(node.c || {}).map(([name, n]) => ({ name, node: n }))
}

export function findInPath(commandName) {
  const nameLower = commandName.toLowerCase().trim()
  for (const dir of FS_PATH) {
    const entries = listDir(FS, dir)
    if (!entries) continue
    for (const { name, node } of entries) {
      if (node.t === 'e' && (node.cmd?.toLowerCase() === nameLower || name.toLowerCase().replace(/\.(exe|sh)$/, '') === nameLower)) return `${dir}/${name}`
    }
  }
  return null
}