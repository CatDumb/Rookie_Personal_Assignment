import './Header.css';  // Fixed the import path

interface BookHeaderProps {
  text: string;
}

export const BookHeader = ({ text = "Book" }: BookHeaderProps) => {
    return (
        <div className="header">
            <div className="header-text"><h3>{text}</h3></div>
            <hr className="header-divider" />
        </div>
    )
}
