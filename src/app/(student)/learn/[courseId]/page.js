'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentCourseDetail() {
  const params = useParams();
  const courseId = params?.courseId;

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const idStr = encodeURIComponent(courseId);

        // Fetch course metadata
        const courseRes = await fetch(`/api/v1/courses/${idStr}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (!courseRes.ok) {
          throw new Error('Course not found or inaccessible.');
        }
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Fetch course units and lessons
        const unitsRes = await fetch(`/api/v1/courses/${idStr}/units`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (unitsRes.status === 403 || unitsRes.status === 401) {
          setNotEnrolled(true);
        } else if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          if (unitsData?.error?.code === 'NOT_ENROLLED') {
            setNotEnrolled(true);
          } else {
            setUnits(Array.isArray(unitsData) ? unitsData : unitsData.units || []);
          }
        }

        // Fetch course assessments / quizzes
        const quizzesRes = await fetch(`/api/v1/courses/${idStr}/assessments`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData.assessments || []);
        }

        // Fetch student dashboard progress
        const dashRes = await fetch('/api/v1/student/dashboard', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          const coursesList = dashData.enrolments || dashData.courses || [];
          const match = coursesList.find((c) => c.course_id === courseId || c.id === courseId);
          if (match) {
            setProgress(match.progress || {
              percent: match.percent || 0,
              lessons_completed: match.lessons_completed || 0,
              lessons_total: match.lessons_total || 0
            });
          }
        }
      } catch (err) {
        console.error('Failed to load course page data:', err);
        setError(err.message || 'Unable to load course content.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [courseId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch('/api/v1/enrolments', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ course_id: courseId })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to join course');
      }
      setNotEnrolled(false);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Could not join course. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const allLessons = units.flatMap((u) => u.lessons || []);
  const doneCount = progress ? progress.lessons_completed : 0;
  const nextLesson = allLessons[Math.min(doneCount, Math.max(0, allLessons.length - 1))];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/20 antialiased font-sans flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/learn" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-red-500">BEARILLY</span> LEARN
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/learn"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              My Courses
            </Link>
            <Link
              href="/programs"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              All Programs
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link
            href="/learn"
            className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Courses
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-neutral-800 rounded w-1/2"></div>
            <div className="h-20 bg-neutral-900 rounded"></div>
            <div className="h-40 bg-neutral-900 rounded"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-xl text-center">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Error Loading Course</h2>
            <p className="text-neutral-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {course && (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 mb-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                      {course.title}
                    </h1>
                    {course.description && (
                      <p className="text-neutral-400 text-base max-w-3xl mb-4">
                        {course.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {course.level && (
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-full">
                          {course.level}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium rounded-full">
                        {course.lessons || allLessons.length} lessons
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {notEnrolled ? (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
                <div className="text-4xl mb-4">📚</div>
                <h2 className="text-xl font-bold text-white mb-2">Join this course to start</h2>
                <p className="text-neutral-400 text-sm mb-6">
                  Your school offers this course. Join to open its interactive lessons and quizzes.
                </p>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join Course'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {progress && (
                  <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-white">Your Progress</h2>
                      <span className="text-sm font-semibold text-neutral-300">
                        {progress.percent || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-red-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress.percent || 0))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">
                      {progress.lessons_completed || 0} of {progress.lessons_total || allLessons.length} lessons finished
                    </p>
                    {nextLesson && (
                      <Link
                        href={`/lesson/${nextLesson.id}`}
                        className="inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {doneCount === 0
                          ? 'Start first lesson'
                          : progress.percent >= 100
                          ? 'Review lessons'
                          : 'Continue lesson'}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}

                <section className="space-y-4">
                  <h2 className="text-xl font-bold tracking-tight text-white border-b border-neutral-800 pb-3">
                    Course Lessons
                  </h2>

                  {units.length === 0 ? (
                    <div className="p-8 bg-neutral-900/30 border border-neutral-800 rounded-xl text-center">
                      <p className="text-neutral-400 text-sm">
                        Lessons are on the way. Your teacher has not added lessons to this course yet.
                      </p>
                    </div>
                  ) : (
                    units.map((u, unitIndex) => (
                      <div key={u.id || unitIndex} className="bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 bg-neutral-900/80 border-b border-neutral-800/80">
                          <h3 className="text-base font-semibold text-white">{u.title}</h3>
                        </div>
                        <div className="divide-y divide-neutral-800/60">
                          {(u.lessons || []).map((l) => {
                            const index = allLessons.findIndex((x) => x.id === l.id);
                            const isDone = index >= 0 && index < doneCount;
                            return (
                              <Link
                                key={l.id}
                                href={`/lesson/${l.id}`}
                                className="flex items-center px-5 py-3.5 hover:bg-neutral-800/50 transition-colors group"
                              >
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                                    isDone
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-neutral-800 text-neutral-400'
                                  }`}
                                >
                                  {isDone ? '✓' : index + 1}
                                </span>
                                <span className="flex-1 text-sm text-neutral-200 group-hover:text-white font-medium">
                                  {l.title}
                                </span>
                                <svg
                                  className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </section>

                <section className="space-y-4 pt-4">
                  <h2 className="text-xl font-bold tracking-tight text-white border-b border-neutral-800 pb-3">
                    Quizzes & Assessments
                  </h2>

                  {quizzes.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic">No quizzes in this course yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {quizzes.map((quiz) => (
                        <Link
                          key={quiz.id}
                          href={`/quiz/${quiz.id}`}
                          className="flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">📝</span>
                            <div>
                              <h4 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                                {quiz.title}
                              </h4>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {quiz.questions || quiz.question_count || 0} questions · Pass mark {quiz.pass_mark || 70}%
                                {quiz.best_percent != null && ` · Best: ${quiz.best_percent}%`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-3 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md">
                            Take Quiz →
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Bearilly Learning System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}