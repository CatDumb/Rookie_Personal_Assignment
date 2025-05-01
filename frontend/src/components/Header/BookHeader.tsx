interface BookHeaderProps {
  text: string;
}

export const BookHeader = ({ text = "Book" }: BookHeaderProps) => {
    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>{text}</h3></div>
            <hr></hr>
        </div>
    )
}
