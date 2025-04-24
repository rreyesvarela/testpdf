import React from 'react';

const PdiSkeleton = () => {
    // Create pulse animation effect for skeleton
    const pulseStyle: React.CSSProperties = {
        animation: 'pulse 1.5s ease-in-out infinite',
        background: '#eeeeee',
        borderRadius: '4px'
    };

    // Use deterministic widths instead of random ones
    // This ensures server and client renders match
    const getWidthByIndex = (index: number, min: number, max: number) => {
        // Use a deterministic pattern based on the index
        const value = min + (index % (max - min + 1));
        return `${value}%`;
    };

    // Generate a few dynamic rows to simulate real data
    const generateSkeletonRows = (count: number) => {
        const rows = [];

        for (let i = 0; i < count; i++) {
            rows.push(
                <tr key={`skeleton-row-${i}`} className="pdi-row">
                    {i % 2 === 0 && (
                        <td
                            className="pdi-priority"
                            rowSpan={2}
                            style={{
                                borderWidth: '0.9px',
                                borderColor: '#ddd',
                                borderLeft: '10px solid #eee',
                            }}
                        >
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '40px',
                                    width: getWidthByIndex(i, 70, 90)
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '20px',
                                    width: getWidthByIndex(i + 1, 50, 80),
                                    marginTop: '10px'
                                }}
                            />
                        </td>
                    )}

                    <td
                        className="pdi-action"
                        style={{
                            borderWidth: '0.9px',
                            borderColor: '#ddd',
                        }}
                    >
                        <div
                            style={{
                                ...pulseStyle,
                                height: '15px',
                                width: getWidthByIndex(i + 2, 60, 90)
                            }}
                        />
                        <div
                            style={{
                                ...pulseStyle,
                                height: '15px',
                                width: getWidthByIndex(i + 3, 40, 80),
                                marginTop: '8px'
                            }}
                        />
                    </td>

                    <td
                        className="pdi-progress"
                        style={{
                            borderWidth: '0.9px',
                            borderColor: '#ddd',
                        }}
                    >
                        <div
                            style={{
                                ...pulseStyle,
                                height: '20px',
                                width: '50%',
                                margin: '0 auto'
                            }}
                        />
                    </td>

                    {i % 2 === 0 && (
                        <td
                            className="pdi-comment"
                            rowSpan={2}
                            style={{
                                borderWidth: '0.9px',
                                borderColor: '#ddd',
                            }}
                        >
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '12px',
                                    width: getWidthByIndex(i + 4, 70, 95)
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '12px',
                                    width: getWidthByIndex(i + 5, 60, 90),
                                    marginTop: '10px'
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '12px',
                                    width: getWidthByIndex(i + 6, 40, 80),
                                    marginTop: '10px'
                                }}
                            />
                        </td>
                    )}

                    {i === 0 && (
                        <td
                            className="pdi-photo"
                            rowSpan={count}
                            style={{
                                borderWidth: '0.9px',
                                borderColor: '#ddd',
                            }}
                        >
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '20px',
                                    width: '70%',
                                    margin: '0 auto 20px auto'
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '15px',
                                    width: getWidthByIndex(i + 7, 60, 90),
                                    marginBottom: '12px'
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '15px',
                                    width: getWidthByIndex(i + 8, 70, 85),
                                    marginBottom: '12px'
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '15px',
                                    width: getWidthByIndex(i + 9, 65, 95),
                                    marginBottom: '12px'
                                }}
                            />
                            <div
                                style={{
                                    ...pulseStyle,
                                    height: '15px',
                                    width: getWidthByIndex(i + 10, 50, 85)
                                }}
                            />
                        </td>
                    )}
                </tr>
            );
        }

        return rows;
    };

    return (
        <div className="pdi-container">
            <style jsx global>{`
                @keyframes pulse {
                    0% {
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0.6;
                    }
                }
            `}</style>

            <table className="pdi-table">
                {/* Headers */}
                <thead>
                    <tr>
                        <th className="pdi-header-priority">PRIORIDADES DE DESARROLLO</th>
                        <th className="pdi-header-action">ACCIONES DE DESARROLLO</th>
                        <th className="pdi-header-progress">AVANCE</th>
                        <th className="pdi-header-comment">COMENTARIOS</th>
                        <th className="pdi-header-photo">FOTO DE ÉXITO</th>
                    </tr>
                </thead>

                {/* Skeleton Body */}
                <tbody>
                    {generateSkeletonRows(6)}
                </tbody>

                {/* Skeleton Footer */}
                <tfoot>
                    <tr className="pdi-footer-row">
                        <td colSpan={2} className="pdi-footer-dates">
                            <div className="pdi-date">
                                <span>Fecha de aprobación:</span>
                                <div
                                    style={{
                                        ...pulseStyle,
                                        height: '14px',
                                        width: '80px',
                                        display: 'inline-block',
                                        marginLeft: '5px',
                                        marginRight: '15px',
                                        verticalAlign: 'middle'
                                    }}
                                />
                                <span style={{ marginLeft: '15px' }}>Fecha límite:</span>
                                <div
                                    style={{
                                        ...pulseStyle,
                                        height: '14px',
                                        width: '80px',
                                        display: 'inline-block',
                                        marginLeft: '5px',
                                        verticalAlign: 'middle'
                                    }}
                                />
                            </div>
                        </td>
                        <td className="pdi-footer-progress">
                            <div className="pdi-total-progress">
                                <div
                                    style={{
                                        ...pulseStyle,
                                        height: '14px',
                                        width: '40px',
                                        display: 'inline-block'
                                    }}
                                />
                            </div>
                        </td>
                        <td colSpan={2} className="pdi-footer-empty"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default PdiSkeleton;