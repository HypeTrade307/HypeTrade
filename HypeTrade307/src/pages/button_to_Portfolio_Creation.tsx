export default function ButtonToPortfolio() {
    return (
        <div>
            <button
                onClick={ () => window.location.href = "/Portfolios"}
            >Go to Portfolio page
            </button>
        </div>
    );
}