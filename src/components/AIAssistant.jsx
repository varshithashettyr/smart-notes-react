import { useMemo, useState } from "react";

/*
  SMART NOTES - LOCAL SMART ASSISTANT

  No API
  No external service
  No API key

  The assistant analyzes the actual note text locally.
  It is designed to work with different kinds of notes:
  work, study, personal, food, travel, ideas,
  shopping, health/lifestyle, programming, etc.
*/

const CATEGORY_RULES = {
  Work: [
    "work",
    "office",
    "company",
    "meeting",
    "manager",
    "team",
    "project",
    "client",
    "employee",
    "job",
    "career",
    "developer",
    "developer",
    "intern",
    "internship",
    "deadline",
    "task",
    "business",
    "professional",
  ],

  Study: [
    "study",
    "studied",
    "learn",
    "learning",
    "exam",
    "test",
    "assignment",
    "college",
    "school",
    "class",
    "subject",
    "chapter",
    "homework",
    "practice",
    "course",
    "tutorial",
  ],

  Personal: [
    "family",
    "friend",
    "friends",
    "mom",
    "mother",
    "dad",
    "father",
    "brother",
    "sister",
    "birthday",
    "today",
    "yesterday",
    "weekend",
    "home",
    "life",
    "myself",
    "feel",
    "feeling",
  ],

  Ideas: [
    "idea",
    "ideas",
    "build",
    "create",
    "creation",
    "concept",
    "design",
    "feature",
    "imagine",
    "plan",
    "innovation",
    "invent",
    "project idea",
  ],

  Important: [
    "important",
    "urgent",
    "remember",
    "reminder",
    "critical",
    "warning",
    "deadline",
    "must",
    "required",
    "priority",
  ],
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "then",
  "than",
  "this",
  "that",
  "these",
  "those",
  "with",
  "from",
  "into",
  "onto",
  "for",
  "you",
  "your",
  "yours",
  "are",
  "was",
  "were",
  "is",
  "am",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "might",
  "to",
  "of",
  "in",
  "on",
  "at",
  "as",
  "it",
  "its",
  "i",
  "me",
  "my",
  "we",
  "our",
  "they",
  "their",
  "he",
  "she",
  "him",
  "her",
  "was",
  "were",
  "very",
  "really",
  "just",
  "also",
  "so",
  "because",
  "about",
  "after",
  "before",
  "today",
  "yesterday",
  "tomorrow",
  "there",
  "here",
  "all",
  "some",
  "more",
  "much",
  "many",
  "like",
  "get",
  "got",
  "getting",
  "make",
  "made",
  "doing",
  "done",
  "thing",
  "things",
  "one",
  "two",
]);

const POSITIVE_WORDS = [
  "happy",
  "excited",
  "great",
  "good",
  "love",
  "loved",
  "enjoy",
  "enjoyed",
  "fun",
  "amazing",
  "wonderful",
  "proud",
  "successful",
  "success",
  "beautiful",
  "nice",
  "glad",
  "hopeful",
  "motivated",
];

const NEGATIVE_WORDS = [
  "sad",
  "angry",
  "bad",
  "difficult",
  "hard",
  "problem",
  "failed",
  "failure",
  "worried",
  "stress",
  "stressed",
  "tired",
  "confused",
  "upset",
  "disappointed",
  "frustrated",
  "hate",
  "error",
  "mistake",
];

const ACTION_WORDS = [
  "need",
  "should",
  "must",
  "want",
  "plan",
  "planned",
  "try",
  "learn",
  "practice",
  "finish",
  "complete",
  "improve",
  "build",
  "create",
  "start",
];

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordsFrom(text = "") {
  return normalize(text)
    .split(" ")
    .filter(Boolean);
}

function sentencesFrom(text = "") {
  return text
    .replace(/\s+/g, " ")
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function containsAny(text, list) {
  const normalized = normalize(text);

  return list.some((item) =>
    normalized.includes(normalize(item))
  );
}

function meaningfulWords(text) {
  return wordsFrom(text).filter(
    (word) =>
      word.length > 2 &&
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word)
  );
}

function getWordFrequency(text) {
  const frequency = {};

  meaningfulWords(text).forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return frequency;
}

function getImportantWords(text, limit = 6) {
  const frequency = getWordFrequency(text);

  return Object.entries(frequency)
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      return b[0].length - a[0].length;
    })
    .slice(0, limit)
    .map(([word]) => word);
}

function detectSentiment(text) {
  const positive = POSITIVE_WORDS.filter((word) =>
    containsAny(text, [word])
  ).length;

  const negative = NEGATIVE_WORDS.filter((word) =>
    containsAny(text, [word])
  ).length;

  if (positive > negative) {
    return "positive";
  }

  if (negative > positive) {
    return "negative";
  }

  return "neutral";
}

function detectCategory(text, currentCategory) {
  const normalized = normalize(text);

  const scores = {};

  Object.entries(CATEGORY_RULES).forEach(
    ([category, keywords]) => {
      scores[category] = keywords.reduce(
        (score, keyword) =>
          score +
          (normalized.includes(normalize(keyword))
            ? 1
            : 0),
        0
      );
    }
  );

  const best = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (!best || best[1] === 0) {
    return currentCategory || "Personal";
  }

  return best[0];
}

function detectTopic(text) {
  const words = getImportantWords(text, 4);

  if (words.length === 0) {
    return "this note";
  }

  if (words.length === 1) {
    return words[0];
  }

  return words.slice(0, 3).join(", ");
}

function getTextInfo(note) {
  const title = note?.title || "";
  const content = note?.content || "";

  const fullText = `${title}. ${content}`.trim();

  return {
    title,
    content,
    fullText,
    normalized: normalize(fullText),
    sentences: sentencesFrom(content),
    words: meaningfulWords(fullText),
    importantWords: getImportantWords(fullText),
    sentiment: detectSentiment(fullText),
    category: detectCategory(
      fullText,
      note?.category
    ),
    hasActions: containsAny(fullText, ACTION_WORDS),
  };
}

function makeSummary(note) {
  const info = getTextInfo(note);

  if (!info.content.trim()) {
    return "There is not enough note content to create a summary yet.";
  }

  const sentences = info.sentences;

  if (sentences.length === 1) {
    const topic = detectTopic(info.fullText);

    if (info.sentiment === "positive") {
      return `This note describes ${topic} in a positive context and highlights the writer's experience or thoughts about it.`;
    }

    if (info.sentiment === "negative") {
      return `This note discusses ${topic} and reflects a challenge, concern, or negative experience.`;
    }

    return `This note focuses on ${topic} and records the main idea shared by the writer.`;
  }

  const first = sentences[0];
  const last = sentences[sentences.length - 1];

  return `The note discusses ${detectTopic(
    info.fullText
  )}. It begins with "${first}" and develops the idea further before ending with "${last}".`;
}

function improveWriting(note) {
  const content = note?.content?.trim();

  if (!content) {
    return "Add some text to the note and I can improve its wording.";
  }

  const sentences = sentencesFrom(content);

  const cleaned = sentences
    .map((sentence) => {
      let result = sentence.trim();

      if (!result) {
        return "";
      }

      result =
        result.charAt(0).toUpperCase() +
        result.slice(1);

      if (
        !/[.!?]$/.test(result)
      ) {
        result += ".";
      }

      return result;
    })
    .filter(Boolean)
    .join(" ");

  if (cleaned === content) {
    return `A polished version would be:\n\n${cleaned}`;
  }

  return `Here is a clearer version:\n\n${cleaned}`;
}

function generateTags(note) {
  const info = getTextInfo(note);
  const tags = [];

  const important = info.importantWords;

  important.forEach((word) => {
    if (
      word.length >= 4 &&
      !tags.some(
        (tag) =>
          tag.toLowerCase() === word.toLowerCase()
      )
    ) {
      tags.push(
        word.charAt(0).toUpperCase() +
          word.slice(1)
      );
    }
  });

  if (info.category) {
    tags.push(info.category);
  }

  if (info.sentiment === "positive") {
    tags.push("Positive");
  }

  if (info.sentiment === "negative") {
    tags.push("Challenge");
  }

  if (info.hasActions) {
    tags.push("Action Item");
  }

  return [...new Set(tags)].slice(0, 7);
}

function generateTitle(note) {
  const info = getTextInfo(note);

  if (!info.content.trim()) {
    return "Untitled Note";
  }

  const topic = detectTopic(info.fullText);

  if (info.sentiment === "positive") {
    return `A Positive Note About ${capitalize(topic)}`;
  }

  if (info.sentiment === "negative") {
    return `Thoughts and Challenges: ${capitalize(
      topic
    )}`;
  }

  if (info.hasActions) {
    return `Next Steps: ${capitalize(topic)}`;
  }

  if (info.category === "Work") {
    return `Work Notes: ${capitalize(topic)}`;
  }

  if (info.category === "Study") {
    return `Study Notes: ${capitalize(topic)}`;
  }

  if (info.category === "Ideas") {
    return `Idea: ${capitalize(topic)}`;
  }

  return `Notes About ${capitalize(topic)}`;
}

function capitalize(text) {
  return text
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function suggestCategory(note) {
  const info = getTextInfo(note);

  return `Suggested category: ${info.category}\n\nThis suggestion is based on the main topics and language detected in the note.`;
}

function answerQuestion(note, question) {
  const info = getTextInfo(note);
  const q = normalize(question);

  if (!q) {
    return "Ask me something about this note.";
  }

  if (
    q.includes("summary") ||
    q.includes("summarize") ||
    q.includes("about")
  ) {
    return makeSummary(note);
  }

  if (
    q.includes("category") ||
    q.includes("where")
  ) {
    return `Based on the content, this note fits best under "${info.category}".`;
  }

  if (
    q.includes("feeling") ||
    q.includes("feel") ||
    q.includes("mood")
  ) {
    if (info.sentiment === "positive") {
      return "The note has a generally positive tone.";
    }

    if (info.sentiment === "negative") {
      return "The note has a generally negative or concerned tone.";
    }

    return "The note has a mostly neutral tone.";
  }

  if (
    q.includes("important") ||
    q.includes("main") ||
    q.includes("key")
  ) {
    return `The main ideas detected are: ${info.importantWords.join(
      ", "
    )}.`;
  }

  if (
    q.includes("next") ||
    q.includes("should") ||
    q.includes("action")
  ) {
    if (info.hasActions) {
      return "The note contains action-oriented language. A useful next step would be to turn the mentioned task or goal into a specific, manageable action.";
    }

    return "The note does not clearly contain an action item. You could add a specific next step if you want to turn this note into a plan.";
  }

  return `Based on this note, the main topic appears to be ${detectTopic(
    info.fullText
  )}. The note is categorized as ${info.category} and has a ${info.sentiment} tone.`;
}

function getRelatedNotes(note) {
  let savedNotes = [];

  try {
    savedNotes = JSON.parse(
      localStorage.getItem("smart-notes-data") ||
        "[]"
    );
  } catch {
    savedNotes = [];
  }

  if (!Array.isArray(savedNotes)) {
    return [];
  }

  const currentWords = new Set(
    meaningfulWords(
      `${note.title} ${note.content}`
    )
  );

  return savedNotes
    .filter((item) => item.id !== note.id)
    .map((item) => {
      const otherWords = meaningfulWords(
        `${item.title} ${item.content}`
      );

      let score = 0;

      otherWords.forEach((word) => {
        if (currentWords.has(word)) {
          score += 1;
        }
      });

      if (
        item.category &&
        item.category === note.category
      ) {
        score += 2;
      }

      return {
        ...item,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function AIAssistant({ note }) {
  const [activeTool, setActiveTool] =
    useState(null);

  const [result, setResult] = useState("");

  const [question, setQuestion] =
    useState("");

  const info = useMemo(
    () => getTextInfo(note),
    [note]
  );

  const runTool = (tool) => {
    setActiveTool(tool);

    if (tool === "summary") {
      setResult(makeSummary(note));
      return;
    }

    if (tool === "improve") {
      setResult(improveWriting(note));
      return;
    }

    if (tool === "tags") {
      const tags = generateTags(note);

      setResult(
        tags.length
          ? tags.map((tag) => `#${tag}`).join("   ")
          : "Not enough meaningful information to generate tags yet."
      );

      return;
    }

    if (tool === "title") {
      setResult(generateTitle(note));
      return;
    }

    if (tool === "category") {
      setResult(suggestCategory(note));
      return;
    }

    if (tool === "related") {
      const related = getRelatedNotes(note);

      if (!related.length) {
        setResult(
          "No strongly related notes were found yet. Add more notes with similar topics and this tool can compare them."
        );
        return;
      }

      setResult(
        related
          .map(
            (item, index) =>
              `${index + 1}. ${item.title}`
          )
          .join("\n")
      );
    }
  };

  const askQuestion = (event) => {
    event.preventDefault();

    setActiveTool("ask");
    setResult(
      answerQuestion(note, question)
    );

    setQuestion("");
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant-header">
        <div>
          <span className="ai-eyebrow">
            AI ASSISTANT
          </span>

          <h4>
            ✨ Smart tools for this note
          </h4>
        </div>
      </div>

      <div className="ai-actions">
        <button
          className={`ai-action-button ${
            activeTool === "summary"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("summary")}
        >
          ✦ Summarize
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "improve"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("improve")}
        >
          ✎ Improve Writing
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "tags"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("tags")}
        >
          🏷️ Generate Tags
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "title"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("title")}
        >
          📝 Generate Title
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "category"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("category")}
        >
          🎯 Suggest Category
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "ask"
              ? "active"
              : ""
          }`}
          onClick={() => {
            setActiveTool("ask");
            setResult(
              "Ask a question about this note below."
            );
          }}
        >
          💬 Ask AI
        </button>

        <button
          className={`ai-action-button ${
            activeTool === "related"
              ? "active"
              : ""
          }`}
          onClick={() => runTool("related")}
        >
          🔗 Related Notes
        </button>
      </div>

      {activeTool === "ask" && (
        <form
          className="ai-ask-form"
          onSubmit={askQuestion}
        >
          <input
            className="ai-question-input"
            type="text"
            placeholder="Ask something about this note..."
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
          />

          <button
            className="ai-ask-submit"
            type="submit"
          >
            Ask
          </button>
        </form>
      )}

      {result && (
        <div className="ai-result">
          <div className="ai-result-header">
            <strong>
              {activeTool === "summary" &&
                "📝 Summary"}

              {activeTool === "improve" &&
                "✎ Improved Writing"}

              {activeTool === "tags" &&
                "🏷️ Suggested Tags"}

              {activeTool === "title" &&
                "📝 Generated Title"}

              {activeTool === "category" &&
                "🎯 Category Suggestion"}

              {activeTool === "ask" &&
                "💡 Smart Insight"}

              {activeTool === "related" &&
                "🔗 Related Notes"}
            </strong>

            <button
              className="ai-result-close"
              onClick={() => {
                setResult("");
                setActiveTool(null);
              }}
            >
              ×
            </button>
          </div>

          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;