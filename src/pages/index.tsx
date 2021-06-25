import React, { FormEvent } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Converter from "libs/convert";


export default function App() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const onSubmit = (data: FormEvent) => console.log(data);
    const url = !watch('url') ? '' : watch('url');
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
        <React.Fragment>
            <h1>Notionで小説を</h1>
            <p>
                Notionで書いた日本語の文章を、それとなく日本語文書風に閲覧・エクスポートするためのサイトです。<br/>
                各小説サイトやフォーマットに合うよう、よしなに変換します。<br/>
                絶賛開発中。
            </p>
            <form onSubmit={handleSubmit<FormEvent>(onSubmit)}>
                <label htmlFor='page-url'>Page URL</label>
                <input defaultValue="" {...register("url")} />
            </form>
            <button onClick={handleCopy}>クリップボードにコピー</button>
            <div>{elem}</div>    
        </React.Fragment>
    );
}
