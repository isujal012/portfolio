// Vercel serverless function. Configure GROQ_API_KEY in the Vercel project
// environment settings; do not commit the secret to the repository.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res
      .status(503)
      .json({ error: "Chatbot is not configured on the server." });
  }

  const question =
    typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const context =
    typeof req.body?.context === "string"
      ? req.body.context.slice(0, 12000)
      : "";

  if (!question) {
    return res.status(400).json({ error: "Please enter a question." });
  }

  try {
    const upstream = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          temperature: 0.8,
          max_tokens: 800,
          messages: [
            {
              role: "system",
              content: `You are a helpful, knowledgeable AI assistant for Sujal Gupta's portfolio website.

You can answer questions on ANY topic, not just portfolio-related topics. These include programming, science, technology, mathematics, education, history, geography, general knowledge, writing, reasoning, entertainment, and everyday questions.

Use the portfolio context below when the user asks about Sujal Gupta, his skills, education, projects, experience, or portfolio.

For questions unrelated to Sujal Gupta or his portfolio, answer normally using your general knowledge. Do not force unrelated questions to connect to the portfolio, and never say you can only answer questions about the portfolio.

Be accurate, clear, and helpful. Explain concepts with examples when useful. If you are uncertain about something, say so instead of inventing facts.

Do not invent personal details about Sujal Gupta that are not provided in the context.

Keep responses concise by default, but provide more detail when the question requires it.

PORTFOLIO CONTEXT:
${context || "No portfolio context was provided. Answer general questions normally."}`,
            },
            { role: "user", content: question },
          ],
        }),
      },
    );

    if (upstream.status === 429) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please wait and try again." });
    }

    if (!upstream.ok) {
      console.error("Groq API returned status", upstream.status);
      return res
        .status(502)
        .json({ error: "AI service is temporarily unavailable." });
    }

    const data = await upstream.json();
    const answer = data.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      return res
        .status(502)
        .json({ error: "The AI returned an empty response." });
    }

    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error("Chat function error:", error);
    return res
      .status(500)
      .json({ error: "Unable to process the chat request." });
  }
};
