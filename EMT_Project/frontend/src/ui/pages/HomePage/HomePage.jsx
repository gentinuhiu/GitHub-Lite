// pages/LandingPage.jsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Link,
    Paper,
    Stack,
    Typography,
    Chip,
} from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";

const FeatureCard = ({ icon, title, children }) => (
    <Paper
        variant="outlined"
        sx={{
            p: 3,
            height: "100%",
            borderRadius: 2,
            borderColor: "#eaecef",
        }}
    >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
            </Typography>
        </Stack>
        <Typography color="text.secondary">{children}</Typography>
    </Paper>
);

export default function LandingPage() {
    return (
        <Box sx={{ bgcolor: "background.default" }}>
            {/* HERO */}
            <Box
                sx={{
                    position: "relative",
                    bgcolor: "#0f172a",
                    color: "#fff",
                    py: { xs: 10, md: 14 },
                    px: 2,
                    overflow: "hidden",
                }}
            >
                <Container maxWidth="lg">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Chip
                            label="Welcome to"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.08)",
                                color: "#fff",
                                borderRadius: "9999px",
                            }}
                        />
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: 36, sm: 44, md: 56 },
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            GitHub&nbsp;Lite
                        </Typography>
                        <Typography
                            sx={{
                                maxWidth: 760,
                                color: "rgba(255,255,255,0.85)",
                                fontSize: { xs: 16, md: 18 },
                            }}
                        >
                            A clean, focused code hosting experience. Create repositories,
                            browse directories, preview files, upload single files or ZIP
                            folders, manage collaborators, and review commits — all with a
                            streamlined UI.
                        </Typography>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{ pt: 1 }}
                        >

                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* KEY FEATURES */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                    What you can do
                </Typography>

                <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard
                            icon={<FolderIcon />}
                            title="Repository structure"
                        >
                            Navigate folders and files with breadcrumbs and a clean list view.
                            Directories appear first, then files, all alphabetically.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard
                            icon={<DescriptionIcon />}
                            title="File preview"
                        >
                            Open files inline with syntax-friendly, monospace preview. Quickly
                            open raw, download, or delete the current file.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard
                            icon={<UploadFileIcon />}
                            title="Uploads: file & ZIP"
                        >
                            Upload a single file into the current directory, or upload a
                            <em> .zip </em> to add an entire folder tree in one go.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard
                            icon={<PeopleIcon />}
                            title="Collaborators"
                        >
                            Search by username, preview results (username + email), select one
                            and add them as a collaborator in a click.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard icon={<HistoryIcon />} title="Commits">
                            See recent commits with message, author, and timestamp. Sorted
                            newest-first for quick scanning.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard icon={<SearchIcon />} title="Global search">
                            Use the header search to look across users and repositories.
                            Results return a unified list with type flags (U/R).
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard icon={<CloudDownloadIcon />} title="Download ZIP">
                            Export the entire repository as a ZIP archive, with server-side
                            generation to stay in sync with your current structure.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard icon={<EditIcon />} title="Edit repository">
                            Update repository name, description, and visibility from an
                            in-place dialog with instant refresh.
                        </FeatureCard>
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                        <FeatureCard
                            icon={
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <PublicIcon />
                                    <LockIcon />
                                </Stack>
                            }
                            title="Public & private"
                        >
                            Toggle visibility and control who sees your work. UI chips make it
                            obvious at a glance.
                        </FeatureCard>
                    </Grid>
                </Grid>
            </Container>

            {/* HOW IT WORKS */}
            <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
                    How it works
                </Typography>
                <Grid container spacing={2.5}>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                1) Create or open a repository
                            </Typography>
                            <Typography color="text.secondary">
                                Start fresh or jump into an existing project. The left panel
                                shows core info; the right panel highlights collaborators and
                                recent commits.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                2) Add files or upload a ZIP
                            </Typography>
                            <Typography color="text.secondary">
                                Upload a single file to the active directory or import a whole
                                folder tree via ZIP. The structure refreshes instantly.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                3) Manage collaborators & explore commits
                            </Typography>
                            <Typography color="text.secondary">
                                Search & add collaborators by username, and keep track of
                                changes with a clean commit feed.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Divider />

            {/* CTA */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: { xs: 3, md: 5 },
                        borderRadius: 3,
                        textAlign: "center",
                        borderColor: "#eaecef",
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        Ready to dive in?
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Try a global search or open the repositories page to get started.
                    </Typography>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="center"
                    >
                    </Stack>
                </Paper>
            </Container>

            {/* FOOTER MINI */}
            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">
                    © {new Date().getFullYear()} GitHub Lite — A streamlined code hosting
                    experience.
                </Typography>
            </Box>
        </Box>
    );
}
