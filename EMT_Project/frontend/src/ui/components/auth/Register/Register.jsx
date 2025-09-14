import React, { useState } from 'react';
import {
    Box, TextField, Button, Typography, Container, Paper, InputLabel, Select, MenuItem, FormControl
} from '@mui/material';
import authRepository from "../../../../repository/authRepository.js";
import { useNavigate } from "react-router";

const initialFormData = {
    name: "",
    username: "",
    password: "",
    repeatPassword: "",
    email: "",
};

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        setErrorMessage("");

        if (!formData.name ||
            !formData.username || !formData.password || !formData.repeatPassword ||
            !formData.email) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        if (formData.password !== formData.repeatPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        authRepository
            .register(formData)
            .then(() => {
                console.log("The user is successfully registered.");
                setFormData(initialFormData);
                navigate("/login");
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
            <Paper elevation={3} sx={{ padding: 4, mt: 4 }}>
                <Typography variant="h5" align="center" gutterBottom>Register</Typography>
                <Box>
                    <TextField fullWidth label="First Name" name="name" margin="normal" required
                               value={formData.name} onChange={handleChange} />
                    <TextField fullWidth label="Username" name="username" margin="normal" required
                               value={formData.username} onChange={handleChange} />
                    <TextField fullWidth label="Password" name="password" type="password" margin="normal" required
                               value={formData.password} onChange={handleChange} />
                    <TextField fullWidth label="Repeat Password" name="repeatPassword" type="password" margin="normal" required
                               value={formData.repeatPassword} onChange={handleChange} />
                    <TextField fullWidth label="Email" name="email" type="email" margin="normal" required
                               value={formData.email} onChange={handleChange} />
                    {errorMessage && (
                        <Typography color="error" align="center" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
                        Register
                    </Button>
                    <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
