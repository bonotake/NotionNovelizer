import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react'
import { Block, ParagraphBlock, HeadingOneBlock, HeadingTwoBlock, HeadingThreeBlock, RichText }
    from '@notionhq/client/build/src/api-types'
import useSWR, { trigger } from 'swr'


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


type InputProp = {
    inputNode: HTMLInputElement,
    handle: (event: React.FormEvent<HTMLFormElement>, input: HTMLInputElement) => void;
}
const Input: React.FC<InputProp> = ({ inputNode, handle }) => {
    return (
        <form className='row align-items-end' onSubmit={(e) => handle(e, inputNode)}>
            <div className='col-10'>                    
                <label htmlFor='page-url' className='form-label'>Page URL</label>
                <input type='text' className='form-control' id='page-url'
                    ref={node => (inputNode = node)} />
            </div>
            <div className='col-auto'>
                <button className='btn btn-primary' type='submit'>更新</button>
            </div>
        </form>
    )
}   

const Manipulate: React.FC<{ text: string }> = ({ text }) => {
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


const Content: React.FC<{ elem: JSX.Element | JSX.Element[] }> = ({elem}) => {
    return (
        <span>
            <div className='container'>
                <h2>本文</h2>
                <div className='d-grid gap-3 container border'>
                    {elem}
                </div>
            </div>
        </span>
    )
}

type NovelerProp = {
    pageId: string,
    data: { blocks: Block[] }
}

const Noveler: React.FC<NovelerProp> = (prop) => {
    let input: HTMLInputElement;
    const [pageId, setPageId] = useState(prop.pageId);
    const [text, setText] = useState('');
    const [count, setCount] = useState(0);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>,
                            inputElem: HTMLInputElement) => {
        event.preventDefault();
        // setUrl(input.value);
        let str = inputElem.value;
        const len = str.length;
        if (len >= 32) {
            setPageId(str.substring(len - 32));
            // trigger(['/api/content', '76649a0f8a5f49af8d01f04e75880773']);
        }
    }

    const fetcher = (url: string, id: string) => fetch(`${url}?id=${id}`)
        .then((res) => res.json())
        // .then(async (res) => {
        //     const json: { blocks: Block[] } = await res.json();
        //     const text = new Converter(json.blocks).text;
        //     const lines: string[] = newText.split('\n');
        //     const elems = 
        //         lines.map((line, index) => <React.Fragment key={index}>{line}<br/></React.Fragment>);
        //     return {
        //         text: text,
        //         elems: elems
        //     }
        // });

    const { data, error } = useSWR(['/api/content', pageId], fetcher, { initialData: prop.data });
    let result: JSX.Element | JSX.Element[] = <React.Fragment/>;
    if (error) {
        setText('');
        result = <div>failed to load</div>;

    } else if (!data) {
        setText('');
        result = <div>loading...</div>;
    }
    const newText = new Converter(data.blocks).text;
    console.log(`text: ${text}`);

    useEffect(() => {
        console.log(`page id: ${pageId}`);
        console.log(`data.blocks(${data.blocks.length}): ${data.blocks}`);
        console.log(`new text length: ${newText.length}`);
        setText(newText);
        const lines = newText.split('\n');
        console.log(`hello: ${lines.length}`);
        result = 
            lines.map((line, index) => <React.Fragment key={index}>{line}<br/></React.Fragment>)
    });

    console.log(`text length: ${text.length}`);
    console.log(`result: ${result}`);
    return <div>
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
            <form className='row align-items-end' onSubmit={(e) => handleSubmit(e, input)}>
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
        {/* <Input inputNode={input} handle={handleSubmit}/> */}
        <Manipulate text={text}/>
        {/* <Content elem={result}/> */}
        <div className='container'>
            <h2>本文</h2>
            <div className='d-grid gap-3 container border'>
                {count}
            </div>
        </div>
    </div>        
}

export async function getServerSideProps() {
    const posts = await fetch('https://notion-novelizer.vercel.app/api/content?id=').then((res) => res.json());
    return { props: { pageId: '', data: posts } }
}


export default Noveler
