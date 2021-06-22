import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react'
import { Block, ParagraphBlock, HeadingOneBlock, HeadingTwoBlock, HeadingThreeBlock, RichText }
    from '@notionhq/client/build/src/api-types'
import useSWR from 'swr'


class Converter {
    private _blocks: Block[]
    constructor (blocks: Block[]) {
        this._blocks = blocks;
    }

    /**
     * 文字列を小説風にインデントする
     * @param text 元になるテキスト
     * @returns インデントされたテキスト
     */ 
    private indent(text: string): string {
        const doNotIndentWith = ['「', '『', '（', '('];
        if (doNotIndentWith.some((c) => text.startsWith(c))) {
            return text;
        } else {
            return '　' + text;
        }
    }

    /**
     * Notion文字列を日本語テキストに変換する
     * @param block Notionのブロック
     * @returns テキストの文字列
     */
    private convert(block: Block): string {
        function isParagraph(b: any): b is ParagraphBlock {
            return b !== undefined &&
                typeof b === 'object' &&
                b.type == 'paragraph';
        }
        function isH1(b: any): b is HeadingOneBlock {
            return b !== undefined &&
                typeof b === 'object' &&
                b.type == 'heading_1';
        }
        function isH2(b: any): b is HeadingTwoBlock {
            return b !== undefined &&
                typeof b === 'object' &&
                b.type == 'heading_2';
        }
        function isH3(b: any): b is HeadingThreeBlock {
            return b !== undefined &&
                typeof b === 'object' &&
                b.type == 'heading_3';
        }
        if (isParagraph(block)) {
            const result = block.paragraph.text.map((txt: RichText) => txt.plain_text).join('\n');
            return (result == '***') ? '[newpage]' : this.indent(result);
        }
        else if (isH1(block)) {
            const result = block.heading_1.text.map((txt: RichText) => txt.plain_text).join('\n');
            return `[chapter: ${result}]`;
        }
        else if (isH2(block)) {
            const result = block.heading_2.text.map((txt: RichText) => txt.plain_text).join('\n');
            return `[chapter: ${result}]`;
        }
        else if (isH3(block)) {
            return '';  // ignore this block
        }
        else {
            console.log('unknown block type: ${block.type}');
            return block.type;
        }
    }
    get text(): string {
        const result = this._blocks.map((block) => this.convert(block)).join('\n');
        return result;
    }
}


const App: React.FC = () => {
    const [pageId, setPageId] = useState('');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');


    const Input: React.FC<{}> = () => {
        let input: HTMLInputElement;

        const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setUrl(input.value);
            let str = input.value;
            const len = str.length;
            if (len >= 32) {
                setPageId(str.substring(len - 32));
            }
        }
        return <span>
            <div className='container'>
                <div className='row'>
                    <h1>Notionで小説を</h1>
                    <div>
                        <p>
                            Notionで書いた日本語の文章を、それとなく日本語文書風に閲覧・エクスポートするためのサイトです。<br/>
                            各小説サイトやフォーマットに合うよう、よしなに変換します。
                        </p>
                    </div>
                </div>
                <form className='row align-items-end' onSubmit={handleSubmit}>
                    <div className='col-10'>                    
                        <label htmlFor='page-url' className='form-label'>Page URL</label>
                        <input type='text' className='form-control' id='page-url'
                            ref={node => (input = node)} />
                    </div>
                    <div className='col-auto'>
                        <button className='btn btn-primary' type='submit'>更新</button>
                    </div>
                </form>
            </div>
        </span>
    }   


    const Manipulate: React.FC<{}> = () => {
        const handleCopy = async () => {
            await navigator.clipboard.writeText(text);
        }

        return <span>
            <div className='container row justify-align-end'>
                <div className='col-8'>
                </div>
                <div className='col-4'>
                    <button className='btn btn-primary' onClick={handleCopy}>
                        クリップボードにコピー
                    </button>
                </div>
            </div>
        </span>
    }

    const Content: React.FC<{}> = () => {
        const format = (elem: JSX.Element | JSX.Element[]) => 
            <span>
                <div className='container'>
                    <h2>本文</h2>
                    <div className='d-grid gap-3 container border'>
                        {elem}
                    </div>
                </div>
            </span>

        const { data, error } = useSWR(`/api/${pageId}`);

        if (error) return format(<div>failed to load</div>);
        if (!data) return format(<div>loading...</div>);

        const text = new Converter(data.blocks).text;
        const lines = text.split('\n');
        console.log(lines.length);
        const result = lines.map((line) => <React.Fragment>{line}<br/></React.Fragment>);
        setText(text);

        return format(result)
    }

    return <html>
        <body>
            <Input/>
            <Manipulate/>
            <Content/>
        </body>
    </html>        
}

export default App
