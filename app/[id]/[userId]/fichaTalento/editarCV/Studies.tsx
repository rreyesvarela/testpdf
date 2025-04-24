/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import Grid from '@mui/material/Grid2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Modal, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Box } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { useState, useEffect } from 'react';
import { useProfileContext } from '@/context/ProfileContext';
import { formatDateDD } from './FormularioPersonal';

interface StudiesProps {
    handleOpenDeleteModal: (item: any, type: string) => void
}

const Studies = ({ handleOpenDeleteModal }: StudiesProps) => {
    const { profileState, setProfileState } = useProfileContext();

    useEffect(() => {
        if (!profileState.talendCard) {
            const storedData = typeof window !== 'undefined' ? localStorage.getItem('employeeData') : null;
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                setProfileState((prev) => ({
                    ...prev,
                    talendCard: parsedData,
                }));
            }
        }
    }, [profileState.talendCard, setProfileState]);

    const studies = profileState.talendCard?.studies || [];
    const languages = profileState.talendCard?.languages || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedStudy, setSelectedStudy] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedLanguage, setSelectedLanguage] = useState<any>(null);

    const [openStudyModal, setOpenStudyModal] = useState(false);
    const [openLanguageModal, setOpenLanguageModal] = useState(false);

    const updateLocalStorage = (updatedTalendCard: any) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('employeeData', JSON.stringify(updatedTalendCard));
        }
    };

    const handleSaveStudy = async (id?: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = {
            userId: profileState.userId,
            userName: profileState.userName,
            studies: [{
                level: selectedStudy.level,
                area: selectedStudy.area,
                institution: selectedStudy.institution,
                startDate: formatDateDD(selectedStudy.startDate),
                endDate: formatDateDD(selectedStudy.endDate),
            }]
        };

        if (id) {
            body.studies[0].IdExpInterna = id;

            try {
                const response = await fetch(`/api/cv`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const resp = await response.json();
                const updatedTalendCard = { ...resp.updatedData };

                setProfileState(prev => ({
                    ...prev,
                    talendCard: updatedTalendCard
                }));

                updateLocalStorage(updatedTalendCard);

            } catch (error) {
                console.error("Failed to save number:", error);
            }
        } else {
            const postBody = {
                userId: profileState.userId,
                userName: profileState.userName,
                attributeType: "study",
                item: {
                    level: selectedStudy.level,
                    area: selectedStudy.area,
                    institution: selectedStudy.institution,
                    startDate: formatDateDD(selectedStudy.startDate),
                    endDate: formatDateDD(selectedStudy.endDate)
                }
            };
            try {
                const response = await fetch(`/api/cv`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postBody),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                const resp = await response.json();

                const updatedTalendCard = {
                    ...profileState.talendCard,
                    studies: [...(profileState.talendCard?.studies || []), resp.updatedAttribute.newItem],
                };

                setProfileState((prev: any) => ({
                    ...prev,
                    talendCard: updatedTalendCard,
                }));

                updateLocalStorage(updatedTalendCard);

            } catch (error) {
                console.error("Failed to save number:", error);
            }
        }
        setOpenStudyModal(false);
    };

    const handleCancelStudy = () => {
        setOpenStudyModal(false);
        setSelectedStudy(null);
    };

    const handleSaveLanguage = async (id?: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body: any = {
            userId: profileState.userId,
            userName: profileState.userName,
            languages: [{
                language: selectedLanguage.language,
                level: selectedLanguage.level,
                score: selectedLanguage.score
            }]
        };

        if (id) {
            body.languages[0].IdExpInterna = id;

            try {
                const response = await fetch(`/api/cv`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const resp = await response.json();
                const updatedTalendCard = { ...resp.updatedData };

                setProfileState(prev => ({
                    ...prev,
                    talendCard: updatedTalendCard
                }));

                updateLocalStorage(updatedTalendCard);

            } catch (error) {
                console.error("Failed to save number:", error);
            }
        } else {
            const postBody = {
                userId: profileState.userId,
                userName: profileState.userName,
                attributeType: "language",
                item: {
                    language: selectedLanguage.language,
                    level: selectedLanguage.level,
                    score: selectedLanguage.score
                }
            };
            try {
                const response = await fetch(`/api/cv`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postBody),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                const resp = await response.json();

                const updatedTalendCard = {
                    ...profileState.talendCard,
                    languages: [...(profileState.talendCard?.languages || []), resp.updatedAttribute.newItem],
                };

                setProfileState((prev: any) => ({
                    ...prev,
                    talendCard: updatedTalendCard,
                }));

                updateLocalStorage(updatedTalendCard);

            } catch (error) {
                console.error("Failed to save number:", error);
            }
        }
        setOpenLanguageModal(false);
    };

    const handleCancelLanguage = () => {
        setOpenLanguageModal(false);
        setSelectedLanguage(null);
    };

    const handleAddStudy = () => {
        setSelectedStudy({
            level: '',
            area: '',
            institution: '',
            startDate: '',
            endDate: '',
        });
        setOpenStudyModal(true);
    };

    const handleAddLanguage = () => {
        setSelectedLanguage({
            level: '',
            language: '',
            score: '',
        });
        setOpenLanguageModal(true);
    };

    const handleEditStudy = (index: number) => {
        setSelectedStudy({ ...studies[index], index });
        setOpenStudyModal(true);
    };

    const handleEditLanguage = (index: number) => {
        setSelectedLanguage({ ...languages[index], index });
        setOpenLanguageModal(true);
    };


    return (
        <Grid container spacing={2} sx={{ justifyContent: "space-between", paddingBottom: "10px" }}>
            <Grid size={7} className="subsection">
                <div className="subsection-header">Estudios</div>
                <div className="subsection-content">
                    <table className="studies-table" style={{ width: "100%", padding: "10px 15px" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left" }}>Nivel</th>
                                <th style={{ textAlign: "left" }}>Area</th>
                                <th style={{ textAlign: "left" }}>Institucion</th>
                                <th style={{ textAlign: "left" }}>Fecha Inicio</th>
                                <th style={{ textAlign: "left" }}>Fecha Final</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {studies.map((study, index) => (
                                <tr key={index}>
                                    <td>{study.level}</td>
                                    <td>{study.area}</td>
                                    <td>{study.institution}</td>
                                    <td>{study.startDate}</td>
                                    <td>{study.endDate}</td>
                                    <td>
                                        <EditIcon
                                            sx={{ cursor: 'pointer', marginRight: 1 }}
                                            onClick={() => handleEditStudy(index)}
                                        />
                                        <DeleteIcon
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleOpenDeleteModal(study, "study")}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        className="btn-save"
                        style={{ width: "50px", minWidth: "50px", marginRight: "10px", marginBottom: "10px" }}
                        onClick={handleAddStudy}
                    >
                        +
                    </button>
                </div>
            </Grid>

            <Grid size={5} className="subsection">
                <div className="subsection-header">Idiomas</div>
                <div className="subsection-content">
                    <table className="languages-table" style={{ width: "100%", padding: "10px 15px" }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: "left" }}>Nivel</th>
                                <th style={{ textAlign: "left" }}>Idioma</th>
                                <th style={{ textAlign: "left" }}>Score</th>
                                <th style={{ textAlign: "right" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {languages.map((language, index) => (
                                <tr key={index}>
                                    <td>{language.level}</td>
                                    <td>{language.language}</td>
                                    <td>{language.score ?? 'N/A'}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <EditIcon
                                            sx={{ cursor: 'pointer', marginRight: 1 }}
                                            onClick={() => handleEditLanguage(index)}
                                        />
                                        <DeleteIcon
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleOpenDeleteModal(language, "language")}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            className="btn-save"
                            style={{ width: "50px", minWidth: "50px", marginRight: "10px", marginBottom: "10px" }}
                            onClick={handleAddLanguage}
                        >
                            +
                        </button>
                    </div>
                </div>
            </Grid>
            <Modal open={openStudyModal} onClose={handleCancelStudy}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {selectedStudy?.index !== undefined ? 'Editar Estudios Profesionales' : 'Agregar Nivel de Estudios'}
                    </Typography>
                    {selectedStudy && (
                        <>
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="nivel-label" sx={{
                                            color: "black",
                                            "&.Mui-focused": {
                                                color: "black",
                                            },
                                        }}>Nivel</InputLabel>
                                        <Select
                                            labelId="nivel-label"
                                            value={selectedStudy.level}
                                            onChange={(e) =>
                                                setSelectedStudy({ ...selectedStudy, level: e.target.value })
                                            }
                                        >
                                            <MenuItem sx={{ color: "black" }} value="Profesional">Profesional</MenuItem>
                                            <MenuItem sx={{ color: "black" }} value="Posgrado">Posgrado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        label="Área"
                                        value={selectedStudy.area}
                                        onChange={(e) =>
                                            setSelectedStudy({ ...selectedStudy, area: e.target.value })
                                        }
                                        sx={{
                                            mb: 2,

                                        }}
                                        slotProps={{
                                            inputLabel: {
                                                sx: {
                                                    color: "black",
                                                }
                                            },

                                        }}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Institución"
                                        value={selectedStudy.institution}
                                        onChange={(e) =>
                                            setSelectedStudy({ ...selectedStudy, institution: e.target.value })
                                        }
                                        sx={{ mb: 2 }}
                                        slotProps={{
                                            inputLabel: {
                                                sx: {
                                                    color: "black",
                                                }
                                            },

                                        }}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <DesktopDatePicker
                                        label="Fecha de inicio"
                                        format="dd/MM/yyyy"
                                        value={new Date(selectedStudy.startDate)}
                                        onChange={(date) =>
                                            setSelectedStudy({
                                                ...selectedStudy,
                                                startDate: date,
                                            })
                                        }
                                        maxDate={new Date()}
                                        slotProps={{
                                            textField: {
                                                InputLabelProps: {
                                                    sx: {
                                                        color: "black",

                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                                <Grid size={6}>
                                    <DesktopDatePicker
                                        label="Fecha de finalización"
                                        format="dd/MM/yyyy"
                                        value={new Date(selectedStudy.endDate)}
                                        onChange={(date) => {
                                            if (date && date >= new Date(selectedStudy.startDate)) {
                                                setSelectedStudy({ ...selectedStudy, endDate: date });
                                            } else {
                                                alert('La fecha de finalización no puede ser anterior a la fecha de inicio.');
                                                setSelectedStudy({ ...selectedStudy, endDate: undefined });
                                            }
                                        }}
                                        maxDate={new Date()}
                                        slotProps={{
                                            textField: {
                                                InputLabelProps: {
                                                    sx: {
                                                        color: "black",

                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button variant="contained" color="info" onClick={handleCancelStudy}>
                                    Cancelar
                                </Button>
                                <Button variant="contained" color="warning" onClick={() => handleSaveStudy(selectedStudy.IdExpInterna)}>
                                    Guardar
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Modal open={openLanguageModal} onClose={handleCancelLanguage}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Editar Idioma
                    </Typography>
                    {selectedLanguage && (
                        <>
                            <Grid container spacing={2}>
                                <Grid size={6}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="language-level-label" sx={{
                                            color: "black",
                                            "&.Mui-focused": {
                                                color: "black",
                                            }
                                        }}>Nivel</InputLabel>
                                        <Select
                                            labelId="language-level-label"
                                            value={selectedLanguage.level}
                                            onChange={(e) =>
                                                setSelectedLanguage({ ...selectedLanguage, level: e.target.value })
                                            }
                                        >
                                            <MenuItem sx={{ color: "black" }} value="Básico">Básico</MenuItem>
                                            <MenuItem sx={{ color: "black" }} value="Intermedio">Intermedio</MenuItem>
                                            <MenuItem sx={{ color: "black" }} value="Avanzado">Avanzado</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={6}>
                                    <TextField
                                        fullWidth
                                        label="Idioma"
                                        value={selectedLanguage.language}
                                        onChange={(e) =>
                                            setSelectedLanguage({ ...selectedLanguage, language: e.target.value })
                                        }
                                        sx={{ mb: 2 }}
                                        slotProps={{
                                            inputLabel: {
                                                sx: {
                                                    color: "black",
                                                }
                                            },

                                        }}
                                    />
                                </Grid>
                                <Grid size={12}>
                                    <TextField
                                        fullWidth
                                        label="Puntaje"
                                        type="number"
                                        value={selectedLanguage.score ?? ''}
                                        onChange={(e) =>
                                            setSelectedLanguage({ ...selectedLanguage, score: e.target.value })
                                        }
                                        sx={{ mb: 2 }}
                                        slotProps={{
                                            inputLabel: {
                                                sx: {
                                                    color: "black",
                                                }
                                            },

                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button variant="contained" color="info" onClick={handleCancelLanguage}>
                                    Cancelar
                                </Button>
                                <Button variant="contained" color="warning" onClick={() => handleSaveLanguage(selectedLanguage.IdExpInterna)}>
                                    Guardar
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
        </Grid>
    )
}

export default Studies
