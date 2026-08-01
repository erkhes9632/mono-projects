'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sparkles,
  Loader2,
  Check,
  ArrowRight,
  Coins,
  School,
} from 'lucide-react';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      id
      userName
      email
      role
    }
  }
`;

const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($role: Role!) {
    updateUserRole(role: $role) {
      id
      role
    }
  }
`;

const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($input: UserInput!) {
    updateMe(input: $input) {
      id
      userName
      email
    }
  }
`;

const roleConfig = {
  STUDENT: {
    title: 'Student',
    description:
      'Submit project ideas, earn coins, and fund community initiatives',
    icon: GraduationCap,
    features: [
      'Propose ideas for school & community',
      'Earn coins through participation',
      'Fund projects you believe in',
      'Track your impact',
    ],
    gradient: 'from-[#E85D3A]/20 to-[#242831]/5',
    accent: 'text-[#E85D3A]',
    accentBg: 'bg-[#E85D3A]/10',
    accentBorder: 'border-[#E85D3A]/20',
    selectedBorder: 'border-[#E85D3A]/50',
    selectedGlow: 'shadow-[#E85D3A]/20',
    buttonBg: 'bg-[#E85D3A] hover:bg-[#D14C2A]',
    buttonText: 'text-[#EAE2D5]',
  },
  TEACHER: {
    title: 'Teacher',
    description: 'Review projects, manage coins, and guide student innovation',
    icon: School,
    features: [
      'Review & approve student projects',
      'Award coins to students',
      'Select winning projects for funding',
      'Mentor the next generation',
    ],
    gradient: 'from-[#E85D3A]/20 to-[#242831]/5',
    accent: 'text-[#E85D3A]',
    accentBg: 'bg-[#E85D3A]/10',
    accentBorder: 'border-[#E85D3A]/20',
    selectedBorder: 'border-[#E85D3A]/50',
    selectedGlow: 'shadow-[#E85D3A]/20',
    buttonBg: 'bg-[#E85D3A] hover:bg-[#D14C2A]',
    buttonText: 'text-[#EAE2D5]',
  },
};

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const [createUser] = useMutation(CREATE_USER_MUTATION);
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE_MUTATION);
  const [updateMe] = useMutation(UPDATE_ME_MUTATION);

  const handleSave = async () => {
    if (!isLoaded || !user || !role) return;

    try {
      setLoading(true);
      setSubmitted(true);

      await user.update({
        unsafeMetadata: {
          role: role,
          isOnboarded: true,
        },
      });

      try {
        const userName = user.fullName || user.username || 'User';
        const email = user.primaryEmailAddress?.emailAddress || '';
        const avatarUrl = user.imageUrl;

        await createUser({
          variables: {
            input: { userName, email, avatarUrl },
          },
        });
      } catch (dbErr) {
        console.warn('DB Sync warning (user may already exist):', dbErr);
        // If createUser failed because user was already created by webhook,
        // update the username via updateMe instead
        try {
          const userName = user.fullName || user.username || 'User';
          await updateMe({
            variables: {
              input: {
                userName,
                email: user.primaryEmailAddress?.emailAddress || '',
                avatarUrl: user.imageUrl,
              },
            },
          });
        } catch (updateErr) {
          console.warn('Fallback updateMe also failed:', updateErr);
        }
      }

      // Always sync the selected role to the backend DB. The Clerk webhook
      // creates users with a default STUDENT role, so skipping this when the
      // user already exists leaves TEACHER users unable to review projects,
      // add coins, or view student projects.
      try {
        await updateUserRole({
          variables: { role },
        });
      } catch (roleErr) {
        console.warn('Role sync warning:', roleErr);
      }

      // Wait a moment so user sees the success
      await new Promise((r) => setTimeout(r, 600));

      if (role === 'STUDENT') {
        router.push('/student-dashboard');
      } else {
        router.push('/teacher-dashboard');
      }
      router.refresh();
    } catch (err) {
      console.error('Clerk & DB update error:', err);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#242831]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#242831]/40 border border-[#242831]/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#E85D3A]/60" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-[#EAE2D5]/50" />
        </div>
      </div>
    );
  }

  const cfg = role ? roleConfig[role] : null;

  // Success screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#242831] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 border-2 bg-[#242831]/40 border-[#E85D3A]/30"
          >
            {role === 'STUDENT' ? (
              <GraduationCap className="w-9 h-9 text-[#E85D3A]" />
            ) : (
              <School className="w-9 h-9 text-[#E85D3A]" />
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {loading
              ? 'Setting up your account...'
              : `Welcome, ${role === 'STUDENT' ? 'Innovator' : 'Mentor'}!`}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-[#EAE2D5]/80"
          >
            {loading
              ? 'Just a moment while we prepare your dashboard'
              : `Redirecting you to your ${role === 'STUDENT' ? 'student' : 'teacher'} dashboard`}
          </motion.p>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex justify-center"
            >
              <Loader2 className="w-6 h-6 animate-spin text-[#EAE2D5]/50" />
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#242831] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E85D3A]/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E85D3A]/3 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#E85D3A]/3 to-[#E85D3A]/3 blur-[150px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#242831]/30 border border-[#242831]/20 text-[11px] font-semibold text-[#EAE2D5]/70 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E85D3A]" />
              Welcome to FundHub
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
            >
              Choose your
              <span className="text-[#E85D3A]">path</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[15px] text-[#EAE2D5]/80 mt-3 max-w-lg mx-auto leading-relaxed"
            >
              Join a community where ideas come to life. Students innovate,
              teachers guide, and together we fund what matters.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {(Object.keys(roleConfig) as Array<'STUDENT' | 'TEACHER'>).map(
              (roleKey, index) => {
                const config = roleConfig[roleKey];
                const Icon = config.icon;
                const isSelected = role === roleKey;

                return (
                  <motion.button
                    key={roleKey}
                    type="button"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
                    onClick={() => setRole(roleKey)}
                    className={`group relative text-left w-full p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? `${config.selectedBorder} ${config.selectedGlow} shadow-lg bg-[#242831]`
                        : 'border-[#242831]/30 bg-[#242831]/60 hover:border-[#E85D3A]/30 hover:bg-[#242831]'
                    }`}
                  >
                    <div
                      className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? `${config.accentBorder} ${config.accentBg} scale-110`
                          : 'border-[#242831]/50 group-hover:border-[#242831]/50'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 20,
                          }}
                        >
                          <Check className={`w-3.5 h-3.5 ${config.accent}`} />
                        </motion.div>
                      )}
                    </div>

                    <div
                      className={`inline-flex p-3 rounded-xl mb-4 border transition-all duration-300 ${
                        isSelected
                          ? `${config.accentBg} ${config.accentBorder}`
                          : 'bg-[#242831]/30 border-[#242831]/50 group-hover:bg-[#242831]/40'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isSelected
                            ? config.accent
                            : 'text-[#EAE2D5]/70 group-hover:text-[#E85D3A]'
                        }`}
                      />
                    </div>

                    <h3
                      className={`text-lg font-bold mb-1.5 transition-colors duration-300 ${
                        isSelected
                          ? 'text-white'
                          : 'text-white/80 group-hover:text-white'
                      }`}
                    >
                      {config.title}
                    </h3>

                    <p className="text-sm text-[#EAE2D5]/80 leading-relaxed mb-5">
                      {config.description}
                    </p>

                    <div className="space-y-2">
                      {config.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2.5">
                          <div
                            className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                              isSelected ? config.accent : 'bg-[#242831]/50'
                            }`}
                          />
                          <span className="text-[12px] text-[#EAE2D5]/70 group-hover:text-[#EAE2D5]/90 transition-colors">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${config.gradient} pointer-events-none`}
                    />
                  </motion.button>
                );
              },
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#242831]/30 border border-[#242831]/20 text-xs text-[#EAE2D5]/70 mb-6">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#242831]/50 shrink-0">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#EAE2D5]/70">
                    {user?.fullName?.[0] || user?.username?.[0] || '?'}
                  </div>
                )}
              </div>
              <span>
                Signed in as
                <span className="text-white/80 font-semibold">
                  {user?.fullName || user?.username || 'User'}
                </span>
              </span>
            </div>

            <div className="flex justify-center">
              <motion.button
                type="button"
                whileHover={role ? { scale: 1.02 } : {}}
                whileTap={role ? { scale: 0.98 } : {}}
                onClick={handleSave}
                disabled={!role || loading}
                className={`relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  role
                    ? `${cfg!.buttonBg} ${cfg!.buttonText} shadow-lg ${cfg!.selectedGlow} hover:shadow-xl cursor-pointer`
                    : 'bg-[#242831]/30 text-[#EAE2D5]/40 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting up...
                  </>
                ) : role ? (
                  <>
                    Get Started as {roleConfig[role].title}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Select a role to continue'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative z-10 text-center pb-6"
      >
        <p className="text-[10px] text-[#EAE2D5]/50 font-medium tracking-wider uppercase flex items-center justify-center gap-2">
          <Coins className="w-3 h-3 text-[#E85D3A]/50" />
          Powered by FundHub &bull; School Community Platform
        </p>
      </motion.div>
    </div>
  );
}
