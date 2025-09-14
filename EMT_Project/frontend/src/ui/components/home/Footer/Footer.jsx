import { Box, Typography, Link, Container } from '@mui/material'

const Footer = () => (
    <Box sx={{ bgcolor: 'primary.main', color: '#fff', mt: 8, py: 6 }}>
        <Container maxWidth="lg">
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'space-between' },
                    textAlign: { xs: 'center', md: 'left' },
                    gap: 4
                }}
            >
                {/* Profile */}
                <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        Profile
                    </Typography>
                </Box>

                {/* Contact */}
                <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #fff', display: 'inline-block', pb: 0.5 }}>
                        Contact
                    </Typography>
                    <Typography variant="body2">Email: info@example.com</Typography>
                    <Typography variant="body2">Phone: +1 234 567 890</Typography>
                    <Typography variant="body2">1234 Main St, City, Country</Typography>
                </Box>

                {/* Company */}
                <Box sx={{ flex: '1 1 200px' }}>
                    <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #fff', display: 'inline-block', pb: 0.5 }}>
                        Company
                    </Typography>
                    <Link href="#" color="inherit" underline="hover" display="block">About Us</Link>
                    <Link href="#" color="inherit" underline="hover" display="block">Terms & Conditions</Link>
                    <Link href="#" color="inherit" underline="hover" display="block">Feedback</Link>
                </Box>

                {/* For Companies & Candidates */}
                <Box sx={{ flex: '1 1 200px' }}>
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #fff', display: 'inline-block', pb: 0.5 }}>
                            For Companies
                        </Typography>
                        <Link href="#" color="inherit" underline="hover" display="block">Learn More</Link>
                        {/*<Link href="#" color="inherit" underline="hover" display="block">Register</Link>*/}
                    </Box>
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #fff', display: 'inline-block', pb: 0.5 }}>
                            For Candidates
                        </Typography>
                        <Link href="#" color="inherit" underline="hover" display="block">Login</Link>
                        <Link href="#" color="inherit" underline="hover" display="block">Register</Link>
                    </Box>
                </Box>
            </Box>

            <Box component="hr" sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 4 }} />
            <Typography variant="body2" align="center">
                &copy; {new Date().getFullYear()} Profile. All rights reserved.
            </Typography>
        </Container>
    </Box>
)

export default Footer
