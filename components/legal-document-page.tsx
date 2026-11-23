import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

type LegalDocument = {
  documentKey: string
  title: string
  version: string
  effectiveDate: string
  content: string
}

const documentLinks = [
  { href: '/legal/terms', label: 'Master Terms', key: 'master_terms_of_service' },
  { href: '/legal/privacy', label: 'Privacy Policy', key: 'privacy_policy' },
  { href: '/legal/safety', label: 'Safety Rules', key: 'safety_rules' },
  { href: '/legal/community', label: 'Community Guidelines', key: 'community_guidelines' },
]

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineMarkdown(value: string) {
  let text = escapeHtml(value)
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
  return text
}

function tableCells(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim())
}

function isTableDivider(line: string) {
  const cells = tableCells(line)
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function isBlockStart(line: string, next = '') {
  return /^#{1,6}\s/.test(line)
    || /^\s*\`\`\`/.test(line)
    || /^\s*[-*]\s+/.test(line)
    || /^\s*\d+\.\s+/.test(line)
    || /^\s*>/.test(line)
    || /^\s*(---|___|\*\*\*)\s*$/.test(line)
    || (line.includes('|') && isTableDivider(next))
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const output: string[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) { index++; continue }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = heading[1].length
      output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`)
      index++
      continue
    }

    if (/^\s*```/.test(line)) {
      index++
      const codeLines: string[] = []
      while (index < lines.length && !/^\s*```/.test(lines[index])) codeLines.push(lines[index++])
      if (index < lines.length) index++
      output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
      continue
    }

    if (index + 1 < lines.length && line.includes('|') && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line)
      index += 2
      const rows: string[][] = []
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(tableCells(lines[index++]))
      const head = headers.map((cell) => `<th scope="col">${inlineMarkdown(cell)}</th>`).join('')
      const body = rows.map((row) => `<tr>${headers.map((_, column) => `<td>${inlineMarkdown(row[column] || '')}</td>`).join('')}</tr>`).join('')
      output.push(`<div class="legal-table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`)
      continue
    }

    if (/^\s*(---|___|\*\*\*)\s*$/.test(line)) {
      output.push('<hr />')
      index++
      continue
    }

    if (/^\s*>/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''))
      output.push(`<blockquote>${quote.map((part) => `<p>${inlineMarkdown(part)}</p>`).join('')}</blockquote>`)
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(`<li>${inlineMarkdown(lines[index++].replace(/^\s*[-*]\s+/, ''))}</li>`)
      }
      output.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(`<li>${inlineMarkdown(lines[index++].replace(/^\s*\d+\.\s+/, ''))}</li>`)
      }
      output.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    const paragraph = [line]
    index++
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index], lines[index + 1] || '')) {
      paragraph.push(lines[index++])
    }
    output.push(`<p>${paragraph.map((part) => inlineMarkdown(part.trim())).join(' ')}</p>`)
  }

  return output.join('\n')
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const body = document.content.replace(/^# [^\n]*\n/, '')
  return (
    <>
      <SiteHeader />
      <main className="section container legal-page">
        <div className="kicker">Legal · Published</div>
        <h1>{document.title}</h1>
        <p className="lead legal-page-lead">Version {document.version} · Effective date {document.effectiveDate}</p>
        <nav className="legal-document-nav" aria-label="Legal documents">
          {documentLinks.map((item) => (
            <Link key={item.href} href={item.href} aria-current={item.key === document.documentKey ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <article className="legal-document" aria-label={document.title} dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }} />
        <p className="legal-page-footnote">This page displays the published MORT legal document version identified above. If you have questions about a specific agreement or your rights, contact MORT through its support channel.</p>
      </main>
    </>
  )
}



function termsSectionId(title: string, index: number) {
  const slug = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section'
  return `terms-section-${index + 1}-${slug}`
}

function termsSections(markdown: string) {
  let index = 0
  return markdown.split('\n').flatMap((line) => {
    const heading = line.match(/^##\s+(.+)$/)
    if (!heading) return []
    const section = { title: heading[1], id: termsSectionId(heading[1], index) }
    index++
    return [section]
  })
}

function termsMarkdownToHtml(markdown: string) {
  const sections = termsSections(markdown)
  let index = 0
  return markdownToHtml(markdown).replace(/<h2>([\s\S]*?)<\/h2>/g, (heading, content: string) => {
    const section = sections[index++]
    return section ? `<h2 id="${section.id}" tabindex="-1">${content}</h2>` : heading
  })
}

export function TermsDocumentPage({ document }: { document: LegalDocument }) {
  const body = document.content.replace(/^# [^\n]*\n/, '')
  const sections = termsSections(body)
  const articleHtml = termsMarkdownToHtml(body)
  const sectionLinks = (
    <ol>
      {sections.map((section) => (
        <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
      ))}
    </ol>
  )

  return (
    <>
      <SiteHeader />
      <main className="terms-page-shell">
        <div className="terms-page-container">
          <div className="terms-heading">
            <div className="terms-kicker">Legal · Published</div>
            <h1>{document.title}</h1>
            <p className="terms-meta">Version {document.version} · Effective date {document.effectiveDate}</p>
            <nav className="legal-document-nav" aria-label="Legal documents">
              {documentLinks.map((item) => (
                <Link key={item.href} href={item.href} aria-current={item.key === document.documentKey ? 'page' : undefined}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="terms-mobile-index">
            <details>
              <summary><span>On this page</span><span>{sections.length} sections</span></summary>
              <nav aria-label="Terms sections">{sectionLinks}</nav>
            </details>
          </div>

          <div className="terms-layout">
            <aside className="terms-aside">
              <p className="terms-aside-title">On this page</p>
              <nav aria-label="Terms sections">{sectionLinks}</nav>
            </aside>
            <article className="legal-document terms-article" aria-label={document.title} dangerouslySetInnerHTML={{ __html: articleHtml }} />
          </div>

          <p className="legal-page-footnote terms-footnote">This page displays the published MORT legal document version identified above. If you have questions about a specific agreement or your rights, contact MORT through its support channel.</p>
        </div>
      </main>
    </>
  )
}
