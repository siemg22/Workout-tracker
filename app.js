const { useState, useEffect } = React;

function WorkOutTracker() {
    const [exercise, setExercise] = useState("");
    const [muscleGroup, setMuscleGroup] = useState("");
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [workoutDate, setWorkoutDate] = useState("");
    const [searchMuscle, setSearchMuscle] = useState("");
    const [searched, setSearched] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [workouts, setWorkouts] = useState(() => {
        try {
            const storedWorkout = localStorage.getItem("exercises");

            if (!storedWorkout) {
                return [];
            }

            const parsedWorkout = JSON.parse(storedWorkout);

            return Array.isArray(parsedWorkout) ? parsedWorkout : [];
        } catch {
            return [];
        }
    });

    const groupedWorkouts = workouts.reduce((groups, workout) => {
        const date = workout.date || "Unknown Date";

        if (!groups[date]) {
            groups[date] = [];
        }

        groups[date].push(workout);

        return groups;
    }, {});

    const filteredWorkout = workouts.filter((workout) => {
        const workoutType = String(workout.type || "");
        const workoutMuscle = String(workout.muscle || "");

        const matchesSearch = workoutType
            .toLowerCase()
            .includes(searched.toLowerCase());

        const matchesMuscle =
            searchMuscle === "" ||
            workoutMuscle.toLowerCase() === searchMuscle.toLowerCase();

        return matchesSearch && matchesMuscle;
    });

    const totalWorkout = workouts.length;

    const completed = workouts.filter(
        (workout) => workout.completed
    ).length;

    const remaining = workouts.filter(
        (workout) => !workout.completed
    ).length;

    const totalSets = workouts.reduce((total, workout) => {
        const workoutSets = Number(workout.set);

        return total + (Number.isFinite(workoutSets) ? workoutSets : 0);
    }, 0);

    useEffect(() => {
        localStorage.setItem("exercises", JSON.stringify(workouts));
    }, [workouts]);

    const resetForm = () => {
        setExercise("");
        setMuscleGroup("");
        setSets("");
        setReps("");
        setWeight("");
        setWorkoutDate("");
        setEditingId(null);
    };

    const handleSubmit = () => {
        const trimmedExercise = exercise.trim();
        const trimmedMuscleGroup = muscleGroup.trim();
        const numericSets = Number(sets);
        const numericReps = Number(reps);
        const numericWeight = Number(weight);

        if (
            !trimmedExercise ||
            !trimmedMuscleGroup ||
            !workoutDate ||
            !Number.isFinite(numericSets) ||
            !Number.isFinite(numericReps) ||
            !Number.isFinite(numericWeight) ||
            numericSets <= 0 ||
            numericReps <= 0 ||
            numericWeight < 0
        ) {
            return;
        }

        if (editingId !== null) {
            setWorkouts((currentWorkouts) =>
                currentWorkouts.map((savedWorkout) => {
                    if (savedWorkout.id === editingId) {
                        return {
                            ...savedWorkout,
                            type: trimmedExercise,
                            muscle: trimmedMuscleGroup,
                            set: numericSets,
                            rep: numericReps,
                            kg: numericWeight,
                            date: workoutDate
                        };
                    }

                    return savedWorkout;
                })
            );
        } else {
            const fullWorkout = {
                id: Date.now(),
                type: trimmedExercise,
                muscle: trimmedMuscleGroup,
                set: numericSets,
                rep: numericReps,
                kg: numericWeight,
                date: workoutDate,
                completed: false
            };

            setWorkouts((currentWorkouts) => [
                ...currentWorkouts,
                fullWorkout
            ]);
        }

        resetForm();
    };

    const handleEdit = (workout) => {
        setEditingId(workout.id);
        setExercise(workout.type || "");
        setMuscleGroup(workout.muscle || "");
        setSets(String(workout.set || ""));
        setReps(String(workout.rep || ""));
        setWeight(String(workout.kg ?? ""));
        setWorkoutDate(workout.date || "");
    };

    const handleDelete = (id) => {
        setWorkouts((currentWorkouts) =>
            currentWorkouts.filter((workout) => workout.id !== id)
        );

        if (editingId === id) {
            resetForm();
        }
    };

    const toggleComplete = (id, checked) => {
        setWorkouts((currentWorkouts) =>
            currentWorkouts.map((workout) => {
                if (workout.id === id) {
                    return {
                        ...workout,
                        completed: checked
                    };
                }

                return workout;
            })
        );
    };

    return (
        <div className="app">
            {showHistory ? (
                <div className="history-page">
                    <div className="history-header">
                        <button
                            className="back-button"
                            onClick={() => setShowHistory(false)}
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>

                        <div>
                            <p className="page-label">WORKOUT TRACKER</p>
                            <h1>Workout History</h1>
                            <p className="page-description">
                                Review your training sessions and progress.
                            </p>
                        </div>
                    </div>

                    <div className="history-container">
                        {Object.entries(groupedWorkouts).length === 0 ? (
                            <div className="empty-state">
                                <i className="fa-solid fa-calendar-xmark"></i>
                                <h2>No workout history</h2>
                                <p>
                                    Start adding workouts to see your history
                                    here.
                                </p>
                            </div>
                        ) : (
                            Object.entries(groupedWorkouts)
                                .sort(([dateA], [dateB]) =>
                                    dateB.localeCompare(dateA)
                                )
                                .map(([date, workoutsOnDate]) => (
                                    <div
                                        className="history-day"
                                        key={date}
                                    >
                                        <div className="date-header">
                                            <div className="date-icon">
                                                <i className="fa-solid fa-calendar-day"></i>
                                            </div>

                                            <div>
                                                <h2>{date}</h2>
                                                <span>
                                                    {workoutsOnDate.length}{" "}
                                                    workout
                                                    {workoutsOnDate.length !==
                                                        1 && "s"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="history-workouts">
                                            {workoutsOnDate.map((workout) => (
                                                <div
                                                    className={`history-card ${
                                                        workout.completed
                                                            ? "completed-card"
                                                            : ""
                                                    }`}
                                                    key={workout.id}
                                                >
                                                    <div className="history-card-left">
                                                        <div className="exercise-icon">
                                                            <i className="fa-solid fa-dumbbell"></i>
                                                        </div>

                                                        <div>
                                                            <h3>
                                                                {workout.type}
                                                            </h3>

                                                            <span className="muscle-badge">
                                                                {workout.muscle}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="history-details">
                                                        <div>
                                                            <strong>
                                                                {workout.kg}
                                                            </strong>
                                                            <span>KG</span>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {workout.set}
                                                            </strong>
                                                            <span>SETS</span>
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {workout.rep}
                                                            </strong>
                                                            <span>REPS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="dashboard">
                    <header className="topbar">
                        <div className="brand">
                            <div className="brand-icon">
                                <i className="fa-solid fa-dumbbell"></i>
                            </div>

                            <div>
                                <h1>FitTrack</h1>
                                <span>Workout Tracker</span>
                            </div>
                        </div>

                        <button
                            className="history-button"
                            onClick={() => setShowHistory(true)}
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                            Workout History
                        </button>
                    </header>

                    <section className="hero">
                        <div>
                            <p className="page-label">YOUR FITNESS JOURNEY</p>

                            <h2>
                                Train harder.
                                <span> Get stronger.</span>
                            </h2>

                            <p>
                                Track your workouts, monitor your progress,
                                and stay consistent.
                            </p>
                        </div>

                        <div className="hero-icon">
                            <i className="fa-solid fa-fire"></i>
                        </div>
                    </section>

                    <section className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">
                                <i className="fa-solid fa-dumbbell"></i>
                            </div>

                            <div>
                                <span>Total Workouts</span>
                                <strong>{totalWorkout}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>

                            <div>
                                <span>Completed</span>
                                <strong>{completed}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon orange">
                                <i className="fa-solid fa-hourglass-half"></i>
                            </div>

                            <div>
                                <span>Remaining</span>
                                <strong>{remaining}</strong>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon purple">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>

                            <div>
                                <span>Total Sets</span>
                                <strong>{totalSets}</strong>
                            </div>
                        </div>
                    </section>

                    <div className="main-grid">
                        <section className="form-card">
                            <div className="section-heading">
                                <div>
                                    <p className="page-label">
                                        {editingId !== null
                                            ? "EDIT WORKOUT"
                                            : "NEW WORKOUT"}
                                    </p>

                                    <h2>
                                        {editingId !== null
                                            ? "Update Workout"
                                            : "Add Workout"}
                                    </h2>
                                </div>

                                <div className="heading-icon">
                                    <i className="fa-solid fa-pen"></i>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group full">
                                    <label>Exercise</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-dumbbell"></i>

                                        <input
                                            type="text"
                                            placeholder="e.g. Bench Press"
                                            value={exercise}
                                            onChange={(event) =>
                                                setExercise(event.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="input-group full">
                                    <label>Muscle Group</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-person"></i>

                                        <input
                                            type="text"
                                            placeholder="e.g. Chest"
                                            value={muscleGroup}
                                            onChange={(event) =>
                                                setMuscleGroup(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Sets</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-layer-group"></i>

                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="3"
                                            value={sets}
                                            onChange={(event) =>
                                                setSets(event.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Reps</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-repeat"></i>

                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="10"
                                            value={reps}
                                            onChange={(event) =>
                                                setReps(event.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Weight</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-weight-hanging"></i>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            placeholder="60"
                                            value={weight}
                                            onChange={(event) =>
                                                setWeight(event.target.value)
                                            }
                                        />

                                        <span>KG</span>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label>Date</label>

                                    <div className="input-wrapper">
                                        <i className="fa-solid fa-calendar"></i>

                                        <input
                                            type="date"
                                            value={workoutDate}
                                            onChange={(event) =>
                                                setWorkoutDate(
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                className="add-workout-button"
                                disabled={
                                    exercise.trim() === "" ||
                                    muscleGroup.trim() === "" ||
                                    sets.trim() === "" ||
                                    reps.trim() === "" ||
                                    weight.trim() === "" ||
                                    workoutDate === ""
                                }
                                onClick={handleSubmit}
                            >
                                <i
                                    className={`fa-solid ${
                                        editingId !== null
                                            ? "fa-rotate"
                                            : "fa-plus"
                                    }`}
                                ></i>

                                {editingId !== null
                                    ? "Update Workout"
                                    : "Add Workout"}
                            </button>

                            {editingId !== null && (
                                <button
                                    className="cancel-edit-button"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </section>

                        <section className="workouts-card">
                            <div className="section-heading">
                                <div>
                                    <p className="page-label">
                                        YOUR WORKOUTS
                                    </p>

                                    <h2>Workout List</h2>
                                </div>

                                <span className="workout-count">
                                    {filteredWorkout.length}
                                </span>
                            </div>

                            <div className="filters">
                                <div className="search-wrapper">
                                    <i className="fa-solid fa-magnifying-glass"></i>

                                    <input
                                        type="text"
                                        placeholder="Search workout..."
                                        value={searched}
                                        onChange={(event) =>
                                            setSearched(event.target.value)
                                        }
                                    />
                                </div>

                                <select
                                    value={searchMuscle}
                                    onChange={(event) =>
                                        setSearchMuscle(event.target.value)
                                    }
                                >
                                    <option value="">All muscles</option>
                                    <option value="chest">Chest</option>
                                    <option value="triceps">Triceps</option>
                                    <option value="biceps">Biceps</option>
                                    <option value="back">Back</option>
                                    <option value="shoulder">Shoulder</option>
                                    <option value="forearm">Forearm</option>
                                    <option value="leg">Leg</option>
                                </select>
                            </div>

                            <div className="workout-list">
                                {filteredWorkout.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="fa-solid fa-dumbbell"></i>
                                        <h3>No workouts found</h3>
                                        <p>
                                            Add a workout or change your
                                            filters.
                                        </p>
                                    </div>
                                ) : (
                                    filteredWorkout.map((workout) => (
                                        <div
                                            className={`workout-card ${
                                                workout.completed
                                                    ? "completed-card"
                                                    : ""
                                            }`}
                                            key={workout.id}
                                        >
                                            <div className="workout-main">
                                                <input
                                                    className="workout-checkbox"
                                                    type="checkbox"
                                                    checked={
                                                        workout.completed ===
                                                        true
                                                    }
                                                    onChange={(event) =>
                                                        toggleComplete(
                                                            workout.id,
                                                            event.target.checked
                                                        )
                                                    }
                                                />

                                                <div className="workout-icon">
                                                    <i className="fa-solid fa-dumbbell"></i>
                                                </div>

                                                <div className="workout-info">
                                                    <h3>{workout.type}</h3>

                                                    <span className="muscle-badge">
                                                        {workout.muscle}
                                                    </span>

                                                    <p>
                                                        <i className="fa-solid fa-calendar"></i>
                                                        {workout.date}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="workout-details">
                                                <div>
                                                    <strong>
                                                        {workout.kg}
                                                    </strong>
                                                    <span>KG</span>
                                                </div>

                                                <div>
                                                    <strong>
                                                        {workout.set}
                                                    </strong>
                                                    <span>SETS</span>
                                                </div>

                                                <div>
                                                    <strong>
                                                        {workout.rep}
                                                    </strong>
                                                    <span>REPS</span>
                                                </div>
                                            </div>

                                            <div className="workout-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEdit(workout)
                                                    }
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(workout.id)
                                                    }
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}

function App() {
    return <WorkOutTracker />;
}

const root = ReactDOM.createRoot(
    document.getElementById("root")
);

root.render(<App />);