import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react'
import { Block, ParagraphBlock, RichText } from '@notionhq/client/build/src/api-types'
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
        if (text.startsWith('「') || text.startsWith('『')) {
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
        if (isParagraph(block)) {
            const result = block.paragraph.text.map((txt: RichText) => txt.plain_text).join('\n');
            return this.indent(result);
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


const App: React.FC = ({ children }) => {
    const [pageId, setPageId] = useState('');
    const [url, setUrl] = useState('');

    type InputProp = {
        setPageId: (arg: string) => void;
        url: string;
        setUrl: (arg: string) => void;
    }

    const Input: React.FC<InputProp> = ({ setPageId, url, setUrl }) => {
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
                    <h1>aaa</h1>
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

    type ContentProp = {
        pageID: string
    }

    const Content: React.FC<ContentProp> = ({ pageID, children }) => {
        const { data, error } = useSWR(`/api/${pageId}`);

        if (error) return <div>failed to load</div>;
        if (!data) return <div>loading...</div>;

        const text = new Converter(data.blocks).text;
        const lines = text.split('\n');
        console.log(lines.length);
        const result = lines.map((line) => <React.Fragment>{line}<br/></React.Fragment>);
        
        return <span>
            <div className='container'>
                <h2>本文</h2>
                <div className='d-grid gap-3 container border'>
                    {result}
                </div>
            </div>
        </span>
    }

    return <html>
        <body>
            <Input setPageId={setPageId} url={url} setUrl={setUrl}/>
            <Content pageID={pageId}/>
        </body>
    </html>        
}

const Main = () => {
    return <html>
        <body>
            <App/>
        </body>
    </html>
}

export default App
