"use client";

import React, { useState, useEffect } from "react";
import "./styles.css";
import PdiSkeleton from "./PdiSkeleton";
import { Box, IconButton } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { decode } from 'html-entities';
import { useParams } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { is } from "date-fns/locale";

export default function AnalisisPuestoVsPersonaPage() {

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';

    const { id } = useParams(); // Extract the dynamic route parameter [id]
    const ID = Array.isArray(id) ? id[0] : id || ''; // Handle the extracted parameter
    let userIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    if (isPDF) {
        userIdFromStorage = searchParams.get('userId');
    }

    const USERID = userIdFromStorage || '';

    interface PdiItem {
        pdiId: number;
        objectiveId: number;
        title: string;
        approveDate: string; // ISO date string
        totalProgress: number;
        successPhoto: string;
        developmentPriority: string;
        dueDate: string; // ISO date string
        developmentAction: string;
        actionProgress: number;
        comment: string;
    }

    const [data, setData] = useState<PdiItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalProgress, setTotalProgress] = useState(0);

    useEffect(() => {

        async function fetchData() {

            // Validación de parámetros requeridos
            if (!USERID) {
                window.location.href = `/${ID}/organigrama`;
                return;
            }

            setLoading(true);
            try {
                // You can add query parameters if needed
                const queryParams = new URLSearchParams({
                    userId: Array.isArray(USERID) ? USERID[0] : USERID,
                });

                const response = await fetch(`/api/pdi?${queryParams.toString()}`);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const result = await response.json();
                setData(result.data.pdi);

                // Calculate total progress
                if (result.data.pdi && result.data.pdi.length > 0) {
                    // Use the totalProgress value from the first item
                    setTotalProgress(result.data.pdi[0].totalProgress);
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data');
                console.error('Error fetching app data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Format date to display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Group data by objectiveId
    const groupDataByObjective = () => {
        const groupedData: { [key: number]: PdiItem[] } = {};
        data.forEach(item => {
            if (!groupedData[item.objectiveId]) {
                groupedData[item.objectiveId] = [];
            }
            groupedData[item.objectiveId].push(item);
        });
        return groupedData;
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
                <div className="skeleton_container">
                    <PdiSkeleton />
                </div>
            </Box>
        );
    }

    if (error) {
        return (
            <div className="app-error">
                <h2>Error al cargar los datos</h2>
                <p style={{ marginTop: '10px' }}>Ha ocurrido un problema al obtener la información. Por favor, intenta nuevamente.</p>
                <button
                    className="app-retry-button"
                    onClick={() => window.location.reload()}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const groupedData = groupDataByObjective();

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
            <div className="pdi-container">

                {/* back button */}
                <Box sx={{ display: "flex", justifyContent: "left", alignItems: 'center', alignContent: 'center', flexDirection: "row", marginBottom: "20px" }}>

                    {/* back button */}
                    {!isPDF &&
                        <IconButton onClick={() => window.history.back()} sx={{ color: "#616161", fontSize: "16px", border: "1px solid #616161", padding: "5px 10px", borderRadius: "5px", marginRight: "10px", gap: "5px" }}>
                            <ArrowLeft size={16} />
                            <span>Atrás</span>
                        </IconButton>
                    }

                    {/* Position Title */}
                    <h2 className="app-position-title">
                        {data.length > 0 ? data[0].title.toUpperCase() : 'N/A'}
                    </h2>
                </Box>

                <table className="pdi-table">

                    {/* encabezados */}
                    <thead>
                        <tr>
                            <th className="pdi-header-priority">PRIORIDADES DE DESARROLLO</th>
                            <th className="pdi-header-action">ACCIONES DE DESARROLLO</th>
                            <th className="pdi-header-progress">AVANCE</th>
                            <th className="pdi-header-comment">COMENTARIOS</th>
                            <th className="pdi-header-photo">FOTO DE ÉXITO</th>
                        </tr>
                    </thead>

                    {/* body */}
                    <tbody>
                        {Object.entries(groupedData).map(([objectiveId, items]) => {
                            const priorityText = items[0].developmentPriority;
                            const commentText = items[0].comment || '';
                            const rowCount = items.length;

                            return (
                                <React.Fragment key={objectiveId}>
                                    {items.map((item, index) => {
                                        const decodedSuccessPhoto = decode(item.successPhoto);
                                        const rowColor = getPriorityColor(parseInt(objectiveId))

                                        return (
                                            <tr key={`${item.pdiId}-${index}`} className="pdi-row">

                                                {/* prioridades de desarrollo */}
                                                {index === 0 && (
                                                    <td
                                                        className="pdi-priority"
                                                        rowSpan={rowCount}
                                                        style={{
                                                            borderWidth: '0.9px',
                                                            borderColor: rowColor,
                                                            borderLeft: `10px solid ${rowColor}`,
                                                        }}
                                                    >
                                                        {priorityText}
                                                    </td>
                                                )}

                                                {/* acciones de desarrollo */}
                                                <td
                                                    className="pdi-action"
                                                    style={{
                                                        borderWidth: '0.9px',
                                                        borderColor: rowColor,
                                                    }}
                                                >
                                                    {item.developmentAction}
                                                </td>

                                                {/* avance */}
                                                <td
                                                    style={{
                                                        borderWidth: '0.9px',
                                                        borderColor: rowColor,
                                                    }}
                                                    className="pdi-progress"
                                                >
                                                    {item.actionProgress}%
                                                </td>

                                                {/* comentarios */}
                                                {index === 0 && (
                                                    <td
                                                        className="pdi-comment"
                                                        rowSpan={rowCount}
                                                        style={{
                                                            borderWidth: '0.9px',
                                                            borderColor: rowColor,
                                                        }}
                                                    >
                                                        {commentText.split('\n').map((line, i) => (
                                                            <React.Fragment key={i}>
                                                                {line}
                                                                {i < commentText.split('\n').length - 1 && <br />}
                                                            </React.Fragment>
                                                        ))}
                                                    </td>
                                                )}

                                                {/* success photo */}
                                                {index === 0 && objectiveId === Object.keys(groupedData)[0] && (
                                                    <td
                                                        className="pdi-photo"
                                                        rowSpan={data.length}
                                                    >
                                                        <div className="pdi-photo-content">
                                                            <ReactMarkdown>{decodedSuccessPhoto}</ReactMarkdown>
                                                        </div>
                                                    </td>
                                                )}

                                            </tr>
                                        )
                                    }
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>

                    {/* footer */}
                    <tfoot>
                        <tr className="pdi-footer-row">
                            <td colSpan={2} className="pdi-footer-dates">
                                <div className="pdi-date">
                                    <span>Fecha de aprobación:</span> {data.length > 0 ? formatDate(data[0].approveDate) : 'N/A'}
                                    <span style={{ marginLeft: '15px' }}>Fecha límite:</span> {data.length > 0 ? formatDate(data[0].dueDate) : 'N/A'}
                                </div>
                            </td>
                            <td className="pdi-footer-progress">
                                <div className="pdi-total-progress">
                                    {totalProgress}%
                                </div>
                            </td>
                            <td colSpan={2} className="pdi-footer-empty"></td>
                        </tr>
                    </tfoot>

                </table>
            </div>
        </Box>
    );
}

// Create a color manager to handle consistent color assignments
const colorManager = (() => {
    // Define an array of colors to use in sequence
    const colors = [
        '#ff7043', // Orange red
        '#29b6f6', // Light blue 
        '#90a4ae',  // Blue grey
        '#7e57c2', // Purple
    ];

    // Map to store objectiveId -> color associations
    const colorMap = new Map<number, string>();

    // Function to get color for an objectiveId
    return {
        getColorForId: (id: number): string => {
            // If this ID doesn't have a color yet, assign the next one
            if (!colorMap.has(id)) {
                const colorIndex = colorMap.size % colors.length;
                colorMap.set(id, colors[colorIndex]);
            }

            // Return the color for this ID
            return colorMap.get(id) || colors[3];
        }
    };
})();

// Helper function to get color based on objectiveId
function getPriorityColor(objectiveId: number): string {
    return colorManager.getColorForId(objectiveId);
}