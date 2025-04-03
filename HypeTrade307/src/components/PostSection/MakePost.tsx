import CreatePostIcon from '@mui/icons-material/Create';
// import { Container, Button} from 'react-floating-action-button'
import React, {useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Container from "@mui/material/Container";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// const style = {
//     position: 'absolute ',
//     // top: '50%',
//     // left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '85%',
//     height :'95%',
//     bgcolor: 'background.paper',
//     border: '2px solid darkblue',
//     boxShadow: 6,
//     p: 3,
//     borderRadius: 1,
//     variant: 'contained',
// };

function MakePost(){
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
}



export default MakePost;