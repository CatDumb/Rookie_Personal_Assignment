const Footer = () => {
    return (
        <div className="bg-gray-300 text-black w-full py-2">
            <div className="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-10 flex items-center w-full gap-2">
                <img src="/book.png" alt="Logo" className="w-14 h-14" />
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
