'use client'

import { Box, Button, Typography } from "@mui/material"
import { CircularProgress } from '@mui/material';
import { useRouter, useParams } from "next/navigation";

type NavigationCardProps = {
    title: string;
    descriptions: string[];
    type: number;
    loading?: boolean;
}

const urls = ["/images/talento_del_negocio.png", "/images/carta_reemplazo.png"]
const colors = ["#f94e01", "#782d30"]
const loadingColors = ["#fa814b", "#754d4f"]

const NavigationCard = ({ title, descriptions, type, loading }: NavigationCardProps) => {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const handleClick = () => {
        if (type === 0) {
            localStorage.setItem("bloque", "1")
            window.dispatchEvent(new Event('localStorageChange'));
            router.push(`/${id}/temas`)
        } else {
            localStorage.setItem("bloque", "2")
            window.dispatchEvent(new Event('localStorageChange'));
            router.push(`/${id}/directoresn3`)
        }
    }

    return (
        <Box sx={{ borderRadius: "30px", boxShadow: " 0 4px 8px 2px rgba(0, 0, 0, 0.2)", width: "300px", height: "60%", padding: "10px", display: "flex", flexDirection: "column" }}>
            <Box sx={{ backgroundImage: `url(${urls[type]})`, height: "150px", backgroundSize: "cover", borderRadius: "20px 20px 0 0", width: "100%", display: "flex", alignItems: "center", padding: "10px" }}>
                <Typography variant="body2">{title}</Typography>
            </Box>
            <Box padding={"20px"}>
                <ul>
                    {descriptions.map((description: string, index: number) => (
                        <li key={index}>
                            <Typography key={index} variant="subtitle1">{description}</Typography>
                        </li>
                    ))}

                </ul>
            </Box>
            <Box sx={{ marginTop: "auto", borderTop: `1px solid ${colors[type]}`, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Button
                    sx={{
                        textTransform: "capitalize",
                        background: loading ? loadingColors[type] : colors[type],
                        color: "white",
                        borderRadius: "20px",
                        margin: "15px",
                        width: "70%",
                        boxShadow: " 0 4px 8px 2px rgba(0, 0, 0, 0.2)"
                    }}
                    disabled={loading}
                    onClick={handleClick}
                >
                    {loading ? <CircularProgress size={20} style={{ 'color': 'white' }} /> : "Iniciar"}
                </Button>
            </Box>
        </Box>
    )
}

export default NavigationCard