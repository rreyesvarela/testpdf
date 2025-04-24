import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ExperienceTable, { ExperienceTableProps } from './ExperienceTable';


const EmployeeProfilePage = ({ experiences }: ExperienceTableProps) => {

  // Example data - in a real app, this would come from an API


  const employeeData = {
    carrera: "Ing. Mecánico Administrador: 1999",
    posgrado: "Maestría En Administración: 2005",
    idiomas: "Inglés TOEIC 870",
    fechaNacimiento: "14/12/1976"
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {/* Header Information */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                Carrera Profesional:
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.75rem', color: 'black' }}>
                {employeeData.carrera}
              </Typography>
            </Grid>

            <Grid xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                Posgrado:
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.75rem', color: 'black' }}>
                {employeeData.posgrado}
              </Typography>
            </Grid>

            <Grid xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                Idiomas:
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.75rem', color: 'black' }}>
                {employeeData.idiomas}
              </Typography>
            </Grid>

            <Grid xs={12} md={3}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                Fecha de nacimiento:
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ fontSize: '0.75rem', color: 'black' }}>
                {employeeData.fechaNacimiento}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Experience Table Component */}
        <ExperienceTable experiences={experiences} />
      </Paper>
    </Container>
  );
};

export default EmployeeProfilePage;