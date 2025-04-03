import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import {Avatar, Badge, Button, CardActions, Fade, ImageList,
    ImageListItem, List, ListItem, ListItemAvatar, Paper, Popper, Stack, styled, Typography} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import {PostDisplayContainer, PostUser, UserName, UserAvatar} from "./ForumElements.ts"
import Grid from "@mui/material/Grid2";
// import "./index.css"

// function Post({
//                   postid,
//                   title,
//                   location,
//                   topic,
//                   topicAuthor,
//                   postText,
//                   authorEmail,
//                   authorNickName,
//                   authorProfilePic,
//                   imageUrl,
//                   imageUrl2,
//                   imageUrl3,
//                   timestamp,
//                   likes_unused,
//                   FileURl,
//                   authorid,
//                   allowComments
//               }) {
//
//     const [open, setOpen] = React.useState(false);
//     const [anchorEl, setAnchorEl] = React.useState(null);
//     const [placement, setPlacement] = React.useState();
//     const handleClick = (newPlacement) => (event) => {
//         setAnchorEl(event.currentTarget);
//         setOpen((prev) => placement !== newPlacement || !prev);
//         setPlacement(newPlacement);
//     };
//
//     const [commentText, setCommentText] = useState("");
//     const [uid, setUid] = useState("");
//     const [commentList, setCommentList] = useState([]);
//     const commentsCollectionRef = collection(database, 'posts', postid, 'comments',)
//     const [likes, setLikes] = useState([]);
//     const [saved, setSaved] = useState([]);
//     const [hasLiked, setHasLiked] = useState(false);
//     const [hasSaved, setHasSaved] = useState(false);
//     const [commentImage, setCommentImage] = useState("");
//
//
//     const createComment = async () => {
//         await addDoc(commentsCollectionRef, {
//             commentText: commentText,
//             commentImage: commentImage,
//             commentAuthorId: auth.currentUser.uid,
//             commentAuthorEmail: auth.currentUser.email,
//             display: {
//                 nickName: auth.currentUser.displayName,
//                 profilePic: auth.currentUser.photoURL,
//             }
//         });
//         await updateDoc(doc(database, "users", getAuth().currentUser.uid), {
//             commentedPosts: arrayUnion(postid)
//         });
//         window.location.pathname = "/home";
//     };
//
//     useEffect(
//         () =>
//             onSnapshot(collection(database, "posts", postid, "likes"), (snapshot) =>
//                 setLikes(snapshot.docs)
//             ),
//         [database, postid]
//     );
//
//     useEffect(
//         () =>
//             setHasLiked(
//                 likes.findIndex((like) => like.id === getAuth().currentUser.uid) !== -1
//             ),
//         [likes]
//     );
//
//     useEffect(
//         () =>
//             onSnapshot(collection(database, "posts", postid, "savedby"), (snapshot) =>
//                 setSaved(snapshot.docs)
//             ),
//         [database, postid]
//     );
//
//     useEffect(
//         () =>
//             setHasSaved(
//                 saved.findIndex((save) => save.id === getAuth().currentUser.uid) !== -1
//             ),
//         [saved]
//     );
//
//     const [progress, setProgress] = useState(0);
//     const [beforesize, setbeforesize] = useState(0);
//     const [aftersize, setaftersize] = useState(0);
//
//     const likePost = async () => {
//         if (hasLiked) {
//             await deleteDoc(doc(database, 'posts', postid, 'likes', getAuth().currentUser.uid));
//             await updateDoc(doc(database, "users", getAuth().currentUser.uid), {
//                 likedPosts: arrayRemove(postid)
//             });
//         } else {
//             await setDoc(doc(database, "posts", postid, "likes", getAuth().currentUser.uid), {
//                 uid: getAuth().currentUser.uid,
//                 username: getAuth().currentUser.email,
//                 nickName: getAuth().currentUser.displayName,
//                 profilePic: getAuth().currentUser.photoURL,
//             });
//
//             await updateDoc(doc(database, "users", getAuth().currentUser.uid), {
//                 likedPosts: arrayUnion(postid)
//             });
//         }
//     };
//
//     const savePost = async () => {
//         if (hasSaved) {
//             await deleteDoc(doc(database, 'posts', postid, 'savedby', getAuth().currentUser.uid));
//             await updateDoc(doc(database, "users", getAuth().currentUser.uid), {
//                 savedPosts: arrayRemove(postid)
//             });
//         } else {
//             await updateDoc(doc(database, "users", getAuth().currentUser.uid), {
//                 savedPosts: arrayUnion(postid)
//             });
//             await setDoc(doc(database, "posts", postid, "savedby", getAuth().currentUser.uid), {
//                 uid: getAuth().currentUser.uid,
//                 username: getAuth().currentUser.email,
//                 nickName: getAuth().currentUser.displayName,
//                 profilePic: getAuth().currentUser.photoURL,
//             });
//         }
//     };
//
//     // useEffect(() => {
//     //     const getComments = async () => {
//     //         const data = await getDocs(commentsCollectionRef);
//     //         setCommentList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
//     //     };
//     //     getComments();
//     // });
//
//     const checkUnderLimit = (object) => {
//         if (object.target.value.length > object.target.maxLength) {
//             object.target.value = object.target.value.slice(0, object.target.maxLength)
//         }
//     }
//
//     // //directs user to post's page with more information ie. comments
//     // async function handleIndvClick() {
//     //     window.location = `/home/${postid}`;
//     // }
//
//     // async function handleProfClick() {
//     //     window.location = `/profile/${authorid}`;
//     // }
//
//     // const [themeModeForCheckTheme, setThemeModeForCheckTheme] = useState(false);
//     // const [themeEmail, setThemeEmail] = useState("");
//     // const [queriedTheme, setQueriedTheme] = useState(false);
//     // const [userOnlineStatus, setUserOnlineStatus] = useState(false);
//
//     const StyledBadge = styled(Badge)(({theme}) => ({
//         "& .MuiBadge-badge": {
//             backgroundColor: "#44b700",
//             color: "#44b700",
//             width: 12,
//             height: 12,
//             borderRadius: "50%",
//             boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
//         }
//     }));
//
//     function StatusBadgeOnline() {
//         return (
//             <StyledBadge
//                 overlap="circular"
//                 anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
//                 variant="dot"
//                 sx={{
//                     "& .MuiBadge-badge": {
//                         backgroundColor: "#44b700",
//                         color: "#44b700",
//                     }
//                 }}
//             >
//
//             </StyledBadge>
//         );
//     }
//
//     const [user, buffering, error] = useAuthState(auth);
//
//     // //get current user's email and settings data
//     // onAuthStateChanged(auth, (user) => {
//     //     if (user && !queriedTheme) {
//     //         setThemeEmail(user.email); //sets user's email to email
//     //         getUserTheme();
//     //         setQueriedTheme(true); //stops overwriting var from firebase backend
//     //     }
//     // });
//
//     return (
//         <Post>
//             <PostHeader>
//                 <PostHeaderTitle>
//                     <PostHeaderTop>
//                         <div>
//                             <h1> {title}</h1>
//                             {/*TODO: should this go underneath the title?*/}
//                             <h5> {location !== "" && location}</h5>
//                             {/*<h7> {location!== "" && location}</h7>*/}
//                         </div>
//
//                         {/*like button*/}
//                         <PostHeaderTopButtons>
//                             <div>
//                                 {hasLiked ? (
//                                     <LikeButton>
//                                         <FavoriteIcon style={{color: 'red'}}/>
//                                         <div className={"likeCounter"}>{likes.length}</div>
//                                         {/*</Button>*/}
//                                     </LikeButton>
//                                 ) : (
//                                     <LikeButton onClick={likePost} href=""> <FavoriteBorderIcon/>
//                                         <div className={"likeCounter"}>{likes.length}</div>
//                                     </LikeButton>
//                                 )}
//                             </div>
//                             {/*save button*/}
//                             <div>
//                                 {hasSaved ? (
//                                     <SaveButton onClick={savePost}>
//                                         <SavedIcon style={{color: 'blue'}}/>
//                                     </SaveButton>
//                                 ) : (
//                                     <SaveButton onClick={savePost}>
//                                         <SavedIcon/>
//                                     </SaveButton>
//                                 )}
//                             </div>
//                         </PostHeaderTopButtons>
//                     </PostHeaderTop>
//
//                     <Stack direction="row" alignItems="center" spacing={1}>
//
//                         <Avatar
//                             sx={{width: 30, height: 30}}
//
//                             src={authorProfilePic}
//
//                         />
//
//                         {userOnlineStatus ? (
//                             <StatusBadgeOnline />
//                         ) : (
//                             <StatusBadgeOffline />
//                         )
//                         }
//
//                         <Button onClick={handleProfClick}>
//                             {authorNickName}
//                         </Button>
//
//                         <div>|</div>
//                         {/*topic section*/}
//                         {topic !== "" &&
//                             <Link to={{
//                                 pathname: "/inner_topic",
//                                 state: topic,
//                                 topicAuthor: topicAuthor,
//                                 // your data array of objects
//                             }}
//                             >
//                                 {topic}
//                             </Link>
//                         }
//                     </Stack>
//                 </PostHeaderTitle>
//             </PostHeader>
//
//             <PostDisplayContainer>
//                 {/*click to go to seperate post page*/}
//                 <div onClick={handleIndvClick}>
//                     {/*post content and images*/}
//                     <NewLine>{postText}</NewLine>
//                     {imageUrl !== "" &&
//                         <ImageList sx={{width: 500, height: 200}} cols={3} rowHeight={164}>
//                             <ImageListItem>
//                                 {imageUrl !== "" &&
//                                     <img
//                                         src={`${imageUrl}?w=164&h=164&fit=crop&auto=format`}
//                                         srcSet={`${imageUrl}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
//
//                                         loading="lazy"
//                                     />
//                                 }
//                             </ImageListItem>
//                             <ImageListItem>
//                                 {imageUrl2 !== "" &&
//                                     <img
//                                         src={`${imageUrl2}?w=164&h=164&fit=crop&auto=format`}
//                                         srcSet={`${imageUrl2}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
//
//                                         loading="lazy"
//                                     />
//                                 }
//                             </ImageListItem>
//                             <ImageListItem>
//                                 {imageUrl3 !== "" &&
//                                     <img
//                                         src={`${imageUrl3}?w=164&h=164&fit=crop&auto=format`}
//                                         srcSet={`${imageUrl3}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
//
//                                         loading="lazy"
//                                     />
//                                 }
//                             </ImageListItem>
//                             {FileURl !== "" &&
//                                 <a href={FileURl}> download attached file</a>
//                             }
//                         </ImageList>
//                     }
//                 </div>
//
//                 {/*adding a comment button*/}
//
//                 <CardActions>
//                     {allowComments ? (
//                         <Button variant='outlined' color='primary' onClick={handleClick('bottom')}
//                         > Add a Comment </Button>
//                     ) : (
//                         <Button variant='outlined' color='secondary'
//                         > Comments not allowed </Button>
//                     )}
//
//                     <Popper open={open} anchorEl={anchorEl} placement={placement} transition>
//                         {({TransitionProps}) => (
//                             <Fade {...TransitionProps} timeout={350}>
//                                 <Paper>
//                                     <Typography variant="h6" component="h2" marginLeft='10px' marginTop='5px'
//                                                 width='70%'>
//                                         Add a Comment here
//                                     </Typography>
//                                     <Typography sx={{p: 2}}>
//                                         click the 'Add a Comment' button again to close
//                                         <div className="inputGp">
//                                                     <textarea
//                                                         style={{
//                                                             width: '85%',
//                                                             height: '80px',
//                                                             marginTop: '0px',
//                                                             marginBottom: '15px',
//                                                             border: '2px solid #0D67B5',
//                                                             borderRadius: '5px'
//                                                         }}
//                                                         placeholder=" Comment..."
//                                                         maxLength="140"
//                                                         onInput={checkUnderLimit}
//                                                         onChange={(event) => {
//                                                             setCommentText(event.target.value);
//                                                         }}
//                                                     />
//                                         </div>
//                                         <Stack spacing={1} direction="row">
//                                             <label>
//                                                 <Button onClick={createComment}
//                                                         style={{color: '#0D67B5'}}>SUBMIT</Button>
//                                             </label>
//                                         </Stack>
//                                     </Typography>
//                                 </Paper>
//                             </Fade>
//                         )}
//                     </Popper>
//                 </CardActions>
//                 <div
//                     align="left">{timestamp.toDate().getDate().toString() + "/" + (timestamp.toDate().getMonth() + 1).toString() + "/" + timestamp.toDate().getFullYear().toString() + " | " + timestamp.toDate().getHours().toString() + ":" + timestamp.toDate().getMinutes().toString()}</div>
//             </PostDisplayContainer>
//         </Post>
//     );
// }

//TODO: Add user specific profile badges here for the individual posts
// interface Post {
//     postID: number,
//     postText: string,
//     userEmail: string,
//     userID: number,
//     userName: string,
//     userProfilePic: string,
//     // timestamp: number,
// }
//
// interface Thread {
//     id: number;
//     pageTitle: string;
//     posts: Post[];
// }

function Post({
                  postID,
                  postText,
                  userID,
                  userName,
                  userEmail,
                  userProfilePic,
                  // timestamp,
              }) {

    // const { threadID } = useParams();
    // // const navigate = useNavigate();
    // const [thread, setThread] = useState<Thread | null>(null);
    //
    // const threadsData: Thread[] = [
    //     {
    //         id: 1,
    //         pageTitle: 'AAPL - Apple',
    //         posts: [
    //             {   postID: 8,
    //                 postText: "Apple is amazing. I can hear Steve Jobs speak to me when I'm sleeping...",
    //                 userEmail: "loony@gmail.com",
    //                 userID: 123456,
    //                 userName: "Loony Luke",
    //                 userProfilePic: "/static/images/avatar/1.jpg",
    //                 // timestamp:,
    //             },
    //             {   postID: 9,
    //                 postText: "Everything is too expensive.",
    //                 userEmail: "normalPerson@gmail.com",
    //                 userID: 456789,
    //                 userName: "Normie Norm",
    //                 userProfilePic: "/static/images/avatar/2.jpg",
    //                 // timestamp:,
    //             },
    //         ]
    //     },
    //     {
    //         id: 2,
    //         pageTitle: 'NVDA - Nvidia',
    //         posts: [
    //             {   postID: 10,
    //                 postText: "NVDA Dev: new chips to help with VR.",
    //                 userEmail: "nvdaScalper@gmail.com",
    //                 userID: 111111,
    //                 userName: "Scalper Sam",
    //                 userProfilePic: "/static/images/avatar/3.jpg",
    //                 // timestamp:,
    //             },
    //             {   postID: 11,
    //                 postText: "NVDA Design: Just how amazing does this look?",
    //                 userEmail: "nvdaShill@gmail.com",
    //                 userID: 222222,
    //                 userName: "Shill Stephen",
    //                 userProfilePic: "/static/images/avatar/4.jpg",
    //                 // timestamp:,
    //             },
    //         ]
    //     },
    //     // {
    //     //     id: 3,
    //     //     pageTitle: 'TICKER - Stocks, etc...',
    //     //     posts: [
    //     //         { id: 12, title: "Web Development", description: "A portfolio showcasing web development projects." },
    //     //         { id: 13, title: "Design", description: "A portfolio with some design work." }
    //     //     ]
    //     // },
    // ];
    //
    // useEffect(() => {
    //     if (threadID) {
    //         const threadData = threadsData.find((t) => t.id === Number(threadID));
    //         setThread(threadData || null);
    //     }
    // }, [threadID]);
    //
    // if (!thread) {
    //     return <div>Thread not found!</div>;
    // }

    return (
        //         {/*<List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>*/}
        //         <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <>
            {/*<ListItem alignItems="flex-start">*/}
                <Grid container spacing={2}>
                    <Grid size={2}>
                        <ListItem alignItems="flex-start">
                        {/*<ListItemAvatar sx={{ flexDirection: "column", justifyContent: "flex-start" }} className={"PostUser"}>*/}
                        {/*<ListItemAvatar>*/}
                        {/*<ListItemAvatar className={PostUser}>*/}
                            <PostDisplayContainer>
                                {/*<Avatar className={UserAvatar}*/}
                                {/*        variant="square"*/}
                                {/*        alt="Remy Sharp"*/}
                                {/*        src={userProfilePic}*/}
                                {/*        sx={{ width: 24, height: 24 }}*/}
                                <div>
                                <Avatar
                                    variant="square"
                                    src={userProfilePic}
                                    sx={{ width: 125, height: 125, maxWidth: 1, maxHeight: 1, flex: 1 }}
                                    // sx={{ width: 150, height: 150, maxWidth: 1, maxHeight: 1, flex: 1 }}
                                />
                                </div>
                                {/*TODO: Underneath the profile pic, the we should have the user's name*/}
                                <UserName>
                                    {userName}
                                </UserName>
                            </PostDisplayContainer>
                        </ListItem>
                    </Grid>
                    <Grid size={10}>
                        <ListItem alignItems="flex-start">
                        <ListItemText
                            // TODO: The primary should be the time the post was created
                            primary="Date/Time of Post creation"
                            secondary={postText}
                            // secondary={<React.Fragment>
                            //     <Typography
                            //
                            //         // component="span"
                            //
                            //         /*variant="body2"*/
                            //         sx={{color: 'text.primary'}}
                            //         // sx={{color: 'text.primary', display: 'inline'}}
                            //     >
                            //         {postText}
                            //     </Typography>
                            // </React.Fragment>}
                        />
                        </ListItem>
                    </Grid>
                </Grid>
            {/*</ListItem>*/}

            <Divider variant="inset" component="li"/>
        </>
    )
}

export default Post;