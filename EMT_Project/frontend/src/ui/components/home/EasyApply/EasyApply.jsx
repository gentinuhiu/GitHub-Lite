import { Grid, Box, Typography, Button } from '@mui/material'

const EasyApply = () => (
    <Box sx={{ py: 8, px: 2, width: '100%', bgcolor: 'background.paper' }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
                <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=800&q=80"
                    alt="Easy to apply"
                    sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <Box sx={{ maxWidth: 500, mx: 'auto', textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="h4" gutterBottom>
                        It’s easy to apply & land your dream job!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Register for free and explore thousands of opportunities tailored for you.
                        Start your journey today and make your next career move effortlessly.
                    </Typography>
                    <Button variant="contained" color="primary" size="large">
                        Register Now
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                        All you need is an email and password.
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    </Box>
)

export default EasyApply
