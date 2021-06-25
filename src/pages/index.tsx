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


    return (
        <React.Fragment>
            <form onSubmit={handleSubmit<FormEvent>(onSubmit)}>
                <label htmlFor='page-url'>Page URL</label>
                <input defaultValue="" {...register("url")} />
            </form>
            <div>{elem}</div>    
        </React.Fragment>
    );
}
