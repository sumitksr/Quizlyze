# Quizlyze – AI-Powered Summaries, Quizzes & Flashcards

**Live Demo:** [quizlyze.vercel.app](https://quizlyze.vercel.app/)
**Author:** [@sumitksr](https://github.com/sumitksr)

Quizlyze transforms any content into structured learning material. Whether it’s a **PDF**, a **YouTube video**, or raw **text**, Quizlyze instantly generates **concise summaries**, **interactive quizzes**, and **flashcards** for smarter studying.

---

## ✨ Features

### 📖 Strong Summarization

* Clean, structured **markdown summaries**
* Works with PDFs, YouTube transcripts, or plain text
* Preserves **paragraph breaks** and **readable formatting**

### 📝 Interactive Quiz Generator

* Auto-generated **multiple-choice questions** with explanations
* Adjustable **question count**
* Modern UI with **hover/selection states**, **progress tracking**, and **result breakdown**

### 🎴 Smart Flashcards

* Interactive **front/back study cards**
* Adjustable **deck size**
* Responsive flip-card interface for **mobile & desktop**

### 🔄 Multi-Source Ingestion

* PDF text extraction via server API (`/api/pdf`)
* YouTube transcript fetching via external service (`/api/youtube`)
* Direct text input supported

### ⚡ Powered by Google Gemini

* Unified AI generation API (`/api/generate`)
* Supports **summary**, **quiz**, and **flashcard** modes

### 🎨 Polished User Experience

* **Dark mode** support
* **Gradient accents** and **micro-interactions**
* Consistent UX with reusable `ContentForm`

---

## 🧭 App Pages

* `/summarize` – Generate clean markdown summaries
* `/quiz` – Create and take interactive quizzes
* `/flashcards` – Build and study flashcards
* `/about` – Learn what Quizlyze is, how it works, and its features

---

## 🏗️ Architecture

**Flow Overview:**

1. User input collected via `components/ContentForm.js`
2. `lib/contentFetcher.js` standardizes ingestion:

   * PDFs uploaded → `app/api/pdf/route.js`
   * YouTube links → `app/api/youtube/route.js`
   * Plain text/manual input passed directly
3. AI generation orchestrated via `app/api/generate/route.js` (Google Gemini)
4. Results rendered by **feature-specific UI components**

**Key Server Routes:**

* `app/api/pdf/route.js` → PDF → `{ text, metadata }`
* `app/api/youtube/route.js` → YouTube transcript → `{ transcript, snippets, videoId }`
* `app/api/generate/route.js` → AI generation (summary/quiz/flashcards)

---

## 📦 Project Structure

```
app/
  about/               # Product overview page
  summarize/           # Summary UI (uses ContentForm)
  quiz/                # Quiz UI (uses ContentForm)
  flashcards/          # Flashcards UI (uses ContentForm)
  api/
    pdf/route.js       # PDF → text extraction
    youtube/route.js   # YouTube transcript → text
    generate/route.js  # Gemini AI orchestration
components/
  ContentForm.js       # Input uploader + text form
  QuizComponent.js     # Enhanced quiz UI
  FlashcardComponent.js# Flashcard UI
lib/
  contentFetcher.js    # Ingestion handler
  generateSummary.js   # Calls /api/generate (summary)
  generateQuiz.js      # Calls /api/generate (quiz)
  generateFlashcards.js# Calls /api/generate (flashcards)
scripts/
  pdf-parser.js        # Server-side PDF helper
  README.md            # Transcript service deployment notes
```

---

## 🔧 Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS 4
* **Backend:** Next.js API routes
* **AI:** Google Generative Language API (Gemini)
* **External Services:** YouTube Transcript Service (HTTP)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Install

```bash
git clone https://github.com/sumitksr/Quizlyze.git
cd Quizlyze
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini API key (required)
GEMINI_API=YOUR_GEMINI_API_KEY

# Optional: External transcript service base URL
PYTHON_SERVICE_URL=https://your-transcript-service.vercel.app
```

### 3. Run the Dev Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 API Reference (Dev)

### `POST /api/pdf`

* **Body:** FormData → `{ file: <PDF> }`
* **Response:**

```json
{
  "text": "extracted text...",
  "metadata": { "filename": "doc.pdf", "size": 12345 }
}
```

### `POST /api/youtube`

* **Body:**

```json
{ "url": "https://youtube.com/watch?v=..." }
```

* **Response:**

```json
{ "transcript": "...", "snippets": [...], "videoId": "abc123" }
```

### `POST /api/generate`

* **Body:**

```json
{
  "data": "raw text from any source",
  "action": "summary" | "quiz" | "flashcards",
  "options": { "numQuestions": 10, "numCards": 15 }
}
```

* **Response:** Action-specific payloads (markdown summary, quiz JSON, or flashcards JSON)

---

## 🎥 YouTube Transcript Service (Optional)

If direct transcript fetching is blocked (common in shared hosting), deploy the minimal transcript service and set `PYTHON_SERVICE_URL`.

See `scripts/README.md` for **Vercel deployment guide**.

---

## ⚠️ Notes & Limitations

* YouTube transcripts may not be available in all regions → use external service.
* Only **text-based PDFs** supported. Image-based PDFs require OCR.

---

## 🗺️ Roadmap

* 📤 Export flashcards to CSV/Anki
* 💾 Save & revisit quizzes
* 👤 User sessions & history tracking
* 🔗 Shareable quiz & flashcard links
* 📊 Analytics dashboard for study progress

---

## 🤝 Contributing

Contributions are welcome! 🚀

* Open an issue for feature ideas or bugs
* Submit PRs for enhancements
* Discuss large changes before implementation

---

## 📄 License

This project is for **educational purposes**. For redistribution or commercial use, add a `LICENSE` file (MIT recommended).

---

## 🌐 Links

* **Live App:** [quizlyze.vercel.app](https://quizlyze.vercel.app/)
* **GitHub Repo:** [github.com/sumitksr/Quizlyze](https://github.com/sumitksr/Quizlyze)
* **Author Profile:** [github.com/sumitksr](https://github.com/sumitksr)
