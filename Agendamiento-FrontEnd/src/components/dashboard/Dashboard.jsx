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
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', p: 2, mt: 8, pt: 4 }}>
      <Box sx={{ maxWidth: 1200 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
          Menú Principal
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {modules.map((module) => {
            const IconComp = module.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={module.title} sx={{ display: 'flex' }}>
                <Card elevation={3} sx={{ width: '100%', minWidth: 260, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mb: 2 }}>
                      <IconComp />
                    </Avatar>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {module.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button component={Link} to={module.href} variant="contained" disableRipple disableElevation sx={{ '&:hover': { bgcolor: 'primary.main', boxShadow: 'none', color: 'inherit' } }}>
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