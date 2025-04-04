import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  CssBaseline,
  Box,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import { alpha } from '@mui/material/styles';

import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from '../components/shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../components/shared-theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

function Forum(props: { disableCustomTheme?: boolean }) {
  const initialForums = [
    { id: 1, title: 'AAPL - Apple', content: 'News: Earnings, Products, etc...', views: 60, replies: 24, dateUpdated: '5/3/2025', author: 'John Doe', category: 'Tech', isOwner: true },
    { id: 2, title: 'NVDA - Nvidia', content: 'News: Earnings, Products, etc...', views: 60, replies: 24, dateUpdated: '5/3/2025', author: 'Jane Smith', category: 'Tech', isOwner: false },
    { id: 3, title: 'TICKER - Stocks, etc...', content: 'News: Earnings, Products, etc...', views: 60, replies: 24, dateUpdated: '5/3/2025', author: 'Alice Johnson', category: 'Finance', isOwner: true },
    { id: 4, title: 'GOOG - Google', content: 'News: Earnings, Products, etc...', views: 45, replies: 18, dateUpdated: '5/4/2025', author: 'Sam Taylor', category: 'Tech', isOwner: false },
    { id: 5, title: 'AMZN - Amazon', content: 'News: Earnings, Products, etc...', views: 72, replies: 31, dateUpdated: '5/4/2025', author: 'Emily White', category: 'E-Commerce', isOwner: false },
    { id: 6, title: 'TSLA - Tesla', content: 'News: Earnings, Products, etc...', views: 90, replies: 42, dateUpdated: '5/4/2025', author: 'Michael Brown', category: 'Automotive', isOwner: false },
  ];

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [forums, setForums] = useState(initialForums);
  const [confirmationOpen, setConfirmationOpen] = useState(false); // State to handle confirmation dialog visibility
  const [forumToDelete, setForumToDelete] = useState<number | null>(null); // Store the forum ID to delete

  const tutorialSteps = [
    { title: "Forum Page", description: "This is where you can engage with the community and discuss your thoughts on stocks." },
    { title: "Data Safety", description: "Discussions on these forums are not used for the sentiment analysis of stocks." },
    { title: "Forum info", description: "Every forum is centered around a stock and topics about that stock (listed under content)." },
    { title: "Posting a Topic", description: "You can create new topics and join conversations with others." },
    { title: "You're All Set!", description: "You're now ready to engage in the forum. Enjoy!" },
  ];

  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      setTutorialOpen(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setForumToDelete(id);
    setConfirmationOpen(true); // Open confirmation dialog
  };

  const confirmDelete = () => {
    if (forumToDelete !== null) {
      const updatedForums = forums.filter(forum => forum.id !== forumToDelete);
      setForums(updatedForums);
      localStorage.setItem("forums", JSON.stringify(updatedForums)); // Persist the updated forums list to localStorage
      setForumToDelete(null); // Clear the forum ID after deletion
    }
    setConfirmationOpen(false); // Close the confirmation dialog
  };

  const cancelDelete = () => {
    setForumToDelete(null); // Clear the forum ID if the user cancels
    setConfirmationOpen(false); // Close the confirmation dialog
  };

  const resetForums = () => {
    setForums(initialForums); // Reset forums to initial state
    localStorage.setItem("forums", JSON.stringify(initialForums)); // Persist the reset forums to localStorage
  };

  useEffect(() => {
    const storedForums = localStorage.getItem("forums");
    if (storedForums) {
      setForums(JSON.parse(storedForums)); // Load forums from localStorage if available
    }

    const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
    if (tutorialMode) {
      setTutorialOpen(true);
    }
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Forum Title',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'content',
      headerName: 'Content',
      headerAlign: 'right',
      align: 'right',
      flex: 1,
      minWidth: 240,
    },
    {
      field: 'views',
      headerName: 'Views',
      headerAlign: 'right',
      align: 'right',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'replies',
      headerName: 'Replies',
      headerAlign: 'right',
      align: 'right',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'dateUpdated',
      headerName: 'Date Updated',
      headerAlign: 'right',
      align: 'right',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'actions',
      headerName: 'Delete',
      flex: 0.5,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.isOwner ? (
          <IconButton
            color="error"
            onClick={() => handleDeleteClick(params.row.id)} // Use the handler for delete confirmation
          >
            <DeleteIcon />
          </IconButton>
        ) : null,
    },
  ];

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <Navbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <h1>Forum List</h1>
            <Box sx={{ width: '100%', maxWidth: 1200 }}>
              <DataGrid
                rows={forums}
                columns={columns}
                autoHeight
                pageSizeOptions={[5]}
                disableRowSelectionOnClick
              />
            </Box>
            <Button variant="contained" color="primary" onClick={resetForums}>
              Reset Forums
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Confirmation Dialog - Centered */}
      <Dialog
        open={confirmationOpen}
        onClose={cancelDelete}
        sx={{
          position: "absolute", // Make the dialog absolute
          top: "50%", // Vertically center it
          left: "50%", // Horizontally center it
          transform: "translate(-50%, -50%)", // Apply the transform to fully center
          maxWidth: "300px",
        }}
        disableEscapeKeyDown
        hideBackdrop
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this forum?</p>
          <Button onClick={confirmDelete} color="error">Delete</Button>
          <Button onClick={cancelDelete}>Cancel</Button>
        </DialogContent>
      </Dialog>

      {/* Tutorial Popup */}
      <Dialog
        open={tutorialOpen}
        onClose={() => {}}
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "300px",
        }}
        disableEscapeKeyDown
        hideBackdrop
      >
        <DialogTitle>{tutorialSteps[step].title}</DialogTitle>
        <DialogContent>
          <p>{tutorialSteps[step].description}</p>
          <Button onClick={nextStep}>{step < tutorialSteps.length - 1 ? "Next" : "Finish"}</Button>
        </DialogContent>
      </Dialog>
    </AppTheme>
  );
}

export default Forum;
