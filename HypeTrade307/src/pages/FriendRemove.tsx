// POPULATE A (SCROLLABLE?) LIST WITH FRIENDS (USING DUMMY DATA) + ADD BUTTON TO DELETE FROM LIST
import styles from './FriendRemove.module.css'
import {useState} from "react";
import Navbar from "../components/NavbarSection/Navbar.tsx";

function FriendRemove() {
  const [friends, setFriends] = useState(['James', 'Fred', 'Peter', 'John', 'Alice', 'Bob']);
  const [verify, setVerify] = useState<any>({});

  const verifyDelete = ({ friend }: { friend: string }) => {
    setFriends(friends.filter((f) => f !== friend)); // remove 'friend'
    setVerify({});
  };

  return (
      <>
          <Navbar />

          <div className={styles.friendList}>  {/* Apply the scoped class from the CSS module */}
            <form action="">
              <h1>FriendList</h1>

              <ul className={styles.friendList}>  {/* Apply the scoped class from the CSS module */}
                {friends.map((friend) => (
                  <li key={friend}>
                    {friend}{" "}
                    <a href="#">View Profile</a>
                    {verify === friend ? (
                      <>
                        <button onClick={() => verifyDelete({ friend: friend })}>Confirm</button>
                        <button onClick={() => setVerify({})}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setVerify(friend)}>Remove</button>
                    )}
                  </li>
                ))}
              </ul>
            </form>
          </div>
      </>
  );
}

export default FriendRemove;