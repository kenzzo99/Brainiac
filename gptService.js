// gptService.js

/**
 * @fileoverview This module provides functions for creating an OpenAI Assistant Tutor and relevant materials.
 */

const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");
require("dotenv").config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const Lesson = require("./models/lesson");
// NOTE: Right now assistant is created only once and the file is discarted on our end - to save on money
// it might be good to store the file on MongoDB and to build the tutor only on days that the user boots it
// up, as storage is priced at 0.20$ per day per assistant

/**
 * Creates an OpenAI Assistant Tutor that specializes in the subject covered in the uploaded files.
 * Additional parameters can be passed to modify personality and behaviour of the tutor.
 *
 * @async
 * @param {string} file - The file to be used for creating the assistant.
 * @param {string} [AssistantName="AInstein"] - The name of the assistant.
 * @param {string} [AssistantInstructions=""] - The instructions for the assistant.
 * @param {string} [AssistantPersonality=""] - The personality of the assistant.
 * @returns {Promise<Object>} The created assistant.
 * @throws {Error} If there is an error in creating the assistant.
 */
async function createAssistant(
  file,
  AssistantName = "AInstein",
  AssistantInstructions = "",
  AssistantPersonality = ""
) {
  try {
    const assistant = await openai.beta.assistants.create({
      name: AssistantName,
      instructions:
        "You are an expert tutor specializing in the subjects covered in the files provided. " +
        "Utilizing the knowledge from the files provided, respond to the user's inquiries with " +
        "detailed explanations. Your responses should be detailed and thorough, utilizing the " +
        "knowledge from the files provided. It is important to provide comprehensive explanations, " +
        "using examples and analogies to enhance understanding. In addition, please clarify any complex " +
        "concepts and offer insights that contribute to the user's learning journey." +
        AssistantInstructions +
        AssistantPersonality,
      tools: [{ type: "retrieval" }],
      model: "gpt-4-1106-preview", // SWITCH MODELS HERE
      file_ids: [file.id],
    });

    return assistant;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Uploads a file to OpenAI and returns the file's OpenAI object.
 *
 * @async
 * @param {string} files - The path to the file to be uploaded.
 * @returns {Promise<Object>} The OpenAI object for the uploaded file.
 * @throws {Error} If there is an error in uploading the file.
 */
async function uploadFile(files) {
  try {
    const fileID = await openai.files.create({
      file: fs.createReadStream(files),
      purpose: "assistants",
    });
    return fileID;
  } catch (error) {
    console.error(error);
    throw new Error("File upload failed");
  }
}

/**
 * Saves a given text to a PDF file.
 *
 * @async
 * @param {string} text - The text to be saved to the PDF.
 * @param {string} filename - The name of the PDF file.
 * @returns {Promise<void>} Resolves when the PDF has been successfully saved.
 * @throws {Error} If there is an error in saving the PDF.
 */
async function save_to_pdf(text, filename) {
  try {
    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // NOTE: SAVE TO DB ONCE IMPLEMENTED
    doc.pipe(fs.createWriteStream(filename + ".pdf"));

    // Add your text to the document
    doc.text(text);

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save PDF");
  }
}

/**
 * Retrieves the last message from a given thread and run.
 *
 * @async
 * @param {Object} thread - The thread object.
 * @param {Object} run - The run object.
 * @returns {Promise<Object>} The last message from the given thread and run.
 * @throws {Error} If there is an error in retrieving the last message.
 */
async function get_last_message(thread, run) {
  try {
    // Imediately fetch run-status, which will be "in_progress"
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Polling mechanism to see if runStatus is completed
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Check for failed, cancelled, or expired status (ADD ERROR HERE IF FAILED)
    if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
      throw new Error(
        `Run status is '${runStatus.status}'. Unable to complete the request.`
      );
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log("JSON.stringify(messages): " + JSON.stringify(messages));
    console.log("response = messages.data[0].content[0].text.value: " + messages.data[0].content[0].text.value);
    return messages;

  } catch (error) {
    console.error(error);
    throw new Error("Failed to get last message");
  }
}

/**
 * Generates a curriculum based on the given assistant ID.
 *
 * @async
 * @param {string} assistantID - The ID of the assistant.
 * @returns {Promise<Array>} An array where the first element is the generated curriculum and the second element is the thread.
 * @throws {Error} If there is an error in generating the curriculum.
 */
async function generate_curriculum(assistantID) {
  // Create a thread with an initial message
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          "Based on the material provided, split it into 6 lessons " +
          "with the goal of making the student understand the material as much " +
          "as possible. Please output lesson numbers and titles as a json file. " +
          "Please output the json file and nothing else. Begin your response with {" +
          " and WITHOUT '''json at the beginning. Let the format be as follows:" +
          '{ "Lesson 1": { "Title": "<insert title here>"}, etc. ',
      },
    ],
  });
  console.log("assistant_id: " + assistantID);

  // Initiate a run of said thread
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantID,
  });

  // Get last message (JSON string of the curriculum)
  let response = await get_last_message(thread, run);
  let message_content = response.data[0].content[0].text.value
  console.log("Message Content: " + message_content);

  // const jsonPattern = /{.*?}}/g;
  // const match = message_content.match(jsonPattern);

  
  // if (match) {
  //   curriculum = JSON.parse(match);
  // }

  let curriculum = JSON.parse(message_content);
  console.log("Curriculum: " + curriculum);
  return curriculum;
}

/**
 * Generates an introduction for a given assistant ID and thread.
 *
 * @async
 * @param {string} assistantID - The ID of the assistant.
 * @param {Object} thread - The thread object.
 * @returns {Promise<void>} Resolves when the introduction has been successfully generated and saved to a PDF.
 * @throws {Error} If there is an error in generating the introduction.
 */
async function generate_intro(assistantID, thread) {
  try {
    console.log("Generating Intro...");
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content:
        "Write a few paragraphs of introduction to the topic covered in the materials." +
        "Then write a short intro to the curriculum, going over what is covered in each lesson.",
    });

    // Initiate a run of given thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantID,
    });

    let intro = await get_last_message(thread, run);
    // save summary to pdf
    save_to_pdf(intro, "Intro");
  } catch (error) {
    console.error("Error generating introduction:", error);
  }
}

/**
 * Generates summaries for each lesson in the curriculum.
 *
 * @async
 * @param {string} assistantID - The ID of the assistant.
 * @param {Object} curriculum - The curriculum object.
 * @param {Object} thread - The thread object.
 * @returns {Promise<void>} Resolves when the summaries have been successfully generated and saved to PDFs.
 * @throws {Error} If there is an error in generating the summaries.
 */

async function generate_summary(assistantID, lesson, thread) {
  try {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content:
        `Generate the material for the following lesson: ${lesson}.` +
        "The material you generate should include information from the uploaded material. Write the lesson" +
        "so that it gives a student reading it deep comprehension of the topic. End by writing 3-5 relevant discussion questions.",
    });

    // Initiate a run of given thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantID,
    });

    // Wait for the run to complete
    let retries = 0;
    while (retries < 10) {
      const runInfo = await openai.beta.threads.runs.retrieve(
        (thread_id = thread.id),
        (run_id = run.id)
      );
      if (runInfo.completed_at) {
        break;
      }
      // delays for 5 sec
      console.log("Waiting 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      retries++;
    }

    const summary = await get_last_message(thread, run);

    // save summary to pdf
    save_to_pdf(summary, lesson + " Summary");
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
  }
}

async function generate_summaries(assistantID, curriculum, thread) {
  try {
    console.log("Generating summaries...");
    // For each lesson in the curriculum JSON file, generate a material to read and study from
    for (const lesson in curriculum) {
      if (Object.prototype.hasOwnProperty.call(curriculum, lesson)) {
        // Add a message to the thread
        const message = await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content:
            `Generate the material for the following lesson: ${curriculum[lesson].Title}.` +
            "The material you generate should include information from the uploaded material. Write the lesson" +
            "so that it gives a student reading it deep comprehension of the topic. End by writing 3-5 relevant discussion questions.",
        });

        // Initiate a run of given thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantID,
        });

        // Wait for the run to complete
        let retries = 0;
        while (retries < 10) {
          const runInfo = await openai.beta.threads.runs.retrieve(
            (thread_id = thread.id),
            (run_id = run.id)
          );
          if (runInfo.completed_at) {
            break;
          }
          // delays for 5 sec
          console.log("Waiting 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          retries++;
        }

        const summary = await get_last_message(thread, run);
        save_to_pdf(summary, curriculum[lesson].Title + " Summary");
      }
    }
  } catch (error) {
    console.error("Error generating summaries:", error);
  }
}

/**
 * Generates a quiz for each lesson in the curriculum.
 *
 * @async
 * @param {string} assistantID - The ID of the assistant.
 * @param {Object} curriculum - The curriculum object.
 * @param {Object} thread - The thread object.
 * @returns {Promise<void>} Resolves when the quizzes have been successfully generated and saved to PDFs.
 * @throws {Error} If there is an error in generating the quizzes.
 */
async function generate_quiz(assistantID, curriculum, thread) {
  try {
    // For each lesson in the curriculum JSON file, generate a quiz
    for (const lesson in curriculum) {
      if (Object.prototype.hasOwnProperty.call(curriculum, lesson)) {
        // Add a message to the thread
        const message = await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content:
            `Generate a quiz of 6-10 questions for the following lesson: ${curriculum[lesson].Title}.` +
            "Please output the json text and nothing else. Begin your response with {" +
            " and DO NOT add '''json at the beginning. Follow this format CLOSELY:" +
            '{"question #": <question goes here>","options": [<options>],' +
            '"correct_answer": <asnwer>}, question #: etc.',
        });

        // Initiate a run of given thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantID,
        });

        // Wait for the run to complete
        let retries = 0;
        while (retries < 10) {
          const runInfo = await openai.beta.threads.runs.retrieve(
            (thread_id = thread.id),
            (run_id = run.id)
          );
          if (runInfo.completed_at) {
            break;
          }
          // delays for 5 sec
          console.log("Waiting 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          retries++;
        }

        const quiz = await get_last_message(thread, run);
        save_to_pdf(quiz, curriculum[lesson].Title + " Summary");
      }
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
  }
}

module.exports = {
  createAssistant,
  uploadFile,
  generate_curriculum,
  generate_intro,
  generate_quiz,
  generate_summaries,
};
