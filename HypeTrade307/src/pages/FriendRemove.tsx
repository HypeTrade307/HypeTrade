import { useState } from "react";
import styles from "./FriendRemove.module.css"; // Assuming you are using CSS modules
import Portfolio_button from "./portfolio_button.tsx"; // Ensure this import is correct
// POPULATE A (SCROLLABLE?) LIST WITH FRIENDS (USING DUMMY DATA) + ADD BUTTON TO DELETE FROM LIST
import Navbar from "../components/NavbarSection/Navbar.tsx";

function FriendRemove() {
  const [friends, setFriends] = useState([
    { id: 123456, name: "James" },
    { id: 234567, name: "Fred" },
    { id: 345678, name: "Peter" },
    { id: 456789, name: "John" },
    { id: 567890, name: "Alice" },
    { id: 678901, name: "Bob" }
  ]);

  const [verify, setVerify] = useState<number | null>(null);

  const verifyDelete = (friendId: number) => {
    setFriends(friends.filter((f) => f.id !== friendId)); // Remove friend by ID
    setVerify(null);
  };

  return (
      <>
          <Navbar />

          <div className={styles.friendList}>
              <form>
                  <h1>Friend List</h1>
                  <ul className={styles.friendList}>
                      {friends.map((friend) => (
                          <li key={friend.id}>
                              {friend.name} <a href="#">View Profile</a>

                              {/* Portfolio button added back */}


                              <Portfolio_button friendID={friend.id} />

                              {verify === friend.id ? (
                                  <>
                                      <button onClick={() => verifyDelete(friend.id)}>Confirm</button>
                                      <button onClick={() => setVerify(null)}>Cancel</button>
                                  </>
                              ) : (
                                  <button onClick={() => setVerify(friend.id)}>Remove</button>
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