import React from 'react';

const MatrixSuccesionSkeleton = () => {
    return (
        <div className="matriz-sucesion-container">
            <div className="matrix-content">
                {/* Left Column */}
                <div className="left-column">

                    {/* Profile and Succession Row */}
                    <div className="profile-succession-row">

                        {/* User Profile Section */}
                        <div className="section-container-skeleton">
                            <div className="profile-photo-wrapper-skeleton">
                                <div className="profile-photo-skeleton skeleton-circle"></div>
                            </div>
                            {/* Profile photo is outside the card, as in the actual component */}
                            <div className="profile-card skeleton">
                                <div className="profile-name skeleton-text"></div>
                                <div className="profile-buttons">
                                    <div className="btn-user btn-gray skeleton-button"></div>
                                    <div className="btn-user btn-gray skeleton-button"></div>
                                    <div className="btn-user btn-gray skeleton-button"></div>
                                </div>
                            </div>
                        </div>

                        {/* Succession Section */}
                        <div className="section-container-skeleton">
                            <h3 className="section-header">Sucesión</h3>
                            <div className="succession-card skeleton">
                                <div className="succession-list">
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index} className="succession-item">
                                            <div className="position-name skeleton-text"></div>
                                            <div className="btn btn-app skeleton-button"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Development Details Card */}
                    <div className="development-card skeleton">
                        <div className="development-sections">
                            {/* Development Priorities */}
                            <div className="development-section">
                                <h3 className="section-title">Prioridades de Desarrollo</h3>
                                <div className="section-content">
                                    {[...Array(2)].map((_, index) => (
                                        <div key={index} className="detail-item skeleton-text"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Strengths */}
                            <div className="development-section">
                                <h3 className="section-title">Fortalezas</h3>
                                <div className="section-content">
                                    {[...Array(2)].map((_, index) => (
                                        <div key={index} className="detail-item skeleton-text"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Motivation */}
                            <div className="development-section">
                                <h3 className="section-title">Motivación</h3>
                                <div className="section-content">
                                    <p className="detail-item">Lateral:</p>
                                    <p className="detail-item skeleton-text"></p>
                                    <br />
                                    <p className="detail-item">Vertical:</p>
                                    <p className="detail-item skeleton-text"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Replacement Cards */}
                <div className="right-column">
                    <h3 className="section-header">Cartas de Reemplazo</h3>
                    <div className="replacement-card skeleton">
                        <div className="replacement-list">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="replacement-item">
                                    <div className="replacement-content">
                                        <div className="replacement-photo-container skeleton-circle"></div>
                                        <div className="replacement-name skeleton-text"></div>
                                    </div>
                                    <div className="replacement-actions">
                                        <div className="btn btn-gray skeleton-button"></div>
                                        <div className="btn btn-app skeleton-button"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatrixSuccesionSkeleton;