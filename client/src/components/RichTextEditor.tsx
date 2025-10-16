import { useRef, useEffect } from 'react';
import { 
    Bold, 
    Italic, 
    Underline, 
    List, 
    ListOrdered, 
    Link as LinkIcon,
    Heading1,
    Heading2,
    Heading3
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, height = '200px' }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertHeading = (level: number) => {
        execCommand('formatBlock', `h${level}`);
    };

    const insertLink = () => {
        const url = prompt('Введите URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const toolbarButtons = [
        { icon: Heading1, action: () => insertHeading(1), title: 'Заголовок 1' },
        { icon: Heading2, action: () => insertHeading(2), title: 'Заголовок 2' },
        { icon: Heading3, action: () => insertHeading(3), title: 'Заголовок 3' },
        { icon: Bold, action: () => execCommand('bold'), title: 'Жирный' },
        { icon: Italic, action: () => execCommand('italic'), title: 'Курсив' },
        { icon: Underline, action: () => execCommand('underline'), title: 'Подчёркивание' },
        { icon: ListOrdered, action: () => execCommand('insertOrderedList'), title: 'Нумерованный список' },
        { icon: List, action: () => execCommand('insertUnorderedList'), title: 'Маркированный список' },
        { icon: LinkIcon, action: insertLink, title: 'Вставить ссылку' },
    ];

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 bg-gray-50 border-b flex-wrap">
                {toolbarButtons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={button.action}
                            title={button.title}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                        >
                            <Icon size={18} />
                        </button>
                    );
                })}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="p-3 outline-none prose max-w-none overflow-y-auto"
                style={{ minHeight: height }}
                data-placeholder={placeholder}
            />

            <style>{`
                [contenteditable][data-placeholder]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }
                [contenteditable] {
                    cursor: text;
                }
                [contenteditable]:focus {
                    outline: none;
                }
                [contenteditable] h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 0.67em 0;
                }
                [contenteditable] h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 0.75em 0;
                }
                [contenteditable] h3 {
                    font-size: 1.17em;
                    font-weight: bold;
                    margin: 0.83em 0;
                }
                [contenteditable] ul, [contenteditable] ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }
                [contenteditable] a {
                    color: #2563eb;
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

