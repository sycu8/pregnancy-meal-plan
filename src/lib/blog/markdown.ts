/** Minimal markdown → React-safe HTML for blog (headings, lists, links, emphasis). */
export function renderBlogMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;

  function closeLists() {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function inline(text: string) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" class="mt-4 rounded-lg" loading="lazy" />')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank" class="text-accent underline underline-offset-2 hover:text-accent/80">$1</a>');
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeLists();
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeLists();
      html.push(`<blockquote class="mt-4 border-l-4 border-accent/40 bg-muted/40 px-4 py-3 text-muted-foreground">${inline(trimmed.slice(2))}</blockquote>`);
      continue;
    }
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      closeLists();
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((cell) => `<td class="border border-border px-3 py-2 text-sm">${inline(cell.trim())}</td>`)
        .join("");
      html.push(`<table class="mt-4 w-full border-collapse"><tr>${cells}</tr></table>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      closeLists();
      html.push(`<h3 class="mt-6 text-lg font-semibold text-foreground">${inline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      closeLists();
      html.push(`<h2 class="mt-8 text-xl font-semibold text-foreground">${inline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("- ")) {
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push('<ul class="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">');
        inUl = true;
      }
      html.push(`<li class="leading-7">${inline(trimmed.slice(2))}</li>`);
      continue;
    }
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push('<ol class="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">');
        inOl = true;
      }
      html.push(`<li class="leading-7">${inline(olMatch[2])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p class="mt-4 leading-7 text-muted-foreground">${inline(trimmed)}</p>`);
  }

  closeLists();
  return html.join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
