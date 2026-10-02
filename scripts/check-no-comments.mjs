import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import ts from 'typescript'

const projectRoot = process.cwd()

const ROOT_FILES = [
  'vite.config.ts',
  'eslint.config.js',
  'index.html',
  '.env.example',
  '.prettierrc.json',
  'components.json',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
]

const SCANNED_DIRECTORIES = ['src', 'scripts']

const SCRIPT_KINDS = {
  '.ts': ts.ScriptKind.TS,
  '.tsx': ts.ScriptKind.TSX,
  '.js': ts.ScriptKind.JS,
  '.mjs': ts.ScriptKind.JS,
  '.jsx': ts.ScriptKind.JSX,
}

function listFiles(directory) {
  return readdirSync(join(projectRoot, directory), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(projectRoot, join(entry.parentPath, entry.name)))
}

function lineOf(text, position) {
  return text.slice(0, position).split('\n').length
}

function findScriptComments(filePath, text) {
  const scriptKind = SCRIPT_KINDS[extname(filePath)]
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, scriptKind)
  const positions = new Set()

  const visit = (node) => {
    if (node.kind !== ts.SyntaxKind.JsxText) {
      const ranges = [
        ...(ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []),
        ...(ts.getTrailingCommentRanges(text, node.getEnd()) ?? []),
      ]
      ranges.forEach((range) => positions.add(range.pos))
    }
    if (ts.isJsxExpression(node) && !node.expression) positions.add(node.getStart(sourceFile))
    node.getChildren(sourceFile).forEach(visit)
  }

  visit(sourceFile)
  return [...positions].map((position) => lineOf(text, position))
}

function findJsonComments(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text)
  const lines = []
  let token = scanner.scan()
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    const isComment =
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    if (isComment) lines.push(lineOf(text, scanner.getTokenStart()))
    token = scanner.scan()
  }
  return lines
}

function findPatternComments(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => lineOf(text, match.index))
}

function findComments(filePath) {
  const text = readFileSync(join(projectRoot, filePath), 'utf8')
  const extension = extname(filePath)
  if (extension in SCRIPT_KINDS) return findScriptComments(filePath, text)
  if (extension === '.json') return findJsonComments(text)
  if (extension === '.css') return findPatternComments(text, /\/\*/g)
  if (extension === '.html' || extension === '.svg') return findPatternComments(text, /<!--/g)
  if (filePath.startsWith('.env')) return findPatternComments(text, /^\s*#/gm)
  return []
}

const files = [
  ...ROOT_FILES.filter((file) => existsSync(join(projectRoot, file))),
  ...SCANNED_DIRECTORIES.flatMap(listFiles),
]

const findings = [
  ...new Set(files.flatMap((file) => findComments(file).map((line) => `${file}:${line}`))),
]

if (findings.length > 0) {
  console.error('Se encontraron comentarios en el código:')
  findings.forEach((finding) => console.error(`  ${finding}`))
  process.exit(1)
}

console.log(`Sin comentarios en ${files.length} archivos revisados.`)
