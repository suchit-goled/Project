import "./Pagination.css";

const Pagination = ({ page, totalPages, setPage }) => {

    if (totalPages <= 1) return null;

    const getPages = () => {

        const pages = [];

        if (totalPages <= 7) {

            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (page > 4) {
            pages.push("...");
        }

        const start = Math.max(2, page - 2);
        const end = Math.min(totalPages - 1, page + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 3) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    };

    return (

        <div className="pagination">

            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
            >
                ← Previous
            </button>

            {getPages().map((item, index) =>

                item === "..." ? (

                    <span
                        key={index}
                        className="dots"
                    >
                        ...
                    </span>

                ) : (

                    <button

                        key={item}

                        className={
                            page === item
                                ? "active"
                                : ""
                        }

                        onClick={() => setPage(item)}

                    >
                        {item}
                    </button>

                )

            )}

            <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
            >
                Next →
            </button>

        </div>

    );

};

export default Pagination;