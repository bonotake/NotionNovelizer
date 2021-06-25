import { Block, ParagraphBlock, HeadingOneBlock, HeadingTwoBlock, HeadingThreeBlock, RichText }
    from '@notionhq/client/build/src/api-types'


export default class Converter {
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
