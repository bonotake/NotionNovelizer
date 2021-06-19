import { Client } from '@notionhq/client'
import { Block, ParagraphBlock, RichText } from '@notionhq/client/build/src/api-types'
import type { NextApiRequest, NextApiResponse } from 'next'
import next from 'next';
import type { PlainText } from '../../libs/types'


const notion = new Client({ auth: process.env.NOTION_KEY });

const pageid = process.env.NOTION_PAGE_ID;

class Converter {
    private _blocks: Block[]
    constructor (blocks: Block[]) {
        this._blocks = blocks
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
        return this._blocks.map((block) => this.convert(block)).join('\n')
    }
}


export default async (req: NextApiRequest, res: NextApiResponse<PlainText>) => {
    let result = '';
    let has_more = true;
    let start_cursor = null;
    while (has_more) {
        type Param = {
            block_id: string,
            start_cursor?: string
        }
        let param: Param = { block_id: pageid };
        if (start_cursor != null) {
            param.start_cursor = start_cursor;
        }
        const response = await notion.blocks.children.list(param);
        has_more = response.has_more;
        if (has_more) {
            start_cursor = response.next_cursor
        }
        result += new Converter(response.results).text;
    }
    res.status(200).send({ text: result });
}

