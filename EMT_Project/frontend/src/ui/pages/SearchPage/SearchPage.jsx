import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Box, Typography, Select, MenuItem, FormControl, InputLabel, TextField,
    IconButton, Paper, Button
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import homeRepository from "../../../repository/homeRepository.js"

const SearchPage = () => {
    const location = useLocation()
    const initialState = location.state || {}
    const [type, setType] = useState(initialState.type || 'findJob')
    const [pendingType, setPendingType] = useState(initialState.type || 'findJob')
    const [cardType, setCardType] = useState(initialState.type || 'findJob')
    const [categories, setCategories] = useState([])
    const [cities, setCities] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(initialState.categoryId || '')
    const [selectedSubcategory, setSelectedSubcategory] = useState(initialState.subcategoryId || '')
    const [selectedCity, setSelectedCity] = useState('')
    const [name, setName] = useState(initialState.name || '')
    const [workType, setWorkType] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [results, setResults] = useState([])

    const params = {
        type: pendingType,
        categoryId: selectedCategory || null,
        subcategoryId: selectedSubcategory || null,
        cityId: selectedCity || null,
        name: name || null,
        workType: workType || null
    }

    useEffect(() => {
        homeRepository.index().then(res => {
            setCategories(res.data.categories || [])
            setCities(res.data.cities || [])
        });

        homeRepository.search(params)
            .then(res => {
                console.log(res.data);
                setResults(res.data || []);
                // setCardType(pendingType);
            })
            .catch(console.error)
    }, [])

    const currentSubcategories = categories.find(c => c.id === selectedCategory)?.subcategories || []

    const handleSearch = () => {
        setType(pendingType)
        homeRepository.search(params)
            .then(res => {
                console.log(res.data)
                setResults(res.data || [])
            })
            .catch(console.error)
    }

    return (
        <Box sx={{ px: 2, py: 6, fontFamily: 'Poppins, sans-serif' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Search Results
            </Typography>

            {/* === ROW 1: TYPE === */}
            <Box sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                mb: 2
            }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={pendingType} onChange={(e) => setPendingType(e.target.value)}>
                        <MenuItem value="findJob">Jobs</MenuItem>
                        <MenuItem value="findCompany">Companies</MenuItem>
                        <MenuItem value="findCandidate">Candidates</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* === ROW 2: CATEGORY + SUBCATEGORY/NAME === */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 2
            }}>
                {pendingType === 'findJob' || pendingType === 'findCompany' && (
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }}>
                        <MenuItem value="">All</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                )}

                {pendingType === 'findJob' && (
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Subcategory</InputLabel>
                        <Select value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            {currentSubcategories.map(sub => (
                                <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {(pendingType === 'findCompany' || pendingType === 'findCandidate') && (
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ minWidth: 200 }}
                    />
                )}
            </Box>

            {/* === ROW 3: ADV FILTER + SEARCH ICON === */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 2,
                mb: 4
            }}>
                {showAdvanced && (
                    <>
                        {(pendingType === 'findJob' || pendingType === 'findCompany') && (
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>City</InputLabel>
                                <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    {cities.map(city => (
                                        <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {pendingType === 'findJob' && (
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Work Type</InputLabel>
                                <Select value={workType} onChange={(e) => setWorkType(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="onsite">Onsite</MenuItem>
                                    <MenuItem value="hybrid">Hybrid</MenuItem>
                                    <MenuItem value="remote">Remote</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton onClick={() => setShowAdvanced(!showAdvanced)}>
                        <TuneIcon sx={{ color: 'primary.main' }} />
                        {showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton color="primary" onClick={handleSearch}>
                        <SearchIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* === RESULTS === */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {results.map(item => (
                    pendingType === 'findJob'
                        ? <JobCard key={item.id} job={item} />
                        : pendingType === 'findCompany'
                            ? <CompanyCard key={item.id} company={item} />
                            : <CandidateCard key={item.id} candidate={item} />
                ))}
            </Box>
        </Box>
    )
}

// CARD COMPONENTS
const JobCard = ({ job }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">{job.title}</Typography>
        <Typography variant="body2" color="text.secondary">
            Category ID: {job.categoryId} • Salary: ${job.salary}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Education: {job.educationType}
        </Typography>
        <Button sx={{ mt: 1 }} variant="contained">Apply</Button>
    </Paper>
)

const CompanyCard = ({ company }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">{company.name}</Typography>
        <Typography variant="body2" color="text.secondary">
            Industry: {company.categoryName} • City: {company.cityName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Website: {company.website}
        </Typography>
        <Button sx={{ mt: 1 }} variant="contained">View Profile</Button>
    </Paper>
)

const CandidateCard = ({ candidate }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6">{candidate.name}</Typography>
        <Typography variant="body2" color="text.secondary">
            Interested in: {candidate.categoryName}
        </Typography>
        <Button sx={{ mt: 1 }} variant="contained">Contact</Button>
    </Paper>
)

export default SearchPage
