import React from 'react'
import type { PlainText } from '../libs/types'
import useSWR from 'swr'

const Main = () => {
    const { data, error } = useSWR<PlainText>('api/text');
    if (error) return <p>failed to load...</p>
    if (!data) return <p>loading...</p>

    const lines = data.text.split('\n');
    return lines.map((line) => <p>{line}</p>)
}

export default Main
