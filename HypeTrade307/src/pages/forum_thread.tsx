import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import {Avatar, List, ListItem, ListItemAvatar, Typography} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Post from "../components/PostSection/post.tsx";
import {ThreadContainer, PostContainer, PostUser} from "../components/PostSection/ForumElements.ts"

// TODO: Change placeholder profile pic when db sorted

import catPic from '../assets/cat_pic.jpg'
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import BottomAdd from "../components/BottomActions/BottomAdd.tsx";

//TODO: Add user specific profile badges here for the individual posts
interface Post {
    postID: number,
    postText: string,
    userEmail: string,
    userID: number,
    userName: string,
    userProfilePic: string,
    // timestamp: number,
}

interface Thread {
    id: number;
    pageTitle: string;
    posts: Post[];
}

const Thread: React.FC = () => {
    const { threadID } = useParams();
    // const navigate = useNavigate();
    const [thread, setThread] = useState<Thread | null>(null);

    const threadsData: Thread[] = [
        {
            id: 1,
            pageTitle: 'AAPL - Apple',
            posts: [
                {   postID: 8,
                    postText: "Apple is amazing. I can hear Steve Jobs speak to me when I'm sleeping...",
                    userEmail: "loony@gmail.com",
                    userID: 123456,
                    userName: "Loony Luke",
                    userProfilePic: "../../assets/react.svg",
                    // timestamp:,
                },
                {   postID: 9,
                    postText: "Everything is too expensive.",
                    userEmail: "normalPerson@gmail.com",
                    userID: 456789,
                    userName: "Normie Norm",
                    userProfilePic: "../../assets/react.svg",
                    // timestamp:,
                },
                {   postID: 10,
                    postText: "Apple is amazing. I can hear Steve Jobs speak to me when I'm sleeping...",
                    userEmail: "loony@gmail.com",
                    userID: 123456,
                    userName: "Loony Luke",
                    userProfilePic: "../../assets/react.svg",
                    // timestamp:,
                },
            ]
        },
        {
            id: 2,
            pageTitle: 'NVDA - Nvidia',
            posts: [
                {   postID: 10,
                    postText: "NVDA Dev: new chips to help with VR.",
                    userEmail: "nvdaScalper@gmail.com",
                    userID: 111111,
                    userName: "Scalper Sam",
                    userProfilePic: "/static/images/avatar/3.jpg",
                    // timestamp:,
                },
                {   postID: 11,
                    postText: "NVDA Design: Just how amazing does this look?",
                    userEmail: "nvdaShill@gmail.com",
                    userID: 222222,
                    userName: "Shill Stephen",
                    userProfilePic: "/static/images/avatar/4.jpg",
                    // timestamp:,
                },
            ]
        },
        // {
        //     id: 3,
        //     pageTitle: 'TICKER - Stocks, etc...',
        //     posts: [
        //         { id: 12, title: "Web Development", description: "A portfolio showcasing web development projects." },
        //         { id: 13, title: "Design", description: "A portfolio with some design work." }
        //     ]
        // },
    ];

    useEffect(() => {
        if (threadID) {
            const threadData = threadsData.find((t) => t.id === Number(threadID));
            setThread(threadData || null);
        }
    }, [threadID]);

    if (!thread) {
        return <div>Thread not found!</div>;
    }

    // const [postList, setPostList] = useState([]);

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            {/* Navigation bar */}
            <Navbar />

            {/* Main Content */}

            {/*<Grid></Grid>*/}

            {/*<Grid container spacing={2}>*/}
            {/*    <Grid size={4}>*/}
            {/*        <Item>size=4</Item>*/}
            {/*    </Grid>*/}
            {/*    <Grid size={8}>*/}
            {/*        <Item>size=8</Item>*/}
            {/*    </Grid>*/}
            {/*</Grid>*/}

            <Container fixed
                       sx={{
                           width: {
                               xs: 1, // theme.breakpoints.up('xs')
                               sm: 700, // theme.breakpoints.up('sm')
                               md: 800, // theme.breakpoints.up('md')
                               lg: 1000, // theme.breakpoints.up('lg')
                               xl: 1200, // theme.breakpoints.up('xl')
                           }
                        }}>
                <Box
                    sx={{
                        textAlign: "left",
                    }}>
                    <h2>{thread.pageTitle}</h2>
                </Box>
                    <div>
                        {/*<h2>Portfolio List</h2>*/}
                        {/*<List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>*/}
                        {/*<List sx={{ width: '100%', bgcolor: 'background.paper' }}>*/}
                        {/*    /!*TODO: Underneath the profile pic, the we should have the user's name*!/*/}
                        {/*    <ListItem alignItems="flex-start">*/}
                        {/*        <ListItemAvatar>*/}
                        {/*            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />*/}
                        {/*        </ListItemAvatar>*/}
                        {/*        <ListItemText*/}
                        {/*            // TODO: The primary should be the time the post was created*/}
                        {/*            primary="Date/Time of Post creation"*/}
                        {/*            secondary={*/}
                        {/*                <React.Fragment>*/}
                        {/*                    <Typography*/}
                        {/*                        component="span"*/}
                        {/*                        variant="body2"*/}
                        {/*                        sx={{ color: 'text.primary', display: 'inline' }}*/}
                        {/*                    >*/}
                        {/*                        Ali Connors - I'll be in your neighborhood doing errands this…*/}
                        {/*                    </Typography>*/}
                        {/*                </React.Fragment>*/}
                        {/*            }*/}
                        {/*        />*/}
                        {/*    </ListItem>*/}
                        {/*    <Divider variant="inset" component="li" />*/}
                        {/*    <ListItem alignItems="flex-start">*/}
                        {/*        <ListItemAvatar>*/}
                        {/*            <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />*/}
                        {/*        </ListItemAvatar>*/}
                        {/*        <ListItemText*/}
                        {/*            primary="Summer BBQ"*/}
                        {/*            secondary={*/}
                        {/*                <React.Fragment>*/}
                        {/*                    <Typography*/}
                        {/*                        component="span"*/}
                        {/*                        variant="body2"*/}
                        {/*                        sx={{ color: 'text.primary', display: 'inline' }}*/}
                        {/*                    >*/}
                        {/*                        to Scott, Alex, Jennifer*/}
                        {/*                    </Typography>*/}
                        {/*                    {" — Wish I could come, but I'm out of town this…"}*/}
                        {/*                </React.Fragment>*/}
                        {/*            }*/}
                        {/*        />*/}
                        {/*    </ListItem>*/}
                        {/*    <Divider variant="inset" component="li" />*/}
                        {/*    <ListItem alignItems="flex-start">*/}
                        {/*        <ListItemAvatar>*/}
                        {/*            <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />*/}
                        {/*        </ListItemAvatar>*/}
                        {/*        <ListItemText*/}
                        {/*            primary="Oui Oui"*/}
                        {/*            secondary={*/}
                        {/*                <React.Fragment>*/}
                        {/*                    <Typography*/}
                        {/*                        component="span"*/}
                        {/*                        variant="body2"*/}
                        {/*                        sx={{ color: 'text.primary', display: 'inline' }}*/}
                        {/*                    >*/}
                        {/*                        Sandra Adams*/}
                        {/*                    </Typography>*/}
                        {/*                    {' — Do you have Paris recommendations? Have you ever…'}*/}
                        {/*                </React.Fragment>*/}
                        {/*            }*/}
                        {/*        />*/}
                        {/*    </ListItem>*/}
                        {/*</List>*/}

                        <List sx={{ bgcolor: 'background.paper' }}>
                        {/*<List sx={{ width: '100%', bgcolor: 'background.paper' }}>*/}
                            {thread.posts.map((post, index) => (
                                <div key={index}>
                                {/*<div key={index} className="PostContainer">*/}
                                    <Post
                                        key={post.postID}
                                        postID={post.postID}
                                        postText={post.postText}
                                        userID={post.userID}
                                        userName={post.userName}
                                        userProfilePic={catPic}
                                        userEmail={post.userEmail}
                                    />
                                </div>
                            ))}
                        </List>
                    </div>
                <BottomAdd></BottomAdd>
            </Container>
        </AppTheme>
    );
};

export default Thread;