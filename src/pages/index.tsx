import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import { Block, ParagraphBlock, RichText } from '@notionhq/client/build/src/api-types'
import type { Blocks } from '../libs/types'
import useSWR from 'swr'
import { EventEmitter } from 'stream';


type Props = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

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


type State = {
    pageID: string,
    text: string
}

class App extends React.Component<{}, State> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            pageID: '',
            text: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let str = event.target.value;
        str = str.split('?')[0];
        if (str.length > 32) {
            str = str.substring(str.length - 32);
        }
        this.setState({ pageID: str })
    }

    private async handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const state = await fetch(`/api/${this.state.pageID}`)
        .then((res) => res.json())
        .then((blocks) => ({
            pageID: this.state.pageID,
            text: new Converter(blocks.blocks).text
        }));
        this.setState(state);
    }

    private renderText(): JSX.Element {
        const lines = this.state.text.split('\n');
        console.log(lines.length);
        const result = lines.map((line) => <React.Fragment>{line}<br/></React.Fragment>);
        return <span>{result}</span>
    }

    
    render() {
        return <span>
            <div className='container'>
                <div className='row'>
                    <h1>aaa</h1>
                </div>
                <form className='row align-items-end'>
                    <div className='col-10'>                    
                        <label htmlFor='page-url' className='form-label'>Page URL</label>
                        <input type='text' className='form-control' id='page-url'
                            onChange={ this.handleChange } />
                    </div>
                    <div className='col-auto'>
                        <button className='btn btn-primary' onClick={this.handleSubmit}>更新</button>
                    </div>
                </form>
            </div>
            <div className='container'>
                <h2>本文</h2>
                <div className='d-grid gap-3 container border'>
                    {this.renderText()}
                </div>
            </div>
        </span>

    }
}

const Main = () => {
    return <html>
        <body>
            <App/>
        </body>
    </html>
}

export default Main
