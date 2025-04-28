function ShopPagination() {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex items-center">
        <span className="text-sm text-gray-600">Showing 1-10 of 100</span>
      </div>
      <div className="flex items-center">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Previous
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md ml-2">
          Next
        </button>
      </div>
    </div>
  );
}

export default ShopPagination;
