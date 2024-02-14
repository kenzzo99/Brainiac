import React, { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import axios from 'axios'; // Assuming you're using axios to fetch data
import PDFViewer from './PDFViewer';

function LessonSummaryButton({ lessonTitle }) {
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        // Fetch the summary from MongoDB when the component mounts
        const fetchSummary = async () => {
            const res = await axios.get(`/api/summary/${lessonTitle}`); // Assuming you have an API endpoint to fetch the summary --> IMPLEMENT THIS
            setSummary(res.data);
        };

        fetchSummary();
    }, [lessonTitle]);

    const handleClick = async () => {
        if (!summary) {
            // If the summary hasn't been generated, generate it
            const res = await axios.get(`http://localhost:5000/generateSummary/${lessonTitle}`);
            const newSummary = res.data;
            setSummary(newSummary);
        }
    };

    return (
        <div>
            <Button color="primary" size="lg" onClick={handleClick}>
                Lesson Summary
            </Button>
            {summary && <PDFViewer file={summary} />}
        </div>
    );
}

export default LessonSummaryButton;