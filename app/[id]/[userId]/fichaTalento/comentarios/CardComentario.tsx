import React from 'react';
import { Card as MuiCard, CardContent, Typography, Box } from '@mui/material';

// Definición de tipos con TypeScript
interface CardProps {
  titulo: string;
  onClick: () => void;
  lengthComment?: number; // Longitud del comentario
  content: React.ReactNode;

}

const CardComentario: React.FC<CardProps> = ({ titulo, onClick, lengthComment, content }) => {
  // Procesamos el HTML para mostrar en el card
  const tituloNuevo = () => {
    switch (titulo) {
      case "MGT HS TextoEstilo":
        return "ESTILO"
      case "MGT HS TextoValores":
        return "VALORES"
      case "MGT HS TextoProcesoP":
        return "PROCESO PENSANTE"
      case "HPI Hogan":
        return "HPI"
      case "HDS Hogan":
        return "HDS"
      case "MVPI Hogan":
        return "MVPI"
    }
  }

  return (
    <MuiCard
      sx={{
        marginBottom: '16px',
        width: '100%',
        height: !lengthComment ? "160px" : "80px", // Adjust height based on lengthComment
        flex: '1 1 auto', // Allow the card to grow and share space dynamically
        display: 'flex', // Use flexbox for layout
        flexDirection: 'column', // Arrange content vertically
        justifyContent: 'space-between', // Distribute content evenly
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: "20px",
      }}
    >
      <CardContent
        sx={{
          cursor: 'pointer',
          flexGrow: 1, // Allow the content to grow and fill available space
          padding: "10px !important", // Ensure paddingBottom is removed with !important
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            textTransform: 'uppercase',
            color: '#374151',
            fontSize: '12px',
            marginBottom: '5px',
          }}
        >
          {tituloNuevo()}:
        </Typography>

        <Box
          sx={{
            paddingLeft: '1rem',
            paddingRight: '10px',
            fontSize: '10px',
            cursor: 'pointer',
            '& strong': {
              fontWeight: 'bold',
              color: '#374151',
            },
            display: '-webkit-box', // Use a flexbox-like layout for text
            WebkitBoxOrient: 'vertical', // Set the box orientation to vertical
            WebkitLineClamp: !lengthComment ? 10 : 4, // Limit to 4 lines
            overflow: 'hidden', // Hide overflowing text
            textOverflow: 'ellipsis', // Add "..." for truncated text
            whiteSpace: 'normal', // Ensure proper wrapping of text
          }}
          onClick={() => onClick()}
        >
          {content}
        </Box>
      </CardContent>
    </MuiCard>
  );
};

export default CardComentario;