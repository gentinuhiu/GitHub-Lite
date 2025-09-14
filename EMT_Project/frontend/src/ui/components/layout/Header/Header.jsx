import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Box, Button, IconButton, Toolbar, Typography, TextField, InputAdornment } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import "./Header.css";
import AuthenticationToggle from "../../auth/AuthenticationToggle/AuthenticationToggle.jsx";
import repositoryRepository from "../../../../repository/repositoryRepository.js";

// Call your repo search (adjust path inside repositoryRepository as you implemented)

const pages = [
    {"path": "/", "name": "home"},
];

const Header = () => {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    const doSearch = async () => {
        const q = query.trim();
        if (!q || searching) return;
        setSearching(true);
        try {
            // Make the GET call with the search string.
            // Implement repositoryRepository.searchGlobal to call your backend (e.g. GET /search?q=...)
            const res = await repositoryRepository.searchGlobal(q);
            const results = res?.data ?? [];
            // Navigate to a results page; pass results via state (or have the page refetch by ?q=)
            navigate(`/search?q=${encodeURIComponent(q)}`, { state: { results, q } });
        } catch {
            navigate(`/search?q=${encodeURIComponent(query)}`, { state: { results: [], q, error: true } });
        } finally {
            setSearching(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            doSearch();
        }
    };

    return (
        <Box>
            <AppBar position="fixed" sx={{ bgcolor: "#0f172a" /* navy dark gray */ }}>
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ mr: 3 }}>
                        GitHub Lite
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                        {pages.map((page) => (
                            <Link key={page.name} to={page.path} style={{ textDecoration: "none" }}>
                                <Button sx={{ my: 2, color: "white", display: "block" }}>
                                    {page.name}
                                </Button>
                            </Link>
                        ))}
                    </Box>

                    {/* Search bar */}
                    <Box sx={{ mr: 2, width: { xs: 170, sm: 240, md: 320 } }}>
                        <TextField
                            size="small"
                            fullWidth
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Search users or repos"
                            variant="outlined"
                            InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                            inputProps={{ sx: { color: '#fff' } }}
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="search"
                                            edge="end"
                                            onClick={doSearch}
                                            disabled={searching}
                                            size="small"
                                            sx={{ color: '#fff' }}
                                        >
                                            <SearchIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* ⚠️ do not touch the login/logout */}
                    <AuthenticationToggle/>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;
