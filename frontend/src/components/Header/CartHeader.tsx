interface CartHeaderProps {
    text: string;
}

export const CartHeader = ({ text = "3" }: CartHeaderProps) => {
    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>Your Cart: ({text}) item(s)</h3></div>
            <hr></hr>
        </div>
    )
}
