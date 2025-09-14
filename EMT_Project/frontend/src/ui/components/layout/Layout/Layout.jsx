import React from 'react';
import {Box, Container} from "@mui/material";
import Header from "../Header/Header.jsx";
import {Outlet} from "react-router";
import "./Layout.css";

const Layout = () => {
    return (
        <Box className="layout-box">
            <Header />
            <Box className="outlet-container" sx={{ mt: 8, px: 2 }}>
                <Outlet />
            </Box>
        </Box>
    )
}

export default Layout
