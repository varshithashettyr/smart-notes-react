import { useEffect, useMemo, useState } from "react";
import "./App.css";

import NoteForm from "./components/NoteForm";
import NoteItem from "./components/NoteItem";
import SearchBar from "./components/SearchBar";

const STORAGE_KEY = "smart-notes-data";
const THEME_KEY = "smart-notes-theme";

const CATEGORY_ORDER = [
  "Work",
  "Study",
  "Personal",
  "Ideas",
  "Important",
];

function normalizeNote(note, index) {
  return {
    id: note.id ?? `${Date.now()}-${index}`,
    title: note.title ?? "",
    content: note.content ?? "",
    category: note.category ?? "Personal",
    pinned: Boolean(note.pinned),
    createdAt: note.createdAt ?? new Date().toISOString(),
    updatedAt: note.updatedAt ?? note.createdAt ?? new Date().toISOString(),
  };
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeNote);
  } catch {
    return [];
  }
}

function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingNote, setEditingNote] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "dark"
  );
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /* --------------------------------
     Save notes
  -------------------------------- */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  /* --------------------------------
     Save theme
  -------------------------------- */

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.body.className = theme;
  }, [theme]);

  /* --------------------------------
     Toast
  -------------------------------- */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  /* --------------------------------
     Ctrl + K
  -------------------------------- */

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        const searchInput = document.querySelector(".search-input");

        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  /* --------------------------------
     Add note
  -------------------------------- */

  const handleAddNote = (noteData) => {
    const now = new Date().toISOString();

    const newNote = {
      id: `${Date.now()}-${Math.random()}`,
      title: noteData.title,
      content: noteData.content,
      category: noteData.category,
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };

    setNotes((previousNotes) => [newNote, ...previousNotes]);

    setToast("Note created successfully ✨");
  };

  /* --------------------------------
     Update note
  -------------------------------- */

  const handleUpdateNote = (updatedData) => {
    setNotes((previousNotes) =>
      previousNotes.map((note) =>
        note.id === updatedData.id
          ? {
              ...note,
              title: updatedData.title,
              content: updatedData.content,
              category: updatedData.category,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );

    setEditingNote(null);
    setToast("Note updated successfully ✨");
  };

  /* --------------------------------
     Delete note
  -------------------------------- */

  const handleDeleteNote = (id) => {
    setDeletingId(id);

    setTimeout(() => {
      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== id)
      );

      setDeletingId(null);
      setToast("Note deleted");
    }, 250);
  };

  /* --------------------------------
     Pin note
  -------------------------------- */

  const handleTogglePin = (id) => {
    setNotes((previousNotes) =>
      previousNotes.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );

    setToast("Pin status updated");
  };

  /* --------------------------------
     Counts
  -------------------------------- */

  const totalNotes = notes.length;

  const pinnedNotes = notes.filter((note) => note.pinned).length;

  const totalCategories = new Set(
    notes.map((note) => note.category)
  ).size;

  const totalWords = notes.reduce((total, note) => {
    const text = `${note.title} ${note.content}`.trim();

    if (!text) {
      return total;
    }

    return total + text.split(/\s+/).length;
  }, 0);

  /* --------------------------------
     Categories
  -------------------------------- */

  const availableCategories = useMemo(() => {
    const usedCategories = new Set(
      notes.map((note) => note.category)
    );

    return CATEGORY_ORDER.filter((category) =>
      usedCategories.has(category)
    );
  }, [notes]);

  /* --------------------------------
     Filtering
  -------------------------------- */

  const filteredNotes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return notes
      .filter((note) => {
        const matchesSearch =
          !search ||
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search) ||
          note.category.toLowerCase().includes(search);

        const matchesCategory =
          selectedCategory === "All" ||
          note.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      });
  }, [notes, searchTerm, selectedCategory]);

  /* --------------------------------
     Group notes
  -------------------------------- */

  const groupedNotes = useMemo(() => {
    const groups = {};

    filteredNotes.forEach((note) => {
      if (!groups[note.category]) {
        groups[note.category] = [];
      }

      groups[note.category].push(note);
    });

    return groups;
  }, [filteredNotes]);

  const displayedCategories =
    selectedCategory === "All"
      ? CATEGORY_ORDER.filter((category) => groupedNotes[category]?.length)
      : [selectedCategory];

  return (
    <div className={`app ${theme}`}>
      {/* --------------------------------
          HERO
      -------------------------------- */}

      <section className="hero">
        <div className="hero-grid"></div>

        {/* Theme-specific background effects */}
        <div className="hero-glow glow-one"></div>
        <div className="hero-glow glow-two"></div>
        <div className="hero-glow glow-three"></div>

        <div className="hero-particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="hero-container">
          <header className="topbar">
            <div className="brand">
              <div className="brand-icon">
                <span>✦</span>
              </div>

              <div>
                <div className="brand-name">Smart Notes</div>
                <div className="brand-subtitle">
                  Your thoughts. Organized.
                </div>
              </div>
            </div>

            <button
              className="theme-toggle"
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === "dark" ? "light" : "dark"
                )
              }
            >
              <span className="theme-icon">
                {theme === "dark" ? "☀" : "☾"}
              </span>

              <span>
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </header>

          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span className="status-dot"></span>
                Your personal productivity space
              </div>

              <h1>
                Capture ideas.
                <br />
                <span>Keep them moving.</span>
              </h1>

              <p>
                Create, organize, search and manage your notes
                in one beautiful workspace.
              </p>

              <div className="hero-actions">
                <a href="#create-note" className="hero-primary-btn">
                  <span>＋</span>
                  Create your first note
                </a>

                <a href="#notes" className="hero-secondary-btn">
                  Explore notes
                  <span>↓</span>
                </a>
              </div>
            </div>

            {/* Floating visual */}
            <div className="hero-visual">
              <div className="floating-note floating-note-main">
                <div className="floating-note-top">
                  <span className="mini-pin">📌</span>

                  <span className="mini-status">
                    <span></span>
                    Active
                  </span>
                </div>

                <div className="floating-note-content">
                  <span className="floating-label">PINNED NOTE</span>

                  <h3>Ideas worth remembering</h3>

                  <p>
                    Keep your best thoughts close and turn
                    small ideas into something meaningful.
                  </p>
                </div>

                <div className="floating-note-footer">
                  <span>Smart Notes</span>
                  <span>Just now</span>
                </div>
              </div>

              <div className="floating-note floating-note-small small-one">
                <span className="small-icon">✦</span>
                <div>
                  <strong>{totalNotes}</strong>
                  <small>Notes created</small>
                </div>
              </div>

              <div className="floating-note floating-note-small small-two">
                <span className="small-icon">📌</span>
                <div>
                  <strong>{pinnedNotes}</strong>
                  <small>Pinned</small>
                </div>
              </div>

              <div className="floating-orbit orbit-one"></div>
              <div className="floating-orbit orbit-two"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------
          DASHBOARD
      -------------------------------- */}

      <main className="main-container">
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">✦</div>

            <div>
              <span>Total Notes</span>
              <strong>{totalNotes}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">📌</div>

            <div>
              <span>Pinned Notes</span>
              <strong>{pinnedNotes}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cyan">◈</div>

            <div>
              <span>Categories</span>
              <strong>{totalCategories}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">Aa</div>

            <div>
              <span>Total Words</span>
              <strong>{totalWords}</strong>
            </div>
          </div>
        </section>

        {/* --------------------------------
            CREATE NOTE
        -------------------------------- */}

        <section className="create-section" id="create-note">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">CREATE</span>
              <h2>What’s on your mind?</h2>
              <p>
                Turn your thoughts into organized notes.
              </p>
            </div>
          </div>

          <NoteForm onAddNote={handleAddNote} />
        </section>

        {/* --------------------------------
            NOTES
        -------------------------------- */}

        <section className="notes-section" id="notes">
          <div className="notes-header">
            <div>
              <span className="section-eyebrow">YOUR SPACE</span>

              <h2>Your Notes</h2>

              <p>
                {totalNotes === 0
                  ? "Your notes will appear here."
                  : `${totalNotes} ${
                      totalNotes === 1 ? "note" : "notes"
                    } in your workspace.`}
              </p>
            </div>

            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="category-tabs">
            <button
              className={
                selectedCategory === "All" ? "active" : ""
              }
              onClick={() => setSelectedCategory("All")}
            >
              All
              <span>{totalNotes}</span>
            </button>

            {availableCategories.map((category) => {
              const count = notes.filter(
                (note) => note.category === category
              ).length;

              return (
                <button
                  key={category}
                  className={
                    selectedCategory === category ? "active" : ""
                  }
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                >
                  {category}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {notes.length === 0 ? "✦" : "⌕"}
              </div>

              <h3>
                {notes.length === 0
                  ? "Your workspace is waiting"
                  : "No matching notes"}
              </h3>

              <p>
                {notes.length === 0
                  ? "Create your first note above and it will appear here automatically."
                  : "Try a different search term or category."}
              </p>

              {notes.length > 0 && (
                <button
                  className="clear-filter-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="note-groups">
              {displayedCategories.map((category) => (
                <div className="note-group" key={category}>
                  <div className="group-heading">
                    <div className="group-title">
                      <span className="category-dot"></span>
                      <h3>{category}</h3>
                    </div>

                    <span className="group-count">
                      {groupedNotes[category]?.length || 0}
                    </span>
                  </div>

                  <div className="notes-grid">
                    {groupedNotes[category]?.map((note) => (
                      <NoteItem
                        key={note.id}
                        note={note}
                        onEdit={setEditingNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        deleting={deletingId === note.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* --------------------------------
          EDIT MODAL
      -------------------------------- */}

      {editingNote && (
        <div
          className="modal-backdrop"
          onClick={() => setEditingNote(null)}
        >
          <div
            className="edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-eyebrow">
                  EDIT NOTE
                </span>

                <h2>Update your note</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setEditingNote(null)}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();

                const formData = new FormData(event.currentTarget);

                handleUpdateNote({
                  id: editingNote.id,
                  title: formData.get("title").trim(),
                  content: formData.get("content").trim(),
                  category: formData.get("category"),
                });
              }}
            >
              <label>
                Title
                <input
                  name="title"
                  defaultValue={editingNote.title}
                  required
                  maxLength="100"
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  defaultValue={editingNote.category}
                >
                  {CATEGORY_ORDER.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Content
                <textarea
                  name="content"
                  defaultValue={editingNote.content}
                  required
                  rows="7"
                  maxLength="5000"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingNote(null)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------
          TOAST
      -------------------------------- */}

      {toast && (
        <div className="toast">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      )}

      {/* --------------------------------
          FOOTER
      -------------------------------- */}

      <footer className="footer">
        <div>
          <strong>Smart Notes</strong>
          <span>Built for ideas that matter.</span>
        </div>

        <span>React • Local Storage • Responsive UI</span>
      </footer>
    </div>
  );
}

export default App;