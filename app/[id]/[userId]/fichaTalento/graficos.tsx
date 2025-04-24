"use client"

import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Image from "next/image";
import GraficaEstilos from './graficaEsitlos';
import GraficaPersonalidad from './graficaPersonalidad';
import GraficaValores from './graficaValores';
import { HoganAssessment, MGTData } from './types';
import { useRouter } from 'next/navigation';

interface GraficosProps {
    mgtData: MGTData | null;
    hoganData: HoganAssessment | null;
    size: number;
    showReturn?: boolean
}

const Graficos = ({ mgtData, hoganData, size, showReturn = false }: GraficosProps) => {
    const router = useRouter()

    return (
        <Grid container size={size} display={"flex"} alignContent={"start"}>
            {mgtData && mgtData.FechaPerfilPuesto &&
                <Box display={"flex"} alignItems={"center"} marginTop="0px">
                    <Typography variant='subtitle1' color="#319da3" marginRight="10px">Human Side: </Typography>
                    <Typography variant='h4'>{mgtData.fechaEval}</Typography>
                </Box>
            }
            {(mgtData?.GraficaEstiloObs || mgtData?.GraficaEstiloProy || mgtData?.GraficaEstiloNat || mgtData?.GraficaValores || mgtData?.GraficaProcesoP) &&
                <Grid container size={12}
                    sx={{
                        background: "#dbd9da",
                        alignContent: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        paddingTop: "3px",
                        paddingBottom: "3px",
                        marginBottom: "10px",
                        height: "30px",
                    }}
                >
                    <Grid size={6}><Typography variant="h4" color={"black"} fontWeight={600}>ESTILO</Typography></Grid>
                    <Grid size={3}><Typography variant="h4" color={"black"} fontWeight={600}>VALORES</Typography></Grid>
                    <Grid size={3}><Typography variant="h4" color={"black"} fontWeight={600}>PROCESO PENSANTE</Typography></Grid>
                </Grid>
            }
            <Grid container size={12} spacing={2} display={"flex"} justifyContent={"start"}>
                <Grid size={6} display={"flex"} justifyContent="space-around" alignItems={"center"}>
                    {mgtData?.GraficaEstiloObs &&
                        <Image
                            src={`data:image/png;base64,${mgtData?.GraficaEstiloObs}` || ""}
                            alt="GraficaEstiloObs"
                            width={120}
                            height={120}
                            className="app-graph-image"
                        />
                    }

                    {mgtData?.GraficaEstiloProy &&
                        <Image
                            src={`data:image/png;base64,${mgtData?.GraficaEstiloProy}` || ""}
                            alt="GraficaEstiloObs"
                            width={120}
                            height={120}
                            className="app-graph-image"
                        />
                    }
                    {mgtData?.GraficaEstiloNat &&
                        <Image
                            src={`data:image/png;base64,${mgtData?.GraficaEstiloNat}` || ""}
                            alt="GraficaEstiloObs"
                            width={120}
                            height={120}
                            className="app-graph-image"
                        />
                    }
                </Grid>
                <Grid size={3} display={"flex"} justifyContent="space-around" alignItems={"center"}>
                    {mgtData?.GraficaValores &&
                        <>
                            <Image
                                src={`data:image/png;base64,${mgtData?.GraficaValores}` || ""}
                                alt="GraficaEstiloObs"
                                width={120}
                                height={120}

                            />
                            <Box display="flex" flexDirection="column" alignContent={"start"} height="100%">
                                <Box display="flex" marginTop="20px" gap={1}>
                                    { }
                                    <Image
                                        src={`data:image/png;base64,${mgtData?.MarcadoresEvaluados}` || ""}
                                        alt="GraficaEstiloObs"
                                        width={12}
                                        height={12}

                                    />
                                    <Typography variant="h4">Persona</Typography>
                                </Box>
                                <Box display="flex" marginTop="20px" gap={1}>
                                    <Image
                                        src={`data:image/png;base64,${mgtData?.MarcadoresPuestos}` || ""}
                                        alt="GraficaEstiloObs"
                                        width={12}
                                        height={12}
                                    />
                                    <Typography variant="h4">Puesto</Typography>
                                </Box>
                            </Box>
                        </>
                    }
                </Grid>
                <Grid size={3} display={"flex"} justifyContent="space-around" alignItems={"center"}>
                    {mgtData?.GraficaProcesoP &&
                        <Image
                            src={`data:image/png;base64,${mgtData?.GraficaProcesoP}` || ""}
                            alt="GraficaEstiloObs"
                            width={120}
                            height={120}
                            className="app-graph-image"
                        />
                    }
                </Grid>

            </Grid>
            {hoganData && hoganData?.comments !== null &&
                <Grid container size={12}>
                    {hoganData &&
                        <Grid size={12}>
                            <Box display={"flex"} alignItems={"center"} marginTop="2px">
                                <Typography variant='subtitle1' color="#319da3" marginRight="10px">Hogan: </Typography>
                                <Typography variant='h4'>{hoganData.assessmentDate}</Typography>
                            </Box>
                        </Grid>
                    }
                    <Grid size={4}>
                        <Box display={"flex"} marginTop="10px" alignItems={"center"}>
                            <Typography variant="h4" color={"black"} fontWeight={600} sx={{ background: "#ffaf06", padding: "5px", color: "#fff", marginRight: "10px" }}>HPI</Typography>
                            <Typography variant="h4" color={"black"} fontWeight={600}>Inventario de Personalidad de Hogan</Typography>
                        </Box>

                        {hoganData?.scores?.HPI?.map((score, index) => (
                            <GraficaEstilos key={score.category} title={score.category} value={Number(score.score)} color="#ffaf06" isLast={hoganData?.scores.HPI.length === index + 1} />
                        ))}
                    </Grid>
                    <Grid size={4}>
                        <Box display={"flex"} marginTop="10px" alignItems={"center"}>
                            <Typography variant="h4" color={"black"} fontWeight={600} sx={{ background: "#fa4a05", padding: "5px", color: "#fff", marginRight: "10px" }}>HDS</Typography>
                            <Typography variant="h4" color={"black"} fontWeight={600}>Encuesta de Desarollo de Hogan</Typography>
                        </Box>
                        {hoganData?.scores?.HDS?.map((score, index) => (
                            <GraficaPersonalidad key={score.category} title={score.category} value={Number(score.score)} color="#fa4a05" isLast={hoganData?.scores.HDS.length === index + 1} />
                        ))}
                    </Grid>
                    <Grid size={4}>
                        <Box display={"flex"} marginTop="10px" alignItems={"center"}>
                            <Typography variant="h4" color={"black"} fontWeight={600} sx={{ background: "#00a0cc", padding: "5px", color: "#fff", marginRight: "10px" }}>MVPI</Typography>
                            <Typography variant="h4" color={"black"} fontWeight={600}>Inventario de Motivos, Valores y Preferencias de Hogan</Typography>
                        </Box>
                        {hoganData?.scores?.MVPI?.map((score, index) => (
                            <GraficaValores key={score.category} title={score.category} value={Number(score.score)} color="#00a0cc" isLast={hoganData?.scores.MVPI.length === index + 1} />
                        ))}
                    </Grid>
                </Grid>
            }
            {showReturn &&
                <Grid size={12} display={"flex"} justifyContent={"end"} marginTop={"50px"} marginRight={"20px"}>
                    <Button
                        sx={{ background: "#fa4f00", borderRadius: "20px", color: "#fff", padding: "5px 30px", textTransform: "capitalize" }}
                        onClick={() => router.back()}>
                        Volver
                    </Button>

                </Grid>
            }
        </Grid>
    );
}

export default Graficos;