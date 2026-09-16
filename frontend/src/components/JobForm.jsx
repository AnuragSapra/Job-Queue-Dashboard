import { useState } from "react";

function JobForm({ onJobCreated }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !type.trim()) {
      setError("Title and type are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await onJobCreated({
        title: title.trim(),
        type: type.trim(),
      });

      setTitle("");
      setType("");
    } catch (error) {
      setError("Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <div className="job-form-header">
        <div>
          <p className="eyebrow">NEW JOB</p>
          <h2>Create a job</h2>
        </div>
      </div>

      <div className="form-fields">
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Build portfolio"
          />
        </div>

        <div className="form-field">
          <label htmlFor="type">Type</label>
          <input
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            placeholder="e.g. frontend"
          />
        </div>

        <button className="create-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Job"}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
    </form>
  );
}

export default JobForm;
