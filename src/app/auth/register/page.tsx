'use client';

import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Code2, Users, Sprout, Loader2 } from 'lucide-react';
import { sendRegData, fetchColleges } from 'api/profile/profile';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import RegistrationField from 'components/japanese/RegistrationField';
import CollegeAutocompleteField from 'components/japanese/CollegeAutocompleteField';
import { parseJwt } from 'utils/jwt';

export default function Register() {
  const [formData, setFormData] = useState({
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
  const [collegeType, setCollegeType] = useState('IIIT Allahabad');
  const [otherCollege, setOtherCollege] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const toast = useToast();
  const router = useRouter();

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => fetchColleges(),
  });

  useEffect(() => {
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
        if (payload?.githubId && !updated.githubId) {
          updated.githubId = payload.githubId;
        }
        if ((payload?.avatarUrl || payload?.avatar_url) && !updated.avatarUrl) {
          updated.avatarUrl = payload.avatarUrl || payload.avatar_url;
        }
      }
      return updated;
    });
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes(name)) {
      setMissingFields(prev => prev.filter(f => f !== name));
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
  };

  const handleOtherCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = event.target.value;
    setOtherCollege(val);
    setFormData(previous => ({ ...previous, college: val }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes('college')) {
      setMissingFields(prev => prev.filter(f => f !== 'college'));
    }
  };

  const handleSelectCollege = (college: string) => {
    setOtherCollege(college);
    setFormData(previous => ({ ...previous, college }));
    if (formStatus) setFormStatus(null);
    if (missingFields.includes('college')) {
      setMissingFields(prev => prev.filter(f => f !== 'college'));
    }
  };

  const registerMutation = useMutation({
    mutationFn: sendRegData,
    onSuccess: () => {
      setIsRedirecting(true);
      setFormStatus({
        type: 'success',
        message: 'Registration successful! Welcome to OpenCode 2026. Redirecting...',
      });
      toast({
        title: 'Registration Successful!',
        description: 'Welcome to OpenCode 2026. Redirecting to your dashboard...',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const avatarUrl = formData.avatarUrl || (formData.githubId ? `https://github.com/${formData.githubId}.png` : '');
      setTimeout(() => {
        window.location.assign(
          `/user/events?token=${encodeURIComponent(token)}&avatar_url=${encodeURIComponent(avatarUrl)}`
        );
      }, 1000);
    },
    onError: (error: any) => {
      setIsRedirecting(false);
      const errorMsg = error?.message || 'Please check your details and try again.';
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
    },
  });

  const isSubmitting = registerMutation.isPending || isRedirecting;

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    console.log("3. Handle submit entered");

    const token = localStorage.getItem("token");

    console.log("4. Token exists: ", !!token);
    console.log("5. Form data:", formData);

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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

    const missing: { key: string; label: string }[] = [];
    if (!resolved.name?.trim()) missing.push({ key: 'name', label: 'Full name' });
    if (!resolved.email?.trim()) missing.push({ key: 'email', label: 'Email address' });
    if (!resolved.githubId?.trim()) missing.push({ key: 'githubId', label: 'GitHub username' });
    if (!resolved.discordId?.trim()) missing.push({ key: 'discordId', label: 'Discord username' });
    if (!resolved.gender?.trim()) missing.push({ key: 'gender', label: 'Gender' });
    if (!resolved.degree?.trim()) missing.push({ key: 'degree', label: 'Degree' });
    if (!resolved.branch?.trim()) missing.push({ key: 'branch', label: 'Branch' });
    if (!resolved.year?.trim()) missing.push({ key: 'year', label: 'Current year' });
    if (!resolved.graduationYear) missing.push({ key: 'graduationYear', label: 'Graduation year' });
    if (collegeType === 'Other' && !otherCollege?.trim()) missing.push({ key: 'college', label: 'College name' });

    if (missing.length > 0) {
      const missingKeys = missing.map(m => m.key);
      setMissingFields(missingKeys);
      const errorMsg = `Please fill in all required fields: ${missing.map(m => m.label).join(', ')}`;
      setFormStatus({
        type: 'error',
        message: errorMsg,
      });
      toast({
        title: 'Please fill in all required fields',
        description: `Missing: ${missing.map(m => m.label).join(', ')}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });

      // Focus first missing input field
      const firstMissingKey = missingKeys[0];
      const el = document.getElementById(`register-${firstMissingKey}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setMissingFields([]);
    setFormStatus(null);

    const resolvedAvatarUrl =
      resolved.avatarUrl?.trim() ||
      (resolved.githubId?.trim() ? `https://github.com/${resolved.githubId.trim()}.png` : '');

    registerMutation.mutate({
      name: resolved.name.trim(),
      email: resolved.email.trim(),
      githubId: resolved.githubId.trim(),
      discordId: resolved.discordId.trim(),
      degree: resolved.degree.trim(),
      branch: resolved.branch.trim(),
      year: resolved.year.trim(),
      college: collegeType === 'Other' ? otherCollege.trim() : 'IIIT Allahabad',
      gender: resolved.gender.trim().toLowerCase(),
      graduationYear: Number(resolved.graduationYear),
      avatarUrl: resolvedAvatarUrl,
    });
  };

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

        <form className="glass-panel oc-register-card" 
        onSubmit={(e) => {
            e.preventDefault()
            console.log('2. Form submitted');
            handleSubmit(e);
        }} noValidate>
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
              />
              <RegistrationField
                name="githubId"
                label="GitHub username"
                value={formData.githubId}
                onChange={handleChange}
                placeholder="Your GitHub handle"
                hasError={missingFields.includes('githubId')}
              />
              <RegistrationField
                name="discordId"
                label="Discord username"
                value={formData.discordId}
                onChange={handleChange}
                placeholder="Your Discord handle"
                hasError={missingFields.includes('discordId')}
              />
              <RegistrationField
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={['male', 'female', 'other']}
                full
                hasError={missingFields.includes('gender')}
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
                />
              )}
              <RegistrationField
                name="degree"
                label="Degree"
                value={formData.degree}
                onChange={handleChange}
                options={['BTECH', 'MTECH', 'PHD', 'Other']}
                hasError={missingFields.includes('degree')}
              />
              <RegistrationField
                name="branch"
                label="Branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Your field of study"
                hasError={missingFields.includes('branch')}
              />
              <RegistrationField
                name="year"
                label="Current year"
                value={formData.year}
                onChange={handleChange}
                options={['School', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passout']}
                hasError={missingFields.includes('year')}
              />
              <RegistrationField
                name="graduationYear"
                label="Graduation year"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="Graduation year"
                type="number"
                hasError={missingFields.includes('graduationYear')}
              />
            </div>
          </section>

          {formStatus && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: formStatus.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                border: `1px solid ${formStatus.type === 'error' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(34, 197, 94, 0.35)'}`,
                color: formStatus.type === 'error' ? '#fca5a5' : '#86efac',
              }}
            >
              <span>{formStatus.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{formStatus.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => console.log("1. Register button clicked")}
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
                <span>Preparing your journey...</span>
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
