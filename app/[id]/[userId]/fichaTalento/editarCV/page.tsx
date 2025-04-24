import { Box } from "@mui/material";
import FormularioPersonal from "./FormularioPersonal";

const EditarCV = () => {
    return (
        <Box sx={{ display: "flex", height: "calc(100vh - 65px)", width: "100%", background: "#f2f2f2", gap: 15 }}>
            <FormularioPersonal />
        </Box>
    );
}

export default EditarCV;