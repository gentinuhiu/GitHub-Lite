import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, TextField, Button, Box } from '@mui/material';
import authRepository from "../../../../repository/authRepository.js";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordChange = (value) => {
        setPassword(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!password || !repeatPassword) {
            setErrorMessage("Please fill in all fields.");
            return;
        }

        if (password !== repeatPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        authRepository.resetPassword({
            token, password, repeatedPassword: repeatPassword
        })
            .then((response) => {
                // navigate("/login");
                setSuccessMessage(response.data);
            })
            .catch(error => {
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data);
                } else {
                    setErrorMessage("Unexpected server error. Please try again.");
                }
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, mt: 8 }}>
                <Typography variant="h5" align="center" gutterBottom>Reset Your Password</Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        margin="normal"
                        required
                        placeholder="Password"
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="Repeat New Password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        margin="normal"
                        required
                        placeholder="Repeat Password"
                    />
                    {/*{repeatPassword && password !== repeatPassword && (*/}
                    {/*    <Typography color="error" variant="body2" sx={{ mt: 1 }}>*/}
                    {/*        Passwords do not match*/}
                    {/*    </Typography>*/}
                    {/*)}*/}

                    {errorMessage && (
                        <Typography color="error" align="center" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    {successMessage && (
                        <Typography color="success" align="center" sx={{ mt: 2 }}>
                            {successMessage}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        sx={{ mt: 3 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : "Continue"}
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ResetPassword;
