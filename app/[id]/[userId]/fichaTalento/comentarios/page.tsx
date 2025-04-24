'use client';

import { useProfileContext } from "@/context/ProfileContext";
import { Box } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Graficos from "../graficos";
import EditableComment from "../../app/EditableComment";
import { useState, useEffect } from "react";
import { HoganAssessment, MGTData } from "../types";

const Comentarios = () => {
  const { profileState, setProfileState } = useProfileContext();
  const { userId, userName, positionId } = profileState;

  const [hoganData, setHoganData] = useState<HoganAssessment | null>(null);
  const [mgtData, setMgtData] = useState<MGTData | null>(null);

  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isPDF = searchParams.get('isPDF') === 'true';

  useEffect(() => {
    const updateDataFromStorage = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let hoganDataFromStorage: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let mgtDataFromStorage: any;
      if (isPDF) {
        const queryParams = new URLSearchParams({
          userId: searchParams.get('userId') || '',
          positionId: searchParams.get('positionId') || '',
          userName: searchParams.get('userName') || '',
          isPDF: 'true',
        });
        const hoganEndpoint = `/api/hogan?${queryParams.toString()}`;
        const mgtEndpoint = `/api/mgt?${queryParams.toString()}`;
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

        const [hogan, mgt] = await Promise.all([
          fetchHogan,
          fetchMGT,
        ]);
        setHoganData(hogan);
        setMgtData(mgt);
      } else {
        hoganDataFromStorage = JSON.parse(localStorage.getItem('hoganData') || 'null');
        mgtDataFromStorage = JSON.parse(localStorage.getItem('mgtData') || 'null');
        setHoganData(hoganDataFromStorage);
        setMgtData(mgtDataFromStorage);
      }

      setProfileState((prevState) => ({
        ...prevState,
        hoganData: hoganDataFromStorage,
        mgtData: mgtDataFromStorage,
      }));
    };

    updateDataFromStorage();

    const handleStorageChange = () => {
      updateDataFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const [commentsState, setCommentsState] = useState<Record<number, string>>({});
  const [mgtCommentsState, setMgtCommentsState] = useState<Record<number, string>>({});

  useEffect(() => {
    if (hoganData?.comments) {
      setCommentsState(
        hoganData.comments.reduce((acc, comentario, index) => {
          (acc as Record<number, string>)[index] = comentario.comment ?? "";
          return acc;
        }, {})
      );
    }
    if (mgtData?.comments) {
      setMgtCommentsState(
        mgtData.comments.reduce((acc, comentario, index) => {
          (acc as Record<number, string>)[index] = comentario.originalComment ?? "";
          return acc;
        }, {})
      );
    }
  }, [hoganData, mgtData]);

  const handleSaveHogan = (index: number, newContent: string) => {
    setCommentsState((prevState) => ({
      ...prevState,
      [index]: newContent,
    }));
  };

  const handleSaveMgt = (index: number, newContent: string) => {
    setMgtCommentsState((prevState) => ({
      ...prevState,
      [index]: newContent,
    }));
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", height: "calc(100vh - 65px)", width: "100%", background: "#f2f2f2", gap: 15, padding: "15px" }}>
      <Grid container size={12} spacing={2}>
        <Grid size={5}>
          {mgtData?.comments?.map((comentario, index) => (
            <EditableComment
              type="mgt"
              key={`mgt-${index}`}
              content={<div dangerouslySetInnerHTML={{ __html: mgtCommentsState?.[index] ?? "" }} />}
              onSave={(newContent) => handleSaveMgt(index, newContent)}
              category={comentario.category}
              userId={userId ?? ""}
              userName={userName ?? ""}
              positionId={positionId ?? ""}
              allComments={mgtData?.comments || []}
              isFichaTalento={true}
              lengthComment={hoganData?.comments?.length ?? 0}
            />
          ))}
          {hoganData?.comments?.map((comentario, index) => (
            <EditableComment
              type="hogan"
              key={`hogan-${index}`}
              content={<div dangerouslySetInnerHTML={{ __html: commentsState?.[index] ?? "" }} />}
              onSave={(newContent) => handleSaveHogan(index, newContent)}
              category={comentario.category}
              userId={userId ?? ""}
              userName={userName ?? ""}
              positionId={positionId ?? ""}
              allComments={hoganData?.comments || []}
              isFichaTalento={true}
              lengthComment={hoganData?.comments?.length ?? 0}
            />
          ))}
        </Grid>
        <Graficos mgtData={mgtData} hoganData={hoganData} size={7} showReturn={true && !isPDF} />
      </Grid>
    </Box>
  );
};

export default Comentarios;