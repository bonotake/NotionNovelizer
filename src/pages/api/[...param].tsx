import { Client } from '@notionhq/client'
import { Block } from '@notionhq/client/build/src/api-types'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Blocks } from '../../libs/types'


const notion = new Client({ auth: process.env.NOTION_KEY });

/**
 * Get a PageID of Notion, and return a list of blocks (as an API)
 */
export default async (req: NextApiRequest, res: NextApiResponse<Blocks>) => {
    console.log('param');
    console.log(req.query.param);

    let result: Block[] = [];
    let has_more = true;
    let start_cursor = null;
    while (has_more) {
        type Param = {
            block_id: string,
            start_cursor?: string
        }
        let param: Param = { block_id: req.query.param[0] };
        if (start_cursor != null) {
            param.start_cursor = start_cursor;
        }
        const response = await notion.blocks.children.list(param);
        console.log('length');
        console.log(response.results.length);
        has_more = response.has_more;
        if (has_more) {
            start_cursor = response.next_cursor
        }
        result = result.concat(response.results);
    }
    res.status(200).send({ blocks: result });
}

