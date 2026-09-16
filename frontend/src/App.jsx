import { useEffect, useState } from "react";

import { createJob, deleteJob, getJobs, updateJobStatus } from "./api/jobs.js";
import JobForm from "./components/JobForm.jsx";
import JobCard from "./components/JobCard.jsx";

function App() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoadError("");

        const data = await getJobs();
        setJobs(data);
      } catch (error) {
        setLoadError("Failed to load jobs.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  async function handleJobCreated(jobData) {
    const newJob = await createJob(jobData);

    setJobs((currentJobs) => [newJob, ...currentJobs]);
  }

  async function handleStatusChange(id, status) {
    try {
      setError("");

      const updatedJob = await updateJobStatus(id, status);

      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
      );
    } catch (error) {
      setError(error.message || "Failed to update job status.");
    }
  }

  async function handleDelete(id) {
    try {
      setError("");

      await deleteJob(id);

      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
    } catch (error) {
      setError(error.message || "Failed to delete job.");
    }
  }

  const jobCounts = {
    all: jobs.length,
    pending: jobs.filter((job) => job.status === "pending").length,
    running: jobs.filter((job) => job.status === "running").length,
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length,
  };

  const filteredJobs =
    statusFilter === "all"
      ? jobs
      : jobs.filter((job) => job.status === statusFilter);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">JOB QUEUE</p>
          <h1>Job Queue Dashboard</h1>
          <p className="subtitle">Monitor and manage your background jobs.</p>
        </div>
      </header>

      <div className="filter-bar">
        <button
          className={
            statusFilter === "all" ? "filter-button active" : "filter-button"
          }
          onClick={() => setStatusFilter("all")}
        >
          All ({jobCounts.all})
        </button>

        <button
          className={
            statusFilter === "pending"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatusFilter("pending")}
        >
          Pending ({jobCounts.pending})
        </button>

        <button
          className={
            statusFilter === "running"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatusFilter("running")}
        >
          Running ({jobCounts.running})
        </button>

        <button
          className={
            statusFilter === "completed"
              ? "filter-button active"
              : "filter-button"
          }
          onClick={() => setStatusFilter("completed")}
        >
          Completed ({jobCounts.completed})
        </button>

        <button
          className={
            statusFilter === "failed" ? "filter-button active" : "filter-button"
          }
          onClick={() => setStatusFilter("failed")}
        >
          Failed ({jobCounts.failed})
        </button>
      </div>

      <JobForm onJobCreated={handleJobCreated} />

      {isLoading && <p className="loading-message">Loading jobs...</p>}

      {loadError && <p className="global-error">{loadError}</p>}

      {error && <p className="global-error">{error}</p>}

      {!isLoading && !loadError && (
        <div className="job-list">
          {filteredJobs.length === 0 ? (
            <p>
              {statusFilter === "all"
                ? "No jobs yet."
                : `No ${statusFilter} jobs found.`}
            </p>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </main>
  );
}

export default App;
