'use client'

import { useRef } from 'react';
import { Box, Typography } from "@mui/material";
import SkeletonDirectores from './SkeletonDirectores';
import { useState, useEffect } from 'react';
import "./styles.css";
import Link from "next/link";
import { useParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

type AreaType = 'revestimientos' | 'adhesivos' | 'administracion-y-finanzas' | 'recursos-humanos';

interface EmployeeData {
    userId: number;
    userName: string;
    name: string;
    lastName: string;
    positionName: string;
    puestoOuId: string;
    vacantFlag: boolean;
    redFlag: boolean;
    photo64base: string;
}

interface ResponseData {
    manager: EmployeeData;
    employees: EmployeeData[];
}

const formatName = (name: string) => {
    if (!name) return '';

    // First handle the case where there's no space after a number and dot
    const processed = name.toLowerCase().replace(/(\d+\.)(\w+)/g, (match, numDot, word) => {
        return numDot + " " + word.charAt(0).toUpperCase() + word.slice(1);
    });

    // Then handle normal space-separated words
    return processed.split(' ')
        .map(word => {
            // Skip words that are just numbers or punctuation
            if (/^[\d\.\:\,\;\-]+$/.test(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
};

const DirectoresN3 = () => {
    const contentRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ResponseData | null>(null);
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

                const result = await response.json();
                setData(result);

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

    const handleClick = (employee: EmployeeData) => {
        const { name, lastName, userId, userName, puestoOuId } = employee;

        if (name) localStorage.setItem('name', name);
        if (lastName) localStorage.setItem('lastName', lastName);
        if (userId) localStorage.setItem('userIdDirectores', userId.toString());
        if (userId) localStorage.setItem('userId', userId.toString());
        if (userName) localStorage.setItem('userNameDirectores', userName);
        if (userName) localStorage.setItem('userName', userName);
        if (puestoOuId) localStorage.setItem('positionIdDirectores', puestoOuId);
        if (puestoOuId) localStorage.setItem('positionId', puestoOuId);
        window.dispatchEvent(new Event('localStorageChange'));
    };

    if (error) {
        return (
            <div className="directoresn3-app-error">
                <h2>Error al cargar los datos</h2>
                <p style={{ marginTop: '10px' }}>Ha ocurrido un problema al obtener la información. Por favor, intenta nuevamente.</p>
                <button
                    className="directoresn3-app-retry-button"
                    onClick={() => window.location.reload()}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <Box ref={contentRef} className="directoresn3-menu_background">
            <Box className="directoresn3-menu_container">
                <Box className="directoresn3-menu_header">
                    <ChevronDown size={30} color="#782D30" />
                    <Typography variant="h2" color='gray' sx={{ marginLeft: '5px' }}>Directores de Área N3</Typography>
                </Box>
                {loading ? (
                    <SkeletonDirectores />
                ) : (
                    <Box className="directoresn3-data_container">
                        {data && data.employees.map((employee: EmployeeData) => (
                            <Link key={employee.userId} onClick={() => handleClick(employee)} href={`${employee.userId}/cartaReemplazo?idPuesto=${employee.puestoOuId}&userName=${employee.userName}`} className='directoresn3-link_directores'>
                                <h3 style={{ fontWeight: 'normal' }}>{formatName(`${employee.name} ${employee.lastName}`)}</h3>
                            </Link>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    )
}

export default DirectoresN3;