import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Paper, Typography, List, ListItemButton, ListItemText, Divider, Skeleton } from "@mui/material";
import repositoryRepository from "../../../../repository/repositoryRepository.js";

const SearchResults = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const urlQ = new URLSearchParams(location.search).get("q") || "";

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState(() => location.state?.results ?? []);
    const [q, setQ] = useState(() => location.state?.q ?? urlQ);
    const [error, setError] = useState(location.state?.error ?? false);

    useEffect(() => {
        // If results not provided (direct link), fetch now
        if (!rows.length && q) {
            setLoading(true);
            repositoryRepository.searchGlobal(q)
                .then(res => setRows(res?.data ?? []))
                .catch(() => setError(true))
                .finally(() => setLoading(false));
        }
    }, [q]); // eslint-disable-line

    const onClickAttr1 = async (row) => {
        try {
            // optional verification / preload
            await repositoryRepository.searchEntityById(row.attr0, row.attr3);
        } catch (_) {
            // ignore failures; still navigate
        }
        if (row.attr3 === "U") {
            // user: attr1 is username
            navigate(`/user/${encodeURIComponent(row.attr1)}`);
        } else if (row.attr3 === "R") {
            // repo: attr0 is id
            navigate(`/repositories/${encodeURIComponent(row.attr0)}`);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto", mt: 12, px: 2, pb: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Search results for “{q}”
            </Typography>

            <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: "#eaecef" }}>
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                        <Skeleton height={36} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="error">Search failed. Please try again.</Typography>
                    </Box>
                ) : rows.length === 0 ? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">No results.</Typography>
                    </Box>
                ) : (
                    <List dense disablePadding>
                        {rows.map((r, idx) => (
                            <React.Fragment key={`${r.attr3}-${r.attr0}-${idx}`}>
                                <ListItemButton onClick={() => onClickAttr1(r)} sx={{ px: 2 }}>
                                    <ListItemText
                                        primaryTypographyProps={{ sx: { fontWeight: 600 } }}
                                        primary={r.attr1 /* username or repo name (clickable row) */}
                                        secondary={
                                            r.attr3 === "U"
                                                ? `id: ${r.attr0}  ·  email: ${r.attr2}`
                                                : `id: ${r.attr0}  ·  created at: ${r.attr2}`
                                        }
                                    />
                                </ListItemButton>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default SearchResults;
