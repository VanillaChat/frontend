import {FC, JSX, ReactNode} from "react";
import ShikiHighlighter from "react-shiki";
import { bundledLanguages } from "shiki";
import {useTheme} from "@/context/ThemeProvider";
import {nanoid} from "nanoid";

interface MarkdownRendererProps {
    children: string;
}

type InlineContext = {
    currentColor?: string;
    gradient?: boolean;
    gradientColors?: string[];
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = ({ children }) => {
    const trimmed = children.replace(/^\n+|\n+$/g, "");
    const { theme } = useTheme();

    const parseBlocks = (): ReactNode[] => {
        const lines = trimmed.split("\n");
        const result: ReactNode[] = [];

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];

            if (line.startsWith("```")) {
                const language = line.slice(3).trim();
                const codeLines: string[] = [];
                i++;
                while (i < lines.length && !lines[i].startsWith("```")) {
                    codeLines.push(lines[i]);
                    i++;
                }
                i++;
                result.push(
                    <ShikiHighlighter language={Object.keys(bundledLanguages).includes(language) ? language : "plaintext"} theme={theme === "light" ? "one-light" : "one-dark-pro"} className="!select-text" showLanguage={false} key={`code-block-${i}`}>
                        {codeLines.join("\n")}
                    </ShikiHighlighter>
                );
                continue;
            }

            const headerMatch = line.match(/^(#{1,3})\s+(.*)/);
            if (headerMatch) {
                const [, hashes, content] = headerMatch;
                const level = hashes.length;
                const Tag = `h${level}` as keyof JSX.IntrinsicElements;
                result.push(<Tag key={`h-${i}`} className="font-bold select-text" style={{ fontSize: {1: "42px", 2: "26px", 3: "18px"}[level] }}>{parseInline(content)}</Tag>);
                i++;
                continue;
            }

            if (/^\s{0,2}[-*]\s+/.test(line)) {
                const items: { text: string; indent: number }[] = [];

                while (i < lines.length && /^\s{0,2}[-*]\s+/.test(lines[i])) {
                    const match = lines[i].match(/^(\s{0,2})[-+*]\s+(.*)/);
                    if (match) {
                        const [, space, content] = match;
                        items.push({ text: content, indent: space.length });
                    }
                    i++;
                }

                result.push(
                    <ul key={`list-${i}`} className="list-none space-y-1">
                        {items.map((item, idx) => (
                            <li
                                key={idx}
                                className={`flex items-start ${
                                    item.indent === 0 ? "" : "pl-3.5"
                                }`}
                            >
                                <span className="mr-2 select-none text-[20px] translate-y-[-3px]">
                                    {item.indent === 0 ? "•" : "◦"}
                                </span>
                                <span>{parseInline(item.text)}</span>
                            </li>
                        ))}
                    </ul>
                );
                continue;
            }

            if (line.startsWith(">")) {
                const quotes: string[] = [];
                while (i < lines.length && lines[i].startsWith(">")) {
                    quotes.push(lines[i].replace(/^>\s?/, ""));
                    i++;
                }
                result.push(
                    <blockquote key={`quote-${i}`} className="border-l-[#ccc] border-l-[3px] rounded-2 pl-[0.5em] select-text">
                        {parseInline(quotes.join(" "))}
                    </blockquote>
                );
                continue;
            }

            if (/^\s*-#\s+/.test(line)) {
                const content = line.replace(/^\s*-#\s+/, "");
                result.push(
                    <p key={`subtext-${i}`}>
                      <span className="text-sm text-gray-500">
                        {parseInline(content)}
                      </span>
                    </p>
                );
                i++;
                continue;
            }

            result.push(
                <p key={`p-${i}`} className="select-text">{parseInline(line)}</p>
            );
            i++;
        }

        return result;
    };

    const tokens: {
        regex: RegExp
        render: (match: RegExpMatchArray, ctx: InlineContext) => ReactNode
    }[] = [
        {
            regex: /~~(.+?)~~/,
            render: ([, content], ctx) => <del key={nanoid()}>{parseInline(content, ctx)}</del>,
        },
        {
            regex: /\*\*\*(.+?)\*\*\*/,
            render: ([, content], ctx) => <strong key={nanoid()}><em>{parseInline(content, ctx)}</em></strong>,
        },
        {
            regex: /_\*\*(.+?)\*\*_?/,
            render: ([, content], ctx) => <strong key={nanoid()}><em>{parseInline(content, ctx)}</em></strong>,
        },
        {
            regex: /\*\*_([^_]+)_\*\*/,
            render: ([, content], ctx) => <strong key={nanoid()}><em>{parseInline(content, ctx)}</em></strong>,
        },
        {
            regex: /\*\*(.+?)\*\*/,
            render: ([, content], ctx) => <strong key={nanoid()}>{parseInline(content, ctx)}</strong>,
        },
        {
            regex: /(?<!\w)_(?!_)(.+?)(?<!_)_(?!\w)|(?<!\w)\*(?!\*)(.+?)(?<!\*)\*(?!\w)/,
            render: (m, ctx) => <em key={nanoid()}>{parseInline(m[1] || m[2], ctx)}</em>,
        },
        { regex: /`([^`]+)`/, render: ([, code]) => <code key={nanoid()} className="px-1 py-0.5 rounded bg-muted font-mono text-sm">{code}</code> },
        {
            regex: /\[([^\]]+)]\(([^)]+)\)/,
            render: ([, text, url]) => <a href={url} key={nanoid()} className="underline text-primary" target="_blank" rel="noopener noreferrer">{text}</a>,
        },
        {
            regex: /\bhttps?:\/\/[^\s]+/,
            render: ([url]) => <a href={url} key={nanoid()} className="underline text-primary" target="_blank" rel="noopener noreferrer">{url}</a>,
        },
        {
            regex: /\[#([0-9a-fA-F]{3,6})]/,
            render: (m: RegExpMatchArray, ctx: InlineContext) => {
                ctx.currentColor = `#${m[1]}`
                return null
            },
        },
        {
            regex: /\[gradient(?::(#[0-9a-fA-F]{3,6}(?:,#[0-9a-fA-F]{3,6})+))?]/,
            render: (m, ctx) => {
                ctx.gradient = true
                if (m[1]) {
                    ctx.gradientColors = m[1].split(",").map(s => s.trim())
                } else {
                    ctx.gradientColors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"]
                }
                return null
            },
        },
        {
            regex: /\[\/r]/,
            render: (_m, ctx) => {
                ctx.currentColor = undefined
                ctx.gradient = false
                ctx.gradientColors = undefined
                return null
            },
        },
    ]

    function parseInline(text: string, ctx: InlineContext = {}): ReactNode[] {
        const parts: ReactNode[] = []
        let remaining = text

        while (remaining) {
            let matched = false

            for (const token of tokens) {
                const match = token.regex.exec(remaining)
                if (match?.index === 0) {
                    const rendered = token.render(match, ctx)
                    if (rendered !== null) parts.push(rendered)
                    remaining = remaining.slice(match[0].length)
                    matched = true
                    break
                }
            }

            if (!matched) {
                const nextMatchIndex = tokens
                    .map((t) => t.regex.exec(remaining)?.index)
                    .filter((i) => i !== undefined && i >= 0)
                    .reduce((min, i) => Math.min(min!, i!), remaining.length)

                const literal = remaining.slice(0, nextMatchIndex)
                const node = ctx.currentColor
                    ? <span style={{ color: ctx.currentColor }} key={nanoid()}>{literal}</span>
                    : literal

                parts.push(node)
                remaining = remaining.slice(literal.length)
            }
        }

        if (ctx.gradient && ctx.gradientColors?.length) {
            const gradientStyle = `linear-gradient(to right, ${ctx.gradientColors.join(",")})`

            return [
                <span
                    key={nanoid()}
                    style={{
                        backgroundImage: gradientStyle,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "inline-block",
                    }}
                >
                  {parts}
                </span>,
            ]
        }

        return parts
    }

    return <div>{parseBlocks()}</div>;
};