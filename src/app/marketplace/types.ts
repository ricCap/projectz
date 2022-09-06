import BigNumber from "bignumber.js"

export type Product = {
    index: number
    sold: boolean
    image: string
    name: string
    description: string
    owner: string
    price: BigNumber
    location: string
}