import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Container, Paper, Link
} from '@mui/material';
import authRepository from "../../../../repository/authRepository.js";
import { useNavigate } from "react-router";
import useAuth from "../../../../hooks/useAuth.js";

const initialFormData = {
    "username": "",
    "password": "",
};

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [errorMessage, setErrorMessage] = useState("");

    const { login } = useAuth();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        setErrorMessage(""); // clear old errors

        // ✅ simple frontend validation
        if (!formData.username.trim() || !formData.password.trim()) {
            setErrorMessage("Please fill in both username and password.");
            return;
        }

        authRepository
            .login(formData)
            .then((response) => {
                const token = response.data;
                console.log(token);
                login(token);
                navigate(`/user/${encodeURIComponent(formData.username)}`);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data);
                } else {
                    setErrorMessage("Unexpected server error. Please try again.");
                }
            });
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>Login</Typography>
                <Box>
                    <TextField
                        inputProps={{ "data-cy": "login-username" }}
                        fullWidth
                        label="Username"
                        name="username"
                        margin="normal"
                        required
                        value={formData.username}
                        onChange={handleChange}
                    />

                    <TextField
                        inputProps={{ "data-cy": "login-password" }}
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        margin="normal"
                        required
                        value={formData.password}
                        onChange={handleChange}
                    />

                    {errorMessage && (
                        <Typography data-cy="login-error" color="error" align="center" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}

                    <Button data-cy="login-submit" fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                        Login
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </Button>
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate("/forgot-password")}
                    >
                        Forgot password?
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
