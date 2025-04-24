import React from 'react';
import { Box, Skeleton } from '@mui/material';

// Skeleton card for the manager/boss position
const BossCardSkeleton = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            alignContent: 'center',
            marginX: 'auto',
            width: '250px',
            height: '150px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#e0e0e0',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            mb: 3
        }}
    >
        <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={1} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={18} />
    </Box>
);

// Skeleton card for employee positions
const EmployeeCardSkeleton = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '250px',
            height: '150px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
    >
        <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="90%" height={1} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={18} />
    </Box>
);

// Row of employee skeletons
const EmployeeRowSkeleton = ({ count }: { count: number }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '40px',
            mb: 3,
            width: '100%'
        }}
    >
        {[...Array(count)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <EmployeeCardSkeleton />
            </Box>
        ))}
    </Box>
);

const OrganigramaSkeleton = () => {
    return (
        <>
            {/* Boss Card Skeleton */}
            <BossCardSkeleton />

            {/* Employee Rows - matching the layout in the image */}
            <Box sx={{ mt: '-60px', width: '100%', justifyContent: 'space-around' }}>
                <EmployeeRowSkeleton count={2} />
            </Box>
            <EmployeeRowSkeleton count={4} />
            <EmployeeRowSkeleton count={4} />
        </>
    );
};

export default OrganigramaSkeleton;