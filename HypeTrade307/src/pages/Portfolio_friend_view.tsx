import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Friend {
    id: number;
    name: string;
    portfolio: string;
}

const PortView: React.FC = () => {
    const { friendID } = useParams();  // Use friendID here
    const [friend, setFriend] = useState<Friend | null>(null);

    const friendsData: Friend[] = [
        { id: 123456, name: "James", portfolio: "Portfolio details for James" },
        { id: 234567, name: "Fred", portfolio: "Portfolio details for Fred" },
        { id: 345678, name: "Peter", portfolio: "Portfolio details for Peter" },
        { id: 456789, name: "John", portfolio: "Portfolio details for John" },
        { id: 567890, name: "Alice", portfolio: "Portfolio details for Alice" },
        { id: 678901, name: "Bob", portfolio: "Portfolio details for Bob" },
    ];

    useEffect(() => {
        if (friendID) {
            const friendData = friendsData.find((f) => f.id === parseInt(friendID)); // Use friendID here
            setFriend(friendData || null);
        }
    }, [friendID]);

    if (!friend) {
        return <div>Friend not found!</div>;
    }

    return (
        <div>
            <h1>{friend.name}'s Portfolio</h1>
            <p>{friend.portfolio}</p>
        </div>
    );
};

export default PortView;