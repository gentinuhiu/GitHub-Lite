import { Box, Grid, Typography, Paper } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import React from "react";

const HowItWorks = () => (
    <Box className={'container'} sx={{ width: '100%', bgcolor: '#fff' }}>
        <Typography variant="h4" align="center" gutterBottom color="text.primary">
            How it works
        </Typography>
        <Typography
            variant="body1"
            align="center"
            sx={{ color: 'text.secondary', mb: 6, maxWidth: 600, mx: 'auto' }}
        >
            Using our platform is simple. In just a few steps, you’ll be closer to your dream job.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
            {[
                { icon: <PersonAddIcon sx={{ fontSize: 50 }} />, title: "Sign up & upload your CV", text: "Create a free account, fill in your profile and upload your CV to get started. You can also see other users and companies profiles." },
                { icon: <WorkOutlineIcon sx={{ fontSize: 50 }} />, title: "Apply to jobs easily", text: "Browse thousands of listings and apply to positions that fit your skills. The companies may give you a questionnaire during the application." },
                { icon: <NotificationsActiveIcon sx={{ fontSize: 50 }} />, title: "Be notified by employers", text: "Get instant updates when employers view your profile or invite you to interviews. You can manage all applications at once." }
            ].map((step, i) => (
                <Grid key={i} xs={12} sm={6} md={4}>
                    <Paper elevation={4} sx={{
                        p: 0,
                        textAlign: 'center',
                        height: '100%',
                        width: 350,
                        minHeight: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 3,
                        bgcolor: '#1976d2',
                        color: '#fff'
                    }}>
                        {React.cloneElement(step.icon, { sx: { ...step.icon.props.sx, mb: 2, color: '#fff' } })}
                        <Typography variant="h6" gutterBottom>{step.title}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                            {step.text}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>
)

export default HowItWorks
