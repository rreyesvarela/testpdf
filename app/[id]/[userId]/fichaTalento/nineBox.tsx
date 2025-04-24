import React from 'react';
import { Box, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';

interface GridSelectorProps {
  position?: number;
}

const NineBox: React.FC<GridSelectorProps> = ({ 
  position = 0
}) => {
  // Validar que la posición esté entre 1 y 9
  const validPosition = position >= 1 && position <= 9 ? position : 0;

  // Mapeo para colores según fila (similar a la imagen)
  const getColorByRow = (index: number): string => {
    const row = Math.ceil(index / 3);
    if (row === 1) return '#2196f3'; // Rojo (primera fila)
    if (row === 2) return '#4caf50'; // Verde (segunda fila)
    if (row === 3) return '#f44336'; // Azul (tercera fila)
    return '#e0e0e0';
  };

  // Definir una interfaz para los elementos de la cuadrícula
  interface GridItem {
    position: number;
    selected: boolean;
    color: string;
  }

  // Crear array de 9 elementos para la cuadrícula
  const gridItems: GridItem[] = Array(9).fill(0).map((_, index) => {
    const pos = index + 1;
    
    return {
      position: pos,
      selected: pos === validPosition,
      color: getColorByRow(pos)
    };
  });

  return (
    <Box sx={{ width: '60px', height: "60px", margin: '0 auto' }}>
      <Grid container>
        {gridItems.map((item) => (
          <Grid size={4} key={item.position}>
            <Paper
              elevation={item.selected ? 3 : 1}
              sx={{
                height: "20px",
                width: "20px",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: item.selected ? item.color : 'background.paper',
                border: '1px solid #ddd',
                transition: 'all 0.3s ease'
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NineBox;