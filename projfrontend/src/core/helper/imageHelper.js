import React from 'react'

const ImageHelper= ({product}) => {
    const ImageUrl = product ? product.image : `https://images.pexels.com/photos/3561339/pexels-photo-3561339.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260`
    return (
        <div className = "rounded border border-success p-2">
            <img src = {ImageUrl}
            style = {{maxHeight:"100%", maxWidth:"100%"}}
            className = "mb-3 rounded"
            />
        </div>
    )
}

export default ImageHelper