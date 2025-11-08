import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';

const modules = [
  {
    title: 'Pacientes',
    description: 'Gestiona los pacientes registrados.',
    icon: PeopleIcon,
    href: '/pacientes',
  },
  {
    title: 'Turnos',
    description: 'Gestiona los turnos agendados.',
    icon: EventAvailableIcon,
    href: '/turnos',
  },
  {
    title: 'Profesionales',
    description: 'Gestiona los profesionales médicos.',
    icon: BadgeIcon,
    href: '/profesionales',
  },
  {
    title: 'Empleados',
    description: 'Gestiona los empleados del sistema.',
    icon: WorkIcon,
    href: '/empleados',
  },
];

export default function Dashboard() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>

        <Grid container spacing={4}>
          {modules.map((module) => {
            const IconComp = module.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={module.title}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                        <IconComp sx={{ color: 'primary.contrastText' }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {module.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button component={Link} to={module.href} variant="contained" color="primary">
                      Ver {module.title}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}