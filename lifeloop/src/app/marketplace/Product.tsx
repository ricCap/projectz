import type { Component } from 'solid-js';
import Comp from './Comp';
import { ERC20_DECIMALS } from './constants';
import * as types from './types'


export default function Product(props: any) {

    const product: types.Product = props._product
    if (!product) {
        return <div>Product data is missing</div>
    }

    return (
        <div class="flex font-sans">
            <div class="flex-none w-48 relative">
                <img src="{product.image}" alt="" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
                Sold: ${product.sold}
                Name: ${product.name}
                Description: ${product.description}
                Location: {product.location}
                Buy for ${product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
            </div>
        </div>
    )
}
