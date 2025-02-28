// POPULATE A (SCROLLABLE?) LIST WITH FRIENDS (USING DUMMY DATA) + ADD BUTTON TO DELETE FROM LIST

import {useState} from "react";

function FriendRemove() {
    const [friends, setFriends] = useState(['James', 'Fred', 'Peter']);
    const [verify, setVerify] = useState({});

    const verifyDelete = ({friend}: { friend: any }) => {
        setFriends(friends.filter((f) => f !== friend)); // remove 'friend'
        setVerify({});
    };

    return (
        // Below lists the lists of friends, with an option to view their profile
        // and the ability to remove them

        // TODO give view user profile functionality
        <div className={'FriendList'}>
            <form action="">
                <h1>FriendList</h1>

                <ul>
                    {friends.map((friend) => (
                        <li>
                            {friend}{" "}
                            <a href="#">View Profile</a>
                            {verify === friend ? <>
                                    <button onClick={() => verifyDelete({friend: friend})}>Confirm</button>
                                    <button onClick={() => setVerify({})}>Cancel</button>
                                </> : <button onClick={() => setVerify(friend)}>Remove</button>}
                        </li>
                    ))}
                </ul>
            </form>
        </div>
    )
}

export default FriendRemove