import React from "react"

const Content: React.FC<{}> = ({ children }) => {
    return (
        <div className='container'>
            <h2>本文</h2>
            <div className='d-grid gap-3 container border'>
                {children}
            </div>
        </div>
    )
}

export default Content;
