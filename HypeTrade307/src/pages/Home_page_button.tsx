//@ts-nocheck
import './homepage.css'
function Home_page_button(){
    return (
        <div>
            <button className='button_top_left' onClick={() => window.location.href = "./"}>
               Return to the Main Page
            </button>
        </div>
    );
}


export default Home_page_button