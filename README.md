# Sujal Gupta — Personal Portfolio

A responsive portfolio website customized for Sujal Gupta and aligned with the Internal Assessment Project brief.

## Profile
- Name: Sujal Gupta
- GitHub: https://github.com/isujal012
- Education: B.Tech (AI and ML Specialization) student.

## Technologies
- HTML, CSS, JavaScript
- Python (featured practicals)
- Git and GitHub
- Node.js local server / Vercel serverless function for the chatbot
- Groq API through a server-side endpoint

## Assessment Features
- Home, About Me, Skills, Projects, Contact, and AI Chatbot sections
- Five project cards required by the assessment
- Search projects by title, description, or technology
- Light/dark mode toggle
- Responsive layout
- Portfolio chatbot with error handling; API key is read server-side from an environment variable
- City-based weather lookup using Open-Meteo API

## Projects

1. **Python Programs Collection** — Python practice programs and fundamentals.
   - https://github.com/isujal012/python_basics
2. **Interactive Quiz Application** — Interactive quiz practical.
   - https://github.com/isujal012/quiz_app
3. **Book Reading List Application** — Reading-list practical with live deployment.
   - https://github.com/isujal012/reading_list
   - Live URL: https://readinglist-chi.vercel.app
4. **Moonify — Music Web Application** — Modern music player web application.
   - https://github.com/isujal012/Moonify
   - Live URL: https://moonify-snowy.vercel.app
5. **Python Directory Practical** — Python scripting and directory utilities.
   - https://github.com/isujal012/directory

## Run Locally

The project can be run directly using the built-in Node server:

1. Run the local server:
   ```bash
   node server.js
   ```
2. Open `http://localhost:3000` in your browser.
3. (Optional) To enable AI chatbot responses, copy `.env.example` to `.env` and set `GROQ_API_KEY`.

## Deploy to Vercel

1. Push the portfolio files to a GitHub repository owned by Sujal (`isujal012`).
2. Import that repository into Vercel.
3. In Vercel Project Settings → Environment Variables, add `GROQ_API_KEY` with a valid Groq API key.
4. Redeploy and test search, theme toggle, chatbot, project links, images, and mobile layout.
