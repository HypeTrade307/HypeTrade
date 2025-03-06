export default function LoginButton() {
    return (
        <div>
            <button
                onClick={ () => window.location.href = "/Login"}
            >Go to Login page
            </button>
        </div>
    );
}