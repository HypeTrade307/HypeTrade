import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown.tsx';
import Sitemark from '../SitemarkIcon';
import type {} from '@mui/material/themeCssVarsAugmentation';

// const Navbar = () => {
//     const [open, setOpen] = React.useState(false);
//
//     const toggleDrawer = (newOpen: boolean) => () => {
//         setOpen(newOpen);
//     };
//
//     return (
//         <AppBar
//             position="fixed"
//             enableColorOnDark
//             sx={{
//                 boxShadow: 0,
//                 bgcolor: 'transparent',
//                 backgroundImage: 'none',
//                 mt: 'calc(var(--template-frame-height, 0px) + 28px)',
//             }}
//         >
//             <Container maxWidth="lg">
//                 <StyledToolbar variant="dense" disableGutters>
//                     <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
//                         <Sitemark />
//                         <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
//                             {pages.map((page) => (
//                                 <Button
//                                     variant="text" color="info" size="small"
//                                     key={page}
//                                     onClick={() => handleMenuClick(page)}
//                                 >
//                                     {page}
//                                 </Button>
//                             ))}
//                         </Box>
//                     </Box>
//                     <Box
//                         sx={{
//                             display: { xs: 'none', md: 'flex' },
//                             gap: 1,
//                             alignItems: 'center',
//                         }}
//                     >
//                         <Button color="primary" variant="text" size="small"
//                                 onClick={() => handleMenuClick("Login")}
//                         >
//                             Sign in
//                         </Button>
//                         <Button color="primary" variant="contained" size="small"
//                                 onClick={() => handleMenuClick("Login")}
//                         >
//                             Sign up
//                         </Button>
//                         <ColorModeIconDropdown />
//                     </Box>
//                     <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
//                         <ColorModeIconDropdown size="medium" />
//                         <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
//                             <MenuIcon />
//                         </IconButton>
//                         <Drawer
//                             anchor="top"
//                             open={open}
//                             onClose={toggleDrawer(false)}
//                             PaperProps={{
//                                 sx: {
//                                     top: 'var(--template-frame-height, 0px)',
//                                 },
//                             }}
//                         >
//                             <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
//                                 <Box
//                                     sx={{
//                                         display: 'flex',
//                                         justifyContent: 'flex-end',
//                                     }}
//                                 >
//                                     <IconButton onClick={toggleDrawer(false)}>
//                                         <CloseRoundedIcon />
//                                     </IconButton>
//                                 </Box>
//
//                                 {pages.map((page) => (
//                                     <MenuItem
//                                         key={page}
//                                         onClick={() => handleMenuClick(page)}
//                                     >
//                                         {page}
//                                     </MenuItem>
//                                 ))}
//
//                                 <Divider sx={{ my: 3 }} />
//                                 <MenuItem>
//                                     <Button
//                                         color="primary" variant="contained" fullWidth
//                                         onClick={() => handleMenuClick("Login")}
//                                     >
//                                         Sign up
//                                     </Button>
//                                 </MenuItem>
//                                 <MenuItem>
//                                     <Button
//                                         color="primary" variant="outlined" fullWidth
//                                         onClick={() => handleMenuClick("Login")}
//                                     >
//                                         Sign in
//                                     </Button>
//                                 </MenuItem>
//                             </Box>
//                         </Drawer>
//                     </Box>
//                 </StyledToolbar>
//             </Container>
//         </AppBar>
//     );
// }



import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddIcon from '@mui/icons-material/Add';
import MakePost from "../PostSection/MakePost.tsx";
import {useState} from "react";
import CreatePostIcon from "@mui/icons-material/Create";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

async function handleClick() {
    // </MakePost/>
}

const BottomAdd = () => {
    // const [value, setValue] = React.useState(0);
    const [postText, setPostText] = useState("");

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const createPost = async () => {
        window.location.pathname = "/home";
    };

    return (
        <Container sx={{color: 'darkblue', }}>
            <Button
                sx={{backgroundColor: 'darkblue' , color : 'white', }}
                onClick={handleOpen}
            >
                icon={<AddIcon />}
                <CreatePostIcon fontSize='large'/>
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box>
                    {/*<Box sx={style}>*/}
                    <Typography id="modal-modal-title" variant="h6" component="h2" style={{marginTop:'-8px'}}>
                        Create A Post
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} style={{marginTop:'-8px'}}>
                        <label> Post: (Limit 500 Characters)</label>
                        <div>
                            <textarea
                                style={{width:'90%', height:'200px', marginTop:'5px', marginBottom:'20px', border: '2px solid #0D67B5', borderRadius:'5px'}}
                                placeholder=" Post..."
                                // maxLength="500"
                                // onInput={checkunderlimit}

                                onChange={(event) => {
                                    setPostText(event.target.value);
                                }}
                            />
                        </div>
                    </Typography>

                    <hr />

                    <Stack  spacing={2} direction="row">
                        <label>
                            <button onClick={createPost} style={{color:'#0D67B5'}}>SUBMIT</button>
                        </label>
                        <label>
                            <button onClick={handleClose} style={{color:'red'}}> CLOSE </button>
                        </label>
                    </Stack>
                </Box>
            </Modal>
        </Container>
    );

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                mt: 'calc(var(--template-frame-height, 0px) + 28px)',
            }}
        >

        <Box sx={{ width: 1 , position: 'fixed', bottom: 0, left: 0, right: 0}}>
            <BottomNavigation
                showLabels
            >
                <MakePost/>
                <BottomNavigationAction label="Add Post" icon={<AddIcon />} onClick={handleClick}/>
            </BottomNavigation>
        </Box>
        </AppBar>
    );
}

export default BottomAdd;