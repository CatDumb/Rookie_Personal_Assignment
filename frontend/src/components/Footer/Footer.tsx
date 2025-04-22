const Footer = () => {
    return (
        <div className="bg-gray-300 text-black w-full py-4">
            <div className="flex items-center w-full gap-3">
                <img src="/book.png" alt="Logo" className="w-16 h-16" />
                <div>
                    <div className="font-bold text-xl">BOOKWORM</div>
                    <div className="text-sm">Address</div>
                    <div className="text-sm">Phone</div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
