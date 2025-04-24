import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Grid,
  useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Experience interface from your provided type
interface Experience {
  idEmployee: string;
  separationReason: string;
  IdExpInterna: string;
  achievements: string;
  deleted: string;
  functions: string;
  endDate: string;
  company: string;
  location: string;
  position: string;
  type: string;
  startDate: string;
}

interface Experiences {
  interna: Experience[];
  externa: Experience[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  other: any[];
}

export interface ExperienceTableProps {
  experiences: Experiences;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData?: any; // This could be typed more precisely based on the ExternalUserData type
}

// Format date helper function
const formatDate = (dateString: string): string => {
  if (dateString === "Actual") return "Actual";

  try {
    // Assuming date format is MM/DD/YYYY or similar
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateString; // Return original if parsing fails
  }
};

export default function ExperienceTable({ experiences }: ExperienceTableProps) {
  const theme = useTheme();

  // Smaller font size for the table content
  const smallFontStyle = {
    fontSize: '0.85rem',
  };

  // Header style
  const headerStyle = {
    ...smallFontStyle,
    fontWeight: 'bold',
    backgroundColor: theme.palette.grey[100],
    paddingY: 1
  };

  // Cell style
  const cellStyle = {
    ...smallFontStyle,
    paddingY: 1,
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            p: 1.5,
            color: theme.palette.primary.main,
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}
        >
          Información Personal:
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Trayectoria Interna */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: theme.palette.primary.main
            }}
          >
            Trayectoria Interna
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="internal experience table">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerStyle}>EMPRESA</TableCell>
                  <TableCell sx={headerStyle}>PUESTO</TableCell>
                  <TableCell sx={headerStyle}>FECHA INICIAL</TableCell>
                  <TableCell sx={headerStyle}>FECHA FINAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experiences.interna?.slice(0, 3).map((exp, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={cellStyle}>{exp.company}</TableCell>
                    <TableCell sx={cellStyle}>{exp.position}</TableCell>
                    <TableCell sx={cellStyle}>{formatDate(exp.startDate)}</TableCell>
                    <TableCell sx={cellStyle}>{exp.endDate === "Actual" ? "Actual" : formatDate(exp.endDate)}</TableCell>
                  </TableRow>
                ))}
                {(!experiences.interna || experiences.interna.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={cellStyle}>No hay información disponible</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Trayectoria Externa */}
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: theme.palette.primary.main
            }}
          >
            Trayectoria Externa
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table size="small" aria-label="external experience table">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerStyle}>EMPRESA</TableCell>
                  <TableCell sx={headerStyle}>PUESTO</TableCell>
                  <TableCell sx={headerStyle}>FECHA INICIAL</TableCell>
                  <TableCell sx={headerStyle}>FECHA FINAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experiences.externa?.slice(0, 3).map((exp, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={cellStyle}>{exp.company}</TableCell>
                    <TableCell sx={cellStyle}>{exp.position}</TableCell>
                    <TableCell sx={cellStyle}>{formatDate(exp.startDate)}</TableCell>
                    <TableCell sx={cellStyle}>{formatDate(exp.endDate)}</TableCell>
                  </TableRow>
                ))}
                {(!experiences.externa || experiences.externa.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={cellStyle}>No hay información disponible</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Additional information section - similar to what's in the image */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 2,
        p: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Box>
          <Typography variant="body2" component="div" sx={{ color: theme.palette.info.main, fontSize: '0.8rem' }}>
            Human Side: 19/05/2023
          </Typography>
        </Box>
        <Box>
          <Chip
            label="Matriz de Sucesión"
            size="small"
            sx={{
              backgroundColor: theme.palette.grey[200],
              borderRadius: 1,
              fontSize: '0.75rem',
              height: '24px'
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}