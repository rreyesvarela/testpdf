import React from 'react';
import { Skeleton } from '@mui/material';

const APPSkeleton = () => {
    return (
        <div className="app-container">
            {/* Position Title Skeleton */}
            <Skeleton variant="text" width={300} height={30} sx={{ mb: 3, mt: 0 }} />

            <div className="app-table-container">
                <table className="app-table">
                    {/* Table Header */}
                    <thead>
                        <tr className="app-header-row">
                            <th className="app-header-cell">POND</th>
                            <th className="app-header-cell">FACTOR</th>
                            <th className="app-header-cell">ADECUACIONES</th>
                            <th className="app-header-cell">ÁREAS DE OPORTUNIDAD</th>
                            <th className="app-header-cell">PTS</th>
                            <th className="app-header-cell">CALIF</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* ESTILO Row */}
                        <tr className="app-data-row">
                            {/* POND Cell */}
                            <td className="app-pond-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* Factor Cell */}
                            <td className="app-factor-cell app-transparent-cell">
                                {/* Factor Header */}
                                <div className="app-factor-header">
                                    <div className="app-factor-header-grid">
                                        <div className="app-factor-header-left">PUESTO</div>
                                        <div className="app-factor-header-right">PERSONA</div>
                                    </div>
                                    <div className="app-factor-title">ESTILO</div>
                                </div>

                                {/* Graphs Skeleton */}
                                <div className="app-graphs-container">
                                    <div className="app-puesto-graph">
                                        <Skeleton variant="rectangular" width={120} height={120} />
                                    </div>
                                    <div className="app-graphs-grid">
                                        {/* Three graph skeletons */}
                                        {[1, 2, 3].map((item) => (
                                            <div key={item} className="app-graph-item">
                                                <Skeleton variant="rectangular" width={120} height={120} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </td>

                            {/* Adecuaciones Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* Áreas de Oportunidad Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* PTS Cell */}
                            <td className="app-score-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* CALIF Cell */}
                            <td className="app-score-cell app-transparent-cell">
                                <Skeleton variant="rectangular" width={60} height={30} />
                            </td>
                        </tr>

                        {/* VALORES Row */}
                        <tr className="app-data-row">
                            {/* POND Cell */}
                            <td className="app-pond-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* Factor Cell */}
                            <td className="app-factor-cell app-transparent-cell">
                                <div className="app-factor-header">
                                    <div className="app-factor-title">VALORES</div>
                                </div>
                                <div className="app-graphs-container">
                                    <div className="app-puesto-graph">
                                        <Skeleton variant="rectangular" width={120} height={120} />
                                    </div>
                                    <div className="app-graph-item">
                                        <Skeleton variant="rectangular" width={180} height={180} />
                                    </div>
                                </div>
                            </td>

                            {/* Adecuaciones Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* Áreas de Oportunidad Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* PTS Cell */}
                            <td className="app-score-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* CALIF Cell */}
                            <td className="app-score-cell app-transparent-cell">
                                <Skeleton variant="rectangular" width={60} height={30} />
                            </td>
                        </tr>

                        {/* PROCESO PENSANTE Row */}
                        <tr className="app-data-row">
                            {/* POND Cell */}
                            <td className="app-pond-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* Factor Cell */}
                            <td className="app-factor-cell app-transparent-cell">
                                <div className="app-factor-header">
                                    <div className="app-factor-title">PROCESO PENSANTE</div>
                                </div>
                                <div className="app-graphs-container">
                                    <div className="app-puesto-graph">
                                        <Skeleton variant="rectangular" width={120} height={120} />
                                    </div>
                                    <div className="app-graph-item">
                                        <Skeleton variant="rectangular" width={140} height={140} />
                                    </div>
                                </div>
                            </td>

                            {/* Adecuaciones Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* Áreas de Oportunidad Cell */}
                            <td className="app-comments-cell">
                                <Skeleton variant="rectangular" height={120} />
                            </td>

                            {/* PTS Cell */}
                            <td className="app-score-cell">
                                <Skeleton variant="rectangular" width={40} height={30} />
                            </td>

                            {/* CALIF Cell */}
                            <td className="app-score-cell app-transparent-cell">
                                <Skeleton variant="rectangular" width={60} height={30} />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer with Wonderlic and Subtotal */}
                <div className="app-footer-container">
                    <div className="app-wonderlic">
                        <Skeleton variant="text" width={150} />
                    </div>
                    <div className="app-subtotal-container">
                        <div className="app-subtotal-label">SUBTOTAL:</div>
                        <Skeleton variant="rectangular" width={60} height={24} />
                    </div>
                </div>
            </div>

            {/* Date */}
            <div className="app-date">
                <Skeleton variant="text" width={180} />
            </div>
        </div>
    );
};

export default APPSkeleton;