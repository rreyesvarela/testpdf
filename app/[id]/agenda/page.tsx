'use client';
import NavigationCard from "@/app/components/NavigationCard";
import { Box } from "@mui/material";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type AreaType = 'revestimientos' | 'adhesivos' | 'administracion-y-finanzas' | 'recursos-humanos';

const Agenda = () => {

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isPDF = searchParams.get('isPDF') === 'true';
  const isTalento = searchParams.get('talento') === 'true';
  const isCarta = searchParams.get('carta') === 'true';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { id } = useParams<{ id: string }>();

  const routeToParam: { [key in AreaType]: string } = {
    'revestimientos': 'Rev',
    'adhesivos': 'Adh',
    'administracion-y-finanzas': 'AF',
    'recursos-humanos': 'RHH'
  };

  // Type guard to check if area is a valid key
  const isValidArea = (value: string): value is AreaType =>
    Object.keys(routeToParam).includes(value);

  useEffect(() => {
    async function fetchData() {

      setLoading(true);
      try {
        // For GET requests with query parameters
        const queryParams = new URLSearchParams({
          area: isValidArea(id) ? routeToParam[id] : 'Unknown'
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?${queryParams.toString()}`, {
          method: 'GET',
        });

        if (!response.ok) {
          setError(true);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(true);
        console.error('Error fetching app data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="agenda-app-error">
        <h2>Error al cargar los datos</h2>
        <p style={{ marginTop: '10px' }}>Ha ocurrido un problema al obtener la información. Por favor, intenta nuevamente.</p>
        <button
          className="agenda-app-retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 65px)", width: "100%", background: "#f2f2f2", gap: 15 }}>
      {
        isPDF ? isTalento &&
          <NavigationCard
            title="Talento del Negocio"
            descriptions={["Presentación del Equipo Directivo del Negocio", "CR Director del Negocio"]}
            type={0}
            loading={loading}
          /> :
          <NavigationCard
            title="Talento del Negocio"
            descriptions={["Presentación del Equipo Directivo del Negocio", "CR Director del Negocio"]}
            type={0}
            loading={loading}
          />
      }
      {
        isPDF ? isCarta &&
          <NavigationCard
            title="Cartas Reemplazo"
            descriptions={["Directores N3", "Ejecutivos N4-Clave"]}
            type={1}
            loading={loading}
          /> :
          <NavigationCard
            title="Cartas Reemplazo"
            descriptions={["Directores N3", "Ejecutivos N4-Clave"]}
            type={1}
            loading={loading}
          />
      }
    </Box>
  );
}

export default Agenda;