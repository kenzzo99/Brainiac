import React from "react";
import {Button, Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import LessonSummaryButton from "./LessonSummaryButton";

export default function LessonCard({ lessonNumber, lessonTitle }) {
  return (
    <Card className="max-w-[400px]">
      <CardHeader className="flex gap-3 justify-center">
        <div className="flex flex-col">
          <p className="text-large text-bold">{lessonNumber}</p>
          <p className="text-large text-bold">{lessonTitle}</p>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        <p>{}</p>
      </CardBody>
      <Divider/>
      <CardFooter className="flex flex-col gap-3 justify-center">
        <LessonSummaryButton lessonId={lessonTitle} />
          <Button color="primary" size="lg">
      Lesson Quiz
    </Button>
      </CardFooter>
    </Card>
  );
}
