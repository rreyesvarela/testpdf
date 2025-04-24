'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const Report = () => {
  const pathname = usePathname();
  const report = pathname.split("/")[1];
  const router = useRouter();
  const [isPDF, setIsPDF] = useState(false);

  type AreaType = 'revestimientos' | 'adhesivos' | 'administracion-y-finanzas' | 'recursos-humanos';

  const routeToParam: { [key in AreaType]: string } = {
    'revestimientos': 'Rev',
    'adhesivos': 'Adh',
    'administracion-y-finanzas': 'AF',
    'recursos-humanos': 'RHH'
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsPDF(searchParams.get('isPDF') === 'true');
    }
  }, []);

  const descargarPDF = async () => {
    try {
      const response = await fetch(`/api/generate-pdf?area=${routeToParam[report as AreaType]}&includeAgenda=true`);
      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${report}.pdf`; // Nombre por defecto del archivo
      link.click();
    } catch (error) {
      console.error('Hubo un problema con la descarga del PDF:', error);
    }
  };

  return (
    <Box className='background'>
      <Box sx={{ paddingLeft: "150px", display: "flex", flexDirection: "column", alignContent: "center", height: "80%", justifyContent: "center", marginBottom: "400px" }}>
        <Box sx={{ marginBottom: "50px" }}>
          <Image src="/assets/grupo_lamosa.png" alt="Home Icon" width={164} height={93} />
        </Box>
        <Typography variant='h2' fontWeight={600} marginBottom="15px">2025</Typography>
        <Typography variant='h1' fontWeight={600}>Reporte Anual</Typography>
        <Typography variant='h1'>de talento</Typography>
        {!isPDF &&
          <Button sx={{ width: "200px", background: "#d50411", color: "#fff", borderRadius: "20px", textTransform: "capitalize", marginTop: "20px", boxShadow: " 0 4px 8px 2px rgba(0, 0, 0, 0.2)" }} onClick={() => router.push(`/${report}/agenda`)}>Iniciar Reporte</Button>
        }
        {!isPDF &&
          <Button sx={{ width: "200px", background: "#d50411", color: "#fff", borderRadius: "20px", textTransform: "capitalize", marginTop: "20px", boxShadow: " 0 4px 8px 2px rgba(0, 0, 0, 0.2)" }} onClick={descargarPDF}>Generar PDF</Button>
        }
      </Box>
    </Box>
  );
}

export default Report;