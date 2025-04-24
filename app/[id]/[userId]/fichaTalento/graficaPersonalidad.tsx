import { Box, Typography } from "@mui/material";
type GraficaProps = {
    title: string;
    value: number;
    color: string;
    isLast?: boolean;
};
const GraficaPersonalidad = ({ title, value, color, isLast }: GraficaProps) => {
    const calculateWidth = (part: number, value: number): string => {
        const result = value - part;
        return result > 0 ? "100%" : `${(value * 100) / part}%`;
    };

    return (
        <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
            <Typography variant="h4">{title}</Typography>
            <Box display={"flex"} sx={{ gap: 1, height: "5px" }}>
                <Box sx={{ height: "5px", display: "flex", width: "80%" }} gap={.5}>
                    <Box width={"10%"} sx={{
                        borderRadius: "20px 0px 0px 20px", background: "#cad2de", height: "100%", position: "relative",
                    }}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: calculateWidth(10, value), // Ajusta el ancho según el valor
                                height: "100%",
                                background: color, // Color superpuesto
                                borderRadius: "20px 0px 0px 20px",
                            }}
                        />
                        {isLast && <Typography marginTop="10px" textAlign="center" variant="h4" fontSize="10px">Sin Riesgo</Typography>}
                    </Box>
                    <Box width={"10%"} sx={{
                        borderRadius: "20px 0px 0px 20px", background: "#cad2de", height: "100%", position: "relative",
                    }}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: calculateWidth(10, value - 10), // Ajusta el ancho según el valor
                                height: "100%",
                                background: color, // Color superpuesto
                                borderRadius: "20px 0px 0px 20px",
                            }}
                        />
                        {isLast && <Typography marginTop="10px" textAlign="center" variant="h4" fontSize="10px">Bajo Riesgo</Typography>}
                    </Box>
                    <Box width={"30%"} sx={{ background: "#cad2de", height: "100%", position: "relative" }}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: calculateWidth(30, value - 20), // Ajusta el ancho según el valor
                                height: "100%",
                                background: color, // Color superpuesto
                                borderRadius: "0px 0px 0px 0px",
                            }}
                        />
                        {isLast && <Typography marginTop="10px" textAlign="center" variant="h4" fontSize="10px">Riesgo Moderado</Typography>}
                    </Box>
                    <Box width={"50%"} sx={{ borderRadius: "0px 20px 20px 0px", background: "#cad2de", height: "100%", position: "relative" }}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: calculateWidth(50, value - 50), // Ajusta el ancho según el valor
                                height: "100%", // Ajusta el ancho según el valor
                                background: color, // Color superpuesto
                                borderRadius: "0px 20px 20px 0px",
                            }}
                        />
                        {isLast && <Typography marginTop="10px" textAlign="center" variant="h4" fontSize="10px">Alto Riesgo</Typography>}
                    </Box>
                </Box>
                <Typography variant="subtitle1" sx={{ position: "relative", top: -5 }}>{value}</Typography>
            </Box>
        </Box>
    )
}

export default GraficaPersonalidad;