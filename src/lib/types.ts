export type Role = 'READER' | 'CREATOR' | 'ADMIN';

export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'HIATUS';

export type ContentRating = 'EVERYONE' | 'TEEN' | 'MATURE';

export type ContentType = 'NOVEL' | 'COMIC' | 'ANIMATION' | 'COMMUNITY_POST';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'ko' | 'hi';

export type MonetizationTier = 'NONE' | 'LEVEL_1_ELIGIBLE' | 'LEVEL_2_ESTABLISHED' | 'LEVEL_3_VERIFIED';

export type MonetizationStatus = 'NOT_APPLIED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatar: string;
  banner?: string;
  bio: string;
  country?: string;
  website?: string;
  twitter?: string;
  preferredTypes?: string[];
  primaryGenres?: string[];
  agreedToCreatorTerms?: boolean;
  isCreatorProfileComplete?: boolean;
  isEmailVerified?: boolean;
  isAgeVerified?: boolean;
  monetizationTier?: MonetizationTier;
  monetizationStatus?: MonetizationStatus;
  fraudAuditStatus?: 'CLEAN' | 'UNDER_REVIEW' | 'FLAGGED';
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  totalReads: number;
  coins?: number;
  totalTipsReceived?: number;
  createdAt: string;
  payoutMethod?: string;
  payoutBankHolder?: string;
  payoutBankName?: string;
  payoutBankNumber?: string;
  payoutBankIfsc?: string;
  payoutBankCountry?: string;
  payoutUpiId?: string;
  payoutPaypalEmail?: string;
  payoutAutoEnabled?: boolean;
}

export interface MonetizationEligibility {
  overallPercentage: number;
  currentTier: MonetizationTier;
  status: MonetizationStatus;
  accountAgeDays: number;
  isEmailVerified: boolean;
  isAgeVerified: boolean;
  isProfileComplete: boolean;
  hasOriginalityPledge: boolean;
  violationsCount: number;
  hasApprovedWork: boolean;
  publishedChaptersOrEpisodes: number;
  followersCount: number;
  followersThreshold: number;
  genuineReadsCount: number;
  genuineReadsThreshold: number;
  engagementsCount: number;
  engagementsThreshold: number;
  fraudAuditStatus: 'CLEAN' | 'UNDER_REVIEW' | 'FLAGGED';
  missingRequirements: string[];
  canApplyLevel1: boolean;
  canApplyLevel2: boolean;
  canApplyLevel3: boolean;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  status: ContentStatus;
  wordCount: number;
  isFree: boolean;
  publishedAt: string;
  readTimeMinutes: number;
}

export type StoryFormat = 'WEB_NOVEL' | 'LIGHT_NOVEL' | 'MANGA' | 'WEBTOON' | 'COMIC';

export interface StoryFormatInfo {
  key: StoryFormat;
  label: string;
  badge: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface Novel {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  bannerUrl?: string;
  genre: string;
  secondaryGenre?: string;
  tags: string[];
  language: LanguageCode;
  format?: 'STANDARD' | 'ILLUSTRATED';
  subType?: 'NOVEL' | 'WEB_NOVEL' | 'LIGHT_NOVEL' | 'ILLUSTRATED_NOVEL';
  status: ContentStatus;
  contentRating: ContentRating;
  views: number;
  reads: number;
  likesCount: number;
  bookmarksCount: number;
  rating: number;
  totalRatings: number;
  isFeatured: boolean;
  isEditorPick: boolean;
  isPremium: boolean;
  chaptersCount: number;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
  contentWarning?: string;
}

export interface ComicEpisode {
  id: string;
  comicId: string;
  episodeNumber: number;
  title: string;
  thumbnailUrl?: string;
  imageUrls: string[];
  status: ContentStatus;
  publishedAt: string;
  likesCount: number;
}

export interface Comic {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  bannerUrl?: string;
  genre: string;
  secondaryGenre?: string;
  tags: string[];
  language: LanguageCode;
  format?: 'VERTICAL' | 'PAGE_BASED';
  readingDirection?: 'VERTICAL' | 'RTL' | 'LTR';
  subType?: 'WEBTOON' | 'COMIC' | 'MANGA' | 'GRAPHIC_NOVEL' | 'ILLUSTRATED_NOVEL' | 'PDF_BOOK';
  allowPdfDownload?: boolean;
  status: ContentStatus;
  contentRating: ContentRating;
  contentWarning?: string;
  views: number;
  reads: number;
  likesCount?: number;
  bookmarksCount?: number;
  rating: number;
  totalRatings: number;
  isFeatured: boolean;
  isEditorPick: boolean;
  isPremium: boolean;
  episodesCount: number;
  episodes: ComicEpisode[];
  createdAt: string;
  updatedAt: string;
}

export function getStoryFormat(item: {
  type?: 'NOVEL' | 'COMIC';
  subType?: string;
  format?: string;
  readingDirection?: string;
  tags?: string[];
  genre?: string;
  chapters?: any[];
  episodes?: any[];
} | null | undefined): StoryFormatInfo {
  if (!item) {
    return {
      key: 'WEB_NOVEL',
      label: 'Web Novels',
      badge: 'WEB NOVEL',
      color: '#3B82F6',
      bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      textClass: 'text-blue-500',
      borderClass: 'border-blue-500/20',
    };
  }

  const subType = String(item.subType || '').toUpperCase();
  const format = String(item.format || '').toUpperCase();
  const readingDirection = String(item.readingDirection || '').toUpperCase();
  const tags = (Array.isArray(item.tags) ? item.tags : []).map((t) => String(t || '').toLowerCase());
  const isNovel = item.type === 'NOVEL' || (Array.isArray(item.chapters) && item.chapters.length > 0) || (item as any)?.chaptersCount !== undefined;
  const isExplicitComic = item.type === 'COMIC' || Array.isArray(item.episodes) || (item as any)?.episodesCount !== undefined;

  // 1. Light Novel (Illustrated Light Novel)
  if (
    subType === 'ILLUSTRATED_NOVEL' ||
    subType === 'LIGHT_NOVEL' ||
    format === 'ILLUSTRATED' ||
    tags.includes('light novel') ||
    tags.includes('illustrated novel')
  ) {
    return {
      key: 'LIGHT_NOVEL',
      label: 'Light Novels',
      badge: 'LIGHT NOVEL',
      color: '#8B5CF6',
      bgClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      textClass: 'text-purple-500',
      borderClass: 'border-purple-500/20',
    };
  }

  // 2. Manga (Japanese Manga RTL)
  if (
    subType === 'MANGA' ||
    readingDirection === 'RTL' ||
    tags.includes('manga') ||
    tags.includes('japanese manga')
  ) {
    return {
      key: 'MANGA',
      label: 'Manga',
      badge: 'MANGA',
      color: '#D91E18',
      bgClass: 'bg-rose-500/10 text-[#D91E18] border-rose-500/20',
      textClass: 'text-[#D91E18]',
      borderClass: 'border-rose-500/20',
    };
  }

  // 3. Webtoon (Vertical Webtoon / Manhwa)
  if (
    subType === 'WEBTOON' ||
    format === 'VERTICAL' ||
    readingDirection === 'VERTICAL' ||
    tags.includes('webtoon') ||
    tags.includes('manhwa')
  ) {
    return {
      key: 'WEBTOON',
      label: 'Webtoons',
      badge: 'WEBTOON',
      color: '#10B981',
      bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      textClass: 'text-emerald-500',
      borderClass: 'border-emerald-500/20',
    };
  }

  // 4. Comic / Graphic Novel
  if (
    subType === 'COMIC' ||
    subType === 'GRAPHIC_NOVEL' ||
    subType === 'PDF_BOOK' ||
    (isExplicitComic && !isNovel)
  ) {
    return {
      key: 'COMIC',
      label: 'Comics / Graphic Novels',
      badge: 'COMIC',
      color: '#F59E0B',
      bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/20',
    };
  }

  // 5. Default: Web Novel
  return {
    key: 'WEB_NOVEL',
    label: 'Web Novels',
    badge: 'WEB NOVEL',
    color: '#3B82F6',
    bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    textClass: 'text-blue-500',
    borderClass: 'border-blue-500/20',
  };
}

export interface Comment {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  contentId: string;
  contentType: ContentType;
  chapterNumber?: number;
  text: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  contentId: string;
  contentType: ContentType;
  score: number;
  review: string;
  createdAt: string;
}

export interface ReadingProgress {
  id?: string;
  userId?: string;
  contentId: string;
  contentType: ContentType;
  chapterId?: string;
  chapterNumber: number;
  episodeNumber?: number;
  progressPercentage?: number;
  scrollOffset?: number;
  pageIndex?: number;
  lastReadAt: string;
  contentTitle?: string;
  contentSlug?: string;
  coverUrl?: string;
  creatorName?: string;
  episodeTitle?: string;
  totalUnits?: number;
}

export interface Contest {
  id: string;
  contestNumber?: string | number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  bannerUrl: string;
  heroCoverUrl?: string;
  category?: string;
  prizePool: string;
  prizeStructure: {
    place: string;
    reward: string;
    desc: string;
  }[];
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'ACTIVE' | 'UPCOMING' | 'JUDGING' | 'COMPLETED';
  isPublished?: boolean;
  rules: string[];
  judgingCriteria: {
    title: string;
    weight: string;
    percentage?: number;
    desc: string;
  }[];
  eligibleGenres: string[];
  minChapters: number;
  submissionCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  contentId: string;
  contentType: ContentType;
  novel: Novel;
  creator: UserProfile;
  score: number;
  votes: number;
  rank?: number;
  status: 'APPROVED' | 'PENDING' | 'WINNER';
  submittedAt: string;
}

export interface CommunityPost {
  id: string;
  userId: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    badge?: string;
  };
  category: 'General' | 'Creator Lounge' | 'Story Feedback' | 'Writing Prompts' | 'Announcements';
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  commentsCount: number;
  views: number;
  isPinned?: boolean;
  createdAt: string;
  comments?: {
    id: string;
    userId: string;
    user: {
      name: string;
      username: string;
      avatar: string;
    };
    text: string;
    upvotes: number;
    createdAt: string;
  }[];
}

export interface ReportItem {
  id: string;
  reporterName: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  creatorName: string;
  reason: 'Copyright Infringement' | 'Inappropriate / NSFW' | 'Hate Speech' | 'Spam / Scam' | 'Other';
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
}

export interface ReaderSettings {
  theme: 'light' | 'dark' | 'sepia' | 'slate' | 'midnight';
  fontFamily: 'serif' | 'sans' | 'mono';
  fontSize: number; // 14 to 28
  lineHeight: number; // 1.4, 1.8, 2.2
  maxWidth: 'narrow' | 'standard' | 'wide' | 'full';
  autoScrollSpeed: number; // 0 = off
}

export interface NotificationPreferences {
  newChapters: boolean;
  newStories: boolean;
  newComics: boolean;
  announcements: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  notificationsEnabled: boolean;
  preferences?: NotificationPreferences;
}

export interface NotificationItem {
  id: string;
  userId: string; // recipient
  creatorId?: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  message: string;
  contentUrl: string;
  type: 'CHAPTER_RELEASE' | 'EPISODE_RELEASE' | 'STORY_RELEASE' | 'ANNOUNCEMENT' | 'NEW_FOLLOWER' | 'LIKE' | 'COMMENT' | 'REVIEW' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface TipTransaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toCreatorId: string;
  toCreatorName: string;
  contentId?: string;
  contentTitle?: string;
  amount: number; // in Coins
  tierTitle?: string;
  message?: string;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonusCoins: number;
  priceUsd: number;
  priceInr: number;
  label: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  badge?: string;
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amountInr: number;
  amountUsd: number;
  method: 'UPI' | 'BANK' | 'PAYPAL';
  details: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  requestedAt: string;
  processedAt?: string;
  transactionReference?: string;
  notes?: string;
}


