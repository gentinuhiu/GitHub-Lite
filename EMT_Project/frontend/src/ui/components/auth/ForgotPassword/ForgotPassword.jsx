import React, { useState } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box
} from '@mui/material';
import { useNavigate } from 'react-router';
import authRepository from "../../../../repository/authRepository.js";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);

        if (!email) {
            setErrorMessage("Please enter your email");
            setIsSubmitting(false);
            return;
        }

        authRepository.forgotPassword({ email })
            .then((response) => {
                setSuccessMessage(response.data);
                setIsDisabled(true);
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data);
                } else {
                    setErrorMessage("Unexpected server error. Please try again.");
                }
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                padding: 2
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ padding: { xs: 3, sm: 4 } }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Reset Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
                        Enter your email to reset your password.
                    </Typography>

                    <form onSubmit={handleSubmit} noValidate>
                        <TextField
                            id="fp-email"
                            fullWidth
                            type="email"
                            label="Email address"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            disabled={isDisabled}
                            placeholder="you@example.com"
                        />
                        {errorMessage && (
                            <Typography id="fp-error" data-cy="fp-error" color="error" align="center" sx={{ mb: 2 }}>
                                {errorMessage}
                            </Typography>
                        )}

                        {successMessage && (
                            <Typography id="fp-success" data-cy="fp-success" color="success.main" align="center" sx={{ mb: 2 }}>
                                {successMessage}
                            </Typography>
                        )}
                        <Button
                            id="fp-submit"
                            data-cy="fp-submit"
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2 }}
                            disabled={isDisabled || isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "Continue"}
                        </Button>
                    </form>

                    <Box sx={{ mt: 2 }}>
                        <Button
                            data-cy="fp-back"
                            id="fp-back"
                            fullWidth variant="outlined" onClick={() => navigate("/login")}>
                            Back to Login
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ForgotPassword;
