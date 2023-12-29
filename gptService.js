// gptService.js

const OpenAI = require("openai");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const openai = new OpenAI({
  apiKey: "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",
}); // DO NOT MAKE THIS PUBLIC

// NOTE: Right now assistant is created only once and the file is discarted on our end - to save on money
// it might be good to store the file on MongoDB and to build the tutor only on days that the user boots it
// up, as storage is priced at 0.20$ per day per assistant

// Function for creating OpenAI Assistant Tutor that specilizies in the the subject covered in the uploaded files
// additional parameters can be passed to modify personality and behaviour of the tutor
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
        "You are an expert tutor specializing in the subjects covered in the files provided." +
        "Utilizing the knowledge from the files provided, respond to the user's inquiries with detailed explanations," +
        "examples, and analogies. Engage in an interactive learning experience, encouraging curiosity and deeper understanding." +
        "Answer questions comprehensively, clarify complex concepts, and provide insights that enhance the learning journey." +
        "Remember to adapt your responses to suit the user's level of understanding, from beginner to advanced, " +
        "ensuring a supportive and enriching educational environment." +
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


// Helper delay function
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Handles file upload to openai, returns file openai object
async function uploadFile(files) {
  try {
    const fileID = await openai.files.create({
      file: fs.createReadStream(files),
      purpose: "assistants",
    });
    return fileID;
  } catch (error) {
    console.error(error);
  }
}

async function save_to_pdf(text, filename) {
  // Create a document
  const doc = new PDFDocument();

  // Pipe its output somewhere, like to a file or HTTP response
  // NOTE: SAVE TO DB ONCE IMPLEMENTED
  doc.pipe(fs.createWriteStream(filename + ".pdf"));

  // Add your text to the document
  doc.text(text);

  // Finalize the PDF and end the stream
  doc.end();
}

// Get the last assistant message from the messages array --> returns a string of the last message
async function get_last_message(thread, run) {
  // Imediately fetch run-status, which will be "in_progress"
  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  // Polling mechanism to see if runStatus is completed
  while (runStatus.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  // Check for failed, cancelled, or expired status (ADD ERROR HERE IF FAILED)
  if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
    console.log(
      `Run status is '${runStatus.status}'. Unable to complete the request.`
    );
  }

  const messages = await openai.beta.threads.messages.list(thread.id);

  // Find the last message for the current run
  const lastMessageForRun = messages.data
    .filter(
      (message) => message.run_id === run.id && message.role === "assistant"
    )
    .pop();

  // If an assistant message is found, return it
  if (lastMessageForRun) {
    return lastMessageForRun.content[0].text.value;
  } else if (!["failed", "cancelled", "expired"].includes(runStatus.status)) {
    console.log("No response received from the assistant.");
  }
}

// Creates a curriculum based on the files uploaded to the assistant and returns it in JSON format
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
          " and DO NOT add '''json at the beginning. Let the format be as follows:" +
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
  let curriculum = JSON.parse(await get_last_message(thread, run));
  console.log("Now generating summaries...");
  let intro = generate_intro(assistantID, thread);
  let test = generate_summaries(assistantID, curriculum, thread);
  // NOTE: save JSON file to db once implemented !!!!!!!!!
  return curriculum;
}

async function generate_intro(assistantID, thread) {
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
}

async function generate_summaries(assistantID, curriculum, thread) {
  for (const lesson in curriculum) {
    if (curriculum.hasOwnProperty(lesson)) {
      // Add a message to the thread
      const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content:
          "Write a summary for the following lesson: " + curriculum[lesson].Title,
      });

      // Initiate a run of given thread
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantID,
      });

      // Wait for the run to complete
      while(true) {
        let runInfo = await openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        if(runInfo.completed_at) {
          break
        }
        // delays for 1 sec
        console.log("Waiting 1 second...")
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      let summary = await get_last_message(thread, run);
      save_to_pdf(summary, curriculum[lesson].Title + " Summary");
    }
  }
}

module.exports = { createAssistant, uploadFile, generate_curriculum };
