'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Button } from '@mui/material';
import { useParams } from "next/navigation";
import Grid from '@mui/material/Grid2';
import NineBox from './nineBox';
import { useProfileContext } from '@/context/ProfileContext';
import { getDes, getHabilidad, getWonderlicStatus } from './utils';
import { cuadrante, HoganAssessment, MGTData, TalendCard, TalentCardDetail } from './types';
import { useRouter } from 'next/navigation';
import Graficos from './graficos';
import { set } from 'date-fns';

interface FichaContentProps {
    isDialog: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dialogProps: any;
}

const getEqiPercentage = (eqi: number): string => {
    if (eqi <= 0) return "0%"; // Valores menores o iguales a 0 siempre serán 0%
    if (eqi <= 41) {
        return `${((eqi / 41) * 25).toFixed(2)}%`; // Proporcional entre 0% y 25%
    } else if (eqi <= 61) {
        return `${(25 + ((eqi - 42) / 20) * 25).toFixed(2)}%`; // Proporcional entre 26% y 50%
    } else if (eqi <= 81) {
        return `${(50 + ((eqi - 62) / 20) * 25).toFixed(2)}%`; // Proporcional entre 51% y 75%
    } else if (eqi <= 100) {
        return `${(75 + ((eqi - 82) / 18) * 25).toFixed(2)}%`; // Proporcional entre 76% y 100%
    } else {
        return "100%"; // Valores mayores a 100 siempre serán 100%
    }
};

const TalentProfileContent: React.FC<FichaContentProps> = ({ isDialog, dialogProps }: FichaContentProps) => {

    const { profileState, setProfileState } = useProfileContext();
    const router = useRouter();
    const [hoganDataPDF, setHoganDataPDF] = useState<HoganAssessment | null>(null);
    const [mgtDataPDF, setMgtDataPDF] = useState<MGTData | null>(null);
    const [talentCardDetailDataPDF, setTalentCardDetailDataPDF] = useState<TalentCardDetail | null>(null);
    const [talendCardPDF, setTalendCardPDF] = useState<TalendCard | null>(null);

    // get userId, userName, positionId from dialogProps or localStorage
    const { dialogUserId, dialogUserName, dialogPositionId } = dialogProps || {};
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const isPDF = searchParams.get('isPDF') === 'true';

    let userIdAux; 
    let userNameAux;
    let positionIdAux;

    if (isPDF) {
        userIdAux = searchParams.get('userId') || '';
        userNameAux = searchParams.get('userName') || '';
        positionIdAux = searchParams.get('positionId') || '';
    } else {
        userIdAux = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        userNameAux = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
        positionIdAux = typeof window !== 'undefined' ? localStorage.getItem('positionId') : null;
    }

    const { id } = useParams(); // Extract the dynamic route parameter [id]
    const ID = Array.isArray(id) ? id[0] : id || ''; // Handle the extracted parameter
    let userId = isDialog ? dialogUserId : userIdAux;
    let userName = isDialog ? dialogUserName : userNameAux;
    let positionId = isDialog ? dialogPositionId : positionIdAux;

    useEffect(() => {
        const fetchAllData = async () => {

            // Validación de parámetros requeridos
            if (!userId || !userName || !positionId) {
                if (typeof window !== 'undefined') {
                    window.location.href = `/${ID}/organigrama`;
                }
                return;
            }

            try {
                setProfileState(prev => ({
                    ...prev,
                    loading: true,
                    userId: userId || '',
                    userName: userName || '',
                    positionId: positionId || ''
                }));

                const queryParams = new URLSearchParams({
                    userId: userId?.toString() || '',
                    positionId: positionId || '',
                    userName: userName || '',
                });

                const employeeEndpoint = `/api/cv?userId=${userId}&userName=${userName}${isPDF ? '&isPDF=true' : ''}`;
                const hoganEndpoint = `/api/hogan?userId=${userId}&userName=${userName}${isPDF ? '&isPDF=true' : ''}`;
                const mgtEndpoint = `/api/mgt?${queryParams.toString()}`;
                const talentCardDetailEndpoint = `/api/talentCardDetails?${queryParams.toString()}`;

                const fetchEmployee = fetch(employeeEndpoint).then(res => {
                    if (!res.ok) throw new Error('Failed to fetch employee data');
                    return res.json();
                });

                const fetchHogan = fetch(hoganEndpoint)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch Hogan data');
                        return res.json();
                    })
                    .catch(() => null);

                const fetchMGT = fetch(mgtEndpoint)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch MGT data');
                        return res.json();
                    })
                    .catch(() => null);

                const fetchTalentCardDetail = fetch(talentCardDetailEndpoint)
                    .then(res => {
                        if (!res.ok) throw new Error('Failed to fetch talent card details');
                        return res.json();
                    })
                    .catch(() => null);

                const [employee, hogan, mgt, talentCardDetail] = await Promise.all([
                    fetchEmployee,
                    fetchHogan,
                    fetchMGT,
                    fetchTalentCardDetail
                ]);

                localStorage.setItem('employeeData', JSON.stringify(employee));
                localStorage.setItem('hoganData', JSON.stringify(hogan));
                localStorage.setItem('mgtData', JSON.stringify(mgt));
                localStorage.setItem('talentCardDetailData', JSON.stringify(talentCardDetail));

                setProfileState({
                    talendCard: employee,
                    hoganData: hogan,
                    mgtData: mgt,
                    talentCardDetailData: talentCardDetail,
                    loading: false,
                    userId: userId || '',
                    userName: userName || '',
                    positionId: positionId || ''
                });
                setTalendCardPDF(employee);
                setHoganDataPDF(hogan);
                setMgtDataPDF(mgt);
                setTalentCardDetailDataPDF(talentCardDetail);

            } catch (err) {
                console.error('Error fetching data:', err);
                setProfileState(prev => ({
                    ...prev,
                    loading: false,
                    userId: userId || '',
                    userName: userName || '',
                    positionId: positionId || ''
                }));
            }
        };

        if (profileState.userId == userId && profileState.userId != null) {
            setProfileState(prev => ({
                ...prev,
                loading: false,
                userId: userId || '',
                userName: userName || '',
                positionId: positionId || ''
            }));
        } else {
            fetchAllData();
        }

    }, [setProfileState, userId, userName, positionId]);

    const { hoganData, talendCard, mgtData, talentCardDetailData } = isPDF ? {
        hoganData: hoganDataPDF,
        talendCard: talendCardPDF,
        mgtData: mgtDataPDF,
        talentCardDetailData: talentCardDetailDataPDF
    } : profileState;


    if (profileState.loading) {
        return (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', height: "calc(100vh - 65px)", padding: '20px' }}>
                <Typography variant='h4' fontWeight={600} color={"black"}>Información Personal:</Typography>
                <hr />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Skeleton variant="text" width="20%" height={40} />
                    <Skeleton variant="text" width="20%" height={40} />
                    <Skeleton variant="text" width="20%" height={40} />
                    <Skeleton variant="text" width="20%" height={40} />
                </Box>
                <Box sx={{ display: "flex", width: "100%", borderTop: "1px solid black", borderBottom: "1px solid black" }}>
                    <Box sx={{ width: "50%", padding: "10px", borderRight: "1px solid black" }}>
                        <Skeleton variant="rectangular" width="100%" height={200} />
                    </Box>
                    <Box sx={{ width: "50%", padding: "10px" }}>
                        <Skeleton variant="rectangular" width="100%" height={200} />
                    </Box>
                </Box>
                <Skeleton variant="text" width="20%" height={40} />
                <Grid container padding={"10px"} display="flex" justifyContent="space-between">
                    <Grid container size={9}>
                        <Grid container size={12}>
                            <Skeleton variant="rectangular" width="100%" height={250} />
                        </Grid>
                    </Grid>
                    <Grid container size={3} display="flex" flexDirection="column" padding={"10px"} gap={3}>
                        <Skeleton variant="text" width="100%" height={40} />
                        <Skeleton variant="text" width="100%" height={40} />
                        <Skeleton variant="rectangular" width="100%" height={100} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', height: "calc(100vh - 65px)", padding: '5px 20px 20px 20px' }}>
            <Typography variant='h4' fontWeight={600} color={"black"}>Información Personal:</Typography>
            <hr />
            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <Box sx={{ display: "flex" }}>
                    <Typography variant='h4' fontWeight={600} color={"black"}>Carrera Profesional:</Typography>
                    <Typography variant='h4' marginLeft="5px">
                        {talendCard?.studies
                            .find((study) => study.level === "Profesional")?.area}: {(talendCard?.studies
                                .find((study) => study.level === "Posgrado" || study.level === "Profesional")?.endDate.split("/")[2])}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex" }}>
                    <Typography variant='h4' fontWeight={600} color={"black"}>Posgrado:</Typography>
                    {talendCard?.studies && talendCard?.studies.length > 0 && talendCard?.studies
                        .filter((study) => study.level === "Posgrado" || study.level === "Maestria").length > 0 &&
                        <Box>
                            {talendCard?.studies
                                .filter((study) => study.level === "Posgrado" || study.level === "Maestria").slice(0, 3).map(study =>
                                    <Typography key={study.IdExpInterna} variant='h4' marginLeft="5px">{study.area}: {study.endDate.split("/")[2]}
                                    </Typography>
                                )}
                        </Box>
                    }
                </Box>
                {
                    (talendCard?.languages?.length ?? 0) > 0 &&
                    <Box sx={{ display: "flex" }}>
                        <Typography variant='h4' fontWeight={600} color={"black"}>Idiomas:</Typography>
                        <Box>
                            {talendCard?.languages.slice(0, 3).map((language, index) => (
                                <Typography key={index} variant='h4' marginLeft="5px">{language?.language} {language.score ? `Puntaje TOEIC ${language.score}` : `
                                ${language.level}`}</Typography>
                            ))}
                        </Box>
                    </Box>
                }
                {talentCardDetailData?.birthday &&
                    <Box sx={{ display: "flex" }}>
                        <Typography variant='h4' fontWeight={600} color={"black"}>Fecha de nacimiento:</Typography>
                        <Typography variant='h4' marginLeft="5px">{talentCardDetailData?.birthday}</Typography>
                    </Box>
                }
            </Box>
            <Box onClick={() => isDialog ? "" : router.push("fichaTalento/editarCV")} sx={{ display: "flex", width: "100%", borderTop: "1px solid black", borderBottom: "1px solid black", cursor: isDialog ? "auto" : "pointer" }}>
                <Box sx={{ width: "50%", padding: "10px", borderRight: "1px solid black" }}>
                    <Typography variant='subtitle1' color="#319da3" marginBottom="10px">Trayectoria Interna</Typography>
                    <Box>
                        <table style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            EMPRESA
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            PUESTO
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            FECHA INICIAL
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            FECHA FINAL
                                        </Typography>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {talendCard?.experiences.interna
                                    ?.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) // Ordena por fecha de inicio
                                    ?.slice(0, 3).map((experience, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Typography variant="h4">{experience.company}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{experience.position}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{convertDateFormat(experience.startDate)}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{experience.endDate ? convertDateFormat(experience.endDate) : ""}</Typography>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
                <Box sx={{ width: "50%", padding: "10px" }}>
                    <Typography variant='subtitle1' color="#319da3" marginBottom="10px">Trayectoria Externa</Typography>
                    <Box>
                        <table style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            EMPRESA
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            PUESTO
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            FECHA INICIAL
                                        </Typography>
                                    </th>
                                    <th>
                                        <Typography variant="h4" color={"black"} fontWeight={600} textAlign="left">
                                            FECHA FINAL
                                        </Typography>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {talendCard?.experiences.externa
                                    ?.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()) // Ordena por fecha de inicio
                                    ?.slice(0, 3).map((experience, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Typography variant="h4">{experience.company}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{experience.position}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{convertDateFormat(experience.startDate)}</Typography>
                                            </td>
                                            <td>
                                                <Typography variant="h4">{experience.endDate ? convertDateFormat(experience.endDate) : ""}</Typography>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </Box>
            <Grid container padding={"10px"} display="flex" justifyContent="space-between">
                <Graficos mgtData={mgtData} hoganData={hoganData} size={9} />
                <Grid container size={3} display="flex" flexDirection="column" padding={"10px"} gap={3}>
                    {talentCardDetailData?.scores && talentCardDetailData?.scores.length > 0 &&
                        <Box display="flex">
                            <Typography variant='subtitle1' color="#319da3" marginRight="10px">Desempeño </Typography>
                            <Typography variant='subtitle1'>{getDes(talentCardDetailData?.scores || [])}</Typography>
                        </Box>
                    }
                    {talentCardDetailData?.Eqi &&
                        <Box display="flex" flexDirection="column">
                            <Typography variant='subtitle1' color="#319da3">EQI </Typography>
                            <Box display="flex" width="100%">
                                <Box display="flex" flexDirection="column" alignItems="column" justifyContent="center" textAlign="center" width={"25%"}>
                                    <Typography sx={{ height: "60px", borderTop: "1px solid black", borderRight: "1px solid black", borderLeft: "1px solid black", padding: "5px" }} variant='h4' color="#000">Área de oportunidad</Typography>
                                    <Typography sx={{ height: "30px", borderLeft: "1px solid black", borderRight: "1px solid black", borderBottom: "1px solid black", padding: "5px" }} variant='h4' color="#000">{"<= 41"}</Typography>
                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="column" justifyContent="center" textAlign="center" width={"25%"}>
                                    <Typography sx={{ height: "60px", borderTop: "1px solid black", borderRight: "1px solid black", padding: "5px" }} variant='h4' color="#000">Habilidad menos desarrollada</Typography>
                                    <Typography sx={{ height: "30px", borderRight: "1px solid black", borderBottom: "1px solid black", padding: "5px" }} variant='h4' color="#000">41 - 61</Typography>
                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="column" justifyContent="center" textAlign="center" width={"25%"}>
                                    <Typography sx={{ height: "60px", borderTop: "1px solid black", borderRight: "1px solid black", padding: "5px" }} variant='h4' color="#000">Habilidad en equilibro</Typography>
                                    <Typography sx={{ height: "30px", borderRight: "1px solid black", borderBottom: "1px solid black", padding: "5px" }} variant='h4' color="#000">62 - 81</Typography>

                                </Box>
                                <Box display="flex" flexDirection="column" alignItems="column" justifyContent="center" textAlign="center" width={"25%"}>
                                    <Typography sx={{ height: "60px", borderTop: "1px solid black", borderRight: "1px solid black", padding: "5px" }} variant='h4' color="#000">Habilidad más desarrollada</Typography>
                                    <Typography sx={{ height: "30px", borderRight: "1px solid black", borderBottom: "1px solid black", padding: "5px" }} variant='h4' color="#000">{">= 82"}</Typography>
                                </Box>
                            </Box>
                            <Box width={"100%"} height="40px" borderBottom={"1px solid black"} borderLeft={"1px solid black"} borderRight={"1px solid black"} display="flex" alignItems={"center"} padding={"5px"}>
                                <Box width={getEqiPercentage(Number(talentCardDetailData?.Eqi))} height="30px" sx={{ background: "#fc0000", borderRadius: "0 20px 20px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant='h4' color="#fff" textAlign="center" fontWeight={600}>{talentCardDetailData?.Eqi} {getHabilidad(Number(talentCardDetailData?.Eqi) || 0)}</Typography>
                                </Box>
                            </Box>

                        </Box>
                    }
                    {talentCardDetailData?.Wonderlic &&
                        <Box display="flex">
                            <Typography variant='subtitle1' color="#319da3" marginRight="10px">Wonderlic:  </Typography>
                            <Typography variant='subtitle1' marginBottom="10px">{talentCardDetailData?.Wonderlic} {getWonderlicStatus(Number(talentCardDetailData?.Wonderlic) || 0)} </Typography>
                        </Box>
                    }
                    {talentCardDetailData?.nineBox &&
                        <Box display="flex" alignContent={"center"} justifyContent={"center"} alignItems={"end"}>
                            <Typography variant='subtitle1' color="#319da3" marginRight="10px">9Box: </Typography>
                            <Typography variant='subtitle1'>{talentCardDetailData?.nineBox}</Typography>
                            <NineBox position={cuadrante[talentCardDetailData?.nineBox as keyof typeof cuadrante] || 0} />
                        </Box>
                    }
                    {(!isDialog && !isPDF) && (hoganData?.comments && hoganData.comments.length > 0 || mgtData?.comments && mgtData.comments.length > 0) ?
                        <Button
                            sx={{
                                background: "#fa4f00", borderRadius: "20px", color: "#fff", textTransform: "none", width: "200px", // Ajusta el ancho automáticamente al contenido
                            }}
                            onClick={() => router.push("fichaTalento/comentarios")}>
                            Interpretación
                        </Button> :
                        null
                    }
                </Grid>
            </Grid>
        </Box>
    );
};

const convertDateFormat = (dateStr: string): string => {
    const [month, day, year] = dateStr.split('/');
    return `${day}/${month}/${year}`;
};

export default TalentProfileContent;

