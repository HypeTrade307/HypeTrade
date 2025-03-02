// POPULATE A (SCROLLABLE?) LIST WITH FRIENDS (USING DUMMY DATA) + ADD BUTTON TO DELETE FROM LIST
import styles from './FriendRemove.module.css'
import {useState} from "react";
import Portfolio_button from "./portfolio_button.tsx"
function FriendRemove() {
  const [friends, setFriends] = useState(['James', 'Fred', 'Peter', 'John', 'Alice', 'Bob']);
  const [verify, setVerify] = useState<any>({});

  const verifyDelete = ({ friend }: { friend: string }) => {
    setFriends(friends.filter((f) => f !== friend)); // remove 'friend'
    setVerify({});
  };

  return (
    <div className={styles.friendList}>  {/* Apply the scoped class from the CSS module */}
      <form action="">
        <h1>Friend List</h1>

        <ul className={styles.friendList}>  {/* Apply the scoped class from the CSS module */}
          {friends.map((friend) => (
            <li key={friend}>
              {friend}{" "}
              <a href="#">View Profile</a>

              <Portfolio_button friendName={friend} />

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
  );
}

export default FriendRemove;