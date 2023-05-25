#!/usr/bin/env node
import readline from "readline/promises";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { exec } from "child_process";
import chalk from "chalk";
import ora from 'ora';

const { OPENAI_API_KEY } = process.env;
const isYes = (str) => ["", "y", "yes"].includes(str.trim().toLowerCase());
const logBold = (msg) => console.log(chalk.bold(msg));
const logSuccess = (msg) => console.log(chalk.green.bold(msg));
const logError = (msg) => console.error(chalk.red.bold(`ERROR: ${msg}`));
let spinner = null;

const parseArgs = () => {
  if (!OPENAI_API_KEY) {
    logError(
      '`OPENAI_API_KEY` has not been set. \n\nThis is required in order to generate issues with Open AI.\n Once you have an OpenAI account, you can get an API Key here: https://platform.openai.com/account/api-keys.\n Export the environment variable in your terminal with `export OPEN_API_KEY="sk-abcdefghijklmnopqrstuvwxyz"`.'
    );

    process.exit(1);
  }

  if (process.argv.length < 3) {
    logBold(
      "\nPlease provide a brief desciption of the story you want to generate as the first argument."
    );

    process.exit(1);
  }

  const featureText = `'Feature': ${process.argv[2]}`;

  const techStackIndex = process.argv.indexOf("--stack");
  let techStackText = "";
  if (techStackIndex > -1) {
    techStackText = `Tech Stack: ${process.argv[techStackIndex + 1]}`;
  }

  const contextIndex = process.argv.indexOf("--context");
  const contextText = contextIndex > -1 ? process.argv[contextIndex + 1] : "";

  return { featureText, techStackText, contextText };
};

const generateInitialPrompt = () => {
  const { featureText, techStackText, contextText } = parseArgs();

  return `Context: Act as a product manager at a software development company. Write a user story for the 'Feature' defined below. Explain in detailed steps how to implement this in a section called 'Implementation Notes' at the end of the story. Please make sure that the implementation notes are complete; do not leave any incomplete sentences. ${contextText}

  ${featureText}

  ${techStackText}

  User Story Spec:
    overview:
      "The goal is to convert your response into a GitHub Issue that a software engineer can use to implement the feature. Start your response with a 'Background' section, with a few sentences about why this feature is valuable to the application and why we want the user story written. Follow with one or more 'Scenarios' containing the relevant Acceptance Criteria (AC). Use markdown format, with subheaders (e.g. '##' ) for each section (i.e. '## Background', '## Scenario - [Scenario 1]', '## Implementation Notes').",
    scenarios:
    "detailed stories covering the core loop of the feature requested",
    style:
      "Use BDD / gherkin style to describe the user scenarios, prefacing each line of acceptance criteria (AC) with a markdown checkbox (e.g. '- [ ]').",
  }`;
};

const askQuestion = (rl, question) => rl.question(chalk.bold(question));

const maybeCreateIssue = async (rl, issueContent) => {
  const shouldCreateIssue = await askQuestion(
    rl,
    "Would you like to create an issue in GitHub? (NOTE: This requires the GitHub CLI. See https://github.com/cli/cli#installation if you don't have it.)  "
  );

  if (isYes(shouldCreateIssue)) {
    const issueTitle = await askQuestion(
      rl,
      "What you like to call this issue?  "
    );
    const repo = await askQuestion(
      rl,
      "Enter the `organization/repo` (e.g. `revelrylabs/storybot-ai`) for this issue:  "
    );

    exec(
      `gh issue create --web --repo ${repo} -t "${issueTitle}" -b "${issueContent}"`,
      (output) => {
        if (output == null) {
          logSuccess(
            `\n\nContinue from your browswer to finish adding your issue to to ${repo}! 🤘`
          );
        } else {
          logError(output);
        }
        rl.close();
      }
    );
  } else {
    rl.close();
    logSuccess("Ok, all done! 🤘");
  }
};

const maybeFinish = async (issueContent, chain) => {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const continueConversation = await askQuestion(
      rl,
      "Would you like to make any changes to this user story?  "
    );
    if (isYes(continueConversation)) {
      const changesRequested = await askQuestion(
        rl,
        "Tell me what you want to change.  \n\n"
      );
      rl.close();

      const newIssueContent = await sendPrompt(chain, `I need to make some changes to the user story you just output. Please output a new user story with the following adjustments: ${changesRequested}`);

      maybeFinish(newIssueContent, chain);
    } else {
      maybeCreateIssue(rl, issueContent);
    }
  } catch (err) {
    rl.close();
    logError(err);
  }
};

const sendPrompt = async (chain, prompt) => {
  const { response } = await chain.call({input: prompt});

  console.log(
    "\n\n==========================================================\n\n"
  );

  // Escape double quotes so that it can be sent to to github via GH CLI
  return response.replace(/"/g, '\\"');
};

const initialPrompt = generateInitialPrompt()

logSuccess(`
     /\\  __________                   .__                           .__ 
    / /  \\______   \\ _______  __ ____ |  |_______ ___.__.    _____  |__|
   / /    |       _// __ \\  \\/ // __ \\|  |\\_  __ <   |  |    \\__  \\ |  |
  / /     |    |   \\  ___/\\   /\\  ___/|  |_|  | \\/\\___  |     / __ \\|  |
 / /      |____|_  /\\___  >\\_/  \\___  >____/__|   / ____| /\\ (____  /__|
 \\/              \\/     \\/          \\/            \\/      \\/      \\/    
`);

spinner = ora({spinner: "fistBump"}).start();

const model = new OpenAI({
  streaming: true,
  temperature: 0.6,
  modelName: "gpt-3.5-turbo",
  maxTokens: 512,
  callbacks: [
    {
      handleLLMNewToken(token) {
        if (spinner) {
          spinner.stop();
          spinner = null;
        }

        process.stdout.write(token);
      },
    },
  ],
});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory: memory });
const issueContent = await sendPrompt(chain, initialPrompt);

maybeFinish(issueContent, chain);
