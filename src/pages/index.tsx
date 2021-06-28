import React, { FormEvent } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Converter from "libs/convert";
import { Button, Form } from "react-bootstrap";


export default function App() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const url = '';
    const onSubmit = () => { url = watch('url') };
    const len = url.length;
    let pageId = "";
    if (url.includes('notion.so') && len >= 32) {
        pageId = url.substring(len - 32);
        console.log(`page id: ${pageId}`);
    }

    const fetcher = (url: string, id: string) => fetch(`${url}?id=${id}`)
    .then((res) => res.json())
    .then((json) => {
        const text = new Converter(json.blocks).text;
        const lines: string[] = text.split('\n');
        const elems = 
            lines.map((line, index) => <React.Fragment key={index}>{line}<br/></React.Fragment>);
        return {
            text: text,
            elems: elems
        }
    });

    console.log(`page id: ${pageId}`);
    const { data, error } = useSWR(['/api/content', pageId], fetcher);
    const elem = error ? <div>failed to load</div> : !data ? <div>loading...</div> : data.elems

    const handleCopy = async () => {
        await navigator.clipboard.writeText(data.text);
    }

    return (
        <html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" 
                    rel="stylesheet" 
                    integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1"
                    crossOrigin="anonymous"/>
            </head>
            <body>
                <h1>Notionで小説を</h1>
                <p>
                    Notionで書いた日本語の文章を、それとなく日本語文書風に閲覧・エクスポートするためのサイトです。<br/>
                    各小説サイトやフォーマットに合うよう、よしなに変換します。<br/>
                    絶賛開発中。
                </p>
                <Form onSubmit={handleSubmit<FormEvent>(onSubmit)}>
                    <Form.Label htmlFor='page-url'>Page URL</Form.Label>
                    <Form.Control defaultValue="" {...register("url")} />
                    <Button type='submit'>送信</Button>
                </Form>
                <Button onClick={handleCopy}>クリップボードにコピー</Button>
                <div>{elem}</div>    
            </body>
        </html>
    );
}
