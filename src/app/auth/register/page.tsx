'use client';

import { Button, useToast } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Code2, Users, Sprout } from 'lucide-react';
import { sendRegData, fetchColleges } from 'api/profile/profile';
import JapaneseBackground from 'components/japanese/JapaneseBackground';
import SiteNavbar from 'components/navbar/SiteNavbar';
import RegistrationField from 'components/japanese/RegistrationField';
import CollegeAutocompleteField from 'components/japanese/CollegeAutocompleteField';
import { parseJwt } from 'utils/jwt';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', gender: '', degree: '', branch: '', college: 'IIIT Allahabad', discordId: '', githubId: '', graduationYear: '', avatarUrl: '', year: '' });
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
    const avatarParam = params.get('avatar_url');

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
        if (payload?.avatarUrl && !updated.avatarUrl) {
          updated.avatarUrl = payload.avatarUrl;
        }
      }
      return updated;
    });
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(previous => ({ ...previous, [event.target.name]: event.target.value }));
    if (formStatus) setFormStatus(null);
  };
  const handleCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCollegeType(event.target.value);
    setFormData(previous => ({ ...previous, college: event.target.value === 'Other' ? otherCollege : 'IIIT Allahabad' }));
    if (formStatus) setFormStatus(null);
  };
  const handleOtherCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOtherCollege(event.target.value);
    setFormData(previous => ({ ...previous, college: event.target.value }));
    if (formStatus) setFormStatus(null);
  };
  const handleSelectCollege = (college: string) => {
    setOtherCollege(college);
    setFormData(previous => ({ ...previous, college }));
    if (formStatus) setFormStatus(null);
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
      const avatarUrl = formData.avatarUrl || '';
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

  const handleSubmit = (event?: FormEvent<HTMLFormElement> | React.MouseEvent) => {
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

    const missing: string[] = [];
    if (!resolved.name?.trim()) missing.push('Full name');
    if (!resolved.email?.trim()) missing.push('Email address');
    if (!resolved.githubId?.trim()) missing.push('GitHub username');
    if (!resolved.discordId?.trim()) missing.push('Discord username');
    if (!resolved.gender?.trim()) missing.push('Gender');
    if (!resolved.degree?.trim()) missing.push('Degree');
    if (!resolved.branch?.trim()) missing.push('Branch');
    if (!resolved.year?.trim()) missing.push('Current year');
    if (!resolved.graduationYear) missing.push('Graduation year');
    if (collegeType === 'Other' && !otherCollege?.trim()) missing.push('College name');

    if (missing.length > 0) {
      const errorMsg = `Please fill in all required fields: ${missing.join(', ')}`;
      setFormStatus({
        type: 'error',
        message: errorMsg,
      });
      toast({
        title: 'Please fill in all required fields',
        description: `Missing: ${missing.join(', ')}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setFormStatus(null);
    registerMutation.mutate({
      ...resolved,
      college: collegeType === 'Other' ? otherCollege : 'IIIT Allahabad',
      gender: resolved.gender.trim().toLowerCase(),
      graduationYear: Number(resolved.graduationYear),
    });
  };

  return <JapaneseBackground variant="auth">
    <SiteNavbar />
    <main className="oc-register-layout">
      <header className="oc-register-intro">
        <p className="oc-eyebrow"><span />JOIN THE JOURNEY</p>
        <h1 className="oc-auth-heading">A place for<br />your potential.</h1>
        <p className="oc-description">Complete your profile and become part of OpenCode 2026. Your first contribution is just the beginning.</p>
        <ul className="oc-register-benefits"><li><Code2 size={18} />Build something that matters</li><li><Users size={18} />Find people who share your curiosity</li><li><Sprout size={18} />Grow, one contribution at a time</li></ul>
      </header>
      <form className="glass-panel oc-register-card" onSubmit={handleSubmit} noValidate>
        <section className="oc-form-section"><h2><span>01</span>A little about you</h2><div className="oc-form-grid">
          <RegistrationField name="name" label="Full name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
          <RegistrationField name="email" label="Email address" value={formData.email} onChange={handleChange} placeholder="you@example.com" type="email" autoComplete="email" />
          <RegistrationField name="githubId" label="GitHub username" value={formData.githubId} onChange={handleChange} placeholder="Your GitHub handle" />
          <RegistrationField name="discordId" label="Discord username" value={formData.discordId} onChange={handleChange} placeholder="Your Discord handle" />
          <RegistrationField name="gender" label="Gender" value={formData.gender} onChange={handleChange} options={['male', 'female', 'other']} full />
        </div></section>
        <section className="oc-form-section"><h2><span>02</span>Your academic chapter</h2><div className="oc-form-grid">
          <RegistrationField name="collegeType" label="College" value={collegeType} onChange={handleCollegeChange} options={['IIIT Allahabad', 'Other']} full />
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
            />
          )}
          <RegistrationField name="degree" label="Degree" value={formData.degree} onChange={handleChange} options={['BTECH', 'MTECH', 'PHD', 'Other']} />
          <RegistrationField name="branch" label="Branch" value={formData.branch} onChange={handleChange} placeholder="Your field of study" />
          <RegistrationField name="year" label="Current year" value={formData.year} onChange={handleChange} options={['School', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Passout']} />
          <RegistrationField name="graduationYear" label="Graduation year" value={formData.graduationYear} onChange={handleChange} placeholder="Graduation year" type="number" />
        </div></section>
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
        <Button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          width="100%"
          height="48px"
          bg="var(--accent)"
          color="var(--accent-ink)"
          borderRadius="10px"
          fontSize="13px"
          _hover={{ bg: 'var(--accent-hover)' }}
          isLoading={isSubmitting}
          loadingText="Preparing your journey..."
          rightIcon={<ArrowRight size={16} />}
        >
          Begin your journey
        </Button>
        <p className="oc-auth-fineprint">All fields are required. Let&apos;s make your profile feel like you.</p>
        <div className="oc-auth-links">Already part of the community? <Link href="/auth/sign-in">Sign in</Link></div>
      </form>
    </main>
  </JapaneseBackground>;
}
