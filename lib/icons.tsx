/**
 * The app's one icon set: Phosphor (@phosphor-icons/react), behind the names the code already used (IconPlus,
 * IconChevronDown…), so every screen switched from Tabler / Lucide by changing only the import path.
 *
 * - Default 24px (Tabler's default); a className size (size-4…) still wins, as before.
 * - Regular weight; Tabler "…Filled" icons map to Phosphor's fill weight; a heavier Tabler stroke (2.25+) to bold.
 * - Pass `weight` to override (thin, light, regular, bold, fill, duotone).
 */
import * as React from "react";
import type { Icon as PhosphorIcon, IconProps as PhosphorProps, IconWeight } from "@phosphor-icons/react";
import {
  AppleLogoIcon,
  ArchiveIcon,
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowElbowDownRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowSquareOutIcon,
  ArrowUUpLeftIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  ArrowsDownUpIcon,
  ArrowsInSimpleIcon,
  ArrowsLeftRightIcon,
  ArrowsOutIcon,
  ArrowsOutSimpleIcon,
  ArticleIcon,
  BellIcon,
  BezierCurveIcon,
  BookIcon,
  BookmarkSimpleIcon,
  BrowserIcon,
  BuildingIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleDashedIcon,
  CircleHalfIcon,
  CircleIcon,
  CircleNotchIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  CodeIcon,
  CoinIcon,
  ColumnsIcon,
  CopyIcon,
  CreditCardIcon,
  CrownIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DatabaseIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DeviceTabletIcon,
  DiamondIcon,
  DiamondsFourIcon,
  DotIcon,
  DotsSixVerticalIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  ExclamationMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  FileIcon,
  FileTextIcon,
  FilesIcon,
  FlagIcon,
  FlaskIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  FolderSimpleIcon,
  FoldersIcon,
  FunnelIcon,
  GameControllerIcon,
  GearSixIcon,
  GiftIcon,
  GitBranchIcon,
  GlobeIcon,
  GridFourIcon,
  HammerIcon,
  HardDrivesIcon,
  HouseIcon,
  InfoIcon,
  KanbanIcon,
  KeyIcon,
  GoogleLogoIcon,
  LayoutIcon,
  LifebuoyIcon,
  LightningIcon,
  LinkIcon,
  ListBulletsIcon,
  ListChecksIcon,
  ListIcon,
  ListNumbersIcon,
  LockIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MapTrifoldIcon,
  MicrophoneIcon,
  MinusIcon,
  MoneyIcon,
  MonitorIcon,
  MoonIcon,
  NotePencilIcon,
  PackageIcon,
  PaintBrushIcon,
  PaletteIcon,
  PaperPlaneTiltIcon,
  PaperclipIcon,
  PathIcon,
  PencilSimpleIcon,
  PlayIcon,
  PauseIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  CornersOutIcon,
  PlugIcon,
  PlugsConnectedIcon,
  PlusIcon,
  PresentationChartIcon,
  ProhibitIcon,
  PulseIcon,
  PushPinIcon,
  PushPinSlashIcon,
  PuzzlePieceIcon,
  QuestionIcon,
  ReceiptIcon,
  RepeatIcon,
  RocketIcon,
  RowsIcon,
  SealIcon,
  SelectionIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SidebarIcon,
  SidebarSimpleIcon,
  SignOutIcon,
  SlidersHorizontalIcon,
  SlidersIcon,
  SparkleIcon,
  SpinnerIcon,
  SquaresFourIcon,
  StackIcon,
  StarIcon,
  StorefrontIcon,
  TableIcon,
  TagIcon,
  TerminalWindowIcon,
  TestTubeIcon,
  TicketIcon,
  TranslateIcon,
  TrashIcon,
  TrayIcon,
  TreeStructureIcon,
  TreeViewIcon,
  TrendDownIcon,
  TrendUpIcon,
  UploadSimpleIcon,
  UserCheckIcon,
  UserCircleIcon,
  UserCircleMinusIcon,
  UserFocusIcon,
  UserGearIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  UsersThreeIcon,
  WarningCircleIcon,
  WarningIcon,
  WarningOctagonIcon,
  WaveformIcon,
  WebhooksLogoIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";

export type IconProps = Omit<PhosphorProps, "weight" | "stroke"> & {
  /** Tabler-style stroke width: 2.25 or more draws the bold weight. */
  stroke?: number | string;
  weight?: IconWeight;
};
export type Icon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;

function icon(P: PhosphorIcon, name: string, filled = false): Icon {
  const C = React.forwardRef<SVGSVGElement, IconProps>(function PhosphorIconWrapper({ stroke, weight, size = 24, ...rest }, ref) {
    return <P ref={ref} size={size} weight={weight ?? (filled ? "fill" : Number(stroke) >= 2.25 ? "bold" : "regular")} {...rest} />;
  });
  C.displayName = name;
  return C;
}

export const IconActivity = icon(PulseIcon, "IconActivity");
export const IconAdjustments = icon(SlidersIcon, "IconAdjustments");
export const IconAdjustmentsHorizontal = icon(SlidersHorizontalIcon, "IconAdjustmentsHorizontal");
export const IconAlertCircle = icon(WarningCircleIcon, "IconAlertCircle");
export const IconAlertOctagon = icon(WarningOctagonIcon, "IconAlertOctagon");
export const IconAlertTriangle = icon(WarningIcon, "IconAlertTriangle");
export const IconApps = icon(SquaresFourIcon, "IconApps");
export const IconArchive = icon(ArchiveIcon, "IconArchive");
export const IconArrowBack = icon(ArrowUUpLeftIcon, "IconArrowBack");
export const IconArrowBackUp = icon(ArrowUUpLeftIcon, "IconArrowBackUp");
export const IconArrowDown = icon(ArrowDownIcon, "IconArrowDown");
export const IconArrowLeft = icon(ArrowLeftIcon, "IconArrowLeft");
export const IconArrowRight = icon(ArrowRightIcon, "IconArrowRight");
export const IconArrowUp = icon(ArrowUpIcon, "IconArrowUp");
export const IconArrowUpRight = icon(ArrowUpRightIcon, "IconArrowUpRight");
export const IconArrowsDiagonal = icon(ArrowsOutSimpleIcon, "IconArrowsDiagonal");
export const IconArrowsDiagonalMinimize2 = icon(ArrowsInSimpleIcon, "IconArrowsDiagonalMinimize2");
export const IconArrowsExchange = icon(ArrowsLeftRightIcon, "IconArrowsExchange");
export const IconArrowsMaximize = icon(ArrowsOutIcon, "IconArrowsMaximize");
export const IconArrowsSort = icon(ArrowsDownUpIcon, "IconArrowsSort");
export const IconArticle = icon(ArticleIcon, "IconArticle");
export const IconBan = icon(ProhibitIcon, "IconBan");
export const IconBell = icon(BellIcon, "IconBell");
export const IconBinaryTree = icon(TreeStructureIcon, "IconBinaryTree");
export const IconBolt = icon(LightningIcon, "IconBolt");
export const IconBook2 = icon(BookIcon, "IconBook2");
export const IconBookmark = icon(BookmarkSimpleIcon, "IconBookmark");
export const IconBox = icon(CubeIcon, "IconBox");
export const IconBrandAppleFilled = icon(AppleLogoIcon, "IconBrandAppleFilled", true);
export const IconBrush = icon(PaintBrushIcon, "IconBrush");
export const IconBuilding = icon(BuildingIcon, "IconBuilding");
export const IconBuildingSkyscraper = icon(BuildingsIcon, "IconBuildingSkyscraper");
export const IconBuildingStore = icon(StorefrontIcon, "IconBuildingStore");
export const IconCalendar = icon(CalendarBlankIcon, "IconCalendar");
export const IconCashBanknote = icon(MoneyIcon, "IconCashBanknote");
export const IconChartBar = icon(ChartBarIcon, "IconChartBar");
export const IconCheck = icon(CheckIcon, "IconCheck");
export const IconChecklist = icon(ListChecksIcon, "IconChecklist");
export const IconChevronDown = icon(CaretDownIcon, "IconChevronDown");
export const IconChevronLeft = icon(CaretLeftIcon, "IconChevronLeft");
export const IconChevronRight = icon(CaretRightIcon, "IconChevronRight");
export const IconChevronUp = icon(CaretUpIcon, "IconChevronUp");
export const IconChevronsLeft = icon(CaretDoubleLeftIcon, "IconChevronsLeft");
export const IconChevronsRight = icon(CaretDoubleRightIcon, "IconChevronsRight");
export const IconCircle = icon(CircleIcon, "IconCircle");
export const IconCircleCheck = icon(CheckCircleIcon, "IconCircleCheck");
export const IconCircleCheckFilled = icon(CheckCircleIcon, "IconCircleCheckFilled", true);
export const IconCircleFilled = icon(CircleIcon, "IconCircleFilled", true);
export const IconClock = icon(ClockIcon, "IconClock");
export const IconCode = icon(CodeIcon, "IconCode");
export const IconCoinFilled = icon(CoinIcon, "IconCoinFilled", true);
export const IconColumns = icon(ColumnsIcon, "IconColumns");
export const IconColumns3 = icon(ColumnsIcon, "IconColumns3");
export const IconComponents = icon(DiamondsFourIcon, "IconComponents");
export const IconCopy = icon(CopyIcon, "IconCopy");
export const IconCornerDownRight = icon(ArrowElbowDownRightIcon, "IconCornerDownRight");
export const IconCreditCard = icon(CreditCardIcon, "IconCreditCard");
export const IconCrownFilled = icon(CrownIcon, "IconCrownFilled", true);
export const IconCurrencyDollar = icon(CurrencyDollarIcon, "IconCurrencyDollar");
export const IconDatabase = icon(DatabaseIcon, "IconDatabase");
export const IconDeviceDesktop = icon(DesktopIcon, "IconDeviceDesktop");
export const IconDeviceGamepad2 = icon(GameControllerIcon, "IconDeviceGamepad2");
export const IconDeviceImac = icon(MonitorIcon, "IconDeviceImac");
export const IconDeviceMobile = icon(DeviceMobileIcon, "IconDeviceMobile");
export const IconDeviceTablet = icon(DeviceTabletIcon, "IconDeviceTablet");
export const IconDiamondFilled = icon(DiamondIcon, "IconDiamondFilled", true);
export const IconDots = icon(DotsThreeIcon, "IconDots");
export const IconDotsVertical = icon(DotsThreeVerticalIcon, "IconDotsVertical");
export const IconDownload = icon(DownloadSimpleIcon, "IconDownload");
export const IconExclamationMark = icon(ExclamationMarkIcon, "IconExclamationMark");
export const IconExternalLink = icon(ArrowSquareOutIcon, "IconExternalLink");
export const IconEye = icon(EyeIcon, "IconEye");
export const IconEyeOff = icon(EyeSlashIcon, "IconEyeOff");
export const IconFile = icon(FileIcon, "IconFile");
export const IconFileText = icon(FileTextIcon, "IconFileText");
export const IconFiles = icon(FilesIcon, "IconFiles");
export const IconFilter = icon(FunnelIcon, "IconFilter");
export const IconFlag = icon(FlagIcon, "IconFlag");
export const IconFlask = icon(FlaskIcon, "IconFlask");
export const IconFolder = icon(FolderIcon, "IconFolder");
export const IconFolderFilled = icon(FolderIcon, "IconFolderFilled", true);
export const IconFolderOpen = icon(FolderOpenIcon, "IconFolderOpen");
export const IconFolderPlus = icon(FolderPlusIcon, "IconFolderPlus");
export const IconFolderSymlink = icon(FolderSimpleIcon, "IconFolderSymlink");
export const IconFolders = icon(FoldersIcon, "IconFolders");
export const IconGift = icon(GiftIcon, "IconGift");
export const IconGiftFilled = icon(GiftIcon, "IconGiftFilled", true);
export const IconGitBranch = icon(GitBranchIcon, "IconGitBranch");
export const IconGripVertical = icon(DotsSixVerticalIcon, "IconGripVertical");
export const IconHammer = icon(HammerIcon, "IconHammer");
export const IconHelpCircle = icon(QuestionIcon, "IconHelpCircle");
export const IconHierarchy = icon(TreeStructureIcon, "IconHierarchy");
export const IconHierarchy2 = icon(TreeStructureIcon, "IconHierarchy2");
export const IconHistory = icon(ClockCounterClockwiseIcon, "IconHistory");
export const IconHome = icon(HouseIcon, "IconHome");
export const IconHome2 = icon(HouseIcon, "IconHome2");
export const IconInbox = icon(TrayIcon, "IconInbox");
export const IconInfoCircle = icon(InfoIcon, "IconInfoCircle");
export const IconInnerShadowTop = icon(CircleHalfIcon, "IconInnerShadowTop");
export const IconKey = icon(KeyIcon, "IconKey");
export const IconBrandGoogle = icon(GoogleLogoIcon, "IconBrandGoogle", true);
export const IconLanguage = icon(TranslateIcon, "IconLanguage");
export const IconLayoutColumns = icon(ColumnsIcon, "IconLayoutColumns");
export const IconLayoutDashboard = icon(SquaresFourIcon, "IconLayoutDashboard");
export const IconLayoutGrid = icon(GridFourIcon, "IconLayoutGrid");
export const IconLayoutKanban = icon(KanbanIcon, "IconLayoutKanban");
export const IconLayoutList = icon(RowsIcon, "IconLayoutList");
export const IconLayoutNavbar = icon(BrowserIcon, "IconLayoutNavbar");
export const IconLayoutSidebar = icon(SidebarIcon, "IconLayoutSidebar");
export const IconLayoutSidebarLeftCollapse = icon(SidebarSimpleIcon, "IconLayoutSidebarLeftCollapse");
export const IconLayoutSidebarLeftExpand = icon(SidebarSimpleIcon, "IconLayoutSidebarLeftExpand");
export const IconLayoutSidebarRight = icon(SidebarIcon, "IconLayoutSidebarRight");
export const IconLifebuoy = icon(LifebuoyIcon, "IconLifebuoy");
export const IconLink = icon(LinkIcon, "IconLink");
export const IconList = icon(ListIcon, "IconList");
export const IconListDetails = icon(ListBulletsIcon, "IconListDetails");
export const IconListNumbers = icon(ListNumbersIcon, "IconListNumbers");
export const IconListTree = icon(TreeViewIcon, "IconListTree");
export const IconLoader = icon(SpinnerIcon, "IconLoader");
export const IconLoader2 = icon(CircleNotchIcon, "IconLoader2");
export const IconLock = icon(LockIcon, "IconLock");
export const IconLockFilled = icon(LockIcon, "IconLockFilled", true);
export const IconLogout = icon(SignOutIcon, "IconLogout");
export const IconMail = icon(EnvelopeSimpleIcon, "IconMail");
export const IconMailForward = icon(PaperPlaneTiltIcon, "IconMailForward");
export const IconMap = icon(MapTrifoldIcon, "IconMap");
export const IconMapPin = icon(MapPinIcon, "IconMapPin");
export const IconMenu2 = icon(ListIcon, "IconMenu2");
export const IconMicrophone = icon(MicrophoneIcon, "IconMicrophone");
export const IconMinus = icon(MinusIcon, "IconMinus");
export const IconMoon = icon(MoonIcon, "IconMoon");
export const IconPackage = icon(PackageIcon, "IconPackage");
export const IconPalette = icon(PaletteIcon, "IconPalette");
export const IconPencil = icon(PencilSimpleIcon, "IconPencil");
export const IconPin = icon(PushPinIcon, "IconPin");
export const IconPinnedOff = icon(PushPinSlashIcon, "IconPinnedOff");
export const IconPlayerPlay = icon(PlayIcon, "IconPlayerPlay");
export const IconPlayerPause = icon(PauseIcon, "IconPlayerPause");
export const IconAlignLeft = icon(TextAlignLeftIcon, "IconAlignLeft");
export const IconAlignCenter = icon(TextAlignCenterIcon, "IconAlignCenter");
export const IconAlignRight = icon(TextAlignRightIcon, "IconAlignRight");
export const IconMaximize = icon(CornersOutIcon, "IconMaximize");
export const IconPlug = icon(PlugIcon, "IconPlug");
export const IconPlugConnected = icon(PlugsConnectedIcon, "IconPlugConnected");
export const IconPlus = icon(PlusIcon, "IconPlus");
export const IconPoint = icon(DotIcon, "IconPoint");
export const IconProgress = icon(CircleDashedIcon, "IconProgress");
export const IconProgressHelp = icon(CircleDashedIcon, "IconProgressHelp");
export const IconPuzzle = icon(PuzzlePieceIcon, "IconPuzzle");
export const IconReceipt = icon(ReceiptIcon, "IconReceipt");
export const IconReceipt2 = icon(ReceiptIcon, "IconReceipt2");
export const IconRefresh = icon(ArrowClockwiseIcon, "IconRefresh");
export const IconRepeat = icon(RepeatIcon, "IconRepeat");
export const IconReportAnalytics = icon(PresentationChartIcon, "IconReportAnalytics");
export const IconRocket = icon(RocketIcon, "IconRocket");
export const IconRosette = icon(SealIcon, "IconRosette");
export const IconRotateClockwise2 = icon(ArrowClockwiseIcon, "IconRotateClockwise2");
export const IconRoute = icon(PathIcon, "IconRoute");
export const IconSearch = icon(MagnifyingGlassIcon, "IconSearch");
export const IconSelector = icon(CaretUpDownIcon, "IconSelector");
export const IconServer = icon(HardDrivesIcon, "IconServer");
export const IconSettings = icon(GearSixIcon, "IconSettings");
export const IconShieldCheck = icon(ShieldCheckIcon, "IconShieldCheck");
export const IconShoppingBag = icon(ShoppingBagIcon, "IconShoppingBag");
export const IconSitemap = icon(TreeStructureIcon, "IconSitemap");
export const IconSparkles = icon(SparkleIcon, "IconSparkles");
export const IconSquareDashed = icon(SelectionIcon, "IconSquareDashed");
export const IconStack2 = icon(StackIcon, "IconStack2");
export const IconStar = icon(StarIcon, "IconStar");
export const IconStarFilled = icon(StarIcon, "IconStarFilled", true);
export const IconTable = icon(TableIcon, "IconTable");
export const IconTag = icon(TagIcon, "IconTag");
export const IconTemplate = icon(LayoutIcon, "IconTemplate");
export const IconTerminal2 = icon(TerminalWindowIcon, "IconTerminal2");
export const IconTestPipe = icon(TestTubeIcon, "IconTestPipe");
export const IconTicket = icon(TicketIcon, "IconTicket");
export const IconTrash = icon(TrashIcon, "IconTrash");
export const IconTrendingDown = icon(TrendDownIcon, "IconTrendingDown");
export const IconTrendingUp = icon(TrendUpIcon, "IconTrendingUp");
export const IconUpload = icon(UploadSimpleIcon, "IconUpload");
export const IconUser = icon(UserIcon, "IconUser");
export const IconUserCheck = icon(UserCheckIcon, "IconUserCheck");
export const IconUserCircle = icon(UserCircleIcon, "IconUserCircle");
export const IconUserCog = icon(UserGearIcon, "IconUserCog");
export const IconUserExclamation = icon(UserFocusIcon, "IconUserExclamation");
export const IconUserMinus = icon(UserMinusIcon, "IconUserMinus");
export const IconUserOff = icon(UserCircleMinusIcon, "IconUserOff");
export const IconUserPlus = icon(UserPlusIcon, "IconUserPlus");
export const IconUserX = icon(UserMinusIcon, "IconUserX");
export const IconUsers = icon(UsersIcon, "IconUsers");
export const IconUsersGroup = icon(UsersThreeIcon, "IconUsersGroup");
export const IconVectorBezier2 = icon(BezierCurveIcon, "IconVectorBezier2");
export const IconWebhook = icon(WebhooksLogoIcon, "IconWebhook");
export const IconWorld = icon(GlobeIcon, "IconWorld");
export const IconX = icon(XIcon, "IconX");
export const IconRotateCounterClockwise = icon(ArrowCounterClockwiseIcon, "IconRotateCounterClockwise");
export const IconWaveform = icon(WaveformIcon, "IconWaveform");
export const IconPaperclip = icon(PaperclipIcon, "IconPaperclip");
export const IconNotePencil = icon(NotePencilIcon, "IconNotePencil");
