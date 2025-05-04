/* Book Header Component - Displays the book detail page title with category */

/* Props Interface */
interface BookHeaderProps {
  text: string;
}

/**
 * Book detail page header showing the book's category or default text
 * @param text String representing the book category (defaults to "Book")
 */
export const BookHeader = ({ text = "Book" }: BookHeaderProps) => {
    return (
        <div className="header">
            <div className="font-bold my-4 text-2xl"><h3>{text}</h3></div>
            <hr></hr>
        </div>
    )
}
