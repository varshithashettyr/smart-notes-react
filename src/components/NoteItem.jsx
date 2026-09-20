// function NoteItem({
//   note,
//   onEdit,
//   onDelete,
//   onTogglePin,
//   deleting,
// }) {
//   const wordCount = `${note.title} ${note.content}`
//     .trim()
//     .split(/\s+/).length;

//   const formattedDate = new Date(
//     note.updatedAt
//   ).toLocaleDateString(undefined, {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });

//   return (
//     <article
//       className={`note-card ${
//         deleting ? "note-card-deleting" : ""
//       } ${note.pinned ? "is-pinned" : ""}`}
//     >
//       <div className="note-card-top">
//         <span className="note-category">
//           {note.category}
//         </span>

//         <button
//           className={`pin-button ${
//             note.pinned ? "pinned" : ""
//           }`}
//           onClick={() => onTogglePin(note.id)}
//           title={note.pinned ? "Unpin note" : "Pin note"}
//         >
//           {note.pinned ? "📌" : "◇"}
//         </button>
//       </div>

//       <div className="note-card-body">
//         <h3>{note.title}</h3>

//         <p>{note.content}</p>
//       </div>

//       <div className="note-card-footer">
//         <div className="note-meta">
//           <span>{wordCount} words</span>
//           <span>•</span>
//           <span>{formattedDate}</span>
//         </div>

//         <div className="note-actions">
//           <button
//             onClick={() => onEdit(note)}
//             className="edit-button"
//             title="Edit note"
//           >
//             ✎
//           </button>

//           <button
//             onClick={() => onDelete(note.id)}
//             className="delete-button"
//             title="Delete note"
//           >
//             ♲
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// }

// export default NoteItem;

import AIAssistant from "./AIAssistant";

function NoteItem({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  deleting,
}) {
  const wordCount = `${note.title} ${note.content}`
    .trim()
    .split(/\s+/).length;

  const formattedDate = new Date(
    note.updatedAt
  ).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={`note-card ${
        deleting ? "note-card-deleting" : ""
      } ${note.pinned ? "is-pinned" : ""}`}
    >
      <div className="note-card-top">
        <span className="note-category">
          {note.category}
        </span>

        <button
          className={`pin-button ${
            note.pinned ? "pinned" : ""
          }`}
          onClick={() => onTogglePin(note.id)}
          title={note.pinned ? "Unpin note" : "Pin note"}
        >
          {note.pinned ? "📌" : "◇"}
        </button>
      </div>

      <div className="note-card-body">
        <h3>{note.title}</h3>

        <p>{note.content}</p>
      </div>

      <div className="note-card-footer">
        <div className="note-meta">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        <div className="note-actions">
          <button
            onClick={() => onEdit(note)}
            className="edit-button"
            title="Edit note"
          >
            ✎
          </button>

          <button
            onClick={() => onDelete(note.id)}
            className="delete-button"
            title="Delete note"
          >
            ♲
          </button>
        </div>
      </div>

      <AIAssistant note={note} />
    </article>
  );
}

export default NoteItem;