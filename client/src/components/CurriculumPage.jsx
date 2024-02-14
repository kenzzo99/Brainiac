import React, { useContext } from 'react';
import CurriculumContext from '../context/CurriculumContext'; // Import the context
import LessonCard from './LessonCard'; // Import the LessonCard component
import './CurriculumPage.css'; // Import the CSS file


function CurriculumPage() {
    const { curriculum } = useContext(CurriculumContext);

    return (
        <div className="curriculum flex flex-col gap-3">
            {Object.entries(curriculum).map(([lesson, details], index) => (
                <LessonCard key={index} lessonNumber={lesson} lessonTitle={details.Title} />
            ))}
        </div>
    );
}

export default CurriculumPage;