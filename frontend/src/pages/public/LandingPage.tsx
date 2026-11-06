import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PollCard from '../../components/poll/PollCard';
import { pollService } from '../../services/pollService';
import { Poll } from '../../types';

const LandingPage: React.FC = () => {
  const [featuredPolls, setFeaturedPolls] = useState<Poll[]>([]);

  useEffect(() => {
    pollService.getPublicPolls({ page: 1, limit: 3 }).then((data) => {
      const polls = Array.isArray(data) ? data : data.items;
      setFeaturedPolls(polls);
    }).catch(() => setFeaturedPolls([]));
  }, []);

  return (
    <div className="space-y-16">
      <section className="group relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex min-h-[calc(100vh-8rem)] w-screen items-center overflow-hidden border-y border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(135deg,#ffffff_0%,#eef5ff_48%,#f8fafc_100%)] px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 lg:px-16 lg:py-20">
        <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute right-0 top-16 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl transition-transform duration-500 group-hover:-translate-y-2" />
        <div className="absolute -bottom-8 right-8 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl transition-transform duration-500 group-hover:scale-110" />

        <div className="relative mx-auto w-full max-w-6xl text-center">
          <span className="inline-flex rounded-full border border-blue-200 bg-white/85 px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">Pollsmaster for modern teams</span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
            Launch beautiful public polls and turn every response into actionable insight.
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-600 sm:text-xl">
            Design engaging polls, collect open-text and multiple-choice responses, and review clean analytics from one streamlined platform.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/polls" className="group/button">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-blue-200/60 transition-all duration-300 group-hover/button:-translate-y-1 group-hover/button:shadow-xl">
                Browse active polls
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-700">
            <span className="rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700 hover:shadow-md">No account needed to vote</span>
            <span className="rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md">Multiple choice + open text</span>
            <span className="rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:text-violet-700 hover:shadow-md">Instant response visibility</span>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <div className="group/card rounded-[1.75rem] border border-white/80 bg-white/70 p-6 text-left shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:bg-white hover:shadow-[0_24px_50px_rgba(59,130,246,0.14)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Reach</p>
                <span className="text-xl transition-transform duration-300 group-hover/card:translate-x-1">→</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">24/7</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Keep participation open for public audiences with a frictionless flow that invites more responses.</p>
            </div>
            <div className="group/card rounded-[1.75rem] border border-white/80 bg-white/70 p-6 text-left shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:bg-white hover:shadow-[0_24px_50px_rgba(16,185,129,0.14)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Flexibility</p>
                <span className="text-xl transition-transform duration-300 group-hover/card:translate-x-1">→</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">2 formats</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Blend structured choices with open responses to capture both fast sentiment and richer context.</p>
            </div>
            <div className="group/card rounded-[1.75rem] border border-white/80 bg-white/70 p-6 text-left shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-violet-200 hover:bg-white hover:shadow-[0_24px_50px_rgba(139,92,246,0.14)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Momentum</p>
                <span className="text-xl transition-transform duration-300 group-hover/card:translate-x-1">→</span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">Live insight</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Turn incoming feedback into clear direction with analytics that stay readable and immediate.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Card className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f7f2ea_100%)] p-8 text-stone-900 shadow-[0_18px_40px_rgba(120,113,108,0.08)] sm:p-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
              <span className="h-px w-12 bg-stone-300" />
              Why Teams Choose This Platform
              <span className="h-px w-12 bg-stone-300" />
            </span>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/85 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:bg-white hover:shadow-[0_18px_34px_rgba(120,113,108,0.12)]">
              <h3 className="text-xl font-semibold text-stone-900 transition-colors duration-300 hover:text-stone-700">Flexible Question Formats</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">Combine structured multiple-choice questions with open-ended responses to capture both quantitative and qualitative insights within a single poll.</p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/85 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:bg-white hover:shadow-[0_18px_34px_rgba(120,113,108,0.12)]">
              <h3 className="text-xl font-semibold text-stone-900 transition-colors duration-300 hover:text-stone-700">Accessible Participation</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">Enable seamless engagement without requiring user accounts, reducing barriers to participation and increasing response volume.</p>
            </div>
            <div className="rounded-[1.5rem] border border-stone-200 bg-white/85 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:bg-white hover:shadow-[0_18px_34px_rgba(120,113,108,0.12)]">
              <h3 className="text-xl font-semibold text-stone-900 transition-colors duration-300 hover:text-stone-700">Analytics-Driven Dashboard</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">Monitor total responses, distribution across options, and detailed text feedback through clear, structured, and actionable insights.</p>
            </div>
          </div>
        </Card>
      </section>
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f5ef_100%)] px-6 py-10 shadow-[0_18px_40px_rgba(120,113,108,0.08)] sm:px-8">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">
            <span className="h-px w-12 bg-stone-300" />
            Featured selection
            <span className="h-px w-12 bg-stone-300" />
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Featured active polls</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-stone-600">Jump straight into the latest open polls.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredPolls.length > 0 ? featuredPolls.map((poll) => <PollCard key={poll.id} poll={poll} />) : (
            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500 lg:col-span-3">
              No active polls are live yet.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
