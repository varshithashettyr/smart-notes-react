import { useState } from "react";

const categories = [
  "Work",
  "Study",
  "Personal",
  "Ideas",
  "Important",
];

function NoteForm({ onAddNote }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    onAddNote({
      title: title.trim(),
      content: content.trim(),
      category,
    });

    setTitle("");
    setContent("");
    setCategory("Personal");
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="form-top">
        <div className="input-group title-group">
          <label htmlFor="note-title">Title</label>

          <input
            id="note-title"
            type="text"
            placeholder="Give your note a name..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength="100"
          />
        </div>

        <div className="input-group category-group">
          <label htmlFor="note-category">Category</label>

          <select
            id="note-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="note-content">Your note</label>

        <textarea
          id="note-content"
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows="6"
          maxLength="5000"
        />
      </div>

      <div className="form-bottom">
        <span className="form-hint">
          Your notes are saved automatically in this browser.
        </span>

        <button type="submit" className="create-note-btn">
          <span>＋</span>
          Create Note
        </button>
      </div>
    </form>
  );
}

export default NoteForm;