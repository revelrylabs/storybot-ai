#!/usr/bin/env node
import readline from "readline/promises";
import { OpenAI } from "langchain/llms/openai";
import { exec } from "child_process";
import chalk from "chalk";

const { OPENAI_API_KEY } = process.env;
const isYes = (str) => str == "Y" || str == "y";
const logBold = (msg) => console.log(chalk.bold(msg));
const logSuccess = (msg) => console.log(chalk.green.bold(msg));
const logWarning = (msg) => console.error(chalk.yellow.bold(msg));
const logError = (msg) => console.error(chalk.red.bold(`ERROR: ${msg}`));

let issueContent = "";

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
  const contextText =
    contextIndex > -1
      ? process.argv[contextIndex + 1]
      : "Context: Act as a product manager at a software development company. Write a user story for the 'Feature' defined below. Explain in detailed steps how to implement this in a section called 'Implementation Notes' at the end of the story. Please make sure that the implementation notes are complete; do not leave any incomplete sentences.";

  return { featureText, techStackText, contextText };
};

const generatePrompt = () => {
  const { featureText, techStackText, contextText } = parseArgs();

  return `${contextText}

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

const prompt = generatePrompt();

const chat = new OpenAI({
  openAIApiKey: OPENAI_API_KEY,
  streaming: true,
  temperature: 0,
  callbacks: [
    {
      handleLLMNewToken(token) {
        issueContent = issueContent += token.replace(/"/g, '\\"');
        process.stdout.write(token);
      },
    },
  ],
});

logBold("\n\nWe can work with that...\n");

await chat.call(prompt);

console.log(
  "\n\n==========================================================\n\n"
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => rl.question(chalk.bold(question));

try {
  const shouldCreateIssue = await askQuestion(
    "Would you like to create an issue in GitHub? (NOTE: This requires the GitHub CLI. See https://github.com/cli/cli#installation if you don't have it.) y/n  \n\n"
  );

  if (isYes(shouldCreateIssue)) {
    const issueTitle = await askQuestion(
      "What you like to call this issue?\n\n"
    );
    const repo = await askQuestion(
      "Enter the `organization/repo` (e.g. `revelrylabs/ai`) for this issue: \n\n"
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
    logSuccess("\n\nOK, all done! 🤘");
    rl.close();
  }
} catch (err) {
  logError(err);
}
