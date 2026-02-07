'use client';

import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';

// ============================================
// Copy button for code blocks
// ============================================
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 transition-all opacity-0 group-hover:opacity-100"
      aria-label="Copy code"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ============================================
// Custom components — styled to match RuleKit design system
// ============================================
const components: Components = {
  // Paragraphs
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-[var(--foreground)]/85 mb-3 last:mb-0">
      {children}
    </p>
  ),

  // Bold
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--foreground)]">{children}</strong>
  ),

  // Italic
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),

  // Strikethrough
  del: ({ children }) => (
    <del className="line-through text-[var(--muted-foreground)]">{children}</del>
  ),

  // Headings — scaled down for chat context (not page headings)
  h1: ({ children }) => (
    <h4 className="text-base font-semibold text-[var(--foreground)] mt-4 mb-2 first:mt-0">{children}</h4>
  ),
  h2: ({ children }) => (
    <h5 className="text-[15px] font-semibold text-[var(--foreground)] mt-3 mb-1.5 first:mt-0">{children}</h5>
  ),
  h3: ({ children }) => (
    <h6 className="text-sm font-semibold text-[var(--foreground)] mt-3 mb-1 first:mt-0">{children}</h6>
  ),
  h4: ({ children }) => (
    <h6 className="text-sm font-medium text-[var(--foreground)] mt-2 mb-1 first:mt-0">{children}</h6>
  ),
  h5: ({ children }) => (
    <h6 className="text-sm font-medium text-[var(--muted-foreground)] mt-2 mb-1 first:mt-0">{children}</h6>
  ),
  h6: ({ children }) => (
    <h6 className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mt-2 mb-1 first:mt-0">{children}</h6>
  ),

  // Unordered lists
  ul: ({ children }) => (
    <ul className="text-sm space-y-1 mb-3 last:mb-0 pl-0 list-none">{children}</ul>
  ),

  // Ordered lists
  ol: ({ children }) => (
    <ol className="text-sm space-y-1 mb-3 last:mb-0 pl-0 list-none counter-reset-[item]">{children}</ol>
  ),

  // List items — custom bullet/number styling
  li: ({ children, ...props }) => {
    // Check if this is inside an ordered list by looking for the `ordered` prop
    // react-markdown passes `ordered` and `index` to li elements
    const ordered = (props as any).ordered;
    const index = (props as any).index;

    return (
      <li className="flex gap-2 text-[var(--foreground)]/85 leading-relaxed">
        <span className="flex-shrink-0 text-[var(--brand)] mt-0.5 text-xs font-medium select-none w-4 text-right">
          {ordered ? `${(index ?? 0) + 1}.` : '–'}
        </span>
        <span className="flex-1 min-w-0">{children}</span>
      </li>
    );
  },

  // Inline code
  code: ({ children, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isBlock = match || (typeof children === 'string' && children.includes('\n'));

    // Block code — handled by `pre`
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    // Inline code
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-[var(--muted)] text-[var(--foreground)] text-[13px] font-mono border border-[var(--border)]/50">
        {children}
      </code>
    );
  },

  // Code blocks (pre wraps code)
  pre: ({ children }) => {
    // Extract raw text for the copy button
    let codeText = '';
    let language = '';
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props) {
        const childProps = child.props as { children?: React.ReactNode; className?: string };
        if (typeof childProps.children === 'string') {
          codeText = childProps.children;
        }
        const match = /language-(\w+)/.exec(childProps.className || '');
        if (match) language = match[1];
      }
    });

    return (
      <div className="group relative my-3 last:mb-0 rounded-lg overflow-hidden border border-[var(--border)]/60">
        {/* Language label */}
        {language && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--muted)]/80 border-b border-[var(--border)]/40">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {language}
            </span>
          </div>
        )}
        <pre className="p-3 overflow-x-auto bg-[var(--muted)]/40 text-[13px] font-mono leading-relaxed text-[var(--foreground)]/90">
          {children}
        </pre>
        {codeText && <CopyButton text={codeText.replace(/\n$/, '')} />}
      </div>
    );
  },

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--brand)]/40 pl-3 my-3 last:mb-0 text-[var(--muted-foreground)] italic">
      {children}
    </blockquote>
  ),

  // Horizontal rules
  hr: () => (
    <hr className="my-4 border-t border-[var(--border)]" />
  ),

  // Links
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--brand)] hover:underline underline-offset-2 font-medium"
    >
      {children}
    </a>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-3 last:mb-0 overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[var(--muted)]/60 text-[var(--muted-foreground)]">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-[var(--border)]">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-[var(--muted)]/30 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-[var(--foreground)]/85">{children}</td>
  ),

  // Images (rare in chat, but handle gracefully)
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ''}
      className="max-w-full rounded-lg border border-[var(--border)] my-2"
      loading="lazy"
    />
  ),
};

// ============================================
// MarkdownContent — memoized for streaming performance
// ============================================
interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent = memo(function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownContent;
