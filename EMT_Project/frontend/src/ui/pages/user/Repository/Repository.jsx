// pages/Repository.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import UploadFileIcon from "@mui/icons-material/UploadFile";   // document-style

import {
    Box,
    Typography,
    Paper,
    Skeleton,
    Chip,
    Grid,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Breadcrumbs,
    Link as MuiLink,
    Divider,
    Avatar,
    Stack,
    IconButton,
    Tooltip,
    Alert,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import repositoryRepository from "../../../../repository/repositoryRepository.js";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRef } from "react";

// import { Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";

import { useNavigate } from "react-router-dom";
import userRepository from "../../../../repository/userRepository.js";
import {
    Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, TextField, FormControlLabel, Switch, CircularProgress
} from "@mui/material";

// put near top of Repository.jsx (below imports)
// ✅ folder check works with either `isDirectory` or `directory`
const isDir = (n) =>
    (n?.isDirectory ?? n?.directory ?? false) ||
    (Array.isArray(n?.children) && n.children.length > 0);
// ✅ children for both node objects *and* array roots
const kids = (n) => {
    if (Array.isArray(n)) return n;                 // <— handle array root
    return Array.isArray(n?.children) ? n.children : [];
};

// ✅ wrap a raw array root into a synthetic directory node
const normalizeStructure = (data) => {
    if (Array.isArray(data)) {
        return { name: "", isDirectory: true, children: data };
    }
    return data;
};

// add near other file states


const prettyLang = (x) => (x ?? "").toString().replace(/_/g, " ");

const formatDate = (d) => {
    try {
        return new Date(d).toLocaleString();
    } catch {
        return String(d ?? "—");
    }
};

const joinPath = (parts) => parts.join("/");

// Navigate the in-memory tree to the node at `pathParts`
const findNodeByPath = (root, pathParts) => {
    if (!root) return null;
    if (!pathParts || pathParts.length === 0) return root;
    let node = root;
    for (const segment of pathParts) {
        if (!isDir(node)) return null;
        node = kids(node).find((c) => c.name === segment) || null;
        if (!node) return null;
    }
    return node;
};


const Repository = () => {


    const fileInputRef = useRef(null);
    const zipInputRef = useRef(null); // <-- NEW

    const handleUploadZip = async (e) => {
        const file = e.target?.files?.[0];
        if (!file || !repo?.id) return;

        // simple validation
        const isZip =
            /\.zip$/i.test(file.name) ||
            file.type === "application/zip" ||
            file.type === "application/x-zip-compressed" ||
            file.type === "application/octet-stream";

        if (!isZip) {
            setFileError("Please select a .zip archive.");
            if (e.target) e.target.value = "";
            return;
        }

        const currentPath = path.length ? joinPath(path) : "";
        try {
            // Call your backend. If you have a dedicated method, use it:
            await repositoryRepository.uploadZipDirectory(repo.id, currentPath, file);

            // If your API expects FormData instead, use this variant:
            // const form = new FormData();
            // form.append("archive", file);
            // form.append("path", currentPath);
            // await repositoryRepository.uploadZip(repo.id, form);

            // Refresh tree
            const res = await repositoryRepository.getStructure(repo.id);
            setStructure(normalizeStructure(res?.data ?? null));
        } catch (err) {
            console.error("[upload-zip] failed:", err?.response || err);
            setFileError("Failed to upload ZIP.");
        } finally {
            if (e.target) e.target.value = ""; // reselect same file later
        }
    };


    const handleUploadFile = async (e) => {
        const file = e.target?.files?.[0];
        if (!file || !repo?.id) return;

        const currentPath = path.length ? joinPath(path) : "";
        try {
            await repositoryRepository.uploadFile(repo.id, currentPath, file);
            const res = await repositoryRepository.getStructure(repo.id);
            setStructure(res?.data ?? null);
        } catch (err) {
            console.error("Upload failed:", err?.response || err);
            setFileError("Failed to upload file.");
        } finally {
            if (e.target) e.target.value = ""; // allow re-choosing same filename
        }
    };
    const getFilenameFromDisposition = (disposition, fallback) => {
        if (!disposition) return fallback;
        // try RFC5987 filename*
        const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition);
        if (star && star[1]) return decodeURIComponent(star[1].replace(/["']/g, ""));
        // fallback to filename=
        const plain = /filename\s*=\s*("?)([^";]+)\1/i.exec(disposition);
        if (plain && plain[2]) return plain[2];
        return fallback;
    };

    const handleDownload = async () => {
        if (!filePath) return;
        try {
            const res = await repositoryRepository.downloadFile(repo.id, filePath);
            const dispo = res.headers["content-disposition"];
            const fallback = filePath.split("/").pop() || "download";
            const filename = getFilenameFromDisposition(dispo, fallback);

            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            // optional: inspect server error payload
            console.error("Download failed", e?.response || e);
            setFileError("Failed to download file.");
        }
    };


    const navigate = useNavigate();

// menu state
    const [user, setUser] = useState(null);

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPublic, setEditPublic] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

// Open the dialog prefilled with current repo values
    const openEditDialog = () => {
        setEditName(repo?.name || "");
        setEditDescription(repo?.description || "");
        setEditPublic(Boolean(repo?.isPublic));
        setEditOpen(true);
    };

// Use this instead of your old navigate-based handler
    const handleEditRepository = () => {
        closeMenu();
        openEditDialog();
    };

// Save -> call backend -> refresh page
    const handleEditSave = async () => {
        if (!editName.trim()) return;
        setEditSaving(true);
        try {
            await repositoryRepository.updateRepository(id, {
                name: editName.trim(),
                description: editDescription,
                isPublic: editPublic,
            });
            setEditOpen(false);
            window.location.assign(window.location.href);
        } catch (e) {
            console.error("Update failed", e?.response || e);
            // optionally surface an error UI here
        } finally {
            setEditSaving(false);
        }
    };

    const [collabMenuAnchor, setCollabMenuAnchor] = useState(null);
    const [collabTarget, setCollabTarget] = useState(null); // username to remove


    const [menuAnchor, setMenuAnchor] = useState(null);
    const openMenu = (e) => setMenuAnchor(e.currentTarget);
    const closeMenu = () => setMenuAnchor(null);

// delete confirm
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Add-collaborator dialog state
    const [collabOpen, setCollabOpen] = useState(false);
    const [collabQuery, setCollabQuery] = useState("");
    const [collabSearching, setCollabSearching] = useState(false);
    const [collabResults, setCollabResults] = useState([]); // [{id, username, email, avatarUrl?...}]
    const [collabSelected, setCollabSelected] = useState(null); // the picked user object
    const [collabAdding, setCollabAdding] = useState(false);
    const [collabSearchedOnce, setCollabSearchedOnce] = useState(false);
    const [collabMsg, setCollabMsg] = useState(""); // optional error/info


// 🔐 decide if this viewer can manage the repo
// TODO: wire this to your real auth (e.g., from context or repo.ownerUsername)
//     const isOwner = Boolean(user?.ownProfile);
//     let isOwner = false;

// Download whole repository (zip)
    const openCollabMenu = (event, uname) => {
        event.stopPropagation();
        setCollabTarget(uname);
        setCollabMenuAnchor(event.currentTarget);
    };

    const closeCollabMenu = () => {
        setCollabMenuAnchor(null);
        setCollabTarget(null);
    };

    const confirmRemoveCollaborator = async () => {
        if (!collabTarget) return;
        try {
            // call backend with repo.id and username
            await repositoryRepository.removeCollaborator(repo.id, collabTarget);
            // refresh collaborators list
            const res = await repositoryRepository.getCollaborators(repo.id);
            setCollabs(res?.data ?? []);
        } catch (err) {
            console.error("[remove-collaborator] failed:", err?.response || err);
            setFileError("Failed to remove collaborator.");
        } finally {
            closeCollabMenu();
        }
    };


    const handleDownloadRepository = async () => {
        closeMenu();
        try {
            const res = await repositoryRepository.downloadRepositoryZip(repo.id);
            const fileName = `${repo.name || "repository"}.zip`;
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Repo download failed", e?.response || e);
            setFileError("Failed to download repository.");
        }
    };

// Stubs – hook up real dialogs/routes when ready
//     const handleEditRepository = () => {
//         closeMenu();
//         // navigate to an edit page (or open a dialog you build)
//         navigate(`/repositories/${encodeURIComponent(username)}/${encodeURIComponent(id)}/edit`);
//     };

    const handleAddFile = () => {
        closeMenu();
        // open your "add file" dialog or route
        navigate(`/repositories/${encodeURIComponent(username)}/${encodeURIComponent(id)}/add-file`);
    };

    const handleDeleteFile = async () => {
        if (!repo?.id || !filePath) return;

        const name = filePath.split("/").pop();
        const ok = window.confirm(`Delete file "${name}"?`);
        if (!ok) return;

        try {
            // Expecting backend: DELETE /api/repositories/{repoId}/file?path=<full path>
            // and a wrapper like repositoryRepository.deleteFile(repoId, filePath)
            await repositoryRepository.deleteFile(repo.id, filePath);

            // Clear preview + refresh structure
            clearFilePreview();
            const res = await repositoryRepository.getStructure(repo.id);
            setStructure(normalizeStructure(res?.data ?? null));
        } catch (err) {
            console.error("[delete-file] failed:", err?.response || err);
            setFileError("Failed to delete file.");
        }
    };

    const searchCollaborators = async () => {
        const q = collabQuery.trim();
        setCollabSearchedOnce(true);
        setCollabMsg("");
        setCollabResults([]);
        if (!q) return;

        setCollabSearching(true);
        try {
            // 🔧 Adjust to your real API. You asked for repository calls:
            // Expecting: GET /repositories/{repoId}/search-users?username=<q>
            const res = await repositoryRepository.searchUsers(repo.id, q);
            setCollabResults(res?.data ?? []);
            if (!res?.data?.length) setCollabMsg("No users matched that username.");
        } catch (e) {
            console.error("[search-collaborators] failed:", e?.response || e);
            setCollabMsg("Search failed. Please try again.");
        } finally {
            setCollabSearching(false);
        }
    };

    const addSelectedCollaborator = async () => {
        if (!collabSelected) return;
        setCollabAdding(true);
        setCollabMsg("");
        try {
            // 🔧 Adjust to your real API shape (by username or userId).
            // Examples:
            // await repositoryRepository.addCollaborator(repo.id, collabSelected.username);
            // or:
            // await repositoryRepository.addCollaboratorById(repo.id, collabSelected.id);
            await repositoryRepository.addCollaborator(repo.id, collabSelected.username);

            // Refresh the sidebar collaborators list
            const res = await repositoryRepository.getCollaborators(repo.id);
            setCollabs(res?.data ?? []);

            setCollabOpen(false);
        } catch (e) {
            console.error("[add-collaborator] failed:", e?.response || e);
            setCollabMsg("Failed to add collaborator.");
        } finally {
            setCollabAdding(false);
        }
    };


    const handleDeleteDirectory = async () => {
        closeMenu();

        const currentPath = path.length ? joinPath(path) : "";
        if (!currentPath) {
            setFileError("Can't delete the root directory.");
            return;
        }

        const ok = window.confirm(`Delete directory "${currentPath}" and all its contents?`);
        if (!ok) return;

        try {
            await repositoryRepository.deleteDirectory(repo.id, currentPath); // <-- backend endpoint you expose
            // navigate one level up
            setPath((p) => p.slice(0, -1));
            // refresh structure
            const res = await repositoryRepository.getStructure(repo.id);
            setStructure(normalizeStructure(res?.data ?? null));
        } catch (err) {
            console.error("[delete-dir] failed:", err?.response || err);
            setFileError("Failed to delete directory.");
        }
    };


    const handleAddCollaborators = () => {
        closeMenu();
        // reset dialog state
        setCollabQuery("");
        setCollabResults([]);
        setCollabSelected(null);
        setCollabMsg("");
        setCollabSearchedOnce(false);
        setCollabOpen(true);
    };


    const openDeleteConfirm = () => {
        closeMenu();
        setConfirmOpen(true);
    };

    const cancelDelete = () => setConfirmOpen(false);

    const confirmDelete = async () => {
        try {
            await repositoryRepository.deleteRepository(repo.id);
            setConfirmOpen(false);
            // go back to the user's page (adjust to your desired landing)
            navigate(`/user/${encodeURIComponent(user.username)}`);
        } catch (e) {
            console.error("Delete failed", e?.response || e);
            setFileError("Failed to delete repository.");
            setConfirmOpen(false);
        }
    };


    const [fileMeta, setFileMeta] = useState(null); // { id, name, relativePath, extension, language }

    const { username, id } = useParams();
    const [repo, setRepo] = useState(null);
    const [loadingRepo, setLoadingRepo] = useState(true);


    const [isOwner, setIsOwner] = useState(false);
    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        repositoryRepository
            .identify(id)
            .then((res) => {
                if (cancelled) return;
                setIsOwner(Boolean(res?.data?.ownProfile));
                setUser(res?.data ?? null);
            })
            .catch(() => {
                if (!cancelled) {
                    setIsOwner(false);
                    setUser(null);
                }
            });

        return () => { cancelled = true; };
    }, [id]);


    // Right sidebar
    const [collabs, setCollabs] = useState([]);
    const [loadingCollabs, setLoadingCollabs] = useState(true);

    const [commits, setCommits] = useState([]);
    const [loadingCommits, setLoadingCommits] = useState(true);

    // Structure + navigation
    const [structure, setStructure] = useState(null);
    const [loadingStructure, setLoadingStructure] = useState(true);
    const [path, setPath] = useState([]); // array of directory names from root

    // File preview
    const [filePath, setFilePath] = useState(null); // "dir1/dir2/file.txt"
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState(null);
    const [fileContent, setFileContent] = useState("");

    let mounted = true;

    // (async () => {
    //     try {
    //         const userRes = repositoryRepository.identify(id);
    //         if (!mounted) return;
    //         const u = userRes.data;
    //         setUser(u);
    //     } catch(err) {
    //         console.log(err);
    //     }
    // })();

    // 1) Base repo load
    useEffect(() => {
        if (!id || !username) return;

        setLoadingRepo(true);
        repositoryRepository
            .getRepository(id)
            .then((res) => setRepo(res.data))
            .catch(() => setRepo(null))
            .finally(() => setLoadingRepo(false));
    }, [username, id]);


    // 2) After repo exists, fetch sidebars + structure
    useEffect(() => {
        if (!repo?.id) return;

        // collaborators
        setLoadingCollabs(true);
        repositoryRepository
            .getCollaborators(repo.id)
            .then((res) => setCollabs(res?.data ?? []))
            .finally(() => setLoadingCollabs(false));

        // commits
        setLoadingCommits(true);
        repositoryRepository
            .getCommits(repo.id)
            .then((res) => setCommits(res?.data ?? []))
            .finally(() => setLoadingCommits(false));

        // structure
        setLoadingStructure(true);
        repositoryRepository
            .getStructure(repo.id)
            .then((res) => setStructure(normalizeStructure(res?.data ?? null)))
            .finally(() => setLoadingStructure(false));
    }, [repo?.id]);

    const created = repo?.createdAt ? formatDate(repo.createdAt) : "—";

    // Current directory node from root + `path`
    const currentNode = useMemo(
        () => findNodeByPath(structure, path),
        [structure, path]
    );

    const currentChildren = useMemo(() => {
        if (!currentNode || !isDir(currentNode)) return [];
        return kids(currentNode)
            .slice()
            .sort((a, b) => {
                // folders first, then files; then by name
                if (isDir(a) !== isDir(b)) return isDir(a) ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
    }, [currentNode]);


    const goInto = (node) => {
        if (isDir(node)) {
            setPath((p) => [...p, node.name]);
            clearFilePreview();
        } else {
            openFile([...path, node.name]);
        }
    };


    const goBack = () => {
        if (path.length === 0) return;
        setPath((p) => p.slice(0, -1));
        clearFilePreview();
    };

    const goToCrumb = (index) => {
        // index = -1 means root
        if (index < 0) {
            setPath([]);
        } else {
            setPath(path.slice(0, index + 1));
        }
        clearFilePreview();
    };

    const clearFilePreview = () => {
        setFilePath(null);
        setFileContent("");
        setFileError(null);
        setFileLoading(false);
    };

    const openFile = async (parts) => {
        const p = joinPath(parts);
        setFilePath(p);
        setFileLoading(true);
        setFileError(null);
        setFileContent("");
        try {
            const { data } = await repositoryRepository.getFile(repo.id, p);
            // data is DisplayCodeFileDto
            setFileMeta({
                id: data.id,
                name: data.name,
                relativePath: data.relativePath,
                extension: data.extension,
                language: data.language,
            });
            setFileContent(data.content ?? ""); // <-- HERE: use dto.content
        } catch (e) {
            setFileError("Failed to open file.");
        } finally {
            setFileLoading(false);
        }
    };


    // Loading screen for the whole page
    if (loadingRepo) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6, px: 2 }}>
                <Skeleton variant="rounded" height={160} />
            </Box>
        );
    }

    if (!repo) {
        return (
            <Typography align="center" sx={{ mt: 8 }}>
                Repository not found.
            </Typography>
        );
    }

    return (
        <Box sx={{maxWidth: 1200, mx: "auto", mt: 6, px: 2, pb: 6}}>
            <Grid container spacing={3}>
                {/* LEFT/MIDDLE: Repo info + structure + file preview */}
                <Grid item xs={12} md={8.5}>
                    <Paper variant="outlined" sx={{p: 3, borderRadius: 2, borderColor: "#eaecef"}}>
                        {/*<Typography variant="h5" fontWeight={700}>*/}
                        {/*    {repo.name}{" "}*/}
                        {/*    <Typography component="span" color="text.secondary">*/}
                        {/*        #{repo.id}*/}
                        {/*    </Typography>*/}
                        {/*</Typography>*/}

                        <Typography variant="h5" fontWeight={700}
                                    sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
  <span>
    {repo.name} <Typography component="span" color="text.secondary">#{repo.id}</Typography>
  </span>

                            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                                <MenuItem onClick={handleDownloadRepository}>
                                    <ListItemIcon><DownloadIcon fontSize="small"/></ListItemIcon>
                                    <ListItemText>Download repository</ListItemText>
                                </MenuItem>

                                {isOwner && (
                                    <>
                                        <MenuItem onClick={handleEditRepository}>
                                            <ListItemIcon><EditIcon fontSize="small"/></ListItemIcon>
                                            <ListItemText>Edit repository</ListItemText>
                                        </MenuItem>




                                        {/*<MenuItem onClick={handleAddFile}>*/}
                                        {/*    <ListItemIcon><NoteAddIcon fontSize="small"/></ListItemIcon>*/}
                                        {/*    <ListItemText>Add file</ListItemText>*/}
                                        {/*</MenuItem>*/}

                                        <MenuItem onClick={handleAddCollaborators}>
                                            <ListItemIcon><GroupAddIcon fontSize="small"/></ListItemIcon>
                                            <ListItemText>Add collaborators</ListItemText>
                                        </MenuItem>

                                        <MenuItem onClick={openDeleteConfirm} sx={{color: "error.main"}}>
                                            <ListItemIcon><DeleteOutlineIcon fontSize="small"
                                                                             color="error"/></ListItemIcon>
                                            <ListItemText>Delete repository</ListItemText>
                                        </MenuItem>
                                    </>
                                )}
                            </Menu>

                            {/* ⋮ actions */}
                            <IconButton data-testid="repo-actions" onClick={openMenu}>
                                <MoreVertIcon/>
                            </IconButton>
                        </Typography>


                        {repo.description && (
                            <Typography sx={{mt: 1}} color="text.secondary">
                                {repo.description}
                            </Typography>
                        )}

                        <Box sx={{display: "flex", flexWrap: "wrap", gap: 1.2, mt: 2}}>
                            {repo.programmingLanguage && (
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`Language: ${prettyLang(repo.programmingLanguage)}`}
                                />
                            )}
                            <Chip
                                size="small"
                                color={repo.isPublic ? "success" : "default"}
                                variant={repo.isPublic ? "outlined" : "filled"}
                                label={repo.isPublic ? "Public" : "Private"}
                            />
                            <Chip size="small" variant="outlined" label={`Created: ${created}`}/>
                        </Box>



                        {/* STRUCTURE */}
                        <Divider sx={{my: 2}}/>
                        <Typography variant="subtitle1" sx={{mb: 1}}>
                            Repository structure
                        </Typography>

                        {loadingStructure ? (
                            <Box sx={{display: "grid", gap: 1}}>
                                <Skeleton height={40}/>
                                <Skeleton height={40}/>
                                <Skeleton height={40}/>
                            </Box>
                        ) : !structure ? (
                            <Alert severity="warning">No structure available.</Alert>
                        ) : (
                            <>
                                {/* Breadcrumbs + back */}
                                <Box sx={{display: "flex", alignItems: "center", mb: 1}}>
                                    <Tooltip title={path.length ? "Go back" : ""}>
                    <span>
                      <IconButton
                          size="small"
                          onClick={goBack}
                          disabled={path.length === 0}
                          sx={{mr: 1}}
                      >
                        <ArrowBackIcon fontSize="small"/>
                      </IconButton>
                    </span>
                                    </Tooltip>

                                    <Breadcrumbs maxItems={4} itemsAfterCollapse={2}>
                                        <MuiLink
                                            component="button"
                                            type="button"
                                            underline="hover"
                                            onClick={() => goToCrumb(-1)}
                                            sx={{fontSize: 14}}
                                        >
                                            root
                                        </MuiLink>
                                        {path.map((seg, i) => (
                                            <MuiLink
                                                key={`${seg}-${i}`}
                                                component="button"
                                                type="button"
                                                underline="hover"
                                                onClick={() => goToCrumb(i)}
                                                sx={{fontSize: 14}}
                                            >
                                                {seg}
                                            </MuiLink>
                                        ))}
                                    </Breadcrumbs>

                                </Box>
                                {isOwner && (
                                    <>
                                    <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "center",
                                        flexWrap: "wrap",      // wraps if menu is narrow
                                        px: 1,
                                        py: 0.5,
                                    }}
                                >
                                    <MenuItem
                                        sx={{ width: "auto", px: 1.5 }}
                                        onClick={() => {
                                            closeMenu();
                                            // wait a frame so the Menu fully closes, then open the picker
                                            requestAnimationFrame(() => fileInputRef.current?.click());
                                        }}
                                    >
                                        <ListItemIcon><UploadFileIcon fontSize="small"/></ListItemIcon>
                                        <ListItemText>Upload file</ListItemText>
                                    </MenuItem>

                                    <MenuItem
                                        sx={{ width: "auto", px: 1.5 }}
                                        onClick={() => {
                                            closeMenu();
                                            // wait a frame so the Menu fully closes, then open the ZIP picker
                                            requestAnimationFrame(() => zipInputRef.current?.click());
                                        }}
                                    >
                                        <ListItemIcon><UploadFileIcon fontSize="small"/></ListItemIcon>
                                        <ListItemText>Upload directory (.zip)</ListItemText>
                                    </MenuItem>

                                    <MenuItem
                                        sx={{ width: "auto", px: 1.5, color: "error.main" }}
                                        onClick={handleDeleteDirectory}
                                    >
                                        <ListItemIcon sx={{ color: "error.main" }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Delete directory</ListItemText>
                                    </MenuItem>
                                </Box>
                                        </>
                                )}

                                {/* Directory listing */}
                                {/* File preview */}
                                {filePath && (
                                    <>
                                        <Divider sx={{my: 2}}/>
                                        <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
                                            <DescriptionIcon fontSize="small"/>
                                            <Typography variant="subtitle2" sx={{fontFamily: "monospace"}}>
                                                {filePath}
                                            </Typography>
                                            <Tooltip title="Open raw">
                        <span>
                          <IconButton
                              data-testid="open-raw"
                              size="small"
                              onClick={() =>
                                  repositoryRepository.openRawInNewTab(repo.id, filePath)
                              }
                          >
                            <OpenInNewIcon fontSize="small"/>
                          </IconButton>
                        </span>
                                            </Tooltip>

                                            <Tooltip title="Download">
    <span>
      <IconButton data-testid="download-file" size="small" onClick={handleDownload}>
        <DownloadIcon fontSize="small"/>
      </IconButton>
    </span>
                                            </Tooltip>

                                            <Tooltip title="Delete">
                                                <span>
                                                 <IconButton data-testid="delete-file" size="small" onClick={handleDeleteFile}>
                                                     <DeleteOutlineIcon fontSize="small"></DeleteOutlineIcon>
                                                 </IconButton>

                                                </span>
                                            </Tooltip>
                                        </Box>

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                borderColor: "#eaecef",
                                                bgcolor: "#fafbfc",
                                                maxHeight: 420,
                                                overflow: "auto",
                                            }}
                                        >
                                            {fileLoading ? (
                                                <Box sx={{display: "grid", gap: 1}}>
                                                    <Skeleton height={24}/>
                                                    <Skeleton height={24}/>
                                                    <Skeleton height={24}/>
                                                    <Skeleton height={24}/>
                                                </Box>
                                            ) : fileError ? (
                                                <Alert severity="error">{fileError}</Alert>
                                            ) : (
                                                <pre
                                                    style={{
                                                        margin: 0,
                                                        fontFamily:
                                                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                                        fontSize: 13,
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                          {fileContent || "(empty file)"}
                        </pre>
                                            )}
                                        </Paper>
                                    </>
                                )}
                                <Divider sx={{my: 2}}/>

                                <Paper variant="outlined" sx={{borderRadius: 2, borderColor: "#eaecef"}}>

                                    <List dense disablePadding>
                                        {currentChildren.map((node) => (
                                            <ListItemButton
                                                data-testid={`node-${node.name}`}
                                                key={`${joinPath(path)}/${node.name}`}
                                                onClick={() => goInto(node)}
                                                sx={{px: 1.5}}
                                            >
                                                <ListItemIcon sx={{minWidth: 36}}>
                                                    {isDir(node) ? <FolderIcon/> : <DescriptionIcon/>}
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={node.name}
                                                    secondary={isDir(node) ? "Directory" : "File"}
                                                    primaryTypographyProps={{fontWeight: isDir(node) ? 600 : 500}}
                                                />
                                            </ListItemButton>
                                        ))}
                                        {currentChildren.length === 0 && (
                                            <Box sx={{px: 2, py: 1.5, color: "text.secondary"}}>
                                                Empty directory.
                                            </Box>
                                        )}
                                    </List>
                                </Paper>


                            </>
                        )}
                    </Paper>
                </Grid>

                {/* RIGHT SIDEBAR: Collaborators + Commits */}
                <Grid item xs={12} md={3.5}>
                    {/* Collaborators */}
                    {/* Collaborators */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "#eaecef" }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <PeopleIcon fontSize="small" />
                            <Typography variant="subtitle1">Collaborators</Typography>
                        </Stack>

                        {loadingCollabs ? (
                            <Stack spacing={1}>
                                <Skeleton variant="rounded" height={46} />
                                <Skeleton variant="rounded" height={46} />
                                <Skeleton variant="rounded" height={46} />
                            </Stack>
                        ) : collabs.length === 0 ? (
                            <Typography color="text.secondary">No collaborators.</Typography>
                        ) : (
                            <>
                                <List dense disablePadding>
                                    {collabs.map((c) => {
                                        const uname = c.username || c.name || "";
                                        return (
                                            <ListItemButton key={c.id ?? c.username} sx={{ px: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 38 }}>
                                                    <Avatar
                                                        sx={{ width: 28, height: 28 }}
                                                        src={c.avatarUrl || undefined}
                                                        alt={uname}
                                                    >
                                                        {(uname || "?").slice(0, 1).toUpperCase()}
                                                    </Avatar>
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={
                                                        uname ? (
                                                            <MuiLink
                                                                component="button"
                                                                type="button"
                                                                underline="hover"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/user/${encodeURIComponent(uname)}`);
                                                                }}
                                                                sx={{ fontWeight: 600 }}
                                                            >
                                                                {uname}
                                                            </MuiLink>
                                                        ) : (
                                                            "—"
                                                        )
                                                    }
                                                    secondary={c.email || null}
                                                />

                                                {/* Delete icon (per collaborator) */}
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={(e) => openCollabMenu(e, uname)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemButton>
                                        );
                                    })}
                                </List>

                                {/* Confirm menu */}
                                <Menu
                                    anchorEl={collabMenuAnchor}
                                    open={Boolean(collabMenuAnchor)}
                                    onClose={closeCollabMenu}
                                >
                                    <MenuItem onClick={confirmRemoveCollaborator} sx={{ color: "error.main" }}>
                                        <ListItemIcon>
                                            <DeleteOutlineIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            Yes, remove {collabTarget ? `"${collabTarget}"` : "collaborator"}
                                        </ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={closeCollabMenu}>
                                        <ListItemText>Cancel</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Paper>

                    {/* Commits */}
                    <Paper
                        variant="outlined"
                        sx={{ mt: 2, p: 2, borderRadius: 2, borderColor: "#eaecef" }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <HistoryIcon fontSize="small" />
                            <Typography variant="subtitle1">Recent commits</Typography>
                        </Stack>

                        {loadingCommits ? (
                            <Stack spacing={1}>
                                <Skeleton variant="rounded" height={54} />
                                <Skeleton variant="rounded" height={54} />
                                <Skeleton variant="rounded" height={54} />
                            </Stack>
                        ) : commits.length === 0 ? (
                            <Typography color="text.secondary">No commits.</Typography>
                        ) : (
                            <List
                                dense
                                disablePadding
                                sx={{
                                    maxHeight: 432, // ~8 rows * 54px each (adjust if you like 7 -> 378)
                                    overflowY: "auto",
                                }}
                            >
                                {commits
                                    .slice()
                                    .sort((a, b) => new Date(b.commitDate) - new Date(a.commitDate))
                                    .map((cm) => (
                                        <ListItemButton key={cm.id ?? cm.hash ?? `${cm.name}-${cm.commitDate}`}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <HistoryIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={cm.name || "(no name)"}
                                                secondary={
                                                    <>
                                                        <span>{cm.author ?? "—"}</span>
                                                        {" · "}
                                                        <span>{formatDate(cm.commitDate)}</span>
                                                    </>
                                                }
                                            />
                                        </ListItemButton>
                                    ))}
                            </List>
                        )}
                    </Paper>



                </Grid>
            </Grid>

            <Dialog open={confirmOpen} onClose={cancelDelete} maxWidth="xs" fullWidth>
                <DialogTitle>Delete repository?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{repo.name}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>No</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">Yes, delete</Button>
                </DialogActions>
            </Dialog>


            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit repository</DialogTitle>
                <DialogContent sx={{pt: 1}}>
                    <TextField
                        autoFocus
                        label="Name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        fullWidth
                        margin="dense"
                        required
                    />
                    <TextField
                        label="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        fullWidth
                        margin="dense"
                        multiline
                        minRows={3}
                    />
                    <FormControlLabel
                        sx={{mt: 1}}
                        control={
                            <Switch
                                checked={editPublic}
                                onChange={(e) => setEditPublic(e.target.checked)}
                            />
                        }
                        label={editPublic ? "Public" : "Private"}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleEditSave}
                        variant="contained"
                        disabled={!editName.trim() || editSaving}
                        startIcon={editSaving ? <CircularProgress size={16}/> : null}
                    >
                        {editSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            <input
                data-testid="upload-file-input"
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleUploadFile}
            />

            <input
                type="file"
                data-testid="upload-zip-input"
                hidden
                accept=".zip,application/zip,application/x-zip-compressed,application/octet-stream"
                ref={zipInputRef}
                onChange={handleUploadZip}
            />

            <Dialog open={collabOpen} onClose={() => setCollabOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add collaborator</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            autoFocus
                            fullWidth
                            label="Username"
                            value={collabQuery}
                            onChange={(e) => setCollabQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") searchCollaborators(); }}
                        />
                        <Button
                            variant="contained"
                            onClick={searchCollaborators}
                            disabled={collabSearching}
                            startIcon={collabSearching ? <CircularProgress size={16} /> : null}
                        >
                            {collabSearching ? "Searching..." : "Search"}
                        </Button>
                    </Stack>

                    {/* Results */}
                    <Box sx={{ mt: 2 }}>
                        {collabMsg && (
                            <Alert severity={collabResults.length ? "info" : "warning"} sx={{ mb: 1 }}>
                                {collabMsg}
                            </Alert>
                        )}

                        {collabResults.length > 0 ? (
                            <Paper variant="outlined" sx={{ borderRadius: 2, borderColor: "#eaecef" }}>
                                <List dense disablePadding>
                                    {collabResults.map((u) => {
                                        const selected = collabSelected?.id ? collabSelected.id === u.id : collabSelected?.username === u.username;
                                        return (
                                            <ListItemButton
                                                key={u.id ?? u.username}
                                                selected={selected}
                                                onClick={() => setCollabSelected(u)}
                                                sx={{ px: 1.5 }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 38 }}>
                                                    <Avatar
                                                        sx={{ width: 28, height: 28 }}
                                                        src={u.avatarUrl || undefined}
                                                        alt={u.username}
                                                    >
                                                        {(u.username || "?").slice(0, 1).toUpperCase()}
                                                    </Avatar>
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={u.username}
                                                    secondary={u.email || null}
                                                />
                                            </ListItemButton>
                                        );
                                    })}
                                </List>
                            </Paper>
                        ) : (
                            collabSearchedOnce &&
                            !collabSearching &&
                            !collabMsg && (
                                <Typography color="text.secondary">No users found.</Typography>
                            )
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCollabOpen(false)}>Cancel</Button>
                    <Button
                        onClick={addSelectedCollaborator}
                        variant="contained"
                        disabled={!collabSelected || collabAdding}
                        startIcon={collabAdding ? <CircularProgress size={16} /> : null}
                    >
                        {collabAdding ? "Adding..." : "Add collaborator"}
                    </Button>
                </DialogActions>
            </Dialog>


        </Box>
    );
};

export default Repository;
