declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: MainButton;
  BackButton: BackButton;
  SettingsButton: SettingsButton;
  version: string;
  colorScheme: 'light' | 'dark';
  backgroundColor: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  themeParams: ThemeParams;
  initDataUnsafe: WebAppInitData;
  platform: string;
  initData: string;
  showPopup: (params: PopupParams, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: ScanQrPopupParams, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  enableVerticalSwipes: () => void;
  disableVerticalSwipes: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  shareToStory: (mediaUrl: string, params?: { [key: string]: any }) => void;
  shareMessage: (msgId: string, callback?: (success: boolean) => void) => void;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  start_param?: string;
  auth_date?: string;
  hash?: string;
}

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive: boolean) => void;
  hideProgress: () => void;
}

interface BackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

interface SettingsButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  show: () => void;
  hide: () => void;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

interface PopupParams {
  title?: string;
  message: string;
  buttons?: PopupButton[];
}

interface PopupButton {
  id: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
}

interface ScanQrPopupParams {
  text?: string;
}

export type {
  TelegramWebApp,
  WebAppInitData,
  WebAppUser,
  MainButton,
  BackButton,
  SettingsButton,
  ThemeParams,
  PopupParams,
  PopupButton,
  ScanQrPopupParams,
};