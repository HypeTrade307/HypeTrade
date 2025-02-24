// If we want to use different colors, we need to make a new .css file specific
// to this file, or edit 'index.css' in the 'src' directory.

// VERY BASIC LOGIN PAGE

const LoginForm = () => {
    return (
        <div className={'wrapper'}>
            <form action="">
                <h2>Welcome to</h2>
                <h1>HypeTrade</h1>
                <div className={"input-box user"}>
                    <input type={"text"} placeholder={'Username'} required={true} />
                </div>
                <div className={"input-box pass"}>
                    <input type={"text"} placeholder={'Password'} required={true} />
                </div>


            </form>
        </div>
    );
}

export default LoginForm