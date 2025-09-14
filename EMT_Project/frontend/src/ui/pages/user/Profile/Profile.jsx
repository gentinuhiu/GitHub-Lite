import React, { useEffect, useState } from "react";
import {
    Box, Typography, Avatar, Grid, Link as MuiLink, Paper, Skeleton,
    Divider, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControlLabel, Switch, Stack, LinearProgress
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { Link as RouterLink, useParams } from "react-router-dom";
import userRepository from "../../../../repository/userRepository.js";
import repositoryRepository from "../../../../repository/repositoryRepository.js";

const ProfilePage = () => {
    const { username } = useParams();

    // ---- state must be declared before JSX uses it
    const [user, setUser] = useState(null);
    const [repos, setRepos] = useState([]);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingRepos, setLoadingRepos] = useState(true);

    // dialog + forms
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        localPath: "",
        isPublic: true,
    });
    const [zipFile, setZipFile] = useState(null);
    const [creating, setCreating] = useState(false);
    const [uploading, setUploading] = useState(false);

    // ---- helpers & handlers (inside component)
    const refetchRepos = async (uname) => {
        const res = await repositoryRepository.getAllForUser(uname);
        const data = res?.data ?? [];
        setRepos(Array.isArray(data) ? data : []);
    };

    const handleCreateChange = (e) => {
        const { name, value } = e.target;
        setCreateForm((p) => ({ ...p, [name]: value }));
    };

    const handlePublicToggle = (e) => {
        setCreateForm((p) => ({ ...p, isPublic: e.target.checked }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!createForm.name?.trim() || !user?.username) return;

        try {
            setCreating(true);
            await repositoryRepository.create({
                name: createForm.name.trim(),
                description: createForm.description?.trim() || "",
                localPath: createForm.localPath?.trim() || "",
                isPublic: !!createForm.isPublic,
            });
            await refetchRepos(user.username);
            setOpenAddDialog(false);
            setCreateForm({ name: "", description: "", localPath: "", isPublic: true });
        } finally {
            setCreating(false);
        }
    };

    const handleZipPick = (e) => {
        const f = e.target.files?.[0];
        setZipFile(f ?? null);
    };

    const handleZipUpload = async () => {
        if (!zipFile || !user?.username) return;
        try {
            setUploading(true);
            await repositoryRepository.uploadZip(zipFile);
            await refetchRepos(user.username);
            setOpenAddDialog(false);
            setZipFile(null);
        } finally {
            setUploading(false);
        }
    };

    // ---- data load
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const userRes = await userRepository.profile(username);
                if (!mounted) return;
                const u = userRes.data;
                setUser(u);

                const reposRes = await repositoryRepository.getAllForUser(u.username);
                if (!mounted) return;
                const data = reposRes?.data ?? reposRes ?? [];
                setRepos(Array.isArray(data) ? data : []);
            } catch {
                if (!mounted) return;
                setRepos([]);
            } finally {
                if (!mounted) return;
                setLoadingUser(false);
                setLoadingRepos(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [username]); // include username so it refetches when route changes

    if (loadingUser) {
        return (
            <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6, px: 2 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3}>
                        <Skeleton variant="circular" width={220} height={220} />
                        <Skeleton width="80%" sx={{ mt: 2 }} />
                        <Skeleton width="60%" />
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <Skeleton width="30%" height={40} />
                        <Skeleton width="50%" />
                        <Skeleton width="100%" height={120} sx={{ mt: 3 }} />
                        <Skeleton width="100%" height={120} sx={{ mt: 2 }} />
                        <Skeleton width="100%" height={120} sx={{ mt: 2 }} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (!user) {
        return (
            <Typography align="center" sx={{ mt: 8 }}>
                Couldn’t load profile.
            </Typography>
        );
    }

    const blankAvatarUrl = "https://via.placeholder.com/440x440.png?text=%20";

    return (
        <Box sx={{ maxWidth: 1100, mx: "auto", mt: 6, px: 2, pb: 6 }}>
            <Grid container spacing={4}>
                {/* LEFT: Avatar + Basic Info */}
                <Grid item xs={12} md={3}>
                    <Box sx={{ position: "sticky", top: 24 }}>
                        <Avatar
                            src={blankAvatarUrl}
                            alt="Profile"
                            sx={{
                                width: { xs: 180, md: 220 },
                                height: { xs: 180, md: 220 },
                                border: "1px solid #eaecef",
                                bgcolor: "#fff",
                            }}
                            imgProps={{ referrerPolicy: "no-referrer" }}
                        />
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                            {user.username}
                        </Typography>

                        {user.email && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                <EmailIcon fontSize="small" />
                                <Typography>{user.email}</Typography>
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />
                        <Chip
                            variant="outlined"
                            icon={<FolderOpenIcon />}
                            label={`${repos.length} Repositories`}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>
                </Grid>

                {/* RIGHT: Repository list */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <FolderOpenIcon fontSize="small" /> Repositories
                        </Typography>

                        {user?.ownProfile && (
                            <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
                                Add repository
                            </Button>
                        )}
                    </Box>

                    {loadingRepos ? (
                        <Box sx={{ display: "grid", gap: 2 }}>
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                            <Skeleton variant="rounded" height={120} />
                        </Box>
                    ) : repos.length === 0 ? (
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: "#eaecef", bgcolor: "#fafbfc" }}>
                            <Typography color="text.secondary">This user doesn’t have any public repositories yet.</Typography>
                        </Paper>
                    ) : (
                        <Box sx={{ display: "grid", gap: 2 }}>
                            {repos.map((repo) => {
                                const repoId = String(repo.id);
                                const to = `/repositories/${encodeURIComponent(repoId)}`;

                                return (
                                    <Paper
                                        key={repo.id ?? repo.name}
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            borderColor: "#eaecef",
                                            transition: "box-shadow .15s ease, transform .15s ease",
                                            "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
                                        }}
                                    >
                                        {/* Name (link) */}
                                        <MuiLink
                                            component={RouterLink}
                                            to={to}
                                            underline="hover"
                                            sx={{ fontSize: 18, fontWeight: 700, color: "#0969da", display: "inline-block" }}
                                        >
                                            {repo.name || `repo-${repo.id}`}
                                        </MuiLink>

                                        {/* Description (also clickable) */}
                                        {repo.description && (
                                            <MuiLink component={RouterLink} to={to} underline="none" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
                                                {repo.description}
                                            </MuiLink>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* ----- MOVE THE DIALOG INSIDE THE COMPONENT (below) ----- */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add repository</DialogTitle>
                <DialogContent dividers>
                    {/* Section A: Create via fields */}
                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Create via details
                    </Typography>

                    <Box component="form" onSubmit={handleCreateSubmit}>
                        <Stack spacing={2}>
                            <TextField label="Name" name="name" value={createForm.name} onChange={handleCreateChange} required fullWidth />
                            <TextField label="Description" name="description" value={createForm.description} onChange={handleCreateChange} fullWidth multiline minRows={2} />
                            <TextField label="Local path" name="localPath" value={createForm.localPath} onChange={handleCreateChange} fullWidth placeholder="e.g., C:/code/my-repo" />
                            <FormControlLabel control={<Switch checked={createForm.isPublic} onChange={handlePublicToggle} />} label={createForm.isPublic ? "Public" : "Private"} />
                        </Stack>

                        {creating && <LinearProgress sx={{ mt: 2 }} />}
                        <DialogActions sx={{ px: 0, mt: 1 }}>
                            <Button onClick={() => setOpenAddDialog(false)} disabled={creating || uploading}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={creating || uploading}>Create</Button>
                        </DialogActions>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Section B: Upload ZIP */}
                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                        Or upload a ZIP
                    </Typography>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button variant="outlined" component="label" disabled={creating || uploading}>
                            Choose ZIP
                            <input type="file" accept=".zip" hidden onChange={handleZipPick} />
                        </Button>
                        <Typography sx={{ flex: 1 }} noWrap>
                            {zipFile ? zipFile.name : "No file selected"}
                        </Typography>
                        <Button variant="contained" onClick={handleZipUpload} disabled={!zipFile || creating || uploading}>
                            Upload
                        </Button>
                    </Stack>

                    {uploading && <LinearProgress sx={{ mt: 2 }} />}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;
