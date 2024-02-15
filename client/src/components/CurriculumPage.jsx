import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonCard from './LessonCard';
import './CurriculumPage.css';

function CurriculumPage() {
    const { courseID } = useParams(); // Get the courseID from the URL
    const [curriculum, setCurriculum] = useState({});

    useEffect(() => {
        // Fetch curriculum from MongoDB using courseID
        const fetchCurriculum = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/curriculum/${courseID}`);
                // Check if the response is ok
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Try to parse the response as JSON
                const data = await response.text();
                console.log('Curriculum data:', data);
                setCurriculum(JSON.parse(data));
            } catch (error) {
                console.error('Error fetching curriculum:', error);
            }
        };

        fetchCurriculum();
    }, [courseID]);

    return (
        <div className="curriculum flex flex-col gap-3">
            {Object.entries(curriculum).map(([lesson, details], index) => (
                <LessonCard key={index} lessonNumber={lesson} lessonTitle={details.Title} courseID={courseID} />
            ))}
        </div>
    );
}

export default CurriculumPage;