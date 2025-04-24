import React, { Suspense, use } from 'react';
import { Box } from '@mui/material';
import OrganigramaSkeleton from './OrganigramaSkeleton';
import LocalStorageProvider from './LocalStorageProvider';

// Server component with React.use() for params
export default function Organigrama({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "calc(100vh - 65px)", background: "#f2f2f2" }}>
            <div className="organigrama_container">
                <Suspense fallback={<OrganigramaSkeleton />}>
                    <LocalStorageProvider area={id} />
                </Suspense>
            </div>
        </Box>
    );
}