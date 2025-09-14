import React from 'react';
import {Button} from "@mui/material";
import useAuth from "../../../../hooks/useAuth.js";
import {useNavigate} from "react-router";

const AuthenticationToggle = () => {
    const {logout, isLoggedIn} = useAuth();
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleProfile = () => {
        navigate("/user");
    };

    return (
        <>
            {isLoggedIn && (
                <Button
                    color="inherit"
                    variant="text"
                    onClick={handleProfile}
                    sx={{ mr: 1 }}
                >
                    Profile
                </Button>
            )}

            <Button
                color="inherit"
                variant={!isLoggedIn ? "text" : "outlined"}
                onClick={!isLoggedIn ? handleLogin : handleLogout}
            >
                {!isLoggedIn ? "Login" : "Logout"}
            </Button>
        </>
    );
};

export default AuthenticationToggle;
