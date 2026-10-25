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

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', gender: '', degree: '', branch: '', college: 'IIIT Allahabad', discordId: '', githubId: '', graduationYear: '', avatarUrl: '', year: '' });
  const [collegeType, setCollegeType] = useState('IIIT Allahabad');
  const [otherCollege, setOtherCollege] = useState('');
  const toast = useToast();
  const router = useRouter();

  const { data: colleges = [] } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => fetchColleges(),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFormData(previous => ({ ...previous, avatarUrl: params.get('avatar_url') || '' }));
    if (params.get('token')) localStorage.setItem('token', params.get('token')!);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(previous => ({ ...previous, [event.target.name]: event.target.value }));
  };
  const handleCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCollegeType(event.target.value);
    setFormData(previous => ({ ...previous, college: event.target.value === 'Other' ? otherCollege : 'IIIT Allahabad' }));
  };
  const handleOtherCollegeChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setOtherCollege(event.target.value);
    setFormData(previous => ({ ...previous, college: event.target.value }));
  };
  const handleSelectCollege = (college: string) => {
    setOtherCollege(college);
    setFormData(previous => ({ ...previous, college }));
  };
  const registerMutation = useMutation({
    mutationFn: sendRegData,
    onSuccess: () => router.push(`/user/events?token=${localStorage.getItem('token')}&avatar_url=${formData.avatarUrl}`),
    onError: () => toast({ title: 'Registration could not be completed', description: 'Please check your details and try again.', status: 'error', isClosable: true }),
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    registerMutation.mutate({ ...formData, gender: formData.gender.trim().toLowerCase() });
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
      <form className="glass-panel oc-register-card" onSubmit={handleSubmit}>
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
        <Button type="submit" width="100%" height="48px" bg="var(--accent)" color="var(--accent-ink)" borderRadius="10px" fontSize="13px" _hover={{ bg: 'var(--accent-hover)' }} isLoading={registerMutation.isPending} loadingText="Creating your profile" rightIcon={<ArrowRight size={16} />}>Begin your journey</Button>
        <p className="oc-auth-fineprint">All fields are required. Let&apos;s make your profile feel like you.</p>
        <div className="oc-auth-links">Already part of the community? <Link href="/auth/sign-in">Sign in</Link></div>
      </form>
    </main>
  </JapaneseBackground>;
}
