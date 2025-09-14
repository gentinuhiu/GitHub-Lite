// pages/user/UserBlank.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import authRepository from "../../../../repository/authRepository.js";

const UserBlank = () => {
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await authRepository.getUser(); // expects ResponseEntity.ok(username)
                const username = (res?.data ?? "").toString().trim();

                if (cancelled) return;

                if (username) {
                    navigate(`/user/${encodeURIComponent(username)}`, { replace: true });
                } else {
                    // fallback if no username returned
                    navigate("/login", { replace: true });
                }
            } catch (e) {
                if (!cancelled) {
                    // on error, send to login (or handle however you prefer)
                    navigate("/login", { replace: true });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <Box
            sx={{
                minHeight: "60vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
            }}
        >
            <CircularProgress />
            <Typography sx={{ mt: 1 }} color="text.secondary">
                Loading your profile…
            </Typography>
        </Box>
    );
};

export default UserBlank;
