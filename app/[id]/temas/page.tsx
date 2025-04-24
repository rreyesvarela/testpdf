'use client'
import { useEffect, useRef, useState, use } from 'react';
import { Box, Typography } from "@mui/material";
import "./styles.css";
import Link from "next/link";
import { ApiResponse, AreaType } from '../organigrama/OrganigramaApiData';

const buttonStyle: React.CSSProperties = {
    background: "#f94e01",
    color: "white",
    borderRadius: "20px",
    margin: "15px",
    width: "150px",
    boxShadow: " 0 4px 8px 2px rgba(0, 0, 0, 0.2)",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center",
};

const Menu = ({ params }: { params: Promise<{ id: string }> }) => {
    const contentRef = useRef(null);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [isCarta, setIsCarta] = useState(false);
    const [isOrganigrama, setIsOrganigrama] = useState(false);
    const resolvedParams = use(params);
    const area = resolvedParams.id;
    const routeToParam: { [key in AreaType]: string } = {
        'revestimientos': 'Rev',
        'adhesivos': 'Adh',
        'administracion-y-finanzas': 'AF',
        'recursos-humanos': 'RHH'
    };

    const isValidArea = (value: string): value is AreaType =>
        Object.keys(routeToParam).includes(value);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            setIsCarta(searchParams.get('carta') === 'true');
            setIsOrganigrama(searchParams.get('organigrama') === 'true');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryParams = new URLSearchParams({
                    area: isValidArea(area) ? routeToParam[area] : 'Unknown',
                });

                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?${queryParams.toString()}`, {
                    method: 'GET',
                });

                const responseData = await response.json();
                setData(responseData);

            } catch (err) {
                return console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, [area]);

    return (
        <Box ref={contentRef} className="menu_background">
            <Box className="menu_container">
                {!isCarta &&
                    <>
                        <Typography variant="subtitle1">Presentación de Equipo Directivo del Negocio / Área</Typography>
                        <Link style={buttonStyle} href="organigrama">Inicio</Link>
                    </>
                }
                {
                    !isOrganigrama &&
                    <>
                        <Typography variant="subtitle1">CR Director del Negocio /Área</Typography>
                        <Link style={buttonStyle} href={`${data?.manager.userId}/cartaReemplazo?userName=${data?.manager.userName}&idPuesto=${data?.manager.puestoOuId}`}>Inicio</Link>
                    </>
                }
            </Box>
        </Box>
    );
};

export default Menu;