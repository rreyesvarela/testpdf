'use client';

import React, { useEffect, useState } from 'react';
import "./styles.css";
import { Box, Alert, Typography } from '@mui/material';
import InteractiveLink from './InteractiveLink';
import OrganigramaSkeleton from './OrganigramaSkeleton';

interface ManagerData {
    userId: number;
    userName: string;
    name: string;
    lastName: string;
    positionName: string;
    puestoOuId: number;
    vacantFlag: boolean;
    redFlag: boolean;
    photo64base: string;
}

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

export interface ApiResponse {
    manager: ManagerData;
    employees: EmployeeData[];
}

export type AreaType = 'revestimientos' | 'adhesivos' | 'administracion-y-finanzas' | 'recursos-humanos';

// Dynamic row generation based on available data
const generateRows = (employees: EmployeeData[]): EmployeeData[][] => {

    const rows = [];
    let startIndex = 0;

    // Create the first row with 2 items if enough employees exist
    if (employees.length >= 2) {
        rows.push(employees.slice(0, 2));
        startIndex = 2;
    }

    // Distribute remaining employees evenly across rows of 3-4 items
    const remainingEmployees = employees.slice(startIndex);
    const idealRowSize = remainingEmployees.length > 6 ? 4 : 3;

    for (let i = 0; i < remainingEmployees.length; i += idealRowSize) {
        rows.push(remainingEmployees.slice(i, i + idealRowSize));
    }

    return rows;

};

// Error component to display API errors nicely
function ErrorDisplay({ message }: { message: string }) {
    return (
        <Box sx={{ padding: 3, maxWidth: 600, margin: '0 auto' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
                Error loading organigrama data
            </Alert>
            <Typography variant="body1">
                {message || 'There was a problem loading the data. Please try again later.'}
            </Typography>
        </Box>
    );
}

// Legend component to explain the red border
function RetirementLegend() {
    return (
        <div className="organigrama_legend">
            <div className="organigrama_legend_item">
                <div className="organigrama_legend_indicator"></div>
                <span>Colaboradores próximos a jubilarse</span>
            </div>
        </div>
    );
}

export default function OrganigramaApiData({
    area,
    userIdFromStorage,
    userNameFromStorage,
    bloqueFromStorage
}: {
    area: string;
    userIdFromStorage: string | null;
    userNameFromStorage: string | null;
    bloqueFromStorage: string | null;
}) {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const routeToParam: { [key in AreaType]: string } = {
        'revestimientos': 'Rev',
        'adhesivos': 'Adh',
        'administracion-y-finanzas': 'AF',
        'recursos-humanos': 'RHH'
    };

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';

    let auxBloque = bloqueFromStorage;
    let auxUserId = userIdFromStorage;
    let auxUserName = userNameFromStorage;
    let auxArea = area;

    if (isPDF) {
        auxUserId = searchParams.get('userId');
        auxUserName = searchParams.get('userName');
        auxArea = searchParams.get('area') ?? '';
        auxBloque = searchParams.get('bloque');
    }

    // Type guard to check if area is a valid key
    const isValidArea = (value: string): value is AreaType =>
        Object.keys(routeToParam).includes(value);

    useEffect(() => {
        const fetchData = async () => {
            try {

                let response;
                if (auxBloque === '1') {
                    // For GET requests with query parameters
                    const queryParams = new URLSearchParams({
                        area: isValidArea(auxArea) ? routeToParam[auxArea] : 'Unknown',
                    });

                    response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?${queryParams.toString()}`, {
                        method: 'GET',
                    });

                } else if (auxBloque === '2') {
                    // For GET requests with query parameters
                    const queryParams = new URLSearchParams({
                        userId: auxUserId ?? '',
                        userName: auxUserName ?? ''
                    });

                    response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orgChart?${queryParams.toString()}`, {
                        method: 'GET',
                    });
                }

                if (!response || !response.ok) {
                    setError(`API error: ${response?.status} ${response?.statusText}`);
                    setLoading(false);
                    return;
                }

                const responseData = await response.json();
                // console.log('API response:', responseData);

                // Check if data has expected structure
                if (!responseData.manager || !responseData.employees) {
                    setError("Invalid data format received from API");
                    setLoading(false);
                    return;
                }

                setData(responseData);
                setLoading(false);

            } catch (err) {
                console.error('Error in OrganigramaApiData:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, [auxArea, auxUserId, auxUserName, auxBloque]);

    if (loading) {
        return <OrganigramaSkeleton />; // Or return a skeleton component
    }

    if (error || !data) {
        return <ErrorDisplay message={error || 'No data received'} />;
    }

    const employeeRows = generateRows(data.employees);

    return (
        <>
            {/* Legend */}
            <RetirementLegend />

            {/* Boss Card */}
            <div className="organigrama_top_level">
                <div className={`organigrama_card_boss ${data.manager.redFlag ? 'organigrama_highlighted' : ''}`}>
                    <div className="organigrama_photo">
                        <img src={data.manager.photo64base} alt={data.manager.name} />
                    </div>
                    <div className="organigrama_info">
                        <h3 className="organigrama_name">{data.manager.name} {data.manager.lastName}</h3>
                        <div className="organigrama_divider"></div>
                        <p className="organigrama_position">{data.manager.positionName}</p>
                    </div>
                </div>
            </div>

            {/* Dynamically generate employee rows */}
            {employeeRows.map((rowEmployees, rowIndex) => (
                <div className={`organigrama_employee_row row-${rowIndex}`} key={`row-${rowIndex}`}>
                    {rowEmployees.map((employee: EmployeeData) => (
                        <InteractiveLink
                            href={!employee.vacantFlag ? `${employee.userId}/fichaTalento?userName=${employee.userName}&positionId=${employee.puestoOuId}` : ''}
                            key={employee.userId}
                            className="organigrama_column"
                            name={employee.name}
                            lastName={employee.lastName}
                            userId={String(employee.userId)}
                            userName={employee.userName}
                            positionId={employee.puestoOuId}
                        >
                            <div className={`organigrama_card ${employee.redFlag ? 'organigrama_highlighted' : ''}`}>
                                <div className="organigrama_photo">
                                    <img src={(employee.photo64base === null || employee.photo64base === 'no photo' || employee.vacantFlag) ? "/assets/user.svg" : employee.photo64base} alt={employee.name} />
                                </div>
                                <div className="organigrama_info">
                                    <h3 className="organigrama_name">{employee.name} {employee.lastName}</h3>
                                    <div className="organigrama_divider"></div>
                                    <p className="organigrama_position">{employee.positionName}</p>
                                </div>
                            </div>
                        </InteractiveLink>
                    ))}
                </div>
            ))}
        </>
    );
}