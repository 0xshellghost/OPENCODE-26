'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useToast,
  VStack,
  Heading,
  Divider,
  Grid,
  GridItem,
  Icon,
  Badge,
  HStack,
  Switch,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Checkbox,
  useDisclosure,
  Avatar,
  Tooltip,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  CheckCircle2,
  CloudUpload,
  Download,
  Pencil,
  Plus,
  Star,
  Table,
  Trash2,
  Upload,
  UserPlus,
  Tag as TagIcon,
  Search,
  UserCheck,
  ShieldCheck,
  X,
  Palette,
  Eye,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { FetchedEvents, FetchedRepos } from 'api/events/events';
import {
  addRepo,
  deleteRepo,
  renameRepo,
  updateRepoTags,
  addMentor,
  removeMentor,
  fetchMentors,
  uploadEventLeaderboard,
  uploadRPlaceBoardSnapshot,
  MentorUser,
} from 'api/admin/admin';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  EXPECTED_SNAPSHOT_BYTES,
  encodeImageToSnapshot,
  renderSnapshotToCanvas,
} from 'utils/rplaceProtocol';
import { useRouter } from 'next/navigation';
import { RingLoader } from 'react-spinners';
import { isAdminUser } from 'utils/jwt';
import { useFeatures } from 'contexts/FeaturesContext';

export default function ManagementPage() {
  const router = useRouter();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const { features, toggleFeature, setFlagshipEvent, isLoading: isFeaturesLoading } = useFeatures();
  
  const textColor = 'var(--fg)';
  const cardBg = 'var(--surface)';
  const shadowSoft = 'var(--shadow)';

  // State
  const [selectedEvent, setSelectedEvent] = useState('');
  const [addRepoName, setAddRepoName] = useState('');
  const [deleteRepoName, setDeleteRepoName] = useState('');
  const [renameTargetRepo, setRenameTargetRepo] = useState('');
  const [renameNewRepo, setRenameNewRepo] = useState('');
  const [mentorGithubId, setMentorGithubId] = useState('');

  // Leaderboard SQL Upload State
  const [uploadEvent, setUploadEvent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // R/Place Canvas Snapshot Upload State
  const [canvasSnapshotFile, setCanvasSnapshotFile] = useState<File | null>(null);
  const [canvasBufferToUpload, setCanvasBufferToUpload] = useState<ArrayBuffer | null>(null);
  const [isProcessingCanvasImage, setIsProcessingCanvasImage] = useState(false);
  const [isUploadingCanvas, setIsUploadingCanvas] = useState(false);
  const [canvasPreviewInfo, setCanvasPreviewInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const canvasFileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasPreviewRef = useRef<HTMLCanvasElement | null>(null);

  // Flagship Event State
  const [selectedFlagship, setSelectedFlagship] = useState(features.flagshipEvent || '');
  const [isUpdatingFlagship, setIsUpdatingFlagship] = useState(false);

  useEffect(() => {
    setSelectedFlagship(features.flagshipEvent || '');
  }, [features.flagshipEvent]);

  const handleSetFlagship = async () => {
    if (!selectedFlagship) {
      toast({ title: 'Please select an event to make flagship.', status: 'warning', isClosable: true });
      return;
    }
    setIsUpdatingFlagship(true);
    try {
      await setFlagshipEvent(selectedFlagship);
      toast({
        title: 'Flagship Event Updated',
        description: `"${selectedFlagship}" is now set as the Flagship Event in database.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (e: any) {
      console.error('Failed to update flagship event:', e);
      toast({
        title: 'Failed to update flagship event',
        description: e?.message || 'Could not communicate with backend server.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingFlagship(false);
    }
  };

  const handleRemoveFlagship = async () => {
    setIsUpdatingFlagship(true);
    try {
      await setFlagshipEvent(null);
      setSelectedFlagship('');
      toast({
        title: 'Flagship Event Removed',
        description: 'No event is currently set as flagship.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (e: any) {
      console.error('Failed to remove flagship event:', e);
      toast({
        title: 'Failed to remove flagship event',
        description: e?.message || 'Could not communicate with backend server.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingFlagship(false);
    }
  };

  const [togglingFeature, setTogglingFeature] = useState<string | null>(null);

  const handleToggleFeature = async (
    key: 'showWinners' | 'showMilestones' | 'showRPlace' | 'showRepositories' | 'showLeaderboard' | 'showGeekstore',
    val: boolean,
    label: string
  ) => {
    setTogglingFeature(key);
    try {
      const success = await toggleFeature(key, val);
      if (success) {
        toast({
          title: `${label} tab ${val ? 'enabled' : 'hidden'}`,
          description: 'Updated in database and synced across deployment.',
          status: 'success',
          duration: 2500,
          isClosable: true,
        });
      } else {
        toast({
          title: `Failed to update ${label} tab`,
          description: 'Could not persist change to database. Please check your admin permissions.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: `Failed to update ${label} tab`,
        description: err?.message || 'Database update failed.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setTogglingFeature(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!isAdminUser()) {
      router.push('/user/events');
    }
  }, [isMounted, router]);

  const { data: eventData, isLoading } = useQuery<{ data: Array<{ name: string; isFlagship?: boolean }> }>({
    queryKey: ['EventInfo'],
    queryFn: FetchedEvents,
  });


  // Repos in Selected Event query
  const { data: reposData, refetch: refetchRepos, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['AdminRepos', selectedEvent],
    queryFn: () => FetchedRepos(selectedEvent),
    enabled: !!selectedEvent,
  });

  const eventRepos = reposData?.data || [];

  // Mentors query
  const {
    data: mentorsList = [],
    refetch: refetchMentors,
    isLoading: isLoadingMentors,
  } = useQuery<MentorUser[]>({
    queryKey: ['AllMentors'],
    queryFn: fetchMentors,
  });

  // Add repo state
  const [addRepoTags, setAddRepoTags] = useState<string[]>([]);
  const [addRepoCustomTag, setAddRepoCustomTag] = useState('');
  const [addRepoSelectedMentors, setAddRepoSelectedMentors] = useState<string[]>([]);
  const [addRepoMentorQuery, setAddRepoMentorQuery] = useState('');
  const [showAddMentorDropdown, setShowAddMentorDropdown] = useState(false);
  const [addRepoIsFirstYr, setAddRepoIsFirstYr] = useState(false);
  const [addRepoIsGirlsOnly, setAddRepoIsGirlsOnly] = useState(false);
  const [isAddingRepo, setIsAddingRepo] = useState(false);

  // Edit repo modal state
  const { isOpen: isEditTagsOpen, onOpen: onOpenEditTags, onClose: onCloseEditTags } = useDisclosure();
  const [editingRepo, setEditingRepo] = useState<any>(null);
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [editCustomTag, setEditCustomTag] = useState('');
  const [editSelectedMentors, setEditSelectedMentors] = useState<string[]>([]);
  const [editMentorQuery, setEditMentorQuery] = useState('');
  const [showEditMentorDropdown, setShowEditMentorDropdown] = useState(false);
  const [editIsFirstYr, setEditIsFirstYr] = useState(false);
  const [isSavingEditTags, setIsSavingEditTags] = useState(false);

  // Mentor management state
  const [mentorSearchFilter, setMentorSearchFilter] = useState('');
  const [isAddingMentorRole, setIsAddingMentorRole] = useState(false);
  const [removingMentorId, setRemovingMentorId] = useState<string | null>(null);

  const AVAILABLE_DOMAINS = [
    'WebD',
    'AppDev',
    'UI-UX',
    'AI-ML',
    'Blockchain',
    'GameDev',
    'Competitive Programming',
    'GitBasics',
    'Freshers only',
    'Cybersecurity',
  ];

  const toggleAddDomainTag = (domain: string) => {
    if (domain === 'Freshers only') {
      setAddRepoIsFirstYr(!addRepoIsFirstYr);
    }
    setAddRepoTags((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleAddCustomTag = () => {
    if (!addRepoCustomTag.trim()) return;
    const clean = addRepoCustomTag.trim();
    if (!addRepoTags.includes(clean)) {
      setAddRepoTags((prev) => [...prev, clean]);
    }
    setAddRepoCustomTag('');
  };

  const toggleEditDomainTag = (domain: string) => {
    if (domain === 'Freshers only') {
      setEditIsFirstYr(!editIsFirstYr);
    }
    setEditTagsList((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleAddEditCustomTag = () => {
    if (!editCustomTag.trim()) return;
    const clean = editCustomTag.trim();
    if (!editTagsList.includes(clean)) {
      setEditTagsList((prev) => [...prev, clean]);
    }
    setEditCustomTag('');
  };

  // Mentor Autocomplete Suggestions for Add Repo
  const filteredAddMentorSuggestions = addRepoMentorQuery.trim()
    ? mentorsList.filter((m) => {
        const q = addRepoMentorQuery.trim().toLowerCase().replace(/^@/, '');
        const mGithubId = (m?.githubId || '').toLowerCase();
        const mName = (m?.name || '').toLowerCase();
        const isSelected = addRepoSelectedMentors.some((s) => s.toLowerCase() === mGithubId);
        return !isSelected && (mGithubId.includes(q) || mName.includes(q));
      })
    : [];

  const handleSelectMentorForAdd = (handle: string) => {
    const clean = handle.replace(/^@/, '').trim();
    if (!clean) return;
    if (!addRepoSelectedMentors.some((m) => m.toLowerCase() === clean.toLowerCase())) {
      setAddRepoSelectedMentors((prev) => [...prev, clean]);
    }
    setAddRepoMentorQuery('');
    setShowAddMentorDropdown(false);
  };

  const handleManualAddMentorForAdd = () => {
    const clean = addRepoMentorQuery.trim().replace(/^@/, '');
    if (!clean) return;
    const isRegisteredMentor = mentorsList.some((m) => (m?.githubId || '').toLowerCase() === clean.toLowerCase());
    if (!isRegisteredMentor) {
      toast({
        title: 'User is not a Mentor',
        description: `@${clean} must have the Mentor role first. You can add them in Mentor Management below.`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    handleSelectMentorForAdd(clean);
  };

  // Mentor suggestions for edit modal
  const filteredEditMentorSuggestions = editMentorQuery.trim()
    ? mentorsList.filter((m) => {
        const q = editMentorQuery.trim().toLowerCase().replace(/^@/, '');
        const mGithubId = (m?.githubId || '').toLowerCase();
        const mName = (m?.name || '').toLowerCase();
        const isSelected = editSelectedMentors.some((s) => s.toLowerCase() === mGithubId);
        return !isSelected && (mGithubId.includes(q) || mName.includes(q));
      })
    : [];

  const handleSelectMentorForEdit = (handle: string) => {
    const clean = handle.replace(/^@/, '').trim();
    if (!clean) return;
    if (!editSelectedMentors.some((m) => m.toLowerCase() === clean.toLowerCase())) {
      setEditSelectedMentors((prev) => [...prev, clean]);
    }
    setEditMentorQuery('');
    setShowEditMentorDropdown(false);
  };

  const handleManualAddMentorForEdit = () => {
    const clean = editMentorQuery.trim().replace(/^@/, '');
    if (!clean) return;
    const isRegisteredMentor = mentorsList.some((m) => (m?.githubId || '').toLowerCase() === clean.toLowerCase());
    if (!isRegisteredMentor) {
      toast({
        title: 'User is not a Mentor',
        description: `@${clean} must have the Mentor role first. You can add them in Mentor Management below.`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    handleSelectMentorForEdit(clean);
  };

  const handleOpenEditTags = (repo: any) => {
    if (!repo) return;
    setEditingRepo(repo);
    const existingTags = Array.isArray(repo?.tags) ? [...repo.tags] : [];
    if (repo?.isFirstYrOnly && !existingTags.includes('Freshers only')) {
      existingTags.push('Freshers only');
    }
    setEditTagsList(existingTags);
    setEditIsFirstYr(Boolean(repo?.isFirstYrOnly));
    setEditCustomTag('');
    const currentMentors = Array.isArray(repo?.mentors)
      ? repo.mentors
      : Array.isArray(repo?.maintainers)
      ? repo.maintainers.map((m: any) => (typeof m === 'string' ? m : m?.name || ''))
      : [];
    setEditSelectedMentors(
      currentMentors
        .map((m: any) => String(m || '').replace(/^@/, '').trim())
        .filter(Boolean)
    );
    setEditMentorQuery('');
    setShowEditMentorDropdown(false);
    onOpenEditTags();
  };

  const handleSaveRepoTags = async () => {
    if (!editingRepo || !selectedEvent) return;
    setIsSavingEditTags(true);
    try {
      const finalTags = [...editTagsList];
      if (editCustomTag.trim() && !finalTags.includes(editCustomTag.trim())) {
        finalTags.push(editCustomTag.trim());
      }
      if (editIsFirstYr && !finalTags.includes('Freshers only')) {
        finalTags.push('Freshers only');
      }

      await updateRepoTags(selectedEvent, editingRepo.name, {
        tags: finalTags,
        mentors: editSelectedMentors,
        isFirstYrOnly: editIsFirstYr,
      });

      toast({
        title: 'Repository Updated',
        description: `Successfully updated tags and mentors for "${editingRepo.name}".`,
        status: 'success',
        isClosable: true,
      });
      onCloseEditTags();
      refetchRepos();
    } catch (error: any) {
      toast({
        title: 'Error updating repo',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsSavingEditTags(false);
    }
  };

  const handleAddRepo = async () => {
    if (!selectedEvent || !addRepoName.trim()) {
      toast({ title: 'Event and Repo Name are required.', status: 'warning', isClosable: true });
      return;
    }
    setIsAddingRepo(true);
    try {
      const allTags = [...addRepoTags];
      if (addRepoCustomTag.trim() && !allTags.includes(addRepoCustomTag.trim())) {
        allTags.push(addRepoCustomTag.trim());
      }
      if (addRepoIsFirstYr && !allTags.includes('Freshers only')) {
        allTags.push('Freshers only');
      }

      await addRepo(selectedEvent, addRepoName.trim(), {
        tags: allTags.length > 0 ? allTags : undefined,
        mentors: addRepoSelectedMentors.length > 0 ? addRepoSelectedMentors : undefined,
        isFirstYrOnly: addRepoIsFirstYr,
        isGirlsOnly: addRepoIsGirlsOnly,
      });

      toast({
        title: 'Repo Added!',
        description: `Successfully added ${addRepoName.trim()}.`,
        status: 'success',
        isClosable: true,
      });
      setAddRepoName('');
      setAddRepoTags([]);
      setAddRepoCustomTag('');
      setAddRepoSelectedMentors([]);
      setAddRepoMentorQuery('');
      setShowAddMentorDropdown(false);
      setAddRepoIsFirstYr(false);
      setAddRepoIsGirlsOnly(false);
      refetchRepos();
    } catch (error: any) {
      toast({ title: 'Error adding repo', description: error.message, status: 'error', isClosable: true });
    } finally {
      setIsAddingRepo(false);
    }
  };

  const handleDeleteRepo = async () => {
    if (!selectedEvent || !deleteRepoName) {
      toast({ title: 'Event and Repo Name are required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await deleteRepo(selectedEvent, deleteRepoName);
      toast({ title: 'Repo Deleted!', status: 'success', isClosable: true });
      setDeleteRepoName('');
      refetchRepos();
    } catch (error: any) {
      toast({ title: 'Error deleting repo', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleRenameRepo = async () => {
    if (!selectedEvent || !renameTargetRepo || !renameNewRepo) {
      toast({ title: 'Event, Target Repo, and New Name are required.', status: 'warning', isClosable: true });
      return;
    }
    try {
      await renameRepo(selectedEvent, renameTargetRepo, renameNewRepo);
      toast({ title: 'Repo Renamed!', status: 'success', isClosable: true });
      setRenameTargetRepo('');
      setRenameNewRepo('');
      refetchRepos();
    } catch (error: any) {
      toast({ title: 'Error renaming repo', description: error.message, status: 'error', isClosable: true });
    }
  };

  const handleAddMentor = async () => {
    if (!mentorGithubId.trim()) {
      toast({ title: 'GitHub ID is required.', status: 'warning', isClosable: true });
      return;
    }
    const cleanHandle = mentorGithubId.trim().replace(/^@/, '');
    setIsAddingMentorRole(true);
    try {
      await addMentor(cleanHandle);
      toast({
        title: 'Mentor Role Assigned!',
        description: `Successfully assigned the Mentor role to @${cleanHandle}.`,
        status: 'success',
        isClosable: true,
      });
      setMentorGithubId('');
      refetchMentors();
    } catch (error: any) {
      toast({ title: 'Error adding mentor', description: error.message, status: 'error', isClosable: true });
    } finally {
      setIsAddingMentorRole(false);
    }
  };

  const handleRemoveMentor = async (handle: string) => {
    setRemovingMentorId(handle);
    try {
      await removeMentor(handle);
      toast({
        title: 'Mentor Role Removed',
        description: `Removed mentor role for @${handle}.`,
        status: 'info',
        isClosable: true,
      });
      refetchMentors();
    } catch (error: any) {
      toast({ title: 'Error removing mentor', description: error.message, status: 'error', isClosable: true });
    } finally {
      setRemovingMentorId(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.sql'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a SQL script (.sql) file.',
          status: 'error',
          isClosable: true,
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    const targetEvent = uploadEvent || 'EVENT_NAME';
    const sqlContent = `-- SQL Leaderboard Template for event: ${targetEvent}
-- Replace '${targetEvent}' with your actual event name if not already set.
-- Note: Opencode leaderboard is live and automated; this template is for other events.

-- 1. Insert or update User profiles
INSERT INTO \`User\` (\`id\`, \`name\`, \`email\`, \`avatarUrl\`, \`college\`, \`graduationYear\`, \`branch\`, \`degree\`, \`githubId\`, \`year\`, \`createdAt\`, \`updatedAt\`)
VALUES
  (UUID(), 'Ada Lovelace', 'adalovelace@users.noreply.github.com', 'https://avatars.githubusercontent.com/adalovelace', 'IIIT Allahabad', 2026, 'IT', 'B.Tech', 'adalovelace', '4th', NOW(), NOW()),
  (UUID(), 'Alan Turing', 'aturing@users.noreply.github.com', 'https://avatars.githubusercontent.com/aturing', 'IIIT Allahabad', 2027, 'ECE', 'B.Tech', 'aturing', '3rd', NOW(), NOW()),
  (UUID(), 'Margaret Hamilton', 'mhamilton@users.noreply.github.com', 'https://avatars.githubusercontent.com/mhamilton', 'IIT Delhi', 2026, 'CSE', 'B.Tech', 'mhamilton', '4th', NOW(), NOW()),
  (UUID(), 'Grace Hopper', 'ghopper@users.noreply.github.com', 'https://avatars.githubusercontent.com/ghopper', 'NIT Trichy', 2028, 'ECE', 'B.Tech', 'ghopper', '2nd', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  \`name\` = VALUES(\`name\`),
  \`college\` = VALUES(\`college\`),
  \`graduationYear\` = VALUES(\`graduationYear\`),
  \`avatarUrl\` = VALUES(\`avatarUrl\`),
  \`updatedAt\` = NOW();

-- 2. Insert or update Participants
INSERT INTO \`Participant\` (\`id\`, \`participantId\`)
VALUES
  (UUID(), 'adalovelace'),
  (UUID(), 'aturing'),
  (UUID(), 'mhamilton'),
  (UUID(), 'ghopper')
ON DUPLICATE KEY UPDATE
  \`participantId\` = VALUES(\`participantId\`);

-- 3. Insert or update Leaderboard Entries
INSERT INTO \`LeaderboardEntry\` (\`id\`, \`participantId\`, \`eventName\`, \`points\`, \`PRmerged\`)
VALUES
  (UUID(), 'adalovelace', '${targetEvent}', 500, 0),
  (UUID(), 'aturing', '${targetEvent}', 450, 0),
  (UUID(), 'mhamilton', '${targetEvent}', 420, 0),
  (UUID(), 'ghopper', '${targetEvent}', 380, 0)
ON DUPLICATE KEY UPDATE
  \`points\` = VALUES(\`points\`),
  \`PRmerged\` = VALUES(\`PRmerged\`);
`;

    const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = `${uploadEvent ? uploadEvent.replace(/\s+/g, '_') : 'event'}_leaderboard_template.sql`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUploadLeaderboard = async () => {
    if (!uploadEvent) {
      toast({ title: 'Please select an event first.', status: 'warning', isClosable: true });
      return;
    }
    if (uploadEvent.toLowerCase().includes('opencode')) {
      toast({
        title: 'Action Not Allowed',
        description: 'Opencode leaderboard is live and automated. SQL upload is only permitted for other events.',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Please select a SQL script file (.sql) to upload.', status: 'warning', isClosable: true });
      return;
    }

    setIsUploading(true);
    try {
      await uploadEventLeaderboard(uploadEvent, selectedFile);
      toast({
        title: 'Leaderboard Uploaded Successfully!',
        description: `SQL script executed. Rankings for "${uploadEvent}" have been updated and are now live.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error?.message || 'Failed to upload and execute leaderboard SQL.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCanvasFileSelected = async (file: File) => {
    setCanvasSnapshotFile(file);
    setIsProcessingCanvasImage(true);
    try {
      if (file.name.endsWith('.bin') || file.name.endsWith('.dat')) {
        const buffer = await file.arrayBuffer();
        if (buffer.byteLength !== EXPECTED_SNAPSHOT_BYTES) {
          toast({
            title: 'Invalid Binary Snapshot Size',
            description: `Expected exactly ${EXPECTED_SNAPSHOT_BYTES.toLocaleString()} bytes (got ${buffer.byteLength.toLocaleString()} bytes).`,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setCanvasSnapshotFile(null);
          setCanvasBufferToUpload(null);
          setCanvasPreviewInfo(null);
          return;
        }
        setCanvasBufferToUpload(buffer);
        setCanvasPreviewInfo({
          name: file.name,
          size: `${(buffer.byteLength / 1024).toFixed(1)} KB (Exact ${Math.round(EXPECTED_SNAPSHOT_BYTES / 1024)} KB binary)`,
          type: 'Raw 4-bit Binary Snapshot',
        });
        if (canvasPreviewRef.current) {
          renderSnapshotToCanvas(canvasPreviewRef.current, buffer);
        }
      } else {
        // Image file: PNG, JPG, WebP, etc.
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          try {
            const packedBuffer = encodeImageToSnapshot(img, canvasPreviewRef.current);
            setCanvasBufferToUpload(packedBuffer);
            setCanvasPreviewInfo({
              name: file.name,
              size: `${img.naturalWidth}×${img.naturalHeight} px → Quantized to ${CANVAS_WIDTH}×${CANVAS_HEIGHT} (${Math.round(EXPECTED_SNAPSHOT_BYTES / 1024)} KB)`,
              type: '16-Color Quantized Image',
            });
          } catch (err: any) {
            toast({
              title: 'Image Processing Failed',
              description: err.message || 'Could not quantize image to canvas snapshot',
              status: 'error',
              isClosable: true,
            });
          } finally {
            setIsProcessingCanvasImage(false);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          toast({
            title: 'Image Load Error',
            description: 'Could not decode image file.',
            status: 'error',
            isClosable: true,
          });
          setIsProcessingCanvasImage(false);
        };
        img.src = objectUrl;
        return;
      }
    } catch (err: any) {
      toast({
        title: 'Error reading file',
        description: err?.message || 'Could not read selected file.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsProcessingCanvasImage(false);
    }
  };

  const handleGenerateBlankCanvas = () => {
    const blank = new ArrayBuffer(EXPECTED_SNAPSHOT_BYTES); // zero bytes = color 0 (white)
    setCanvasBufferToUpload(blank);
    setCanvasSnapshotFile(null);
    setCanvasPreviewInfo({
      name: 'blank-canvas.bin',
      size: `${(EXPECTED_SNAPSHOT_BYTES / 1024).toFixed(1)} KB (All White)`,
      type: 'Reset / Blank Snapshot',
    });
    if (canvasPreviewRef.current) {
      renderSnapshotToCanvas(canvasPreviewRef.current, blank);
    }
    toast({
      title: 'Blank Canvas Generated',
      description: 'Click "Deploy Snapshot to Canvas" below to wipe the live board.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUploadCanvasSnapshot = async () => {
    if (!canvasBufferToUpload) {
      toast({
        title: 'No Snapshot Prepared',
        description: 'Please select an image/binary file or generate a blank board first.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    setIsUploadingCanvas(true);
    try {
      const res = await uploadRPlaceBoardSnapshot(canvasBufferToUpload);
      toast({
        title: 'Board Snapshot Deployed!',
        description: `New canvas snapshot is now live! Sequence: ${res?.sequence ?? 'updated'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err?.message || 'Failed to deploy snapshot to R/Place backend.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploadingCanvas(false);
    }
  };

  if (isLoading || !isMounted) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <RingLoader color="var(--accent)" size={52} />
      </Flex>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px="20px">
      <Text
        color={textColor}
        fontFamily="var(--f-display)"
        fontSize={{ base: '26px', md: '32px' }}
        fontWeight="400"
        letterSpacing="0.02em"
        mb="24px"
      >
        Management Tools
      </Text>

      <Box bg={cardBg} p={{ base: '18px', md: '30px' }} borderRadius="20px" border="1px solid var(--border)" boxShadow={shadowSoft} mb="24px">
        <Heading size="md" mb="16px" color={textColor}>Tab Visibility</Heading>
        <Text fontSize="sm" mb="20px" color="gray.500">
          Toggle visibility of community tabs in the navigation.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="20px">
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Winners</Text>
                <Badge colorScheme={features.showWinners ? 'green' : 'gray'}>
                  {features.showWinners ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Winners tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showWinners}
              isDisabled={togglingFeature === 'showWinners' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showWinners', e.target.checked, 'Winners')}
            />
          </Flex>

          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Milestones</Text>
                <Badge colorScheme={features.showMilestones ? 'green' : 'gray'}>
                  {features.showMilestones ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Milestones tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showMilestones}
              isDisabled={togglingFeature === 'showMilestones' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showMilestones', e.target.checked, 'Milestones')}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>RPlace</Text>
                <Badge colorScheme={features.showRPlace ? 'green' : 'gray'}>
                  {features.showRPlace ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the RPlace tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showRPlace}
              isDisabled={togglingFeature === 'showRPlace' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showRPlace', e.target.checked, 'RPlace')}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Repositories</Text>
                <Badge colorScheme={features.showRepositories ? 'green' : 'gray'}>
                  {features.showRepositories ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Repositories tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showRepositories}
              isDisabled={togglingFeature === 'showRepositories' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showRepositories', e.target.checked, 'Repositories')}
            />
          </Flex>
          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>Leaderboard</Text>
                <Badge colorScheme={features.showLeaderboard ? 'green' : 'gray'}>
                  {features.showLeaderboard ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the Leaderboard tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showLeaderboard}
              isDisabled={togglingFeature === 'showLeaderboard' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showLeaderboard', e.target.checked, 'Leaderboard')}
            />
          </Flex>

          <Flex
            p="20px"
            borderRadius="16px"
            border="1px solid"
            borderColor="var(--border)"
            bg="var(--surface-2)"
            align="center"
            justify="space-between"
          >
            <Box>
              <HStack spacing="8px" mb="4px">
                <Text fontWeight="600" color={textColor}>GeekStore</Text>
                <Badge colorScheme={features.showGeekstore ? 'green' : 'gray'}>
                  {features.showGeekstore ? 'Visible' : 'Hidden'}
                </Badge>
              </HStack>
              <Text fontSize="xs" color="gray.500">Show or hide the GeekStore tab in navigation.</Text>
            </Box>
            <Switch
              colorScheme="brand"
              size="lg"
              isChecked={features.showGeekstore}
              isDisabled={togglingFeature === 'showGeekstore' || isFeaturesLoading}
              onChange={(e) => handleToggleFeature('showGeekstore', e.target.checked, 'GeekStore')}
            />
          </Flex>
        </Grid>
      </Box>

      {/* ─── FLAGSHIP EVENT CONTROL ─── */}
      <Box bg={cardBg} p={{ base: '18px', md: '30px' }} borderRadius="20px" border="1px solid var(--border)" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="yellow.50" color="yellow.600">
              <Icon as={Star} boxSize={6} fill="currentColor" />
            </Box>
            <Heading size="md" color={textColor}>Flagship Event</Heading>
          </Flex>
          {features.flagshipEvent ? (
            <Badge colorScheme="green" px="10px" py="4px" borderRadius="full" fontSize="12px">
              Active: {features.flagshipEvent}
            </Badge>
          ) : (
            <Badge colorScheme="gray" px="10px" py="4px" borderRadius="full" fontSize="12px">
              No Flagship Event
            </Badge>
          )}
        </Flex>

        <Text fontSize="sm" mb="20px" color="gray.500">
          The flagship event is highlighted with the prominent &ldquo;Featured Flagship Arena&rdquo; banner at the top of the user events page. You can change it or remove it entirely.
        </Text>

        <Grid templateColumns={{ base: '1fr', md: '3fr 1fr 1fr' }} gap="15px" alignItems="center">
          <Select
            placeholder="Select an Event..."
            variant="auth"
            value={selectedFlagship}
            onChange={(e) => setSelectedFlagship(e.target.value)}
          >
            {eventData?.data?.map((e) => (
              <option key={e.name} value={e.name}>
                {e.name} {e.name.toLowerCase() === features.flagshipEvent?.toLowerCase() ? '(Current Flagship)' : ''}
              </option>
            ))}
          </Select>

          <Button
            colorScheme="brand"
            w="100%"
            leftIcon={<Icon as={Star} fill="currentColor" />}
            isDisabled={!selectedFlagship || isUpdatingFlagship}
            isLoading={isUpdatingFlagship}
            onClick={handleSetFlagship}
          >
            Set Flagship
          </Button>

          <Button
            variant="outline"
            colorScheme="red"
            w="100%"
            isDisabled={!features.flagshipEvent}
            isLoading={isUpdatingFlagship}
            onClick={handleRemoveFlagship}
          >
            Remove Flagship
          </Button>
        </Grid>
      </Box>

      {/* ─── EVENT LEADERBOARD UPLOAD (SQL) ─── */}
      <Box bg={cardBg} p={{ base: '18px', md: '30px' }} borderRadius="20px" border="1px solid var(--border)" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="var(--accent-soft)" color="var(--accent)">
              <Icon as={Table} boxSize={6} />
            </Box>
            <Heading size="md" color={textColor}>Upload Event Leaderboard</Heading>
          </Flex>
          <Badge
            bg="var(--accent-soft)"
            color="var(--accent)"
            border="1px solid var(--border-accent)"
            px="10px"
            py="4px"
            borderRadius="full"
            fontSize="12px"
          >
            SQL
          </Badge>
        </Flex>
        
        <Text fontSize="sm" mb="20px" color="var(--fg-muted)">
          Upload official rankings and scores via SQL for non-OpenCode events (Hackathons, Contests, Design Sprints).
          Rankings uploaded via SQL script will be executed and displayed to users when selecting this event in the Leaderboard.
        </Text>

        <FormControl mb="20px">
          <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Select Target Event</FormLabel>
          <Select
            placeholder="Select an Event..."
            variant="auth"
            value={uploadEvent}
            onChange={(e) => setUploadEvent(e.target.value)}
          >
            {eventData?.data?.map((e) => {
              const isOpencode = e.name.toLowerCase().includes('opencode');
              return (
                <option key={e.name} value={e.name} disabled={isOpencode}>
                  {e.name} {isOpencode ? '(Live Automated - Disabled)' : '(SQL Managed)'}
                </option>
              );
            })}
          </Select>
        </FormControl>

        <Divider mb="20px" />

        {/* File Dropzone / Upload area */}
        <VStack align="stretch" spacing="18px">
          <Box
            border="2px dashed"
            borderColor={selectedFile ? "var(--accent)" : "var(--border)"}
            borderRadius="16px"
            p={{ base: '16px', sm: '24px' }}
            textAlign="center"
            bg={selectedFile ? "var(--accent-soft)" : "transparent"}
            transition="all 0.2s ease"
            cursor="pointer"
            onClick={() => fileInputRef.current?.click()}
            _hover={{
              borderColor: "var(--accent)",
              bg: "var(--surface-2)",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".sql"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <Flex direction="column" align="center" gap="10px">
              <Icon
                as={selectedFile ? CheckCircle2 : CloudUpload}
                boxSize={10}
                color={selectedFile ? "var(--accent)" : "var(--fg-muted)"}
              />
              {selectedFile ? (
                <Box>
                  <Text fontWeight="700" color={textColor} fontSize="15px">
                    {selectedFile.name}
                  </Text>
                  <Text fontSize="12px" color="var(--fg-muted)" mt="2px">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to execute & upload
                  </Text>
                </Box>
              ) : (
                <Box>
                  <Text fontWeight="600" color={textColor} fontSize="14px">
                    Click to browse or drag and drop SQL script
                  </Text>
                  <Text fontSize="12px" color="var(--fg-muted)" mt="4px">
                    Supports SQL scripts (.sql) containing LeaderboardEntry / User records
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          {/* Action buttons */}
          <Flex justify="space-between" align="center" gap="12px" flexWrap="wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Icon as={Download} />}
              onClick={handleDownloadTemplate}
              colorScheme="gray"
            >
              Download Template (.sql)
            </Button>

            <HStack spacing="10px">
              {selectedFile && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<Icon as={Trash2} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Remove
                </Button>
              )}
              <Button
                variant="brand"
                leftIcon={<Icon as={Upload} />}
                onClick={handleUploadLeaderboard}
                isLoading={isUploading}
                loadingText="Executing SQL..."
                isDisabled={!selectedFile || !uploadEvent}
              >
                Upload Leaderboard
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* ─── R/PLACE CANVAS SNAPSHOT MANAGEMENT ─── */}
      <Box bg={cardBg} p={{ base: '18px', md: '30px' }} borderRadius="20px" border="1px solid var(--border)" boxShadow={shadowSoft} mb="24px">
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" flexWrap="wrap" gap="10px">
          <Flex align="center" gap="10px">
            <Box p="8px" borderRadius="10px" bg="var(--accent-soft)" color="var(--accent)">
              <Icon as={Palette} boxSize={6} />
            </Box>
            <Heading size="md" color={textColor}>R/Place Canvas Snapshot</Heading>
          </Flex>
          <HStack spacing="8px">
            <Badge
              bg="rgba(127, 207, 159, 0.14)"
              color="var(--status-live-text)"
              border="1px solid rgba(127, 207, 159, 0.3)"
              px="10px"
              py="4px"
              borderRadius="full"
              fontSize="12px"
            >
              {CANVAS_WIDTH} × {CANVAS_HEIGHT} · {Math.round(EXPECTED_SNAPSHOT_BYTES / 1024)} KB
            </Badge>
            <Button
              as={Link}
              href="/user/rplace"
              target="_blank"
              size="sm"
              variant="outline"
              borderColor="var(--border)"
              color="var(--muted)"
              _hover={{ color: 'var(--text)', borderColor: 'var(--accent)' }}
              leftIcon={<Icon as={Eye} size={14} />}
            >
              View Live Canvas
            </Button>
          </HStack>
        </Flex>

        <Text fontSize="sm" mb="20px" color="var(--fg-muted)">
          Upload a new snapshot to update or wipe the live community canvas. You can upload an image (PNG, JPG, WebP)
          which will be automatically quantized to the 16-color palette and packed to {Math.round(EXPECTED_SNAPSHOT_BYTES / 1024)} KB, or provide a raw {EXPECTED_SNAPSHOT_BYTES.toLocaleString()}-byte 
          binary snapshot (<Text as="span" fontFamily="var(--f-mono)">.bin</Text>).
        </Text>

        <VStack align="stretch" spacing="18px">
          {/* File Dropzone */}
          <Box
            border="2px dashed"
            borderColor={canvasBufferToUpload ? "var(--accent)" : "var(--border)"}
            borderRadius="16px"
            p={{ base: '16px', sm: '24px' }}
            textAlign="center"
            bg={canvasBufferToUpload ? "var(--accent-soft)" : "transparent"}
            transition="all 0.2s ease"
            cursor="pointer"
            onClick={() => canvasFileInputRef.current?.click()}
            _hover={{
              borderColor: "var(--accent)",
              bg: "var(--accent-soft)",
            }}
          >
            <Input
              type="file"
              ref={canvasFileInputRef}
              display="none"
              accept=".png,.jpg,.jpeg,.webp,.bin,.dat"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCanvasFileSelected(file);
              }}
            />
            <Icon as={CloudUpload} boxSize={10} color="var(--accent)" mb="8px" />
            <Text fontWeight="600" fontSize="sm" color={textColor}>
              {canvasSnapshotFile ? canvasSnapshotFile.name : 'Choose an image (.png, .jpg, .webp) or snapshot file (.bin)'}
            </Text>
            <Text fontSize="xs" color="var(--fg-muted)" mt="4px">
              Images will be automatically scaled to {CANVAS_WIDTH}×{CANVAS_HEIGHT} and quantized to 16 colors.
            </Text>
          </Box>

          {/* Quantized Live Preview Canvas */}
          <Box
            borderRadius="16px"
            border="1px solid var(--border)"
            bg="var(--surface-2)"
            p="16px"
            display={canvasBufferToUpload ? 'block' : 'none'}
          >
            <Flex justify="space-between" align="center" mb="12px" flexWrap="wrap" gap="8px">
              <HStack spacing="8px">
                <Icon as={Sparkles} size={15} color="var(--accent)" />
                <Text fontSize="xs" fontWeight="700" color={textColor} textTransform="uppercase" letterSpacing="0.08em">
                  Quantized 16-Color Snapshot Preview
                </Text>
              </HStack>
              {canvasPreviewInfo && (
                <Badge variant="subtle" fontSize="11px" px="8px" py="2px" borderRadius="md">
                  {canvasPreviewInfo.size}
                </Badge>
              )}
            </Flex>

            <Box
              w="100%"
              aspectRatio={`${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`}
              borderRadius="12px"
              overflow="hidden"
              border="1px solid rgba(255,255,255,0.08)"
              bg="#000"
            >
              <canvas
                ref={canvasPreviewRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  width: '100%',
                  height: '100%',
                  imageRendering: 'pixelated',
                  display: 'block',
                }}
              />
            </Box>
          </Box>

          {/* Action Footer */}
          <Flex justify="space-between" align="center" flexWrap="wrap" gap="12px" pt="4px">
            <Button
              size="sm"
              variant="outline"
              borderColor="var(--border)"
              color="var(--muted)"
              _hover={{ color: 'var(--text)', borderColor: 'var(--border-strong)' }}
              onClick={handleGenerateBlankCanvas}
              isDisabled={isUploadingCanvas || isProcessingCanvasImage}
            >
              Generate Blank Board (All White)
            </Button>

            <HStack spacing="10px">
              {canvasBufferToUpload && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  leftIcon={<Icon as={Trash2} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCanvasSnapshotFile(null);
                    setCanvasBufferToUpload(null);
                    setCanvasPreviewInfo(null);
                    if (canvasFileInputRef.current) canvasFileInputRef.current.value = '';
                  }}
                  isDisabled={isUploadingCanvas}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="brand"
                leftIcon={<Icon as={Upload} />}
                onClick={handleUploadCanvasSnapshot}
                isLoading={isUploadingCanvas || isProcessingCanvasImage}
                loadingText={isProcessingCanvasImage ? 'Processing Image...' : 'Deploying to Board...'}
                isDisabled={!canvasBufferToUpload}
              >
                Deploy Snapshot to Canvas
              </Button>
            </HStack>
          </Flex>
        </VStack>
      </Box>

      {/* ─── REPOSITORY MANAGEMENT ─── */}
      <Box bg={cardBg} p={{ base: '18px', md: '30px' }} borderRadius="20px" border="1px solid var(--border)" boxShadow={shadowSoft} mb="24px">
        <Heading size="md" mb="16px" color={textColor}>Repository Management</Heading>
        <Text fontSize="sm" mb="20px" color="var(--fg-muted)">
          Manage repositories associated with specific events.
        </Text>
        
        <FormControl mb="24px">
          <FormLabel fontSize="sm" fontWeight="600" color={textColor}>Select Event</FormLabel>
          <Select placeholder="Select an Event..." variant="auth" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            {eventData?.data.map((e) => (
              <option key={e.name} value={e.name}>{e.name}</option>
            ))}
          </Select>
        </FormControl>

        <Divider mb="24px" />

        <VStack align="stretch" spacing="24px">
          {/* Add Repository Section */}
          <Box p="20px" borderRadius="16px" bg="var(--surface-2)" border="1px solid var(--border)">
            <Text fontSize="md" fontWeight="700" mb="4px" color={textColor}>Add New Repository</Text>
            <Text fontSize="xs" color="var(--muted)" mb="16px">
              Enter the GitHub repository name. You can select domain tags below, or leave them empty to automatically infer tags from GitHub topics and language.
            </Text>

            <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="15px" mb="16px">
              <Input
                placeholder="Repository Name (e.g. SnapMap, CP-Chronicles)"
                variant="auth"
                value={addRepoName}
                onChange={(e) => setAddRepoName(e.target.value)}
              />
              <Button
                variant="brand"
                w="100%"
                leftIcon={<Icon as={Plus} />}
                onClick={handleAddRepo}
                isLoading={isAddingRepo}
                loadingText="Adding..."
              >
                Add Repo
              </Button>
            </Grid>

            {/* Domain Tags */}
            <Box mb="14px">
              <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="8px" textTransform="uppercase" letterSpacing="0.05em">
                Domain Tags:
              </Text>
              <Flex wrap="wrap" gap="6px">
                {AVAILABLE_DOMAINS.map((domain) => {
                  const isSelected = addRepoTags.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleAddDomainTag(domain)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#49dec6] text-[#09111e] font-bold shadow-[0_0_10px_rgba(73,222,198,0.3)]'
                          : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:border-[#49dec6]/60 hover:text-[var(--fg)]'
                      }`}
                    >
                      {domain} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </Flex>
            </Box>

            {/* Custom Tag Input */}
            <Box mb="16px">
              <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px" textTransform="uppercase" letterSpacing="0.05em">
                Add Custom Tag:
              </Text>
              <HStack maxW="400px">
                <Input
                  size="sm"
                  variant="auth"
                  placeholder="e.g. React, Docker, GraphQL"
                  value={addRepoCustomTag}
                  onChange={(e) => setAddRepoCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <Button size="sm" variant="secondary" onClick={handleAddCustomTag}>
                  Add Tag
                </Button>
              </HStack>
            </Box>

            {/* Assigned Mentors */}
            <Box mb="16px">
              <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px" textTransform="uppercase" letterSpacing="0.05em">
                Assigned Mentors:
              </Text>
              
              {/* Selected Mentor Chips */}
              {addRepoSelectedMentors.length > 0 && (
                <Wrap spacing="6px" mb="10px">
                  {addRepoSelectedMentors.map((handle) => (
                    <WrapItem key={handle}>
                      <Tag size="md" borderRadius="full" variant="subtle" colorScheme="teal" px="8px" py="4px">
                        <Avatar
                          size="2xs"
                          name={handle}
                          src={`https://github.com/${handle}.png`}
                          mr="6px"
                        />
                        <TagLabel fontWeight="600">@{handle}</TagLabel>
                        <TagCloseButton
                          onClick={() => setAddRepoSelectedMentors((prev) => prev.filter((h) => h !== handle))}
                        />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}

              {/* Autocomplete Input Container */}
              <Box position="relative" maxW="500px">
                <HStack>
                  <Input
                    size="sm"
                    variant="auth"
                    placeholder="Type GitHub handle to search mentors..."
                    value={addRepoMentorQuery}
                    onChange={(e) => {
                      setAddRepoMentorQuery(e.target.value);
                      setShowAddMentorDropdown(true);
                    }}
                    onFocus={() => setShowAddMentorDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredAddMentorSuggestions.length > 0) {
                          handleSelectMentorForAdd(filteredAddMentorSuggestions[0].githubId);
                        } else {
                          handleManualAddMentorForAdd();
                        }
                      }
                    }}
                  />
                  <Button size="sm" variant="secondary" onClick={handleManualAddMentorForAdd}>
                    Add
                  </Button>
                </HStack>

                {/* Autocomplete Dropdown */}
                {showAddMentorDropdown && addRepoMentorQuery.trim() && (
                  <Box
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    mt="4px"
                    bg="var(--surface)"
                    border="1px solid var(--border)"
                    borderRadius="12px"
                    boxShadow="0 8px 24px rgba(0,0,0,0.3)"
                    maxH="220px"
                    overflowY="auto"
                    zIndex={30}
                    p="4px"
                  >
                    {filteredAddMentorSuggestions.length === 0 ? (
                      <Box p="10px" textAlign="center">
                        <Text fontSize="xs" color="var(--muted)">
                          No mentor matching "{addRepoMentorQuery}".
                        </Text>
                        <Text fontSize="10px" color="var(--subtle)" mt="2px">
                          Only users assigned the Mentor role in the database can be added.
                        </Text>
                      </Box>
                    ) : (
                      filteredAddMentorSuggestions.map((m) => (
                        <Flex
                          key={m.githubId}
                          align="center"
                          justify="space-between"
                          p="8px 12px"
                          borderRadius="8px"
                          cursor="pointer"
                          _hover={{ bg: 'var(--surface-2)' }}
                          onClick={() => handleSelectMentorForAdd(m.githubId)}
                        >
                          <Flex align="center" gap="10px">
                            <Avatar
                              size="xs"
                              name={m.name || m.githubId}
                              src={m.avatarUrl || `https://github.com/${m.githubId}.png`}
                            />
                            <Box>
                              <Text fontSize="xs" fontWeight="700" color={textColor} lineHeight="1.2">
                                {m.name || m.githubId}
                              </Text>
                              <Text fontSize="10px" color="var(--muted)" fontFamily="var(--f-mono)">
                                @{m.githubId}
                              </Text>
                            </Box>
                          </Flex>
                          <Badge size="sm" colorScheme="teal" fontSize="9px">
                            Mentor
                          </Badge>
                        </Flex>
                      ))
                    )}
                  </Box>
                )}
              </Box>

              <Text fontSize="10px" color="var(--muted)" mt="4px">
                Search registered mentors by GitHub username.
              </Text>
            </Box>

            {/* Selected Tags */}
            {addRepoTags.length > 0 && (
              <Box mb="16px">
                <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px">
                  Selected Tags:
                </Text>
                <Wrap spacing="6px">
                  {addRepoTags.map((tag) => (
                    <WrapItem key={tag}>
                      <Tag size="md" borderRadius="full" variant="solid" bg="var(--accent)" color="var(--accent-ink)">
                        <TagLabel fontWeight="600">{tag}</TagLabel>
                        <TagCloseButton onClick={() => setAddRepoTags((prev) => prev.filter((t) => t !== tag))} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}

            {/* Repository Attributes */}
            <HStack spacing="24px" pt="4px">
              <Checkbox
                isChecked={addRepoIsFirstYr}
                onChange={(e) => {
                  setAddRepoIsFirstYr(e.target.checked);
                  if (e.target.checked && !addRepoTags.includes('Freshers only')) {
                    setAddRepoTags((prev) => [...prev, 'Freshers only']);
                  } else if (!e.target.checked) {
                    setAddRepoTags((prev) => prev.filter((t) => t !== 'Freshers only'));
                  }
                }}
                colorScheme="teal"
              >
                <Text fontSize="xs" fontWeight="600" color={textColor}>Freshers Only (isFirstYrOnly)</Text>
              </Checkbox>
              <Checkbox
                isChecked={addRepoIsGirlsOnly}
                onChange={(e) => setAddRepoIsGirlsOnly(e.target.checked)}
                colorScheme="pink"
              >
                <Text fontSize="xs" fontWeight="600" color={textColor}>Girls Only (isGirlsOnly)</Text>
              </Checkbox>
            </HStack>
          </Box>

          {/* List of Existing Repositories with their Tags & Inline Edit */}
          {selectedEvent && (
            <Box p="20px" borderRadius="16px" bg="var(--surface-2)" border="1px solid var(--border)">
              <Flex justify="space-between" align="center" mb="14px">
                <div>
                  <Text fontSize="md" fontWeight="700" color={textColor}>
                    Repositories in {selectedEvent} ({eventRepos.length})
                  </Text>
                  <Text fontSize="xs" color="var(--muted)">
                    Tags stored in the database powering the contributor domain filters.
                  </Text>
                </div>
                {isLoadingRepos && <RingLoader size={18} color="var(--accent)" />}
              </Flex>

              {eventRepos.length === 0 ? (
                <Text fontSize="xs" color="var(--muted)" py="12px">
                  No repositories found for this event. Add a repository above.
                </Text>
              ) : (
                <VStack spacing="10px" align="stretch" maxH="380px" overflowY="auto" pr="6px">
                  {eventRepos.map((repo: any) => {
                    const tags = Array.isArray(repo.tags) ? repo.tags : [];
                    return (
                      <Flex
                        key={repo.id || repo.name}
                        p="12px 16px"
                        borderRadius="12px"
                        bg="var(--surface)"
                        border="1px solid var(--border)"
                        justify="space-between"
                        align="center"
                        gap="12px"
                        wrap={{ base: 'wrap', sm: 'nowrap' }}
                      >
                        <Box minW="0" flex="1">
                          <Flex align="center" gap="8px" mb="4px">
                            <Text fontSize="sm" fontWeight="700" color={textColor}>
                              {repo.name}
                            </Text>
                            {repo.language && (
                              <Badge size="sm" variant="subtle" colorScheme="blue" fontSize="10px">
                                {repo.language}
                              </Badge>
                            )}
                            {repo.isFirstYrOnly && (
                              <Badge size="sm" variant="subtle" colorScheme="teal" fontSize="10px">
                                Freshers
                              </Badge>
                            )}
                          </Flex>
                          <Flex wrap="wrap" gap="4px">
                            {tags.length > 0 ? (
                              tags.map((t: string) => (
                                <span
                                  key={t}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--card-soft)] text-[var(--muted)] border border-[var(--border)]"
                                >
                                  {t}
                                </span>
                              ))
                            ) : (
                              <Text fontSize="10px" color="var(--subtle)" fontStyle="italic">
                                No tags set in DB
                              </Text>
                            )}
                          </Flex>
                          {((Array.isArray(repo.mentors) && repo.mentors.length > 0) ||
                            (Array.isArray(repo.maintainers) && repo.maintainers.length > 0)) && (
                            <Flex align="center" gap="6px" mt="4px" wrap="wrap">
                              <Text fontSize="10px" fontWeight="600" color="var(--subtle)">
                                Mentors:
                              </Text>
                              <Flex wrap="wrap" gap="4px">
                                {(Array.isArray(repo.mentors) && repo.mentors.length > 0
                                  ? repo.mentors
                                  : Array.isArray(repo.maintainers)
                                  ? repo.maintainers.map((m: any) => (typeof m === 'string' ? m : m?.name || ''))
                                  : []
                                ).filter(Boolean).map((mentor: string) => (
                                  <Badge
                                    key={mentor}
                                    size="sm"
                                    variant="outline"
                                    colorScheme="teal"
                                    fontSize="10px"
                                    px="6px"
                                    py="1px"
                                    borderRadius="full"
                                  >
                                    @{mentor.replace(/^@/, '')}
                                  </Badge>
                                ))}
                              </Flex>
                            </Flex>
                          )}
                        </Box>
                        <HStack spacing="8px" flexShrink={0}>
                          <Button
                            size="xs"
                            variant="secondary"
                            leftIcon={<Icon as={TagIcon} size={12} />}
                            onClick={() => handleOpenEditTags(repo)}
                          >
                            Edit Tags
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => {
                              setDeleteRepoName(repo.name);
                            }}
                          >
                            <Icon as={Trash2} size={12} />
                          </Button>
                        </HStack>
                      </Flex>
                    );
                  })}
                </VStack>
              )}
            </Box>
          )}
          
          <Box>
            <Text fontSize="sm" fontWeight="600" mb="8px" color={textColor}>Delete Repository</Text>
            <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="15px">
              <Input placeholder="Repository Name to Delete" variant="auth" value={deleteRepoName} onChange={(e) => setDeleteRepoName(e.target.value)} />
              <Button colorScheme="red" w="100%" leftIcon={<Icon as={Trash2} />} onClick={handleDeleteRepo}>Delete Repo</Button>
            </Grid>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="600" mb="8px" color={textColor}>Rename Repository</Text>
            <Grid templateColumns={{ base: '1fr', md: '1.5fr 1.5fr 1fr' }} gap="15px">
              <Input placeholder="Current Name" variant="auth" value={renameTargetRepo} onChange={(e) => setRenameTargetRepo(e.target.value)} />
              <Input placeholder="New Name" variant="auth" value={renameNewRepo} onChange={(e) => setRenameNewRepo(e.target.value)} />
              <Button variant="brand" w="100%" leftIcon={<Icon as={Pencil} />} onClick={handleRenameRepo}>Rename</Button>
            </Grid>
          </Box>
        </VStack>

        {/* Modal: Edit Existing Repository Tags */}
        {isEditTagsOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            zIndex={9999}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="16px"
          >
            {/* Backdrop Overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              w="100%"
              h="100%"
              bg="blackAlpha.700"
              backdropFilter="blur(8px)"
              onClick={onCloseEditTags}
            />

            {/* Modal Dialog Content */}
            <Box
              position="relative"
              bg="var(--surface)"
              border="1px solid var(--border)"
              borderRadius="22px"
              p={{ base: '20px', md: '28px' }}
              boxShadow="0 20px 60px rgba(0, 0, 0, 0.5)"
              w="100%"
              maxW="650px"
              maxH="90vh"
              overflowY="auto"
              zIndex={10000}
            >
              <Flex justify="space-between" align="center" mb="16px">
                <Heading size="md" color={textColor}>
                  Edit Tags & Mentors for <Text as="span" color="var(--accent)">{editingRepo?.name}</Text>
                </Heading>
                <IconButton
                  aria-label="Close modal"
                  icon={<X size={18} />}
                  size="sm"
                  variant="ghost"
                  borderRadius="full"
                  onClick={onCloseEditTags}
                />
              </Flex>

              <Text fontSize="xs" color="var(--muted)" mb="16px">
                Configure tags and mentors for this repository.
              </Text>

              {/* Current Tags */}
              <Box mb="16px">
                <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px">
                  Current Repository Tags:
                </Text>
                {editTagsList.length === 0 ? (
                  <Text fontSize="xs" color="var(--muted)" fontStyle="italic">
                    No tags selected yet. Pick domain tags below.
                  </Text>
                ) : (
                  <Wrap spacing="6px">
                    {editTagsList.map((tag) => (
                      <WrapItem key={tag}>
                        <Tag size="md" borderRadius="full" variant="solid" bg="var(--accent)" color="var(--accent-ink)">
                          <TagLabel fontWeight="600">{tag}</TagLabel>
                          <TagCloseButton onClick={() => setEditTagsList((prev) => prev.filter((t) => t !== tag))} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </Box>

              {/* Domain Tags */}
              <Box mb="16px">
                <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="8px" textTransform="uppercase" letterSpacing="0.05em">
                  Standard Domains:
                </Text>
                <Flex wrap="wrap" gap="6px">
                  {AVAILABLE_DOMAINS.map((domain) => {
                    const isSelected = editTagsList.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleEditDomainTag(domain)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#49dec6] text-[#09111e] font-bold shadow-[0_0_10px_rgba(73,222,198,0.3)]'
                            : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)] hover:border-[#49dec6]/60 hover:text-[var(--fg)]'
                        }`}
                      >
                        {domain} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </Flex>
              </Box>

              {/* Add Custom Tag */}
              <Box mb="16px">
                <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px" textTransform="uppercase" letterSpacing="0.05em">
                  Add Custom Tag:
                </Text>
                <HStack>
                  <Input
                    size="sm"
                    variant="auth"
                    placeholder="e.g. Flutter, GraphQL, TensorFlow"
                    value={editCustomTag}
                    onChange={(e) => setEditCustomTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditCustomTag();
                      }
                    }}
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddEditCustomTag}>
                    Add
                  </Button>
                </HStack>
              </Box>

              {/* Assigned Mentors */}
              <Box mb="16px">
                <Text fontSize="xs" fontWeight="600" color="var(--subtle)" mb="6px" textTransform="uppercase" letterSpacing="0.05em">
                  Assigned Mentors:
                </Text>

                {/* Selected Mentor Chips */}
                {editSelectedMentors.length > 0 && (
                  <Wrap spacing="6px" mb="10px">
                    {editSelectedMentors.map((handle) => (
                      <Tag key={handle} size="md" borderRadius="full" variant="subtle" colorScheme="teal" px="8px" py="4px">
                        <Avatar
                          size="2xs"
                          name={handle}
                          src={`https://github.com/${handle}.png`}
                          mr="6px"
                        />
                        <TagLabel fontWeight="600">@{handle}</TagLabel>
                        <TagCloseButton
                          onClick={() => setEditSelectedMentors((prev) => prev.filter((h) => h !== handle))}
                        />
                      </Tag>
                    ))}
                  </Wrap>
                )}

                {/* Autocomplete Input Container */}
                <Box position="relative">
                  <HStack>
                    <Input
                      size="sm"
                      variant="auth"
                      placeholder="Type GitHub handle to search mentors..."
                      value={editMentorQuery}
                      onChange={(e) => {
                        setEditMentorQuery(e.target.value);
                        setShowEditMentorDropdown(true);
                      }}
                      onFocus={() => setShowEditMentorDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredEditMentorSuggestions.length > 0) {
                            handleSelectMentorForEdit(filteredEditMentorSuggestions[0].githubId);
                          } else {
                            handleManualAddMentorForEdit();
                          }
                        }
                      }}
                    />
                    <Button size="sm" variant="secondary" onClick={handleManualAddMentorForEdit}>
                      Add
                    </Button>
                  </HStack>

                  {/* Autocomplete Dropdown */}
                  {showEditMentorDropdown && editMentorQuery.trim() && (
                    <Box
                      position="absolute"
                      top="100%"
                      left="0"
                      right="0"
                      mt="4px"
                      bg="var(--surface)"
                      border="1px solid var(--border)"
                      borderRadius="12px"
                      boxShadow="0 8px 24px rgba(0,0,0,0.3)"
                      maxH="200px"
                      overflowY="auto"
                      zIndex={30}
                      p="4px"
                    >
                      {filteredEditMentorSuggestions.length === 0 ? (
                        <Box p="10px" textAlign="center">
                          <Text fontSize="xs" color="var(--muted)">
                            No mentor matching "{editMentorQuery}".
                          </Text>
                          <Text fontSize="10px" color="var(--subtle)" mt="2px">
                            Only users with the Mentor role in the database can be added.
                          </Text>
                        </Box>
                      ) : (
                        filteredEditMentorSuggestions.map((m) => (
                          <Flex
                            key={m.githubId}
                            align="center"
                            justify="space-between"
                            p="8px 12px"
                            borderRadius="8px"
                            cursor="pointer"
                            _hover={{ bg: 'var(--surface-2)' }}
                            onClick={() => handleSelectMentorForEdit(m.githubId)}
                          >
                            <Flex align="center" gap="10px">
                              <Avatar
                                size="xs"
                                name={m.name || m.githubId}
                                src={m.avatarUrl || `https://github.com/${m.githubId}.png`}
                              />
                              <Box>
                                <Text fontSize="xs" fontWeight="700" color={textColor} lineHeight="1.2">
                                  {m.name || m.githubId}
                                </Text>
                                <Text fontSize="10px" color="var(--muted)" fontFamily="var(--f-mono)">
                                  @{m.githubId}
                                </Text>
                              </Box>
                            </Flex>
                            <Badge size="sm" colorScheme="teal" fontSize="9px">
                              Mentor
                            </Badge>
                          </Flex>
                        ))
                      )}
                    </Box>
                  )}
                </Box>

                <Text fontSize="10px" color="var(--muted)" mt="4px">
                  Search registered mentors by GitHub username.
                </Text>
              </Box>

              {/* First Year Only Flag */}
              <Checkbox
                isChecked={editIsFirstYr}
                onChange={(e) => {
                  setEditIsFirstYr(e.target.checked);
                  if (e.target.checked && !editTagsList.includes('Freshers only')) {
                    setEditTagsList((prev) => [...prev, 'Freshers only']);
                  } else if (!e.target.checked) {
                    setEditTagsList((prev) => prev.filter((t) => t !== 'Freshers only'));
                  }
                }}
                colorScheme="teal"
              >
                <Text fontSize="xs" fontWeight="600" color={textColor}>Freshers Only (isFirstYrOnly)</Text>
              </Checkbox>

              {/* Footer */}
              <Flex justify="flex-end" gap="12px" mt="24px" pt="16px" borderTop="1px solid var(--border)">
                <Button variant="ghost" mr={3} onClick={onCloseEditTags}>
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  onClick={handleSaveRepoTags}
                  isLoading={isSavingEditTags}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>

      {/* Mentor Management Section */}
      <Box bg={cardBg} border="1px solid var(--border)" p={{ base: '20px', md: '30px' }} borderRadius="20px" boxShadow={shadowSoft}>
        <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb="8px" wrap="wrap" gap="10px">
          <Heading size="md" color={textColor}>Mentor Management</Heading>
          <Badge colorScheme="teal" variant="subtle" px="10px" py="4px" borderRadius="full" fontSize="12px">
            {mentorsList.length} Active Mentors
          </Badge>
        </Flex>
        <Text fontSize="sm" mb="20px" color="var(--muted)">
          Users assigned the Mentor role in the database can review PRs, access mentorship tools, and be assigned to event repositories.
        </Text>

        {/* Promote User to Mentor Form */}
        <Box mb="24px" p="16px" borderRadius="14px" bg="var(--surface-2)" border="1px solid var(--border)">
          <Text fontSize="xs" fontWeight="700" mb="8px" color={textColor} textTransform="uppercase" letterSpacing="0.05em">
            Promote User to Mentor:
          </Text>
          <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap="12px">
            <Input
              placeholder="Enter GitHub ID (e.g. Washiki, 07calc)"
              variant="auth"
              value={mentorGithubId}
              onChange={(e) => setMentorGithubId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMentor();
                }
              }}
            />
            <Button
              variant="brand"
              w="100%"
              leftIcon={<Icon as={UserPlus} />}
              onClick={handleAddMentor}
              isLoading={isAddingMentorRole}
              loadingText="Promoting..."
            >
              Add Mentor
            </Button>
          </Grid>
        </Box>

        {/* Active Mentors List Header & Filter */}
        <Flex justify="space-between" align="center" mb="14px" wrap="wrap" gap="10px">
          <Text fontSize="sm" fontWeight="700" color={textColor}>
            Currently Active Mentors in Database
          </Text>
          <HStack maxW="300px" w="100%">
            <Input
              size="sm"
              variant="auth"
              placeholder="Filter mentors by name or handle..."
              value={mentorSearchFilter}
              onChange={(e) => setMentorSearchFilter(e.target.value)}
            />
          </HStack>
        </Flex>

        {isLoadingMentors ? (
          <Flex justify="center" p="24px">
            <RingLoader size={24} color="var(--accent)" />
          </Flex>
        ) : (
          (() => {
            const query = mentorSearchFilter.trim().toLowerCase().replace(/^@/, '');
            const filtered = mentorsList.filter((m) => {
              if (!query) return true;
              return m.githubId.toLowerCase().includes(query) || (m.name || '').toLowerCase().includes(query);
            });

            if (filtered.length === 0) {
              return (
                <Text fontSize="xs" color="var(--muted)" py="12px" fontStyle="italic">
                  {mentorSearchFilter ? `No mentors matching "${mentorSearchFilter}".` : 'No mentors found in the database. Add one above.'}
                </Text>
              );
            }

            return (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing="12px">
                {filtered.map((m) => (
                  <Flex
                    key={m.githubId}
                    p="12px 14px"
                    borderRadius="14px"
                    bg="var(--surface-2)"
                    border="1px solid var(--border)"
                    justify="space-between"
                    align="center"
                    gap="10px"
                  >
                    <Flex align="center" gap="10px" minW="0">
                      <Avatar
                        size="sm"
                        name={m.name || m.githubId}
                        src={m.avatarUrl || `https://github.com/${m.githubId}.png`}
                        border="1px solid var(--border)"
                      />
                      <Box minW="0">
                        <Text fontSize="xs" fontWeight="700" color={textColor} isTruncated>
                          {m.name || m.githubId}
                        </Text>
                        <Text fontSize="11px" color="var(--muted)" fontFamily="var(--f-mono)" isTruncated>
                          @{m.githubId}
                        </Text>
                      </Box>
                    </Flex>
                    <IconButton
                      size="xs"
                      aria-label={`Remove mentor @${m.githubId}`}
                      icon={<Icon as={Trash2} size={12} />}
                      colorScheme="red"
                      variant="ghost"
                      isLoading={removingMentorId === m.githubId}
                      onClick={() => handleRemoveMentor(m.githubId)}
                    />
                  </Flex>
                ))}
              </SimpleGrid>
            );
          })()
        )}
      </Box>
    </Box>
  );
}
