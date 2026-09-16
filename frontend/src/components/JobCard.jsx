function JobCard({ job, onStatusChange, onDelete }) {
  const nextStatuses = {
    pending: ["running"],
    running: ["completed", "failed"],
    completed: [],
    failed: [],
  };

  return (
    <article className="job-card">
      <div className="job-card-header">
        <div>
          <p className="job-type">{job.type}</p>
          <h2>{job.title}</h2>
        </div>

        <span className={`status-badge status-${job.status}`}>
          {job.status}
        </span>
      </div>

      <div className="job-actions">
        {nextStatuses[job.status].map((status) => (
          <button
            key={status}
            className="action-button"
            onClick={() => onStatusChange(job.id, status)}
          >
            Mark as {status}
          </button>
        ))}

        <button className="delete-button" onClick={() => onDelete(job.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default JobCard;
