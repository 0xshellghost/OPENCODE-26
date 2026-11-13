'use client';

import { useToast } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Code2, Users, Sprout, Loader2, AlertCircle, Check } from 'lucide-react';
import { sendRegData, fetchColleges } from 'api/profile/profile';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import RegistrationField from 'components/japanese/RegistrationField';
import CollegeAutocompleteField from 'components/japanese/CollegeAutocompleteField';
import { parseJwt } from 'utils/jwt';
import {
  RegistrationFieldErrors,
  RegistrationFormData,
  validateRegistration,
} from 'utils/registrationValidation';

export default function Register() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    gender: 'male',
    degree: 'BTECH',
    branch: 'IT',
    college: 'IIIT Allahabad',
    discordId: '',
    githubId: '',
    graduationYear: '2028',
    avatarUrl: '',
    year: '2nd Year',
  });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [collegeType, setCollegeType] = useState('IIIT Allahabad');
  const [otherCollege, setOtherCollege] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const toast = useToast();

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => fetchColleges(),
  });

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const avatarParam = params.get('avatar_url') || params.get('avatarUrl');

    if (tokenParam) {
      localStorage.setItem('token', tokenParam);
    }
    const token = tokenParam || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    setFormData(previous => {
      const updated = { ...previous };
      if (avatarParam) updated.avatarUrl = avatarParam;
      if (token) {
        const payload = parseJwt(token);
        const githubId = payload?.githubId || payload?.id;
        if (githubId && !updated.githubId) {
          updated.githubId = githubId;
        }
        if ((payload?.avatarUrl || payload?.avatar_url) && !updated.avatarUrl) {
          updated.avatarUrl = payload.avatarUrl || payload.avatar_url;
        }
      }
      return updated;
    });

    if (tokenParam) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes(name)) {
      setMissingFields(prev => prev.filter(f => f !== name));
    }
    if (fieldErrors[name as keyof RegistrationFieldErrors]) {
      setFieldErrors(previous => ({ ...previous, [name]: undefined }));
    }
  };

  const handleCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = event.target.value;
    setCollegeType(val);
    setFormData(previous => ({ ...previous, college: val === 'Other' ? otherCollege : 'IIIT Allahabad' }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes('college')) {
      setMissingFields(prev => prev.filter(f => f !== 'college'));
    }
    setFieldErrors(previous => ({ ...previous, college: undefined }));
  };

  const handleOtherCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = event.target.value;
    setOtherCollege(val);
    setFormData(previous => ({ ...previous, college: val }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes('college')) {
      setMissingFields(prev => prev.filter(f => f !== 'college'));
    }
    setFieldErrors(previous => ({ ...previous, college: undefined }));
  };

  const handleSelectCollege = (college: string) => {
    setOtherCollege(college);
    setFormData(previous => ({ ...previous, college }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes('college')) {
      setMissingFields(prev => prev.filter(f => f !== 'college'));
    }
    setFieldErrors(previous => ({ ...previous, college: undefined }));
  };

  const [isPending, setIsPending] = useState(false);
  const isSubmitting = isPending || isRedirecting;

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    // Resolve current values with DOM fallback in case browser autofill didn't trigger React onChange
    const resolved = { ...formData };
    if (typeof document !== 'undefined') {
      const getVal = (name: string) => {
        const el = document.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
        return el?.value?.trim() || '';
      };
      if (!resolved.name?.trim()) resolved.name = getVal('name');
      if (!resolved.email?.trim()) resolved.email = getVal('email');
      if (!resolved.githubId?.trim()) resolved.githubId = getVal('githubId');
      if (!resolved.discordId?.trim()) resolved.discordId = getVal('discordId');
      if (!resolved.gender?.trim()) resolved.gender = getVal('gender');
      if (!resolved.degree?.trim()) resolved.degree = getVal('degree');
      if (!resolved.branch?.trim()) resolved.branch = getVal('branch');
      if (!resolved.year?.trim()) resolved.year = getVal('year');
      if (!resolved.graduationYear) resolved.graduationYear = getVal('graduationYear');
    }

    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      token = params.get('token');
      if (token) {
        localStorage.setItem('token', token);
      }
    }

    // Auto-recover githubId from token if still missing
    if (!resolved.githubId?.trim() && token) {
      const payload = parseJwt(token);
      resolved.githubId = payload?.githubId || payload?.id || '';
      if (resolved.githubId) {
        setFormData(prev => ({ ...prev, githubId: resolved.githubId }));
      }
    }

    if (!token) {
      const authError = 'No GitHub sign-in detected. Please sign in with GitHub first so your account can be linked.';
      setFormStatus({
        type: 'error',
        message: authError,
      });
      toast({
        title: 'Sign in required',
        description: 'Please sign in with GitHub first so we can link your profile.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    resolved.college = collegeType === 'Other' ? otherCollege.trim() : 'IIIT Allahabad';
    const errors = validateRegistration(resolved);
    const invalidKeys = Object.keys(errors);

    if (invalidKeys.length > 0) {
      const missingKeys = invalidKeys;
      setMissingFields(missingKeys);
      setFieldErrors(errors);

      const fieldLabels: Record<string, string> = {
        name: 'Full Name',
        email: 'Email address',
        githubId: 'GitHub username',
        discordId: 'Discord username',
        gender: 'Gender',
        college: 'College name',
        degree: 'Degree',
        branch: 'Branch',
        year: 'Current year',
        graduationYear: 'Graduation year',
      };
      const missingList = missingKeys.map(k => fieldLabels[k] || k).join(', ');
      const errorMsg = `Please fix or fill in the required fields: ${missingList}`;

      setFormStatus({
        type: 'error',
        message: errorMsg,
      });
      toast({
        title: 'Please fill in all required fields',
        description: errorMsg,
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });

      // Focus first missing input field and scroll into view
      const firstMissingKey = missingKeys[0];
      const el = document.getElementById(`register-${firstMissingKey}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setMissingFields([]);
    setFieldErrors({});
    setFormStatus(null);

    const resolvedAvatarUrl =
      resolved.avatarUrl?.trim() ||
      (resolved.githubId?.trim() ? `https://github.com/${resolved.githubId.trim()}.png` : '');

    const registrationPayload = {
      name: resolved.name.trim(),
      email: resolved.email.trim(),
      githubId: resolved.githubId.trim(),
      discordId: resolved.discordId.trim(),
      degree: resolved.degree.trim(),
      branch: resolved.branch.trim(),
      year: resolved.year.trim(),
      college: resolved.college,
      gender: resolved.gender.trim().toLowerCase(),
      graduationYear: Number(resolved.graduationYear),
      avatarUrl: resolvedAvatarUrl,
    };

    try {
      setIsPending(true);
      const data = await sendRegData(registrationPayload);

      setIsRedirecting(true);
      setFormStatus({
        type: 'success',
        message: 'Profile created — taking you to the arenas...',
      });
      toast({
        title: "You're registered",
        description: 'Welcome to OpenCode 2026. Taking you to your dashboard...',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });

      const currentToken = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      setTimeout(() => {
        window.location.assign(
          `/user/events?token=${encodeURIComponent(currentToken)}&avatar_url=${encodeURIComponent(resolvedAvatarUrl)}`
        );
      }, 1000);
    } catch (error: any) {
      setIsRedirecting(false);
      console.error('Registration submission failed:', error);
      const errorMsg = error?.message || 'Please check your details and try again.';
      if (error.fields) {
        setFieldErrors(error.fields);
        const firstField = Object.keys(error.fields)[0];
        document.getElementById(`register-${firstField}`)?.focus();
      }
      if (error.status === 401) {
        localStorage.removeItem('token');
      }
      setFormStatus({
        type: 'error',
        message: errorMsg,
      });
      toast({
        title: 'Registration could not be completed',
        description: errorMsg,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setIsPending(false);
    }
  };

  if (!mounted) {
    return (
      <JapaneseBackground variant="auth">
        <SiteNavbar />
        <main className="oc-register-layout">
          <header className="oc-register-intro">
            <p className="oc-eyebrow"><span />JOIN THE JOURNEY</p>
            <h1 className="oc-auth-heading">A place for<br />your potential.</h1>
            <p className="oc-description">Complete your profile and become part of OpenCode 2026. Your first contribution is just the beginning.</p>
          </header>
          <div className="glass-panel oc-register-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          </div>
        </main>
      </JapaneseBackground>
    );
  }

  return (
    <JapaneseBackground variant="auth">
      <SiteNavbar />
      <main className="oc-register-layout">
        <header className="oc-register-intro">
          <p className="oc-eyebrow"><span />JOIN THE JOURNEY</p>
          <h1 className="oc-auth-heading">A place for<br />your potential.</h1>
          <p className="oc-description">Complete your profile and become part of OpenCode 2026. Your first contribution is just the beginning.</p>
          <ul className="oc-register-benefits">
            <li><Code2 size={18} />Build something that matters</li>
            <li><Users size={18} />Find people who share your curiosity</li>
            <li><Sprout size={18} />Grow, one contribution at a time</li>
          </ul>
        </header>

        <form className="glass-panel oc-register-card" onSubmit={handleSubmit} noValidate>
          <section className="oc-form-section">
            <h2><span>01</span>A little about you</h2>
            <div className="oc-form-grid">
              <RegistrationField
                name="name"
                label="Full name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                hasError={missingFields.includes('name')}
                error={fieldErrors.name}
              />
              <RegistrationField
                name="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                hasError={missingFields.includes('email')}
                error={fieldErrors.email}
              />
              <RegistrationField
                name="githubId"
                label="GitHub username"
                value={formData.githubId}
                onChange={handleChange}
                placeholder="Your GitHub handle"
                hasError={missingFields.includes('githubId')}
                error={fieldErrors.githubId}
                readOnly={Boolean(formData.githubId)}
              />
              <RegistrationField
                name="discordId"
                label="Discord username"
                value={formData.discordId}
                onChange={handleChange}
                placeholder="Your Discord handle"
                hasError={missingFields.includes('discordId')}
                error={fieldErrors.discordId}
              />
              <RegistrationField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={['male', 'female', 'other']}
                full
                hasError={missingFields.includes('gender')}
                error={fieldErrors.gender}
              />
            </div>
          </section>

          <section className="oc-form-section">
            <h2><span>02</span>Your academic chapter</h2>
            <div className="oc-form-grid">
              <RegistrationField
                name="collegeType"
                label="College"
                value={collegeType}
                onChange={handleCollegeChange}
                options={['IIIT Allahabad', 'Other']}
                full
              />
              {collegeType === 'Other' && (
                <CollegeAutocompleteField
                  name="college"
                  label="College name"
                  value={otherCollege}
                  onChange={handleOtherCollegeChange}
                  onSelect={handleSelectCollege}
                  colleges={colleges}
                  placeholder="Your institution"
                  full
                  hasError={missingFields.includes('college')}
                  error={fieldErrors.college}
                />
              )}
              <RegistrationField
                name="degree"
                label="Degree"
                value={formData.degree}
                onChange={handleChange}
                options={['BTECH', 'MTECH', 'PHD', 'Other']}
                hasError={missingFields.includes('degree')}
                error={fieldErrors.degree}
              />
              <RegistrationField
                name="branch"
                label="Branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Your field of study"
                hasError={missingFields.includes('branch')}
                error={fieldErrors.branch}
              />
              <RegistrationField
                name="year"
                label="Current year"
                value={formData.year}
                onChange={handleChange}
                options={['School', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passout']}
                hasError={missingFields.includes('year')}
                error={fieldErrors.year}
              />
              <RegistrationField
                name="graduationYear"
                label="Graduation year"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="Graduation year"
                type="number"
                hasError={missingFields.includes('graduationYear')}
                error={fieldErrors.graduationYear}
                min={2000}
                max={2100}
              />
            </div>
          </section>

          {formStatus && (
            <div
              role={formStatus.type === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '13px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background:
                  formStatus.type === 'error'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'var(--accent-soft, rgba(88, 185, 154, 0.12))',
                border:
                  formStatus.type === 'error'
                    ? '1px solid rgba(239, 68, 68, 0.28)'
                    : '1px solid var(--border-accent, rgba(88, 185, 154, 0.35))',
                color: 'var(--fg)',
                boxShadow: formStatus.type === 'success' ? '0 4px 20px -4px var(--accent-soft)' : undefined,
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                  background:
                    formStatus.type === 'error'
                      ? 'rgba(239, 68, 68, 0.16)'
                      : 'var(--accent)',
                  color:
                    formStatus.type === 'error'
                      ? '#ef4444'
                      : 'var(--accent-ink, #07131F)',
                }}
              >
                {formStatus.type === 'error' ? (
                  <AlertCircle size={15} />
                ) : (
                  <Check size={15} strokeWidth={2.5} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {formStatus.type === 'success' ? (
                  <>
                    <p style={{ fontWeight: 600, color: 'var(--fg)', fontSize: '13.5px', marginBottom: '2px' }}>
                      You&apos;re in.
                    </p>
                    <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>
                      Profile created — taking you to the active arenas...
                    </p>
                  </>
                ) : (
                  <p style={{ color: 'var(--fg)', fontSize: '13px', margin: 0 }}>
                    {formStatus.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              if (!isSubmitting) {
                handleSubmit(e as any);
              }
            }}
            className="oc-button"
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-ink, #000)',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.2s ease',
              border: 'none',
              outline: 'none',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{isRedirecting ? 'Heading to arenas...' : 'Preparing your journey...'}</span>
              </>
            ) : (
              <>
                <span>Begin your journey</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <p className="oc-auth-fineprint">All fields are required. Let&apos;s make your profile feel like you.</p>
          <div className="oc-auth-links">Already part of the community? <Link href="/auth/sign-in">Sign in</Link></div>
        </form>
      </main>
    </JapaneseBackground>
  );
}
