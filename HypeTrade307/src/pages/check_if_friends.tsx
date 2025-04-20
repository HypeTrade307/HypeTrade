import { useState } from "react";

export default function FriendCheck() {
  const [currentUser, setCurrentUser] = useState<string>("");
  const [requestedUser, setRequestedUser] = useState<string>("");
  const [friends, setFriends] = useState<string[] | null>(null);

  const checkFriendship = async () => {
    const response = await fetch("https://hypet-145797464141.us-central1.run.app/api/api/check_friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_user: currentUser, requested_user: requestedUser }),
    });

    const data = await response.json();
    setFriends(data.friends);
  };

  const handleAddFriend = async () => {
    await fetch("https://hypet-145797464141.us-central1.run.app/api/api/add_friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_user: currentUser, add_user: requestedUser }),
    });

    checkFriendship(); // refresh the friendship status
  };

  const handleRemoveFriend = async () => {
    await fetch("https://hypet-145797464141.us-central1.run.app/api/api/remove_friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_user: currentUser, remove_user: requestedUser }),
    });

    checkFriendship(); // refresh the friendship status
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Check Friendship Status</h2>
      <input
        type="text"
        placeholder="Your Username"
        value={currentUser}
        onChange={(e) => setCurrentUser(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Other Username"
        value={requestedUser}
        onChange={(e) => setRequestedUser(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
      />
      <button
        onClick={checkFriendship}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Check Friendship
      </button>

      {friends !== null && (
        <div className="mt-2 p-2 bg-white rounded">
          {friends.length > 0 ? (
            <div>
              <p>Yes, friends. List of friends for current user: {friends.join(", ")}</p>
              <button
                onClick={handleRemoveFriend}
                className="mt-2 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                Remove Friend
              </button>
            </div>
          ) : (
            <div>
              <p>Not Friends</p>
              <button
                onClick={handleAddFriend}
                className="mt-2 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Request to Friend
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}