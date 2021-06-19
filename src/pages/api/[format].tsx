import { Client } from '@notionhq/client'
import { Block, ParagraphBlock, RichText } from '@notionhq/client/build/src/api-types'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { PlainText } from '../../libs/types'


const notion = new Client({ auth: process.env.NOTION_KEY });

const pageid = process.env.NOTION_PAGE_ID;

class Converter {
    private _blocks: Block[]
    constructor (blocks: Block[]) {
        this._blocks = blocks
    }
    private convert(block: Block): string {
        function isParagraph(b: any): b is ParagraphBlock {
            return b !== undefined &&
                typeof b === 'object' &&
                b.type == 'paragraph';
        }
        if (isParagraph(block)) {
            const result = '　' + block.paragraph.text.map((txt: RichText) => txt.plain_text).join('\n');
            console.log(result)
            return result;
        }
        else {
            console.log('unknown block type.');
            return '';
        }
    }
    get text(): string {
        return this._blocks.map((block) => this.convert(block)).join('\n')
    }
}


export default async (req: NextApiRequest, res: NextApiResponse<PlainText>) => {
    const response = await notion.blocks.children.list({ block_id: pageid });
    res.status(200).send({ text: (new Converter(response.results)).text });
}

