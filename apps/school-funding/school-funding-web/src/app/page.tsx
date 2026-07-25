'use client';

import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  GraduationCap,
  Coins,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  School,
  Rocket,
  ArrowRight,
  Star,
  HeartHandshake,
  Target,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role;
      const isOnboarded = user.unsafeMetadata?.isOnboarded;
      if (isOnboarded) {
        router.push(
          role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard',
        );
      } else {
        router.push('/onboarding');
      }
    }
  }, [isLoaded, user, router]);

  const features = [
    {
      icon: Lightbulb,
      title: 'Propose Ideas',
      description:
        'Students submit project ideas that benefit the school or community',
      color: 'text-[#E85D3A]',
      bg: 'bg-[#E85D3A]/10',
      border: 'border-[#E85D3A]/20',
    },
    {
      icon: Coins,
      title: 'Earn & Fund',
      description:
        'Earn coins through participation and fund the projects you believe in',
      color: 'text-[#E85D3A]',
      bg: 'bg-[#E85D3A]/10',
      border: 'border-[#E85D3A]/20',
    },
    {
      icon: TrendingUp,
      title: 'Top Projects Win',
      description:
        'The most funded projects get selected for real-world implementation',
      color: 'text-[#E85D3A]',
      bg: 'bg-[#E85D3A]/10',
      border: 'border-[#E85D3A]/20',
    },
    {
      icon: CheckCircle2,
      title: 'Teacher Review',
      description:
        'Teachers review submissions and guide the most promising ideas to reality',
      color: 'text-[#E85D3A]',
      bg: 'bg-[#E85D3A]/10',
      border: 'border-[#E85D3A]/20',
    },
  ];

  const stats = [
    { label: 'Active Students', value: '120+' },
    { label: 'Projects Funded', value: '15+' },
    { label: 'Coins Distributed', value: '5,000+' },
    { label: 'Ideas Submitted', value: '50+' },
  ];

  const steps = [
    {
      icon: Lightbulb,
      step: '01',
      title: 'Submit an Idea',
      desc: 'Students propose projects that make a difference',
    },
    {
      icon: School,
      step: '02',
      title: 'Teacher Review',
      desc: 'Teachers review and approve feasible projects',
    },
    {
      icon: Coins,
      step: '03',
      title: 'Community Funding',
      desc: 'Students stake coins on projects they support',
    },
    {
      icon: Rocket,
      step: '04',
      title: 'Make It Real',
      desc: 'Top projects get funded and implemented',
    },
  ];

  return (
    <div className="min-h-screen bg-[#2D323E] text-[#EAE2D5] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#E85D3A]/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#E85D3A]/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#E85D3A]/5 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #E85D3A 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#E85D3A]" />
          </div>
          <span className="text-lg font-bold text-[#EAE2D5] tracking-tight">
            CrowdFundHub
          </span>
        </div>

        {!user && (
          <div className="flex items-center gap-3">
            <SignInButton>
              <button className="px-4 py-2 rounded-xl text-xs font-semibold text-[#EAE2D5]/80 hover:text-[#EAE2D5] transition-colors border border-[#E85D3A]/20 hover:border-[#E85D3A]/40 cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E85D3A] text-white hover:bg-[#D14C2A] transition-all cursor-pointer">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )}
      </div>

      <section className="relative z-10 px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[11px] font-semibold text-[#EAE2D5]/80 mb-8"
          >
            <Star className="w-3.5 h-3.5 text-[#E85D3A]" />
            School Community Funding Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#EAE2D5] tracking-tight leading-tight"
          >
            Ideas that
            <span className="bg-gradient-to-r from-[#E85D3A] to-[#E85D3A] bg-clip-text text-transparent">
              shape your school
            </span>
            start here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg text-[#EAE2D5]/80 mt-5 max-w-2xl mx-auto leading-relaxed"
          >
            A crowdfunding platform where students propose ideas, earn coins,
            and fund the projects that make their school and community better.
          </motion.p>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <SignUpButton>
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#E85D3A] text-white font-bold text-sm hover:bg-[#D14C2A] transition-all shadow-lg shadow-[#E85D3A]/30 cursor-pointer">
                  Join CrowdFundHub
                  <ArrowRight className="w-4 h-4" />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#E85D3A]/10 text-[#EAE2D5]/80 font-semibold text-sm border border-[#E85D3A]/20 hover:border-[#E85D3A]/40 hover:text-[#EAE2D5] transition-all cursor-pointer">
                  I already have an account
                </button>
              </SignInButton>
            </motion.div>
          )}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="p-5 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 text-center"
            >
              <p className="text-2xl sm:text-3xl font-extrabold text-[#E85D3A]">
                {stat.value}
              </p>
              <p className="text-[10px] text-[#EAE2D5]/80 mt-1 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[11px] font-semibold text-[#EAE2D5]/80 mb-4">
            <Target className="w-3.5 h-3.5 text-[#E85D3A]" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#EAE2D5]">
            From idea to <span className="text-[#E85D3A]">reality</span>
          </h2>
          <p className="text-[#EAE2D5]/80 mt-3 max-w-lg mx-auto text-sm">
            A simple four-step process that turns student ideas into real-world
            impact
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative p-6 rounded-2xl bg-[#2D323E] border border-[#E85D3A]/20 hover:border-[#E85D3A]/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold text-[#EAE2D5]/80">
                    {step.step}
                  </span>
                  <div className="h-px flex-1 bg-[#E85D3A]/20" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 flex items-center justify-center mb-4 group-hover:bg-[#E85D3A]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#E85D3A]" />
                </div>
                <h3 className="text-base font-bold text-[#EAE2D5] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-xs text-[#EAE2D5]/80 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E85D3A]/10 border border-[#E85D3A]/20 text-[11px] font-semibold text-[#EAE2D5]/80 mb-4">
            <HeartHandshake className="w-3.5 h-3.5 text-[#E85D3A]" />
            Why CrowdFundHub?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#EAE2D5]">
            Built for
            <span className="text-[#E85D3A]">students & teachers</span>
          </h2>
          <p className="text-[#EAE2D5]/80 mt-3 max-w-lg mx-auto text-sm">
            Everything you need to bring great ideas to life
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`p-6 rounded-2xl ${feature.bg} ${feature.border} border hover:bg-[#E85D3A]/15 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bg} border ${feature.border} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#EAE2D5] mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[#EAE2D5]/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-[#2D323E] border border-[#E85D3A]/20 p-10 sm:p-14 text-center"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E85D3A]/10 blur-[80px] rounded-full" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#E85D3A]/15 border border-[#E85D3A]/20 flex items-center justify-center mx-auto mb-5">
              <Rocket className="w-8 h-8 text-[#E85D3A]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#EAE2D5] mb-3">
              Ready to make a difference?
            </h2>
            <p className="text-sm text-[#EAE2D5]/80 max-w-md mx-auto mb-8">
              Join your school&apos;s community of innovators and help turn
              great ideas into reality.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <SignUpButton>
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#E85D3A] text-white font-bold text-sm hover:bg-[#D14C2A] transition-all cursor-pointer">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </div>
            )}

            {user && (
              <p className="text-xs text-[#EAE2D5]/80">
                You&apos;re signed in! You&apos;ll be redirected shortly...
              </p>
            )}
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 px-6 pb-8">
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#E85D3A]/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#EAE2D5]/80" />
              <span className="text-[11px] text-[#EAE2D5]/80 font-medium">
                CrowdFundHub &mdash; School Community Funding Platform
              </span>
            </div>
            <p className="text-[9px] text-[#EAE2D5]/80/50">
              Empowering students to build a better school, one idea at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
