import type { ReactNode } from 'react';

/**
 * Very small inline markdown: `code` and **bold**.
 * `serif` mode renders inline code as italic serif (no box) so it reads smoothly
 * alongside serif prose instead of breaking the line with a mono chip.
 */
export default function Markdown({
  text,
  serif,
}: {
  text: string;
  serif?: boolean;
}) {
  const nodes: ReactNode[] = [];
  let buf = '';
  let i = 0;
  let key = 0;
  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = '';
    }
  };
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end === -1) {
        buf += '**';
        i += 2;
        continue;
      }
      flush();
      nodes.push(
        <strong
          key={key++}
          className={serif ? 'font-serif italic' : 'font-black text-zinc-950'}
        >
          {text.slice(i + 2, end)}
        </strong>,
      );
      i = end + 2;
    } else if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end === -1) {
        buf += '`';
        i++;
        continue;
      }
      flush();
      const inner = text.slice(i + 1, end);
      if (serif) {
        nodes.push(
          <em
            key={key++}
            className="italic font-serif text-blue-900"
          >
            {inner}
          </em>,
        );
      } else {
        nodes.push(
          <code
            key={key++}
            className="font-mono text-[0.85em] px-1.5 py-0.5 bg-zinc-100 text-blue-900 border border-zinc-200"
          >
            {inner}
          </code>,
        );
      }
      i = end + 1;
    } else if (text[i] === '\n') {
      flush();
      nodes.push(<br key={key++} />);
      i++;
    } else {
      buf += text[i];
      i++;
    }
  }
  flush();
  return <>{nodes}</>;
}
