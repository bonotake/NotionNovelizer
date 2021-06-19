import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react'
import type { PlainText } from '../libs/types'
import useSWR from 'swr'

const Content: () => JSX.Element = () => {
    const { data, error } = useSWR<PlainText>('api/text');
    if (error) return <p>failed to load...</p>
    if (!data) return <p>loading...</p>

    const lines = data.text.split('\n');
    return <div>{lines.map((line) => {
        return line.startsWith('[chapter') ?
            <h3>{line.substring(9, line.length - 1)}</h3> :
            <React.Fragment>{line}<br /></React.Fragment>
    })}</div>
}

const Main = () => {
    return <html>
        <body>
            <div className='container'>
                <div className='row'>
                    <h1>aaa</h1>
                </div>
                <form className='row align-items-end'>
                    <div className='col-10'>                    
                        <label htmlFor='page-url' className='form-label'>Page URL</label>
                        <input type='text' className='form-control' id='page-url' />
                    </div>
                    <div className='col-auto'>
                        <button className='btn btn-primary'>更新</button>
                    </div>
                </form>
            </div>
            <div className='container'>
                <h2>本文</h2>
                <div className='d-grid gap-3 container border'>
                    <Content/>
                </div>
            </div>
        </body>
    </html>
}

export default Main
