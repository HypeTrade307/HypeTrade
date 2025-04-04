import { useState, useEffect } from "react";
import styles from "./FriendRemove.module.css"; // Assuming you are using CSS modules
import Portfolio_button from "./portfolio_button.tsx"; // Ensure this import is correct
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

function FriendRemove(props: { disableCustomTheme?: boolean }) {
  const [friends, setFriends] = useState([
    { id: 123456, name: "James" },
    { id: 234567, name: "Fred" },
    { id: 345678, name: "Peter" },
    { id: 456789, name: "John" },
    { id: 567890, name: "Alice" },
    { id: 678901, name: "Bob" }
  ]);

  const [verify, setVerify] = useState<number | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
    if (tutorialMode) {
      setTutorialOpen(true); // Show tutorial if enabled
    }
  }, []);

  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      setTutorialOpen(false); // Close tutorial at the last step
    }
  };

  const tutorialSteps = [
    { title: "Welcome!", description: "This is the Friend Management page. Here, you can manage your friends." },
    { title: "Viewing Portfolios", description: "Each friend has a 'View Profile' button allowing you to see more information." },
    { title: "Removing Friends", description: "Click 'Remove' to delete a friend. A confirmation pop-up will appear." },
    { title: "Checking Portfolios", description: "The 'Portfolio' button allows you to view a friend's stock portfolio." },
    { title: "You're All Set!", description: "That's it! Now you know how to use this page effectively." }
  ];

  const verifyDelete = (friendId: number) => {
    setFriends(friends.filter((f) => f.id !== friendId)); // Remove friend by ID
    setVerify(null);
  };

  return (
    <>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <Navbar />

        <div className={styles.friendList}>
          <form>
            <h1>Friend List</h1>
            <ul className={styles.friendList}>
              {friends.map((friend) => (
                <li key={friend.id}>
                  {friend.name} <a href="#">View Profile</a>
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
      </AppTheme>

      {/* Left-Aligned, Step-by-Step Tutorial Popup */}
      <Dialog
        open={tutorialOpen}
        onClose={() => {}} // Prevents clicking outside from closing
        sx={{
          position: "fixed",
          left: "5%",
          top: "50%",
          transform: "translateY(-50%)",
          maxWidth: "300px"
        }}
        disableEscapeKeyDown // Prevent closing with Esc
        hideBackdrop // Remove the black overlay
      >
        <DialogTitle>{tutorialSteps[step].title}</DialogTitle>
        <DialogContent>
          <p>{tutorialSteps[step].description}</p>
          <Button onClick={nextStep}>{step < tutorialSteps.length - 1 ? "Next" : "Finish"}</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FriendRemove;