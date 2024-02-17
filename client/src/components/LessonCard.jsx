import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
} from "@nextui-org/react";
import LessonSummaryButton from "./LessonSummaryButton";
export default function LessonCard({ lessonNumber, lessonTitle, courseID }) {
  return (
    <Card
      isFooterBlurred
      className="flex flex-col justify-center max-w-[400px] dark text-foreground bg-content1"
    >
      <CardHeader className="flex gap-3 justify-center">
        <div className="flex flex-col">
          <p
            style={{ fontSize: "2em", fontFamily: "Arial" }}
            className="text-xl text-bold"
          >
            {lessonNumber}
          </p>
          <br />
          <Divider />
          <br />
          <p className="text-large text-bold">{lessonTitle}</p>
        </div>
      </CardHeader>

      <CardBody className="flex flex-col justify-center gap-2">
        <LessonSummaryButton courseID={courseID} lessonTitle={lessonTitle} />
        <Button
          href={`/quiz/${courseID}/${encodeURIComponent(lessonTitle)}`}
          as={Link}
          color="default"
          size="lg"
        >
          Lesson Quiz
        </Button>
      </CardBody>
      <Divider />
      <CardFooter className="flex flex-col justify-center gap-3 justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1  before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10"></CardFooter>
    </Card>
  );
}
