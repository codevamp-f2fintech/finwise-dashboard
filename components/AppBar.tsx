// components/AppBar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    AppBar as MuiAppBar,
    Toolbar,
    Button,
    MenuItem,
    Menu,
    Typography,
    Box,
    Badge,
    IconButton,
    Avatar,
    useMediaQuery,
    Drawer,
    styled,
    List,
    ListItem,
    ListItemButton,
    Divider,
    ListItemText,
    Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/Circle";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Mock data - replace with your actual data
const pages = [
    { title: "Login", href: "/login" },
    { title: "Sign Up", href: "/signup" },
];

export default function AppBar () {
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>( null );
    const [ userMenuAnchorEl, setUserMenuAnchorEl ] = useState<null | HTMLElement>( null );
    const [ userNotificationAnchorEl, setUserNotificationAnchorEl ] = useState<null | HTMLElement>( null );
    const [ notifications, setNotifications ] = useState<any[]>( [] );
    const [ visibleNotificationsCount, setVisibleNotificationsCount ] = useState( 5 );
    const [ open, setOpen ] = useState( false );

    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery( "(max-width: 900px)" );
    const theme = useTheme();

    // Mock user data - replace with your actual authentication logic
    const [ customer, setCustomer ] = useState<any>( null );

    useEffect( () => {
        // Check if user is logged in (you'll need to implement your auth logic)
        const userInfo = typeof window !== 'undefined' ? localStorage.getItem( "customerInfo" ) : null;
        if ( userInfo )
        {
            setCustomer( JSON.parse( userInfo ) );
        }
    }, [] );

    const username = customer?.name;
    const customerId = customer?.id;

    const handleMenuOpen = ( event: React.MouseEvent<HTMLElement> ) => {
        setAnchorEl( event.currentTarget );
    };

    const handleMenuClose = () => {
        setAnchorEl( null );
    };

    const handleNotificationMenuOpen = ( event: React.MouseEvent<HTMLElement> ) => {
        setUserNotificationAnchorEl( event.currentTarget );
    };

    const handleNotificationMenuClose = () => {
        setUserNotificationAnchorEl( null );
        setVisibleNotificationsCount( 5 );
    };

    const handleUserMenuOpen = ( event: React.MouseEvent<HTMLElement> ) => {
        setUserMenuAnchorEl( event.currentTarget );
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl( null );
    };

    const handleLogout = () => {
        localStorage.clear();
        setCustomer( null );
        handleUserMenuClose();
        router.push( "/" );
    };

    const handleResetPassword = () => {
        handleUserMenuClose();
        router.push( "/reset-password" );
    };

    const toggleDrawer = ( state: boolean ) => () => setOpen( state );

    // External website URLs - update these with your actual URLs
    const externalUrls = {
        home: "https://f2fintech.com/#",
        about: "https://f2fintech.com/about-us",
        saas: "https://v0-lend-grid-powered-by-f2-fintech.vercel.app/",
        blogs: "https://f2fintech.com/blogs",
    };

    const handleExternalNavigation = ( url: string ) => {
        window.location.href = url;
    };

    const handleInternalNavigation = ( path: string ) => {
        router.push( path );
    };

    const drawerWidth = 200;
    const DrawerHeader = styled( "div" )( () => ( {
        display: "flex",
        alignItems: "center",
        padding: "5px",
        justifyContent: "flex-end",
    } ) );

    return (
        <>
            <Box sx={{ display: "flex", height: "12vh", overflowY: "hidden" }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        backgroundColor: "#eaf4f4",
                        color: theme.palette.primary.main,
                    }}
                >
                    {/* LOGO */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            width: "50%",
                        }}
                    >
                        <Toolbar
                            sx={{
                                display: "flex",
                            }}
                        >
                            <Link href="https://f2fintech.com/" passHref>
                                <Box
                                    component="img"
                                    src="f2Fintechlogo-old.png"
                                    alt="Logo"
                                    sx={{
                                        height: isMobile ? "12vh" : "auto",
                                        width: isMobile ? "auto" : "7.5vw",
                                        cursor: "pointer",
                                    }}
                                />
                            </Link>
                        </Toolbar>
                    </Box>

                    {/* Mobile Menu */}
                    <Drawer
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                                width: drawerWidth,
                                boxSizing: "border-box",
                                backgroundColor: "white",
                            },
                        }}
                        variant="temporary"
                        anchor="right"
                        open={open}
                        onClose={toggleDrawer( false )}
                    >
                        <DrawerHeader>
                            <IconButton sx={{ color: "#000" }} onClick={toggleDrawer( false )}>
                                <ChevronRightIcon />
                            </IconButton>
                        </DrawerHeader>
                        <Divider />

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.home )}
                            sx={{
                                height: "40px",
                                textTransform: "none",
                                fontSize: "3vw",
                                color: "#000",
                                fontFamily: "Poppins",
                                fontWeight: 500,
                                justifyContent: "flex-start",
                            }}
                        >
                            Home
                        </Button>

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.about )}
                            sx={{
                                height: "40px",
                                textTransform: "none",
                                fontSize: "3vw",
                                color: "#000",
                                fontFamily: "Poppins",
                                justifyContent: "flex-start",
                            }}
                        >
                            About Us
                        </Button>

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.blogs )}
                            sx={{
                                height: "40px",
                                textTransform: "none",
                                color: "#000",
                                fontSize: "3vw",
                                fontFamily: "Poppins",
                                justifyContent: "flex-start",
                            }}
                        >
                            Blogs
                        </Button>

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.saas )}
                            sx={{
                                height: "40px",
                                textTransform: "none",
                                color: "#000",
                                fontSize: "3vw",
                                fontFamily: "Poppins",
                                justifyContent: "flex-start",
                            }}
                        >
                            SAAS Products
                        </Button>

                        {/* User Menu for Mobile */}
                        {username && (
                            <>
                                <Button
                                    onClick={handleUserMenuOpen}
                                    endIcon={userMenuAnchorEl ? <ArrowDropDownIcon /> : <ChevronRightIcon />}
                                    sx={{
                                        height: "40px",
                                        textTransform: "none",
                                        fontSize: "3vw",
                                        borderRadius: "22px",
                                        justifyContent: "flex-start",
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {username.split( " " ).map( ( n: string ) => n[ 0 ] ).join( "." )}
                                </Button>

                                {Boolean( userMenuAnchorEl ) && (
                                    <List>
                                        {[ "Profile", "Favourites", "Loan Tracker", "Reset Password", "Logout" ].map( ( text ) => (
                                            <ListItem key={text} disablePadding>
                                                <ListItemButton
                                                    onClick={text === "Logout" ? handleLogout : undefined}
                                                    href={text !== "Logout" ? `/${ text.toLowerCase().split( " " ).join( "-" ) }` : "#"}
                                                >
                                                    <ListItemText primary={text} />
                                                </ListItemButton>
                                            </ListItem>
                                        ) )}
                                    </List>
                                )}
                            </>
                        )}

                        {/* {!username && pages.map( ( page ) => (
                            <Button
                                key={page.title}
                                onClick={() => handleInternalNavigation( page.href )}
                                sx={{
                                    height: "40px",
                                    textTransform: "none",
                                    fontSize: "3vw",
                                    color: "#000",
                                    fontFamily: "Poppins",
                                    justifyContent: "flex-start",
                                }}
                            >
                                {page.title}
                            </Button>
                        ) )} */}
                    </Drawer>

                    {/* Mobile Menu Icon */}
                    <IconButton
                        edge="start"
                        onClick={toggleDrawer( true )}
                        sx={{
                            display: {
                                xs: "flex",
                                md: "none",
                                color: "#2c3ce3",
                            },
                            marginRight: {
                                xs: "20px",
                                sm: "0px",
                                md: "",
                            },
                            marginLeft: {
                                sm: "80px",
                            },
                        }}
                    >
                        <MenuIcon
                            sx={{
                                fontSize: {
                                    xs: "2rem",
                                    sm: "2.5rem",
                                },
                            }}
                        />
                    </IconButton>

                    {/* Desktop Menu */}
                    <Box
                        sx={{
                            width: "120%",
                            display: { xs: "none", md: "flex" },
                            justifyContent: "flex-end",
                            alignItems: "center",
                            marginRight: "2%",
                        }}
                    >
                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.home )}
                            sx={{
                                fontSize: "1vw",
                                color: theme.palette.text.primary,
                                fontFamily: "Sans-serif",
                                fontWeight: 600,
                                ":hover": {
                                    transform: "scale(1.1)",
                                    transition: "all 300ms ease-in-out",
                                },
                            }}
                        >
                            Home
                        </Button>

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.about )}
                            sx={{
                                fontSize: "1vw",
                                color: theme.palette.text.primary,
                                fontFamily: "Sans-serif",
                                fontWeight: 600,
                                ":hover": {
                                    transform: "scale(1.1)",
                                    transition: "all 300ms ease-in-out",
                                },
                            }}
                        >
                            About Us
                        </Button>

                        <Button
                            onClick={() => handleExternalNavigation( externalUrls.blogs )}
                            sx={{
                                fontSize: "1vw",
                                color: theme.palette.text.primary,
                                fontFamily: "Sans-serif",
                                fontWeight: 600,
                                ":hover": {
                                    transform: "scale(1.1)",
                                    transition: "all 300ms ease-in-out",
                                },
                            }}
                        >
                            Blogs
                        </Button>

                        <Tooltip title="Explore our more products" arrow>
                            <Button
                                onClick={() => handleExternalNavigation( externalUrls.saas )}
                                sx={{
                                    fontSize: "1vw",
                                    color: theme.palette.text.primary,
                                    fontFamily: "Sans-serif",
                                    fontWeight: 600,
                                    ":hover": {
                                        transform: "scale(1.1)",
                                        transition: "all 300ms ease-in-out",
                                    },
                                }}
                            >
                                SAAS Products
                            </Button>
                        </Tooltip>

                        {/* User Menu for Desktop */}
                        {username && (
                            <>
                                <Button
                                    onClick={handleUserMenuOpen}
                                    endIcon={<ArrowDropDownIcon />}
                                    sx={{
                                        fontSize: "1vw",
                                        color: theme.palette.text.primary,
                                        fontFamily: "Poppins",
                                        fontWeight: 500,
                                        ":hover": {
                                            transform: "scale(1.1)",
                                            transition: "all 300ms ease-in-out",
                                        },
                                    }}
                                >
                                    {username.split( " " ).map( ( n: string ) => n[ 0 ] ).join( "." )}
                                </Button>

                                <Menu
                                    anchorEl={userMenuAnchorEl}
                                    open={Boolean( userMenuAnchorEl )}
                                    onClose={handleUserMenuClose}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                    getContentAnchorEl={null}
                                    sx={{
                                        "& .MuiPaper-root": {
                                            backgroundColor: "black",
                                        },
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => handleExternalNavigation( `${ externalUrls.home }/profile` )}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontFamily: "Poppins",
                                            fontSize: "1.2vw",
                                            lineHeight: "2vw",
                                        }}
                                    >
                                        Profile
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => handleExternalNavigation( `${ externalUrls.home }/favourites` )}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontFamily: "Poppins",
                                            fontSize: "1.2vw",
                                            lineHeight: "2vw",
                                        }}
                                    >
                                        Favourites
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => handleExternalNavigation( `${ externalUrls.home }/loan-tracker` )}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontFamily: "Poppins",
                                            fontSize: "1.2vw",
                                            lineHeight: "2vw",
                                        }}
                                    >
                                        Loan Tracker
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleResetPassword}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontFamily: "Poppins",
                                            fontSize: "1.2vw",
                                            lineHeight: "2vw",
                                        }}
                                    >
                                        Reset Password
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleLogout}
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontFamily: "sans-serif",
                                            fontSize: "1.2vw",
                                            lineHeight: "2vw",
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
}