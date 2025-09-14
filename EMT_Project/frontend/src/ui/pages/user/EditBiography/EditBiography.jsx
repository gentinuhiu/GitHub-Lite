import React, { useEffect, useState } from 'react'
import {
    Box, Typography, Avatar, Button, Grid, Chip, Paper, Divider, Link as MuiLink,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, IconButton
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import LinkIcon from '@mui/icons-material/Link'
import userRepository from "../../../../repository/userRepository.js"
import biographyRepository from "../../../../repository/biographyRepository.js"

const EditBiography = () => {
    const [user, setUser] = useState(null)
    const [biography, setBiography] = useState(null)
    const [interests, setInterests] = useState([])
    const [educations, setEducations] = useState([])
    const [experiences, setExperiences] = useState([])
    const [applications, setApplications] = useState([])
    const [links, setLinks] = useState([])
    const [activeTab, setActiveTab] = useState('biography')

    // Dialog states
    const [bioDialog, setBioDialog] = useState(false)
    const [newBio, setNewBio] = useState('')
    const [expDialog, setExpDialog] = useState(false)
    const [newExp, setNewExp] = useState({ id: null, title: '', company: '', description: '' })
    const [eduDialog, setEduDialog] = useState(false)
    const [newEdu, setNewEdu] = useState({ id: null, title: '', major: '', institution: '', gpa: '', type: '' })
    const [interestDialog, setInterestDialog] = useState(false)
    const [newInterest, setNewInterest] = useState('')

    useEffect(() => { loadData() }, [])

    const loadData = () => {
        Promise.all([
            userRepository.profile().then(res => setUser(res.data)),
            biographyRepository.biography().then(res => setBiography(res.data)),
            biographyRepository.interests().then(res => setInterests(res.data)),
            biographyRepository.educations().then(res => setEducations(res.data)),
            biographyRepository.experiences().then(res => setExperiences(res.data)),
            biographyRepository.links().then(res => setLinks(res.data)),
        ])
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        if (tab === 'applications' && applications.length === 0) {
            userRepository.applications().then(res => setApplications(res.data))
        }
    }

    // Handlers for creating / updating
    const saveBiography = () => {
        biographyRepository.createBiography({ description: newBio }).then(() => {
            setBioDialog(false)
            loadData()
        })
    }
    const saveExperience = () => {
        const action = newExp.id
            ? biographyRepository.updateExperience(newExp.id, newExp)
            : biographyRepository.createExperience(newExp)
        action.then(() => {
            setExpDialog(false)
            loadData()
        })
    }
    const saveEducation = () => {
        const action = newEdu.id
            ? biographyRepository.updateEducation(newEdu.id, newEdu)
            : biographyRepository.createEducation(newEdu)
        action.then(() => {
            setEduDialog(false)
            loadData()
        })
    }
    const saveInterest = () => {
        biographyRepository.addInterest(newInterest).then(() => {
            setInterestDialog(false)
            loadData()
        })
    }

    // Delete handlers (dummy)
    const deleteExperience = id => biographyRepository.deleteExperience(id).then(loadData)
    const deleteEducation = id => biographyRepository.deleteEducation(id).then(loadData)
    const deleteInterest = id => biographyRepository.deleteInterest(id).then(loadData)

    // Upload profile picture
    const uploadProfilePicture = e => {
        const file = e.target.files[0]
        if (file) {
            userRepository.uploadProfilePicture(file).then(loadData)
        }
    }

    if (!user) return <Typography align="center" sx={{ mt: 8 }}>Loading...</Typography>

    const calculateAge = (b) => {
        if (!b) return null
        const d = new Date(b), t = new Date()
        let age = t.getFullYear() - d.getFullYear()
        if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) age--
        return age
    }
    const shortGender = g => g?.toLowerCase() === 'male' ? 'M' : g?.toLowerCase() === 'female' ? 'F' : 'O'
    const age = calculateAge(user.birthday)
    const genderShort = shortGender(user.gender)

    return (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', my: 4, p: 3, bgcolor: '#fff', borderRadius: 3, boxShadow: 3 }}>
            {/* PROFILE PIC */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                    src={user.profilePicture ? `data:image/jpeg;base64,${user.profilePicture}` : '/images/profile.png'}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 1, border: '2px solid #e2e8f0' }}
                />
                <input type="file" id="upload-pic" style={{ display: 'none' }} onChange={uploadProfilePicture} />
                <Button variant="outlined" onClick={() => document.getElementById('upload-pic').click()}>
                    Upload Photo
                </Button>
                <Typography fontWeight={700} mt={1}>{user.name} {user.surname} ({age}{genderShort})</Typography>
                <Typography color="text.secondary">@{user.username}</Typography>
            </Box>

            {/* NAV */}
            <Box sx={{ display: 'flex', gap: 0.75, mt: 2, borderTop: '1px solid #e0e0e0', pt: 1 }}>
                {['biography', 'applications', 'following'].map(tab => (
                    <React.Fragment key={tab}>
                        <Button sx={{ minWidth: 'auto', p: 0, fontWeight: activeTab === tab ? 700 : 400 }}
                                onClick={() => handleTabChange(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                        {tab !== 'following' && <Typography>|</Typography>}
                    </React.Fragment>
                ))}
            </Box>

            {/* BIOGRAPHY TAB */}
            {activeTab === 'biography' && (
                <>
                    <Box mt={2}>
                        {biography?.city?.name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon fontSize="small" /><Typography>{biography.city.name}</Typography>
                            </Box>
                        )}
                        {biography?.cvPdf && (
                            <MuiLink href={`/user/cv/${user.username}`} target="_blank" underline="hover">
                                <InsertDriveFileIcon fontSize="small" /> View CV
                            </MuiLink>
                        )}
                        {links.map(link => (
                            <MuiLink key={link.url} href={link.url} target="_blank" underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinkIcon fontSize="small" /> {link.name}
                            </MuiLink>
                        ))}
                    </Box>

                    {/* DESCRIPTION */}
                    <Box mt={3}>
                        <Typography variant="h6">Biography Description</Typography>
                        {biography?.description ? (
                            <>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>{biography.description}</Typography>
                                <Button startIcon={<EditIcon />} onClick={() => { setNewBio(biography.description); setBioDialog(true) }}>Edit</Button>
                            </>
                        ) : (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setBioDialog(true)}>
                                Add Biography
                            </Button>
                        )}
                    </Box>

                    {/* INTERESTS */}
                    <Box mt={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Interests</Typography>
                            <Button startIcon={<AddIcon />} onClick={() => setInterestDialog(true)}>Add</Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {interests.map(i => (
                                <Chip
                                    key={i.id}
                                    label={i.name}
                                    color="primary"
                                    onDelete={() => deleteInterest(i.id)}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* EXPERIENCES */}
                    <Box mt={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Experiences</Typography>
                            <Button startIcon={<AddIcon />} onClick={() => { setNewExp({ id: null, title: '', company: '', description: '' }); setExpDialog(true) }}>Add</Button>
                        </Box>
                        {experiences.map(e => (
                            <Box key={e.id} sx={{
                                mt: 2, p: 2, border: '1px solid #e0e0e0', borderLeft: '4px solid #2563eb',
                                borderRadius: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }
                            }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography fontWeight={600}>{e.title} at {e.companyName}</Typography>
                                        <Typography variant="body2">{e.startDate} - {e.endDate || 'PRESENT'}</Typography>
                                        <Typography>{e.description}</Typography>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => { setNewExp({ id: e.id, title: e.title, company: e.companyName, description: e.description }); setExpDialog(true) }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => deleteExperience(e.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* EDUCATIONS */}
                    <Box mt={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Education</Typography>
                            <Button startIcon={<AddIcon />} onClick={() => { setNewEdu({ id: null, title: '', major: '', institution: '', gpa: '', type: '' }); setEduDialog(true) }}>Add</Button>
                        </Box>
                        {educations.map(ed => (
                            <Box key={ed.id} sx={{
                                mt: 2, p: 2, border: '1px solid #e0e0e0', borderLeft: '4px solid #10b981',
                                borderRadius: 2, transition: '0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }
                            }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography fontWeight={600}>{ed.title} in {ed.major}</Typography>
                                        <Typography variant="body2">{ed.institution} | GPA: {ed.gpa} | Type: {ed.educationType}</Typography>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => { setNewEdu({ id: ed.id, title: ed.title, major: ed.major, institution: ed.institution, gpa: ed.gpa, type: ed.educationType }); setEduDialog(true) }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => deleteEducation(ed.id)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {/* DIALOGS */}
            <Dialog open={bioDialog} onClose={() => setBioDialog(false)}>
                <DialogTitle>Edit Biography</DialogTitle>
                <DialogContent>
                    <TextField multiline rows={4} fullWidth value={newBio} onChange={e => setNewBio(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBioDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveBiography}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={expDialog} onClose={() => setExpDialog(false)}>
                <DialogTitle>{newExp.id ? 'Edit' : 'Add'} Experience</DialogTitle>
                <DialogContent>
                    <TextField label="Title" fullWidth sx={{ mb: 2 }} value={newExp.title} onChange={e => setNewExp({ ...newExp, title: e.target.value })} />
                    <TextField label="Company" fullWidth sx={{ mb: 2 }} value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })} />
                    <TextField label="Description" multiline rows={3} fullWidth value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExpDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveExperience}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={eduDialog} onClose={() => setEduDialog(false)}>
                <DialogTitle>{newEdu.id ? 'Edit' : 'Add'} Education</DialogTitle>
                <DialogContent>
                    <TextField label="Title" fullWidth sx={{ mb: 2 }} value={newEdu.title} onChange={e => setNewEdu({ ...newEdu, title: e.target.value })} />
                    <TextField label="Major" fullWidth sx={{ mb: 2 }} value={newEdu.major} onChange={e => setNewEdu({ ...newEdu, major: e.target.value })} />
                    <TextField label="Institution" fullWidth sx={{ mb: 2 }} value={newEdu.institution} onChange={e => setNewEdu({ ...newEdu, institution: e.target.value })} />
                    <TextField label="GPA" fullWidth sx={{ mb: 2 }} value={newEdu.gpa} onChange={e => setNewEdu({ ...newEdu, gpa: e.target.value })} />
                    <Select fullWidth value={newEdu.type} onChange={e => setNewEdu({ ...newEdu, type: e.target.value })}>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="UNIVERSITY">University</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEduDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveEducation}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={interestDialog} onClose={() => setInterestDialog(false)}>
                <DialogTitle>Add Interest</DialogTitle>
                <DialogContent>
                    <TextField label="Interest name" fullWidth value={newInterest} onChange={e => setNewInterest(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInterestDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveInterest}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default EditBiography
