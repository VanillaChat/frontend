import {FC, JSX, ReactNode} from "react";
import ShikiHighlighter from "react-shiki";
import {useTheme} from "@/context/ThemeProvider";

interface SimpleMarkdownProps {
    children: string;
}

export const MarkdownRenderer: FC<SimpleMarkdownProps> = ({ children }) => {
    const trimmed = children.replace(/^\n+|\n+$/g, "");
    const { theme } = useTheme();

    const parseBlocks = (text: string): ReactNode[] => {
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
                    <ShikiHighlighter language={language} theme={theme === "light" ? "one-light" : "one-dark-pro"} className="!select-text" showLanguage={false} key={`code-block-${i}`}>
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

                while (i < lines.length && /^\s{0,2}[-+*]\s+/.test(lines[i])) {
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

    const parseInline = (text: string): ReactNode[] => {
        const elements: ReactNode[] = [];

        const regex = /(\[(.+?)]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<>"'`]+|\*\*\*([^*]+)\*\*\*|___([^_]+)___|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;

        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                elements.push(text.slice(lastIndex, match.index));
            }

            const full = match[0];

            const [
                ,
                ,
                linkText,
                linkHref,
                boldItalic1,
                boldItalic2,
                bold1,
                bold2,
                italic1,
                italic2,
                code,
            ] = match;

            if (linkText && linkHref) {
                elements.push(
                    <a key={elements.length} href={linkHref} target="_blank" rel="noopener noreferrer" className="text-[#0366d6] hover:underline select-text">
                        {linkText}
                    </a>
                );
            }
            else if (/^https?:\/\//.test(full)) {
                elements.push(
                    <a key={elements.length} href={full} target="_blank" rel="noopener noreferrer" className="text-[#0366d6] hover:underline select-text">
                        {full}
                    </a>
                );
            }
            else if (boldItalic1 || boldItalic2) {
                elements.push(
                    <strong key={elements.length}>
                        <em>{boldItalic1 || boldItalic2}</em>
                    </strong>
                );
            }
            else if (bold1 || bold2) {
                elements.push(<strong key={elements.length}>{bold1 || bold2}</strong>);
            }
            else if (italic1 || italic2) {
                elements.push(<em key={elements.length}>{italic1 || italic2}</em>);
            }
            else if (code) {
                elements.push(
                    <code key={elements.length} className="bg-[#eee] px-[4px] border-[2px] p-1 rounded-[6px] border-[#ccc] font-mono">
                        {code}
                    </code>
                );
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            elements.push(text.slice(lastIndex));
        }

        return elements;
    };


    return <div>{parseBlocks(trimmed)}</div>;
};